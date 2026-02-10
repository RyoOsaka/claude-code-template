# CLAUDE.md

## Communication

日本語でコミュニケーションする。

## Tech Stack

<!-- ここにプロジェクトの技術スタックを記載する -->
<!-- 使わないスタックの行は削除する -->

- Runtime: <!-- Node.js / Bun / Deno / Cloudflare Workers -->
- Frontend: <!-- React / Next.js / Vue / Svelte --> + TypeScript <!-- + Vite -->
- Backend: <!-- Hono / Express / Fastify --> + TypeScript
- Database: <!-- PostgreSQL / MySQL / SQLite -->
- ORM: <!-- Drizzle / Prisma -->
- Validation: <!-- Zod / Valibot -->
- Testing: <!-- Vitest / Jest -->
- Linter: <!-- ESLint / Biome -->
- Hosting: <!-- Vercel / Cloudflare / AWS -->
- Package Manager: <!-- pnpm / npm / bun -->

## Development Commands

```bash
# --- 以下をプロジェクトに合わせて編集する ---
pnpm install              # 依存パッケージインストール
pnpm dev                  # 開発サーバー起動
pnpm build                # プロダクションビルド
pnpm preview              # ビルドプレビュー
pnpm lint                 # Linter 実行
pnpm typecheck            # 型チェック（tsc --noEmit）
pnpm test                 # テスト実行
pnpm test:watch           # テスト（ウォッチモード）
# pnpm db:generate        # ORM スキーマからマイグレーション生成
# pnpm db:migrate         # マイグレーション適用
# pnpm db:studio          # DB ブラウザ起動
docker compose up         # Docker 開発環境起動
```

## Project Structure

```
# --- 以下をプロジェクトに合わせて編集する ---
# フロントエンドの場合:
src/
├── components/           # UI コンポーネント
│   ├── common/           # 汎用（Button, Modal 等）
│   └── features/         # 機能特化（LoginForm 等）
├── pages/                # ページコンポーネント
├── hooks/                # カスタムフック
├── lib/                  # ユーティリティ、API クライアント
├── types/                # 型定義
├── contexts/             # React Context（状態管理）
└── constants/            # 定数

# バックエンドの場合:
src/
├── index.ts              # エントリポイント
├── routes/               # ルートハンドラ
├── middleware/            # ミドルウェア
├── services/             # ビジネスロジック
├── db/
│   ├── client.ts         # DB クライアント
│   ├── schema/           # ORM スキーマ定義
│   └── migrations/       # マイグレーション
├── types/                # 型定義
└── lib/                  # 共通ユーティリティ
```

## Git Workflow

GitHub Flow。main は保護ブランチ。

### ブランチ命名
- `feature/xxx` - 新機能
- `fix/xxx` - バグ修正
- `chore/xxx` - 環境整備
- `docs/xxx` - ドキュメント

### コミット規約（Conventional Commits）
```
feat|fix|docs|style|refactor|test|chore: 日本語の説明
```

### コミットメッセージ生成
Claude Code の `/commit` コマンドを使用してコミットメッセージを自動生成する。
生成時は以下のルールに従うこと:
- 形式: `<type>: <日本語の説明>`
- type は変更内容に応じて適切に選択（feat/fix/docs/style/refactor/test/chore）
- 説明は「何をしたか」ではなく「なぜ必要か」を重視
- 50文字以内を目安に簡潔に記述
- 複数の変更がある場合は本文に箇条書きで補足

### ルール
- NEVER: main に直接コミット
- YOU MUST: feature ブランチで作業 → PR → マージ → ブランチ削除
- YOU MUST: コード変更時は「ブランチ作成 → commit → push」を一連の流れで行う

### PR 作成
PR 作成時は `.github/PULL_REQUEST_TEMPLATE.md` の形式に従い、以下を自動で記入する:
- **概要**: ブランチ名とコミット履歴から目的を要約
- **変更内容**: 変更ファイルと diff から主な変更点を抽出
- **変更理由**: コミットメッセージから理由を推測して記載
- **テスト計画**: 変更内容に応じたテスト項目を提案
- **関連 Issue**: ブランチ名やコミットメッセージから Issue 番号を抽出

## Environment

- Docker First: `docker compose up` で環境が立ち上がること
- 設定値は全て環境変数（`.env`）。ハードコード厳禁
- ロックファイル（`pnpm-lock.yaml`, `package-lock.json` 等）は必ずコミット
- 依存ライブラリのバージョンは固定する

## Critical Rules

### NEVER
- `.env` を git にコミットしない
- テスト失敗状態でコミットしない
- 認証情報をハードコードしない

### YOU MUST
- コミット前に lint と型チェックを通す
- 非同期処理にエラーハンドリングを実装する
- 新機能には必ず単体テストを作成する（テストなしのコミットは禁止）
- API 作成時は Zod スキーマを定義し、モックも併せて作成する
- 画面を伴う機能には E2E テストを作成する（主要な操作フローをカバー）

<!-- スタック固有のルールは .claude/rules/ に追加する -->

## AI Assistant Behavior

- プロアクティブに改善提案する
- セキュリティリスクは即座に指摘する
- 変更は小さな単位で、動作確認を頻繁に実施
- 既存のコード構造とパターンに従う
