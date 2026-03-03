#!/bin/bash
# ファイル保存後に Biome でフォーマットする
# PostToolUse: Edit|Write

FILE=$(jq -r '.tool_input.file_path')
npx @biomejs/biome format --write "$FILE" 2>/dev/null
