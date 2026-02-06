# 推奨設定プリセット

CHECKLIST.md の推奨オプション（★）をそのまま採用する場合のテンプレート。
必要な箇所をコピーして CLAUDE.md や .claude/rules/ に反映する。

---

## CLAUDE.md に追記する内容

### Tech Stack セクション

```markdown
## Tech Stack

- Runtime: Node.js
- Frontend: React + TypeScript + Vite
- Backend: Hono + TypeScript
- Database: PostgreSQL
- ORM: Drizzle
- Validation: Zod
- Testing: Vitest + Playwright
- Linter: Biome
- Hosting: Vercel / Cloudflare
- Package Manager: pnpm
```

### Critical Rules セクションに追記

```markdown
### NEVER
- `.env` を git にコミットしない
- テスト失敗状態でコミットしない
- 認証情報をハードコードしない
- 以下を AI が自律的に決定しない:
  - 認証方式
  - DB スキーマ変更
  - 外部サービスの選定
  - 課金関連の実装

### YOU MUST
- コミット前に lint と型チェックを通す
- 非同期処理にエラーハンドリングを実装する
- 新機能には必ず単体テストを作成する（テストなしのコミットは禁止）
- API 作成時は Zod スキーマを定義し、モックも併せて作成する
- 設計判断が必要な場合は必ず人間に確認する
```

### AI Assistant Behavior セクションに追記

```markdown
## AI Assistant Behavior

- プロアクティブに改善提案する
- セキュリティリスクは即座に指摘する
- 変更は小さな単位で、動作確認を頻繁に実施
- 既存のコード構造とパターンに従う
- 機能は「画面が動く」を1単位として実装する
- agent team 使用時はデリゲートモードで調整に専念する
- 設計判断が必要な場合はプラン承認を求める
```

---

## .claude/rules/database.md

```markdown
# データベース設計ルール

## 基本方針

- 論理削除を採用（`deleted_at` カラム）
- 主キーは UUID を使用
- タイムスタンプは UTC 統一
- 楽観的ロック用に `version` カラムを追加
- 監査用に `created_by` / `updated_by` カラムを追加

## テーブル設計テンプレート

\`\`\`sql
CREATE TABLE example (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- ビジネスカラム
  name VARCHAR(255) NOT NULL,

  -- 監査カラム
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),

  -- 楽観的ロック
  version INTEGER NOT NULL DEFAULT 1,

  -- 論理削除
  deleted_at TIMESTAMPTZ
);
\`\`\`

## Drizzle スキーマ例

\`\`\`typescript
import { pgTable, uuid, varchar, timestamp, integer } from 'drizzle-orm/pg-core';

export const example = pgTable('example', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),

  version: integer('version').notNull().default(1),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
\`\`\`
```

---

## .claude/rules/api-design.md

```markdown
# API 設計ルール

## URL 設計

- バージョニング: `/api/v1/...`
- リソース名は複数形: `/api/v1/users`
- ネストは2階層まで: `/api/v1/users/:id/posts`

## ページネーション

cursor-based を採用:

\`\`\`typescript
// リクエスト
GET /api/v1/users?cursor=xxx&limit=20

// レスポンス
{
  "data": [...],
  "nextCursor": "yyy",
  "hasMore": true
}
\`\`\`

## レート制限

- 認証済み: 1000 req/min
- 未認証: 100 req/min
- ヘッダーで残り回数を返す: `X-RateLimit-Remaining`

## ファイルアップロード

署名付き URL を使用:

1. クライアント: POST /api/v1/upload/presigned
2. サーバー: 署名付き URL を返す
3. クライアント: 署名付き URL に直接アップロード
4. クライアント: アップロード完了を通知

## エラーレスポンス

\`\`\`typescript
{
  "code": "VALIDATION_ERROR",
  "message": "入力内容に問題があります",
  "details": {
    "email": "有効なメールアドレスを入力してください"
  }
}
\`\`\`
```

---

## .claude/rules/testing.md

```markdown
# テストルール

## カバレッジ目標

- 全体: 80% 以上
- 重要なビジネスロジック: 90% 以上

## テストの種類

| 種類 | ツール | 対象 |
|------|--------|------|
| Unit | Vitest | 関数、hooks、ユーティリティ |
| Integration | Vitest + MSW | API クライアント、コンポーネント |
| E2E | Playwright | 主要なユーザーフロー |

## テストデータ

Factory パターンを採用:

\`\`\`typescript
// src/test/factories/user.ts
import { faker } from '@faker-js/faker';

export const createMockUser = (overrides?: Partial<User>): User => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  ...overrides,
});
\`\`\`

## CI での実行

- PR 作成時: Unit + Integration
- main マージ時: 全テスト（E2E 含む）
```

---

## .claude/rules/frontend.md

```markdown
# フロントエンドルール

## 状態管理

- グローバル状態: Zustand または Jotai
- サーバー状態: TanStack Query
- フォーム状態: React Hook Form

## スタイリング

Tailwind CSS を使用:

- ユーティリティクラス優先
- カスタム CSS は最小限
- レスポンシブはモバイルファースト（sm: md: lg: xl:）

## コンポーネント

shadcn/ui を基本とする:

- 必要なコンポーネントのみインストール
- カスタマイズは `components/ui/` 内で行う

## フォーム

\`\`\`typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateUserSchema } from '@/schemas/user';

const form = useForm({
  resolver: zodResolver(CreateUserSchema),
});
\`\`\`

## ローディング・エラー表示

- ローディング: スケルトンコンポーネント
- エラー: 専用の ErrorBoundary + フォールバック UI
- 空状態: 専用の EmptyState コンポーネント
```

---

## .claude/rules/ai-delegation.md

```markdown
# AI 委任ルール

## 自動判断 OK（人間の確認不要）

- 変数・関数の命名
- コードフォーマット・スタイル
- リファクタリング（動作を変えない）
- テストコードの作成
- ドキュメントコメントの追加
- 軽微なバグ修正

## 人間承認必須（必ず確認を求める）

- 認証・認可の方式
- データベーススキーマの変更
- 外部サービス・ライブラリの選定
- 課金・決済関連の実装
- セキュリティに関わる変更
- API の破壊的変更
- インフラ構成の変更

## agent team 使用時

- リーダーはデリゲートモードで動作
- 設計フェーズではプラン承認必須
- 実装フェーズでは進捗を定期報告
- 人間承認必須項目は必ず確認を求める
```

---

## 使い方

1. このファイルの必要な部分をコピー
2. `CLAUDE.md` に該当セクションを追記
3. `.claude/rules/` に該当ファイルを作成
4. プロジェクト固有の要件に合わせて調整
