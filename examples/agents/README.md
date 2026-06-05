# Agents サンプル

Claude Code のサブエージェント定義（`.claude/agents/`）のサンプル集。

## サブエージェントとは

独立したコンテキストウィンドウで動く専門エージェント。検索ログやファイル内容でメイン会話を汚さずに、調査・レビュー・テスト実行などを別窓で処理し、**要約だけ**を返す。

- **コンテキスト節約**: 作業の過程をメイン会話に持ち込まない
- **安全化**: `tools` でツールを制限（読み取り専用など）
- **コスト削減**: `model: haiku` など安いモデルに振れる

## 使い方

必要なエージェントを `.claude/agents/` にコピーする:

```bash
cp examples/agents/code-reviewer.md .claude/agents/
```

配置場所と優先度:

| 場所 | スコープ |
|------|---------|
| `.claude/agents/` | プロジェクト（チーム共有・バージョン管理推奨） |
| `~/.claude/agents/` | 全プロジェクト（個人用） |
| プラグインの `agents/` | プラグイン有効時 |

## 起動方式

`description` を見て Claude が**自動委任**する。確実に起動したい場合は明示的に呼ぶ:

```
# 自然言語（Claude が委任判断）
test-runner で失敗テストを直して

# @メンション（確実に起動・1タスク）
@agent-code-reviewer 認証変更を見て

# セッション全体（メインスレッドをそのエージェント化）
claude --agent code-reviewer
```

自動起動の精度は `description` の具体性で決まる。「いつ使うか」を明記する。

## エージェント一覧

| エージェント | model | tools | 用途 |
|-------------|-------|-------|------|
| explorer | haiku | Read, Grep, Glob | コードベース調査（読み取り専用・コンテキスト節約） |
| code-reviewer | sonnet | Read, Grep, Glob, Bash | 差分・PR レビュー（書き込み不可・ツール制限） |
| test-runner | haiku | Bash, Read, Grep | テスト実行・失敗解析（安価なモデルでコスト減） |

3 つは「サブエージェントの 3 大価値（節約・安全化・コスト減）」を 1 本ずつ示すサンプル。スタック非依存でどのプロジェクトでも使える。

## agent team との関係

`examples/skills/agent-team/` は実験的な agent team 機能（複数セッション協働）の運用ガイド。チームの各役割（設計担当・レビュー担当など）を、ここで定義したサブエージェントで裏打ちできる。

## 拡張のヒント（スタック特化エージェント）

汎用 3 本に加え、スタックに合わせた特化エージェントも作れる:

- **api-designer** — Zod スキーマ + Hono ルート設計（agent team の設計担当）
- **db-reviewer** — Drizzle スキーマ/マイグレーションのレビュー（DB 変更は人間承認案件）

`examples/rules/` の `hono.md` / `database.md` などをシステムプロンプトに織り込むと、プロジェクト規約に沿ったエージェントになる。
