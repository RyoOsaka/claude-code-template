---
name: migration
description: DB マイグレーションを作成する。「テーブルを追加して」「カラムを追加して」「スキーマを変更して」などの指示で使用。
argument-hint: <テーブル名 or 変更内容>
disable-model-invocation: true
---

# DB マイグレーション生成

`$ARGUMENTS` に対する Drizzle スキーマ定義とマイグレーションを以下の手順で生成する。

## 1. ファイル構成

```
src/db/schema/$ARGUMENTS.ts           # スキーマ定義
src/db/schema/index.ts                # re-export に追加
drizzle/XXXX_migration_name.sql       # 自動生成（手動編集不可）
```

## 2. スキーマテンプレート

```typescript
import { pgTable, uuid, varchar, boolean, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// --- テーブル定義 ---

export const $ARGUMENTS = pgTable('$ARGUMENTS', {
  id: uuid('id').defaultRandom().primaryKey(),
  // TODO: $ARGUMENTS のカラムを定義
  // name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  // TODO: 必要なインデックスを定義
  // index('${ARGUMENTS}_name_idx').on(table.name),
]);

// --- リレーション ---

// export const ${ARGUMENTS}Relations = relations($ARGUMENTS, ({ one, many }) => ({
//   // TODO: リレーションを定義
// }));

// --- 型定義 ---

export type ${ARGUMENTS^} = InferSelectModel<typeof $ARGUMENTS>;
export type New${ARGUMENTS^} = InferInsertModel<typeof $ARGUMENTS>;
```

## 3. 作業手順

1. `src/db/schema/$ARGUMENTS.ts` にスキーマを定義する
2. `src/db/schema/index.ts` に re-export を追加する
   ```typescript
   export * from './$ARGUMENTS';
   ```
3. リレーションがある場合は関連テーブルのスキーマも更新する
4. マイグレーションを生成する
   ```bash
   pnpm db:generate
   ```
5. 生成された SQL を確認する（`drizzle/` ディレクトリ内の最新ファイル）
6. マイグレーションを適用する
   ```bash
   pnpm db:migrate
   ```
7. Drizzle Studio で結果を確認する（任意）
   ```bash
   pnpm db:studio
   ```

## 4. 破壊的変更の場合

カラム削除、型変更、NOT NULL 追加などの破壊的変更は段階的に行う:

### カラム削除
1. アプリケーションコードから該当カラムの参照を削除する
2. スキーマからカラムを削除する
3. マイグレーションを生成・適用する

### カラム型変更
1. 新カラムを追加する
2. データを移行する（SQL またはスクリプト）
3. アプリケーションコードを新カラムに切り替える
4. 旧カラムを削除する

### NOT NULL 追加
1. デフォルト値付きで NOT NULL 制約を追加する
2. 既存データにデフォルト値がセットされることを確認する

## 5. チェックリスト

- [ ] テーブル名が複数形・スネークケースになっている
- [ ] `id`, `created_at`, `updated_at` が含まれている
- [ ] 外部キーカラムに `_id` サフィックスが付いている
- [ ] 必要なインデックスを定義した
- [ ] `src/db/schema/index.ts` に re-export を追加した
- [ ] `InferSelectModel` / `InferInsertModel` で型を導出した
- [ ] `pnpm db:generate` でマイグレーションを生成した
- [ ] 生成された SQL を目視確認した
- [ ] `pnpm db:migrate` でマイグレーションを適用した
