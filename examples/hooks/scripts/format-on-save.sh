#!/bin/bash
# ファイル保存後に Prettier でフォーマットする
# PostToolUse: Edit|Write

FILE=$(jq -r '.tool_input.file_path')
npx prettier --write "$FILE" 2>/dev/null
