#!/bin/bash
# Claude Code ステータスライン
# stdin で渡される JSON セッションデータを読み、1 行で表示する。
# 表示: [モデル] 📁 ディレクトリ ⎇ ブランチ | NN% context
#
# 設定: settings.json の "statusLine" に登録する（settings.json.example 参照）。
# ステータスラインはローカル実行で API トークンを消費しない。

input=$(cat)

MODEL=$(echo "$input" | jq -r '.model.display_name')
DIR=$(echo "$input" | jq -r '.workspace.current_dir')
PCT=$(echo "$input" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)

# git ブランチ（リポジトリ外なら空）
BRANCH=$(git -C "$DIR" branch --show-current 2>/dev/null)

LINE="[$MODEL] 📁 ${DIR##*/}"
[ -n "$BRANCH" ] && LINE="$LINE ⎇ $BRANCH"
LINE="$LINE | ${PCT}% context"

echo "$LINE"
