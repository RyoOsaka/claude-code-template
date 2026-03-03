# Hooks サンプル

Claude Code がツールを使う前後にシェルコマンドを自動実行する仕組み。

## 使い方

1. 必要なスクリプトをプロジェクトにコピー
2. `settings.json.example` の該当部分を `.claude/settings.json` にマージ
3. スクリプトに実行権限を付与: `chmod +x .claude/hooks/*.sh`

## フックの種類

| フック | タイミング | 用途 |
|--------|-----------|------|
| PreToolUse | ツール実行**前** | ブロック（exit 2）または警告が可能 |
| PostToolUse | ツール実行**後** | 分析・整形（ブロック不可） |

## 実行フロー

```
ユーザー指示 → Claude がツール選択 → PreToolUse → ツール実行 → PostToolUse
                                      ↓
                               exit 2 でブロック可能
```

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
| 0 | 成功（続行） |
| 1 | エラー（警告表示して続行） |
| 2 | ブロック（操作を中止） |

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
