---
paths:
  - "src/routes/**"
  - "src/middleware/**"
  - "src/index.ts"
---

# Hono フレームワークルール

## ルーティング

- リソースごとにファイルを分割する（`src/routes/users.ts`, `src/routes/posts.ts`）
- `app.route()` でサブルートをマウントする
- RESTful な URL 設計に従う（`/api/v1/users`, `/api/v1/users/:id`）
- パスパラメータは `:id` 形式で定義し、Zod でバリデーションする
- ルートハンドラはビジネスロジックを含めない（サービス層に委譲する）

```typescript
// src/routes/users.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { UserService } from '@/services/userService';

const users = new Hono();

// 一覧取得
users.get('/', async (c) => {
  const result = await UserService.findAll();
  return c.json({ data: result });
});

// 単体取得
users.get('/:id', async (c) => {
  const id = c.req.param('id');
  const result = await UserService.findById(id);
  return c.json({ data: result });
});

// 作成
users.post(
  '/',
  zValidator('json', createUserSchema),
  async (c) => {
    const input = c.req.valid('json');
    const result = await UserService.create(input);
    return c.json({ data: result }, 201);
  },
);

export { users };

// src/index.ts
import { Hono } from 'hono';
import { users } from '@/routes/users';

const app = new Hono().basePath('/api/v1');
app.route('/users', users);
```

## ミドルウェア

- 再利用可能なミドルウェアは `src/middleware/` に配置する
- `createMiddleware` を使って型安全なミドルウェアを作成する
- ミドルウェアの実行順序を意識する（ロギング → 認証 → バリデーション → ハンドラ）
- グローバルミドルウェアは `src/index.ts` で適用する
- ルート固有のミドルウェアはルートファイル内で適用する

```typescript
// グローバルミドルウェアの適用順序（src/index.ts）
app.use('*', logger());        // 1. ロギング
app.use('*', cors());          // 2. CORS
app.use('*', secureHeaders()); // 3. セキュリティヘッダ
app.use('/api/*', authMiddleware); // 4. 認証（API ルートのみ）
```

## バリデーション

- すべてのユーザー入力を Zod で検証する
- `@hono/zod-validator` を使ってルートレベルでバリデーションする
- バリデーション対象: `json`（ボディ）, `query`（クエリパラメータ）, `param`（パスパラメータ）
- バリデーションスキーマはルートファイルの上部、またはスキーマ専用ファイルに定義する

```typescript
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

// パスパラメータのバリデーション
const idParamSchema = z.object({
  id: z.string().uuid(),
});

// クエリパラメータのバリデーション
const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['created_at', 'updated_at', 'name']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// リクエストボディのバリデーション
const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  tags: z.array(z.string()).max(10).optional(),
});

app.get(
  '/:id',
  zValidator('param', idParamSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    // id は UUID であることが保証される
  },
);
```

## エラーハンドリング

- グローバルエラーハンドラを `app.onError` で定義する
- 想定内のエラーは `HTTPException` を使う
- カスタムエラークラスを `HTTPException` にマッピングする
- エラーレスポンスは統一された形式で返す
- 本番環境ではスタックトレースを露出しない

```typescript
import { HTTPException } from 'hono/http-exception';
import { AppError } from '@/lib/errors';

// グローバルエラーハンドラ
app.onError((err, c) => {
  // カスタムエラー
  if (err instanceof AppError) {
    return c.json(
      { error: { code: err.code, message: err.message } },
      err.statusCode as StatusCode,
    );
  }

  // Hono の HTTPException
  if (err instanceof HTTPException) {
    return c.json(
      { error: { code: 'HTTP_ERROR', message: err.message } },
      err.status,
    );
  }

  // 予期しないエラー
  console.error('Unhandled error:', err);
  return c.json(
    { error: { code: 'INTERNAL_ERROR', message: 'サーバー内部エラー' } },
    500,
  );
});

// Not Found ハンドラ
app.notFound((c) => {
  return c.json(
    { error: { code: 'NOT_FOUND', message: 'リソースが見つかりません' } },
    404,
  );
});
```

## レスポンス形式

- JSON レスポンスは統一されたフォーマットで返す
- 成功時: `{ data: T }` または `{ data: T[], meta: { total, page, limit } }`
- エラー時: `{ error: { code: string, message: string } }`
- 適切な HTTP ステータスコードを使う
  - `200`: 取得成功
  - `201`: 作成成功
  - `204`: 削除成功（ボディなし）
  - `400`: バリデーションエラー
  - `401`: 未認証
  - `403`: 権限不足
  - `404`: リソースなし
  - `409`: 競合（重複）
  - `500`: サーバー内部エラー

## Context の活用

- `c.env` で環境変数にアクセスする（Cloudflare Workers の場合）
- `c.var` でミドルウェアから渡された値を型安全に取得する
- `c.set()` / `c.get()` でリクエストスコープの値を共有する
- Context の型は `Env` ジェネリクスで定義する

```typescript
// 環境変数と Context の型定義
type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
};

type Variables = {
  userId: string;
  userRole: 'admin' | 'user';
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ミドルウェアで値をセット
app.use('/api/*', async (c, next) => {
  const userId = verifyToken(c.req.header('Authorization'));
  c.set('userId', userId);
  await next();
});

// ハンドラで値を取得
app.get('/api/me', (c) => {
  const userId = c.get('userId'); // 型安全
  return c.json({ userId });
});
```

## テスト

- `app.request()` を使ったインテグレーションテストを書く
- ルートごとにテストファイルを作成する（`src/routes/users.test.ts`）
- 正常系・異常系・境界値のテストを網羅する

```typescript
import { describe, it, expect } from 'vitest';
import app from '@/index';

describe('GET /api/v1/users', () => {
  it('ユーザー一覧を返す', async () => {
    const res = await app.request('/api/v1/users');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toBeInstanceOf(Array);
  });

  it('不正なIDで404を返す', async () => {
    const res = await app.request('/api/v1/users/invalid-id');
    expect(res.status).toBe(404);
  });
});
```
