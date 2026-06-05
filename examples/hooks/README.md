# Hooks サンプル

Claude Code がツールを使う前後にシェルコマンドを自動実行する仕組み。

## 使い方

1. 必要なスクリプトをプロジェクトにコピー
2. `settings.json.example` の該当部分を `.claude/settings.json` にマージ
3. スクリプトに実行権限を付与: `chmod +x .claude/hooks/*.sh`

## フックの種類

Claude Code には多数のライフサイクルイベントがある。代表的なもの:

| フック | タイミング | ブロック | 用途 |
|--------|-----------|---------|------|
| SessionStart | セッション開始・再開時 | 不可 | context 注入（branch・状況など） |
| UserPromptSubmit | プロンプト送信時 | 可 | context 注入・プロンプト遮断 |
| PreToolUse | ツール実行**前** | 可 | 危険な操作をブロック |
| PostToolUse | ツール実行**後** | 不可 | 分析・整形 |
| SubagentStop | サブエージェント終了時 | 可 | 成果の検証 |
| Stop | 応答完了時 | 可 | 完了前の品質ゲート・自動レビュー |
| PreCompact | コンテキスト圧縮**前** | 不可 | 作業メモの退避 |
| SessionEnd | セッション終了時 | 不可 | 後片付け |

> 全イベント一覧は[公式ドキュメント](https://code.claude.com/docs/en/hooks)を参照。

## 実行フロー

```
SessionStart
   ↓
ユーザー指示 → UserPromptSubmit → Claude がツール選択 → PreToolUse → ツール実行 → PostToolUse
                                      （exit 2 / JSON でブロック可能）          ↓
                                                                  Claude が応答完了 → Stop
                                                                       （未完なら block で継続させる）
```

## なぜ Stop フックが重要か

CLAUDE.md の「YOU MUST レビューする」は**お願い**で、Claude が忘れても止められない。
Stop フックは応答完了の瞬間に発火し、`decision: block` で**完了そのものを差し止めて**指示を注入できる。
「実装したら必ずレビュー」「テストが通るまで完了させない」を**仕組みで強制**する唯一の手段。

## 同梱スクリプト

### protect-files.sh

**タイミング**: PreToolUse (Edit|Write)

`.env` やロックファイルへの編集をブロックする。

```bash
# ブロック対象
*.env, *.env.*, pnpm-lock.yaml, package-lock.json, yarn.lock
```

**動作**: 対象ファイルへの編集を検知すると exit 2 で操作をブロック。

### pre-commit-check.sh

**タイミング**: PreToolUse (Bash: git commit)

`git commit` 前に品質チェックを実行する。

```bash
pnpm lint && pnpm typecheck && pnpm test
```

**動作**: いずれかが失敗すると exit 2 でコミットをブロック。

### format-on-save.sh

**タイミング**: PostToolUse (Edit|Write)

ファイル保存後に Prettier でフォーマットする。

```bash
npx prettier --write <file>
```

**動作**: エラーは無視（2>/dev/null）。

### auto-review.sh

**タイミング**: Stop

応答完了前に、未コミットのコード変更を code-reviewer サブエージェントでレビューさせる。

**動作**: ソースの変更（`.ts/.tsx/.js/.jsx/.py/.go/.rs`）があれば `decision: block` で完了を差し止め、`additionalContext` で「code-reviewer でレビューしてから完了して」と注入する。`stop_hook_active` ガードで 1 ターンに 1 回だけ発火し、レビュー後はそのまま完了できる。`examples/agents/code-reviewer.md` と併用する。

### quality-gate.sh

**タイミング**: Stop

応答完了前に lint / typecheck を実行する。

```bash
pnpm lint && pnpm typecheck
```

**動作**: 失敗すると `decision: block` で完了を差し止め、失敗内容を `additionalContext` に載せて修正を促す。型エラーやテスト失敗のまま「完了」と宣言させない品質ゲート。

### session-context.sh

**タイミング**: SessionStart

セッション開始時に git の状況を context として注入する。

**動作**: ブランチ・未コミット変更・直近コミット・（`gh` があれば）自分のオープン PR をまとめて stdout に出力。SessionStart はブロック不可で、context 追加のみ。

## カスタムフックの作り方

### 入力

フックはツールの入力を JSON で標準入力から受け取る:

```json
{
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "/path/to/file.ts",
    "old_string": "...",
    "new_string": "..."
  }
}
```

### 終了コード

| コード | 意味 |
|--------|------|
| 0 | 成功（続行）。JSON を出力していれば解釈される |
| 1 | エラー（警告表示して続行） |
| 2 | ブロック（操作を中止）。stderr がエラーメッセージになる |

### JSON 出力でブロック + 指示注入（Stop など）

exit 2 の単純ブロックに加え、exit 0 で JSON を出力すると細かく制御できる。
Stop / UserPromptSubmit フックで「完了をブロックして Claude に指示を返す」場合:

```json
{
  "decision": "block",
  "reason": "ユーザーには見えない・Claude に渡す理由",
  "hookSpecificOutput": {
    "hookEventName": "Stop",
    "additionalContext": "Claude のコンテキストに注入される追加指示"
  }
}
```

- `decision: "block"` → Claude の完了を止め、会話を継続させる
- `reason` → Claude に見せる理由（ユーザーには非表示）
- `additionalContext` → Claude のコンテキストに注入され、これを見て対応する

ブロックせず context だけ足したい場合は `decision` を省き `hookSpecificOutput.additionalContext` のみ返す。

> **無限ループ注意**: Stop フックでブロックすると Claude が再び完了しようとする。
> 入力の `stop_hook_active` が `true` のときは再ブロックしない（`exit 0`）ガードを必ず入れる。

### テンプレート

```bash
#!/bin/bash
# <何をするか>
# <いつ実行されるか>: PreToolUse|PostToolUse (matcher)

# 入力を取得
VALUE=$(jq -r '.tool_input.<field>')

# 条件チェック
case "$VALUE" in
  <pattern>)
    echo "Message" >&2
    exit 2  # ブロック
    ;;
esac
```

## 参考

- [Claude Code Hooks ドキュメント](https://docs.anthropic.com/en/docs/claude-code/hooks)
