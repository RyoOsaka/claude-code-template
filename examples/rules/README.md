# Rules サンプル

Claude Code のルールファイル（`.claude/rules/`）のサンプル集。

## 使い方

必要なルールを `.claude/rules/` にコピーする:

```bash
cp examples/rules/<category>/*.md .claude/rules/
```

## スタック別おすすめ組み合わせ

### Hono バックエンド

```bash
cp examples/rules/hono/hono.md .claude/rules/
cp examples/rules/typescript/typescript-backend.md .claude/rules/typescript.md
cp examples/rules/api-design/api-design.md .claude/rules/
cp examples/rules/database/database.md .claude/rules/
cp examples/rules/security/security.md .claude/rules/
cp examples/rules/testing/testing-backend.md .claude/rules/testing.md
cp examples/rules/error-handling/error-handling.md .claude/rules/
cp examples/rules/logging/logging.md .claude/rules/
```

### React + Vite フロントエンド

```bash
cp examples/rules/react/react.md .claude/rules/
cp examples/rules/typescript/typescript-frontend.md .claude/rules/typescript.md
cp examples/rules/styling/styling.md .claude/rules/
cp examples/rules/api-client/api-client.md .claude/rules/
cp examples/rules/testing/testing-frontend.md .claude/rules/testing.md
```

### 共通（どのプロジェクトでも推奨）

```bash
cp examples/rules/tdd/tdd.md .claude/rules/
```

## ルール一覧

| カテゴリ | ファイル | 内容 |
|---------|---------|------|
| hono | hono.md | Hono プロジェクト規約（ルート構成・ミドルウェア） |
| react | react.md | React コンポーネント設計・Hooks・状態管理 |
| typescript | typescript-backend.md | バックエンド向け TypeScript 規約 |
| typescript | typescript-frontend.md | フロントエンド向け TypeScript 規約 |
| api-design | api-design.md | REST API 設計（URL・レスポンス形式） |
| api-client | api-client.md | API クライアント設計・エラーハンドリング |
| api-mock | api-mock.md | API モック戦略・MSW 設定 |
| database | database.md | DB 設計・Drizzle スキーマ・マイグレーション |
| testing | testing-backend.md | バックエンドテスト（Vitest・モック戦略） |
| testing | testing-frontend.md | フロントエンドテスト（Testing Library・MSW） |
| security | security.md | 認証・CORS・レートリミット |
| logging | logging.md | ログレベル・構造化ログ |
| error-handling | error-handling.md | エラークラス階層・グローバルハンドラ |
| styling | styling.md | CSS Modules・CSS 変数・レスポンシブ |
| tdd | tdd.md | TDD プロセス（Red → Green → Refactor） |
| infrastructure | terraform.md | Terraform 規約 |
| infrastructure | infrastructure-design.md | インフラ設計方針 |

## その他のファイル

| ファイル | 内容 |
|---------|------|
| .env.example | 環境変数テンプレート |
