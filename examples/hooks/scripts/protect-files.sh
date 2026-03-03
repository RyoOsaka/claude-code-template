#!/bin/bash
# .env やロックファイルの編集をブロックする
# PreToolUse: Edit|Write

FILE=$(jq -r '.tool_input.file_path')

case "$FILE" in
  *.env|*.env.*|pnpm-lock.yaml|package-lock.json|yarn.lock)
    echo "Protected: $FILE" >&2
    exit 2
    ;;
esac
