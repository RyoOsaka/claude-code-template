# TypeScript ルール（バックエンド）

## 型定義
- `any` 禁止。`unknown` + 型ガードで絞り込む
- API のリクエスト/レスポンスは必ず型定義する
- Union 型で取りうる値を制限する（`'admin' | 'user' | 'guest'` など）
- Drizzle スキーマから推論される型（`InferSelectModel`, `InferInsertModel`）を活用する
- Zod スキーマから `z.infer<typeof schema>` で型を導出する（型の二重定義を避ける）
- 環境変数は `src/types/env.ts` で型定義し、起動時にバリデーションする

## ランタイムバリデーション
- API の入力値（リクエストボディ、クエリパラメータ、パスパラメータ）は Zod で検証する
- Zod スキーマはルートハンドラと同じファイル、または `src/lib/validation.ts` に配置する
- バリデーションエラーは 400 Bad Request で返す
- エラーメッセージはユーザーに分かりやすい形式にする

```typescript
// 良い例: Zod スキーマから型を導出
const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(['admin', 'user']),
});
type CreateUserInput = z.infer<typeof createUserSchema>;

// 悪い例: 型とスキーマを別々に定義（乖離のリスク）
interface CreateUserInput { name: string; email: string; }
const createUserSchema = z.object({ name: z.string(), email: z.string() });
```

## エラーハンドリング
- 非同期処理は必ず try-catch で囲む
- `error instanceof Error` で型ガードしてからメッセージを参照する
- エラーは握りつぶさない。ログ出力 + 適切な HTTP ステータスで返す
- カスタムエラークラスを定義して、エラーの種類を区別する

```typescript
// カスタムエラークラスの例
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource}（ID: ${id}）が見つかりません`, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}
```

## 関数の設計
- 関数の引数と戻り値に型を明示する
- 戻り値の型が複雑な場合は名前付き型を定義する
- サービス層の関数は副作用を明示する（DB 操作、外部 API 呼び出し等）
- 純粋関数とI/O を伴う関数を明確に分離する

## インポート
- ESModules（`import/export`）を使用する
- パスエイリアス `@/` を使用する（`@/routes/users` など）
- 型のインポートには `import type` を使う
- 循環参照を避ける（サービス間の依存は DI パターンで解決）

```typescript
// 良い例
import type { Context } from 'hono';
import type { InferSelectModel } from 'drizzle-orm';
import { users } from '@/db/schema/users';
import { NotFoundError } from '@/lib/errors';

// 悪い例
import { Context } from 'hono'; // 型のみの場合は import type を使う
import { users } from '../../db/schema/users'; // 相対パスは避ける
```
