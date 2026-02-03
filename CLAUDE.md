# CLAUDE.md

## Communication

日本語でコミュニケーションする。

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Supabase (PostgreSQL, Auth, Storage)
- Styling: CSS Modules（検討中: TailwindCSS）
- State: React Context API / Zustand
- Data Fetching: TanStack Query
- Hosting: Vercel
- Package Manager: pnpm

## Development Commands

```bash
pnpm install              # 依存パッケージインストール
pnpm dev                  # 開発サーバー起動
pnpm build                # プロダクションビルド
pnpm preview              # ビルドプレビュー
pnpm lint                 # ESLint
pnpm typecheck            # 型チェック
pnpm test                 # テスト実行
pnpm types:gen            # Supabase 型定義生成
docker compose up         # Docker 開発環境起動
```

## Project Structure

```
src/
├── components/
│   ├── common/           # 汎用 UI コンポーネント
│   └── features/         # 機能特化コンポーネント
├── pages/                # ページコンポーネント
├── hooks/                # カスタムフック
├── lib/supabase.ts       # Supabase クライアント（一元管理）
├── types/database.types.ts  # Supabase 自動生成型
├── contexts/             # React Context
└── constants/            # 定数
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

### ルール
- NEVER: main に直接コミット
- YOU MUST: feature ブランチで作業 → PR → マージ → ブランチ削除

## Environment

- Docker First: `docker compose up` で環境が立ち上がること
- 設定値は全て環境変数（`.env`）。ハードコード厳禁
- pnpm 使用。バージョンは `packageManager` で固定
- 依存ライブラリのバージョンは固定（`^` `~` 不使用）
- `pnpm-lock.yaml` は必ずコミット

## Critical Rules

### NEVER
- `any` 型を使用しない（`unknown` + 型ガードを使う）
- `@ts-ignore` / `@ts-nocheck` を使用しない
- Supabase の認証情報をハードコードしない
- RLS なしでテーブルを公開しない
- `.env` を git にコミットしない
- テスト失敗状態でコミットしない

### YOU MUST
- すべてのコンポーネントに Props 型定義を付ける
- `tsconfig.json` で `strict: true`
- 非同期処理にエラーハンドリングを実装する
- 新機能にはテストを作成する
- コミット前に `pnpm lint` と `pnpm typecheck` を通す

## AI Assistant Behavior

- プロアクティブに改善提案する
- セキュリティリスクは即座に指摘する
- 変更は小さな単位で、動作確認を頻繁に実施
- 既存のコード構造とパターンに従う
