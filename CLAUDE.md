# CLAUDE.md

このリポジトリは Claude Code プロジェクトテンプレート。
Claude Code を使った開発の生産性を最大化するための設定・ルール・スキルのサンプル集。

## Communication

日本語でコミュニケーションする。

## Project Overview

このリポジトリはテンプレート。実際のアプリケーションコードは含まない。

- `CLAUDE.md` - このリポジトリ用の指示（今読んでいるファイル）
- `examples/CLAUDE.md.template` - ユーザーがコピーして使うテンプレート
- `examples/rules/` - ルールサンプル
- `examples/skills/` - スキルサンプル
- `examples/agents/` - サブエージェントサンプル
- `examples/statusline/` - ステータスラインサンプル
- `examples/output-styles/` - 出力スタイルサンプル
- `examples/mcp/` - MCP サーバー設定サンプル
- `examples/hooks/` - Hook サンプル
- `.claude/` - このリポジトリの Claude Code 設定

## Project Structure

```
.
├── CLAUDE.md                     # このリポジトリ用（開発者向け）
├── README.md                     # ユーザー向けドキュメント
├── CHECKLIST.md                  # 設計判断チェックリスト
├── .claude/
│   └── settings.json             # Claude Code 設定
├── .github/
│   ├── ISSUE_TEMPLATE/           # Issue テンプレート
│   └── PULL_REQUEST_TEMPLATE/    # PR テンプレート
└── examples/
    ├── CLAUDE.md.template        # コピー用テンプレート
    ├── rules/                    # ルールサンプル
    ├── skills/                   # スキルサンプル
    ├── agents/                   # サブエージェントサンプル
    ├── statusline/               # ステータスラインサンプル
    ├── output-styles/            # 出力スタイルサンプル
    ├── mcp/                      # MCP サーバー設定サンプル
    └── hooks/                    # Hook サンプル
```

## Git Workflow

GitHub Flow。main は保護ブランチ。

### ブランチ命名
- `feature/xxx` - 新機能・新サンプル追加
- `fix/xxx` - バグ修正・誤り訂正
- `chore/xxx` - 設定変更・依存更新
- `docs/xxx` - ドキュメント改善
- `refactor/xxx` - リファクタリング

### コミット規約（Conventional Commits）
```
<type>: <日本語の説明>
```
- type: feat/fix/docs/style/refactor/chore

### PR 作成
ブランチ名からテンプレートを選択:

| ブランチ prefix | テンプレート |
|----------------|-------------|
| `feature/` | `feature.md` |
| `fix/` | `bugfix.md` |
| `docs/` | `docs.md` |
| `refactor/` | `refactor.md` |
| `chore/` | `chore.md` |

### ルール
- NEVER: main に直接コミット
- YOU MUST: feature ブランチで作業 → PR → マージ → ブランチ削除

## Critical Rules

### NEVER
- examples/ 内のファイルを壊さない
- テンプレートのプレースホルダー（`[REQUIRED: ...]`）を具体的な値で埋めない
- README.md の説明と examples/ の内容が矛盾する状態にしない

### YOU MUST
- 新規ディレクトリを作成したら README.md を追加する
- examples/ にサンプルを追加したら対応する README.md を更新する
- ルール追加時は `examples/rules/README.md` の一覧表を更新する
- スキル追加時は `examples/skills/README.md` の一覧表を更新する
- サブエージェント追加時は `examples/agents/README.md` の一覧表を更新する
- ステータスライン・出力スタイル追加時は対応する README.md を更新する
- MCP サーバー追加時は `examples/mcp/README.md` を更新する
- Hook 追加時は `examples/hooks/README.md` を更新する
- テンプレートの構造を変更したら README.md のファイル構成図を更新する

## AI Assistant Behavior

- ユーザー視点でテンプレートの使いやすさを考える
- コンテキストコスト削減を意識した設計を提案する
- 新しいサンプル追加時は既存の粒度・スタイルに合わせる
- README.md の説明が最新状態を反映しているか確認する
