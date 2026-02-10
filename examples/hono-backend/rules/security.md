# API サーバーセキュリティルール

## 認証

- JWT またはセッションベースの認証を使用する
- 認証ミドルウェアで保護対象のルートをガードする
- トークンの有効期限を設定する（アクセストークン: 短め、リフレッシュトークン: 長め）
- パスワードは bcrypt または argon2 でハッシュ化する（平文保存は厳禁）
- 認証情報はリクエストヘッダ（`Authorization: Bearer <token>`）で受け渡す

```typescript
// 認証ミドルウェアの適用例
app.use('/api/v1/*', authMiddleware);         // API 全体を保護
app.use('/api/v1/admin/*', adminMiddleware);  // 管理者ルートを追加保護

// 公開エンドポイントは認証ミドルウェアの前に定義する
app.post('/api/v1/auth/login', loginHandler);
app.post('/api/v1/auth/register', registerHandler);
app.get('/api/v1/health', healthHandler);
```

## 認可

- リソースへのアクセス権限をチェックする（自分のデータのみ操作可能）
- ロールベースアクセス制御（RBAC）を実装する
- 権限不足の場合は 403 Forbidden を返す
- 管理者操作は別ルートグループに分離する

## CORS

- 環境ごとに CORS を設定する（開発: `localhost`、本番: 特定ドメインのみ）
- ワイルドカード `*` は開発環境のみ許容する
- 必要な HTTP メソッドのみ許可する
- `credentials: true` の場合はオリジンを明示する（`*` は不可）

```typescript
import { cors } from 'hono/cors';

app.use('/api/*', cors({
  origin: (origin) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? [];
    return allowedOrigins.includes(origin) ? origin : '';
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
}));
```

## 入力バリデーション

- すべての API 入力を Zod でバリデーションする（リクエストボディ、クエリ、パスパラメータ）
- 文字列の長さ制限を設ける（バッファオーバーフロー・DoS 対策）
- 数値の範囲制限を設ける
- ファイルアップロードのサイズ・MIME タイプを制限する
- ユーザー入力を SQL クエリやシェルコマンドに直接埋め込まない

```typescript
// バリデーションの例
const createUserSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email().max(255).toLowerCase(),
  password: z.string().min(8).max(128),
  bio: z.string().max(1000).optional(),
});
```

## レートリミット

- API エンドポイントにレートリミットを設定する
- 認証エンドポイント（ログイン、登録）は特に厳しく制限する
- IP アドレスまたはユーザー単位で制限する
- 制限超過時は 429 Too Many Requests を返す
- `Retry-After` ヘッダを含める

```typescript
import { rateLimiter } from 'hono-rate-limiter';

// グローバルレートリミット
app.use('/api/*', rateLimiter({
  windowMs: 15 * 60 * 1000,  // 15分
  limit: 100,                 // 最大100リクエスト
  keyGenerator: (c) => c.req.header('x-forwarded-for') ?? 'unknown',
}));

// 認証エンドポイント: より厳しい制限
app.use('/api/v1/auth/*', rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  keyGenerator: (c) => c.req.header('x-forwarded-for') ?? 'unknown',
}));
```

## 環境変数

- すべての秘密情報（API キー、DB 接続文字列、JWT シークレット）は `.env` に格納する
- `.env` は `.gitignore` に含める（絶対にコミットしない）
- `.env.example` をリポジトリに含め、必要な変数名を明示する（値は空にする）
- 環境変数は起動時にバリデーションする（必須変数が未設定ならエラーで停止）
- コード内に認証情報をハードコードしない

```typescript
// src/types/env.ts - 環境変数のバリデーション
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
});

export const env = envSchema.parse(process.env);
```

## SQL インジェクション対策

- Drizzle ORM のクエリビルダを使用する（生 SQL を直接書かない）
- やむを得ず生 SQL を使う場合は `sql` テンプレートリテラルを使う（パラメータ化クエリ）
- ユーザー入力をテーブル名やカラム名に直接使用しない

```typescript
import { sql } from 'drizzle-orm';

// 良い例: Drizzle クエリビルダ
const result = await db.select().from(users).where(eq(users.id, userId));

// 良い例: パラメータ化された生 SQL
const result = await db.execute(sql`SELECT * FROM users WHERE id = ${userId}`);

// 悪い例: 文字列結合（SQL インジェクションの脆弱性）
const result = await db.execute(`SELECT * FROM users WHERE id = '${userId}'`);
```

## セキュリティヘッダ

- Hono の `secureHeaders` ミドルウェアを使用する
- HSTS（HTTP Strict Transport Security）を有効にする
- `X-Content-Type-Options: nosniff` を設定する
- `X-Frame-Options: DENY` を設定する
- 不要な `X-Powered-By` ヘッダを削除する

```typescript
import { secureHeaders } from 'hono/secure-headers';

app.use('*', secureHeaders({
  strictTransportSecurity: 'max-age=31536000; includeSubDomains',
  xContentTypeOptions: 'nosniff',
  xFrameOptions: 'DENY',
  referrerPolicy: 'strict-origin-when-cross-origin',
}));
```

## ログとモニタリング

- 認証の失敗、権限エラー、異常なリクエストパターンをログに記録する
- ログにパスワードやトークンなどの機密情報を含めない
- 構造化ログ（JSON 形式）を使用する
- 本番環境ではエラーの詳細（スタックトレース）をレスポンスに含めない

## 依存関係

- ライブラリのバージョンを固定する（`^` `~` 不使用）
- `pnpm audit` で脆弱性を定期的にチェックする
- 不要な依存関係は削除する
