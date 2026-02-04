---
paths:
  - "src/lib/errors.ts"
  - "src/middleware/errorHandler.ts"
  - "src/routes/**"
  - "src/services/**"
---

# エラーハンドリングルール

## エラークラス階層

```typescript
// src/lib/errors.ts

// 基底クラス: すべてのアプリケーションエラーの親
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// 400: バリデーションエラー
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

// 401: 未認証
export class UnauthorizedError extends AppError {
  constructor(message = '認証が必要です') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

// 403: 権限不足
export class ForbiddenError extends AppError {
  constructor(message = 'この操作を行う権限がありません') {
    super(message, 403, 'FORBIDDEN');
  }
}

// 404: リソース不在
export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource}（ID: ${id}）が見つかりません`, 404, 'NOT_FOUND');
  }
}

// 409: 競合
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}
```

## エラーコード体系

| コード | HTTP | 発生場面 |
|-------|------|---------|
| VALIDATION_ERROR | 400 | Zod バリデーション失敗、不正な入力値 |
| UNAUTHORIZED | 401 | トークン未提供、トークン期限切れ |
| FORBIDDEN | 403 | 権限不足、他ユーザーのリソースへのアクセス |
| NOT_FOUND | 404 | 存在しないリソースの取得・更新・削除 |
| CONFLICT | 409 | メールアドレスの重複、同時更新の衝突 |
| INTERNAL_ERROR | 500 | 予期しないエラー（DB 障害、外部 API 障害等） |

## グローバルエラーハンドラ

```typescript
// src/middleware/errorHandler.ts
import type { ErrorHandler } from 'hono';
import { AppError } from '@/lib/errors';

export const errorHandler: ErrorHandler = (err, c) => {
  // AppError（アプリケーションが意図的に投げたエラー）
  if (err instanceof AppError) {
    return c.json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    }, err.statusCode as 400 | 401 | 403 | 404 | 409);
  }

  // Hono の HTTPException
  if (err instanceof HTTPException) {
    return c.json({
      error: {
        code: 'HTTP_ERROR',
        message: err.message,
      },
    }, err.status);
  }

  // 予期しないエラー（500）
  logger.error({ err }, '予期しないエラーが発生');
  return c.json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'サーバー内部エラーが発生しました',
    },
  }, 500);
};

// src/index.ts で登録
app.onError(errorHandler);
```

## エラーの投げ方

### サービス層

- ビジネスロジックのエラーはカスタムエラークラスを使って `throw` する
- エラーメッセージはユーザーに見せて問題ないものにする
- 内部エラー（DB エラー等）はログに記録し、汎用メッセージで 500 を返す

```typescript
// サービス層の例
export const findUserById = async (id: string): Promise<User> => {
  const [user] = await db.select().from(users).where(eq(users.id, id));

  if (!user) {
    throw new NotFoundError('ユーザー', id);
  }

  return user;
};

export const createUser = async (input: NewUser): Promise<User> => {
  try {
    const [user] = await db.insert(users).values(input).returning();
    return user;
  } catch (err) {
    if (err instanceof Error && err.message.includes('unique')) {
      throw new ConflictError('このメールアドレスは既に使用されています');
    }
    throw err; // 予期しないエラーはそのまま再スロー → グローバルハンドラで処理
  }
};
```

### ルートハンドラ

- ルートハンドラでは try-catch を書かない（グローバルエラーハンドラに任せる）
- バリデーションエラーは `@hono/zod-validator` が自動で 400 を返す

```typescript
// 良い例: エラーはサービス層が投げ、グローバルハンドラが処理する
usersRoutes.get('/:id', zValidator('param', idParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = await findUserById(id); // NotFoundError を投げる可能性
  return c.json({ data: user });
});

// 悪い例: ルートハンドラで try-catch
usersRoutes.get('/:id', async (c) => {
  try {
    const user = await findUserById(c.req.param('id'));
    return c.json({ data: user });
  } catch (err) {
    // グローバルハンドラと重複する処理
    return c.json({ error: 'Not found' }, 404);
  }
});
```

## 外部 API エラー

- 外部 API 呼び出しは try-catch で囲む
- リトライ可能なエラー（429, 503）はリトライする
- リトライ不可のエラーはログに記録して適切な AppError に変換する

```typescript
export const callPaymentApi = async (data: PaymentInput): Promise<PaymentResult> => {
  try {
    const res = await fetch(env.PAYMENT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.text();
      logger.error({ status: res.status, body }, '決済 API エラー');
      throw new AppError('決済処理に失敗しました', 502, 'PAYMENT_FAILED');
    }

    return await res.json() as PaymentResult;
  } catch (err) {
    if (err instanceof AppError) throw err;
    logger.error({ err }, '決済 API 接続エラー');
    throw new AppError('決済サービスに接続できません', 503, 'PAYMENT_UNAVAILABLE');
  }
};
```

## 禁止事項

- NEVER: エラーを握りつぶさない（空の `catch {}` は厳禁）
- NEVER: エラーレスポンスにスタックトレースを含めない
- NEVER: 内部実装の詳細（テーブル名、カラム名、SQL エラー等）をレスポンスに露出しない
- NEVER: `catch (err: any)` を使わない（`unknown` + 型ガード）
