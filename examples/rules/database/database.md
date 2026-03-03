---
paths:
  - "src/db/**"
  - "drizzle/**"
  - "drizzle.config.ts"
---

# データベースルール

## テーブル命名

- テーブル名は**複数形**のスネークケース（`users`, `order_items`, `user_profiles`）
- 中間テーブルは両テーブル名をアルファベット順で結合（`posts_tags`, `roles_users`）
- テーブル名をそのまま Drizzle のエクスポート名に使う

```typescript
// 良い例
export const users = pgTable('users', { ... });
export const orderItems = pgTable('order_items', { ... });

// 悪い例
export const user = pgTable('user', { ... });        // 単数形
export const OrderItems = pgTable('OrderItems', { ... }); // PascalCase
```

## カラム命名

- カラム名はスネークケース（`created_at`, `user_id`）
- 全テーブル共通カラム:
  - `id`: UUID（`gen_random_uuid()` で自動生成）
  - `created_at`: `timestamp with time zone`、`defaultNow()`
  - `updated_at`: `timestamp with time zone`、`defaultNow()`（INSERT 時は DB デフォルト、UPDATE 時は `updatedAt: new Date()` でアプリ側セット）
- 論理削除を使う場合: `deleted_at`: `timestamp with time zone`（nullable）
- 外部キーは `{参照先テーブル名の単数形}_id`（`user_id`, `post_id`）
- boolean カラムは `is_` または `has_` プレフィックス（`is_active`, `has_verified`）

```typescript
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
```

## Drizzle スキーマ設計

- スキーマは `src/db/schema/` にテーブルごとのファイルで配置する
- `src/db/schema/index.ts` で全スキーマをまとめて re-export する
- 型は `InferSelectModel` / `InferInsertModel` で導出する（手動定義しない）

```typescript
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users } from '@/db/schema/users';

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
```

## リレーション

- Drizzle の `relations()` でリレーションを定義する
- リレーション定義はスキーマファイルの末尾に配置する
- 1:N は `one` / `many` で定義する
- N:M は中間テーブルを作成する

```typescript
import { relations } from 'drizzle-orm';

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));
```

## インデックス

- 検索・ソートに使うカラムにインデックスを付与する
- 外部キーカラムにインデックスを付与する
- ユニーク制約が必要なカラムには `uniqueIndex` を使う
- 複合インデックスは使用頻度の高いクエリパターンに合わせる
- インデックス名: `{テーブル名}_{カラム名}_idx`（ユニーク: `{テーブル名}_{カラム名}_unique`）

```typescript
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  teamId: uuid('team_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('users_email_unique').on(table.email),
  index('users_team_id_idx').on(table.teamId),
  index('users_created_at_idx').on(table.createdAt),
]);
```

## マイグレーション

- Drizzle Kit でマイグレーションを管理する（`pnpm db:generate` → `pnpm db:migrate`）
- 自動生成されたマイグレーションファイルを手動で編集しない
- 破壊的変更（カラム削除、型変更）は段階的に行う:
  1. 新カラムを追加してデータを移行
  2. アプリケーションコードを新カラムに切り替え
  3. 旧カラムを削除
- 本番デプロイ前にマイグレーションをレビューする
- ロールバック手順を事前に確認する

## クエリパターン

- Drizzle のクエリビルダを使用する（生 SQL を直接書かない）
- `select` / `insert` / `update` / `delete` はビルダ API を使う
- 複雑なクエリでやむを得ない場合のみ `sql` テンプレートリテラルを使う
- N+1 問題を防ぐ: リレーションデータの取得には `with` を使う

```typescript
// 良い例: リレーション付き取得
const usersWithPosts = await db.query.users.findMany({
  with: { posts: true },
  where: eq(users.isActive, true),
  limit: 20,
});

// 良い例: ビルダ API
const result = await db
  .select()
  .from(users)
  .where(and(eq(users.isActive, true), gte(users.createdAt, since)))
  .orderBy(desc(users.createdAt))
  .limit(20);

// 悪い例: 文字列結合
const result = await db.execute(`SELECT * FROM users WHERE id = '${id}'`);
```

## DB クライアント

- Drizzle クライアントは `src/db/client.ts` で一元管理する
- コネクションプールの設定を明示する
- テスト用のクライアントを別途用意する

```typescript
// src/db/client.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/db/schema';
import { env } from '@/types/env';

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
});

export const db = drizzle(pool, { schema });
```
