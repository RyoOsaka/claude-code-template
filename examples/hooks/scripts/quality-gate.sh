#!/bin/bash
# 応答完了前に lint / typecheck を実行し、失敗していれば完了をブロックする
# 実行タイミング: Stop（Claude が応答を終えようとした時）
#
# テスト失敗状態・型エラー状態のまま「完了」と宣言させないための品質ゲート。
# stop_hook_active ガードで 1 ターンにつき 1 回だけ発火する。

INPUT=$(cat)

STOP_HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')
if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
  exit 0
fi

# プロジェクトのコマンドに合わせて変更する
OUTPUT=$(pnpm lint && pnpm typecheck 2>&1)
if [ $? -eq 0 ]; then
  exit 0
fi

# 失敗内容を Claude に渡して修正を促す（jq で JSON 文字列に安全にエンコード）
REASON="lint / typecheck が失敗しています。完了前に修正してください。"
CONTEXT=$(printf '%s' "$OUTPUT" | tail -40 | jq -Rs .)
cat <<JSON
{
  "decision": "block",
  "reason": "$REASON",
  "hookSpecificOutput": {
    "hookEventName": "Stop",
    "additionalContext": $CONTEXT
  }
}
JSON
exit 0
