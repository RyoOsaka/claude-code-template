#!/bin/bash
# git commit 前に lint/typecheck/test を実行する
# PreToolUse: Bash (git commit)

CMD=$(jq -r '.tool_input.command')

case "$CMD" in
  'git commit'*)
    pnpm lint && pnpm typecheck && pnpm test || exit 2
    ;;
esac
