# CLAUDE.md

## Communication

日本語でコミュニケーションする。

## Tech Stack

<!-- プロジェクトの技術スタックを記載する。例: -->
<!-- - Frontend: React + TypeScript + Vite -->
<!-- - Backend: Hono + TypeScript -->
<!-- - Database: PostgreSQL -->
<!-- - Hosting: Vercel -->
<!-- - Package Manager: pnpm -->

## Development Commands

<!-- プロジェクトのコマンドを記載する。例: -->
<!-- ```bash -->
<!-- pnpm install              # 依存パッケージインストール -->
<!-- pnpm dev                  # 開発サーバー起動 -->
<!-- pnpm build                # プロダクションビルド -->
<!-- pnpm lint                 # Linter -->
<!-- pnpm typecheck            # 型チェック -->
<!-- pnpm test                 # テスト実行 -->
<!-- docker compose up         # Docker 開発環境起動 -->
<!-- ``` -->

## Project Structure

<!-- プロジェクトのディレクトリ構造を記載する。例: -->
<!-- ``` -->
<!-- src/ -->
<!-- ├── components/ -->
<!-- ├── pages/ -->
<!-- ├── hooks/ -->
<!-- ├── lib/ -->
<!-- ├── types/ -->
<!-- └── constants/ -->
<!-- ``` -->

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
- YOU MUST: コード変更時は「ブランチ作成 → commit → push」を一連の流れで行う

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
- 新機能にはテストを作成する

<!-- スタック固有のルールは .claude/rules/ に追加する -->

## AI Assistant Behavior

- プロアクティブに改善提案する
- セキュリティリスクは即座に指摘する
- 変更は小さな単位で、動作確認を頻繁に実施
- 既存のコード構造とパターンに従う
