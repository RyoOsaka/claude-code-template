# CLAUDE.md

## Communication

日本語でコミュニケーションする。

## Tech Stack

- Runtime: Node.js 20
- Frontend: React 19 + TypeScript
- Backend: Hono + TypeScript
- Database: PostgreSQL 16
- ORM: Drizzle
- Validation: Zod
- Testing: Vitest
- Linter: Biome
- Package Manager: pnpm (workspace)

## Development Commands

```bash
pnpm install              # 依存パッケージインストール
pnpm dev                  # API + Web 同時起動
pnpm dev:api              # API サーバー起動 (localhost:3000)
pnpm dev:web              # Vite 開発サーバー起動 (localhost:5173)
pnpm build                # プロダクションビルド
pnpm lint                 # Biome lint 実行
pnpm lint:fix             # Biome lint + 自動修正
pnpm typecheck            # 型チェック（tsc --build）
pnpm test                 # テスト実行
pnpm test:watch           # テスト（ウォッチモード）
pnpm db:generate          # Drizzle スキーマからマイグレーション生成
pnpm db:migrate           # マイグレーション適用
pnpm db:studio            # Drizzle Studio 起動
docker compose up -d      # PostgreSQL 起動
```

## Project Structure

```
.
├── CLAUDE.md                     # プロジェクト指示
├── README.md                     # プロジェクト説明
├── CHECKLIST.md                  # 設計判断チェックリスト
├── package.json                  # ワークスペースルート
├── pnpm-workspace.yaml           # pnpm workspace 設定
├── biome.json                    # Biome lint + formatter
├── tsconfig.json                 # TypeScript プロジェクト参照
├── docker-compose.yml            # PostgreSQL
├── .env.example                  # 環境変数テンプレート
├── .claude/
│   ├── settings.json             # Claude Code 設定 + hooks
│   ├── rules/                    # コンテキストルール
│   ├── skills/                   # スキル定義
│   └── hooks/scripts/            # Hook スクリプト
├── .github/
│   ├── ISSUE_TEMPLATE/           # Issue テンプレート
│   └── PULL_REQUEST_TEMPLATE/    # PR テンプレート
├── examples/                     # テンプレートサンプル（参照用）
│   ├── CLAUDE.md.template
│   ├── rules/
│   ├── skills/
│   └── hooks/
└── packages/
    ├── api/                      # Hono バックエンド
    │   ├── src/
    │   │   ├── index.ts          # エントリポイント
    │   │   ├── app.ts            # Hono app 定義
    │   │   ├── routes/           # ルートハンドラ
    │   │   ├── middleware/        # ミドルウェア
    │   │   ├── services/         # ビジネスロジック
    │   │   ├── db/               # Drizzle クライアント・スキーマ・マイグレーション
    │   │   ├── lib/              # errors, logger
    │   │   └── types/            # 型定義・環境変数バリデーション
    │   ├── drizzle.config.ts
    │   └── vitest.config.ts
    ├── web/                      # React + Vite フロントエンド
    │   ├── src/
    │   │   ├── main.tsx          # エントリポイント
    │   │   ├── App.tsx           # ルートコンポーネント
    │   │   ├── components/       # common/ + features/
    │   │   ├── pages/            # ページコンポーネント
    │   │   ├── hooks/            # カスタムフック
    │   │   ├── lib/              # API クライアント
    │   │   ├── types/            # 型定義
    │   │   ├── contexts/         # React Context
    │   │   ├── constants/        # 定数
    │   │   └── styles/           # CSS 変数・グローバルスタイル
    │   ├── vite.config.ts
    │   └── vitest.config.ts
    └── shared/                   # 共有パッケージ（型・Zod スキーマ）
        └── src/index.ts
```

## Git Workflow

GitHub Flow。Issue 駆動開発を採用する。

### Issue 駆動開発フロー

```
Issue 取得 → ブランチ作成 → TDD → 品質チェック → コミット → PR → マージ
```

1. **Issue 取得**: `gh issue view #N` で要件を確認
2. **ブランチ作成**: `<type>/#<issue>-<description>` 形式
3. **TDD**: Red（テスト先行）→ Green（実装）→ Refactor
4. **品質チェック**: `pnpm lint && pnpm typecheck && pnpm test`
5. **コミット**: `<type>: <説明> (#<issue>)` 形式
6. **PR 作成**: `Closes #<issue>` を含める
7. **マージ**: PR マージで Issue 自動クローズ

### ブランチ命名

Issue 番号を含める:
- `feature/#123-user-login` - 新機能
- `fix/#456-auth-bug` - バグ修正
- `chore/#789-upgrade-deps` - 環境整備
- `docs/#012-api-reference` - ドキュメント

### コミット規約（Conventional Commits）
```
<type>: <日本語の説明> (#<issue>)
```
- type: feat/fix/docs/style/refactor/test/chore

### コミットメッセージ生成
Claude Code の `/commit` コマンドを使用してコミットメッセージを自動生成する。
生成時は以下のルールに従うこと:
- 形式: `<type>: <日本語の説明> (#<issue>)`
- type は変更内容に応じて適切に選択（feat/fix/docs/style/refactor/test/chore）
- 説明は「何をしたか」ではなく「なぜ必要か」を重視
- 50文字以内を目安に簡潔に記述
- 複数の変更がある場合は本文に箇条書きで補足
- Issue 番号を末尾に含める

### PR 作成
PR 作成時はブランチ名からテンプレートを選択し、`gh pr create` で作成する:

| ブランチ prefix | テンプレート | 用途 |
|----------------|-------------|------|
| `feature/` | `feature.md` | 新機能追加 |
| `fix/` | `bugfix.md` | バグ修正 |
| `docs/` | `docs.md` | ドキュメント変更 |
| `refactor/` | `refactor.md` | リファクタリング |
| `chore/` | `chore.md` | 依存更新・CI・設定変更 |

```bash
gh pr create --template <template>.md
```

### ルール
- NEVER: main に直接コミット
- YOU MUST: feature ブランチで作業 → PR → マージ → ブランチ削除
- YOU MUST: コード変更時は「ブランチ作成 → commit → push」を一連の流れで行う

## Environment

- Docker First: `docker compose up` で環境が立ち上がること
- 設定値は全て環境変数（`.env`）。ハードコード厳禁
- ロックファイル（`pnpm-lock.yaml`）は必ずコミット
- 依存ライブラリのバージョンは固定する

## Critical Rules

### NEVER
- `.env` を git にコミットしない
- テスト失敗状態でコミットしない
- 認証情報をハードコードしない
- テストより先に実装コードを書かない（TDD 必須）
- 失敗するテストを確認せずに実装を書かない（RED フェーズをスキップしない）
- examples/ 内のファイルを変更しない（テンプレート参照用として維持）

### YOU MUST
- コミット前に lint と型チェックを通す
- 非同期処理にエラーハンドリングを実装する
- 新機能は必ず TDD で開発する（Red → Green → Refactor）
- 機能追加時は先にテストを書き、`pnpm test` で失敗を確認してから実装する
- 実装後は `pnpm test` で成功を確認する
- API 作成時は Zod スキーマを定義し、モックも併せて作成する
- 画面を伴う機能には E2E テストを作成する（主要な操作フローをカバー）

## AI Assistant Behavior

- プロアクティブに改善提案する
- セキュリティリスクは即座に指摘する
- 変更は小さな単位で、動作確認を頻繁に実施
- 既存のコード構造とパターンに従う
