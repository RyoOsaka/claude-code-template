#!/bin/bash
# 応答完了前に、未コミットのコード変更を code-reviewer サブエージェントでレビューさせる
# 実行タイミング: Stop（Claude が応答を終えようとした時）
#
# CLAUDE.md の「お願い」と違い、Stop hook はレビューを「仕組みで強制」する。
# stop_hook_active ガードで 1 ターンにつき 1 回だけ発火し、無限ループを防ぐ。
# examples/agents/code-reviewer.md と併用する前提。

INPUT=$(cat)

# すでに hook 起因で継続中なら、再ブロックしない（ループ防止）
STOP_HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')
if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
  exit 0
fi

# レビュー対象（ソースの変更）があるか。なければ何もしない
# 追跡ファイルの変更 + 未追跡ファイルを対象にする
CHANGES=$(git status --porcelain 2>/dev/null | grep -E '\.(ts|tsx|js|jsx|py|go|rs)$')
if [ -z "$CHANGES" ]; then
  exit 0
fi

# 完了をブロックし、レビュー指示を注入する
cat <<'JSON'
{
  "decision": "block",
  "reason": "未コミットのコード変更があります。完了前にレビューしてください。",
  "hookSpecificOutput": {
    "hookEventName": "Stop",
    "additionalContext": "git diff の変更を code-reviewer サブエージェントでレビューし、指摘があれば反映してから完了してください（@agent-code-reviewer）。すでにレビュー済みであればそのまま完了して構いません。"
  }
}
JSON
exit 0
