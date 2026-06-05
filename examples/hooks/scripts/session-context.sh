#!/bin/bash
# セッション開始時に、現在の git 状況を context として注入する
# 実行タイミング: SessionStart（セッション開始・再開時）
#
# ブランチ・変更状況・直近コミット・未マージ PR を毎セッション自動で把握させる。
# SessionStart はブロックできない（context 追加のみ）。

BRANCH=$(git branch --show-current 2>/dev/null)
STATUS=$(git status --porcelain 2>/dev/null | head -20)
COMMITS=$(git log --oneline -5 2>/dev/null)

# gh が使えれば自分の未マージ PR も載せる（失敗は無視）
PRS=$(gh pr list --author "@me" --state open --json number,title \
  --jq '.[] | "#\(.number) \(.title)"' 2>/dev/null)

CONTEXT="現在のブランチ: ${BRANCH:-不明}"
[ -n "$STATUS" ]  && CONTEXT="$CONTEXT
未コミットの変更:
$STATUS"
[ -n "$COMMITS" ] && CONTEXT="$CONTEXT
直近のコミット:
$COMMITS"
[ -n "$PRS" ]     && CONTEXT="$CONTEXT
オープン中の自分の PR:
$PRS"

# プレーン stdout はそのまま context に追加される
echo "$CONTEXT"
exit 0
