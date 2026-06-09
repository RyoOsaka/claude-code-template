# ステータスライン サンプル

Claude Code 画面下部のステータスバーをカスタマイズするサンプル。

## ステータスラインとは

任意のシェルスクリプトを実行し、その出力を画面下部に常時表示する仕組み。モデル名・コンテキスト使用率・git ブランチ・コストなどを一目で把握できる。ローカル実行で **API トークンを消費しない**。

## 使い方

1. スクリプトをコピーして実行権限を付与:
   ```bash
   cp examples/statusline/statusline.sh .claude/statusline.sh
   chmod +x .claude/statusline.sh
   ```
2. `settings.json.example` の `statusLine` を `.claude/settings.json` にマージ

`/statusline <やりたいこと>` で Claude に自動設定させることもできる。

## 同梱スクリプト

### statusline.sh

表示: `[モデル] 📁 ディレクトリ ⎇ ブランチ | NN% context`

stdin の JSON から `model.display_name` / `workspace.current_dir` / `context_window.used_percentage` を取り出し、git ブランチを添えて 1 行で出力する。

## 入力 JSON の主なフィールド

stdin に以下が渡る（抜粋）:

| フィールド | 内容 |
|-----------|------|
| `model.display_name` | モデル表示名 |
| `workspace.current_dir` | 現在の作業ディレクトリ |
| `workspace.repo.owner` / `.name` | origin から解析したリポジトリ |
| `context_window.used_percentage` | コンテキスト使用率（%） |
| `context_window.remaining_percentage` | 残り（%） |
| `cost.total_cost_usd` | セッション推定コスト（USD） |
| `cost.total_lines_added` / `removed` | 変更行数 |
| `effort.level` | 推論 effort（low〜max） |

## 出力のヒント

- **複数行**: `echo` を複数回すると各行が別の段に表示される
- **色**: ANSI エスケープ（`\033[32m` 等）で着色可
- **幅**: `COLUMNS` / `LINES` 環境変数で端末サイズを取得（`tput cols` は不可）

## 更新タイミング

アシスタントの新メッセージごと、`/compact` 後、権限モード変更時などに再実行（300ms デバウンス）。時刻など時間依存の表示は `refreshInterval`（秒）で定期再実行できる。
