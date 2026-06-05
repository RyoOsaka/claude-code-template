# MCP サンプル

MCP（Model Context Protocol）サーバー設定（`.mcp.json`）のサンプル。

## MCP とは

Claude Code を外部ツール・DB・API に接続する仕組み。接続すると、別ツールからチャットにコピペする代わりに、Claude が直接そのシステムを読み書きできる。

- DB に直接クエリ（PostgreSQL）
- ブラウザ操作・E2E（Playwright）
- 外部 API・課題管理・監視ツール

## 使い方

`.mcp.json` を**プロジェクトのルート**にコピーする（`.claude/` の中ではない）:

```bash
cp examples/mcp/.mcp.json .mcp.json
```

プロジェクトルートの `.mcp.json` はチームで共有（バージョン管理）される。初回利用時、Claude Code は承認を求める（`/mcp` で確認・認証）。

## 同梱サーバー例

| サーバー | transport | 用途 |
|---------|-----------|------|
| postgres | stdio | DB クエリ（`${DATABASE_URL}` を使用） |
| playwright | stdio | ブラウザ操作・E2E テスト |
| api | http | 外部 API 接続（HTTP + 認証ヘッダーの例） |

## .mcp.json の形式

```json
{
  "mcpServers": {
    "<名前>": {
      "command": "npx",            // stdio: 実行コマンド
      "args": ["-y", "..."],       // 引数
      "env": {}                    // サーバーに渡す環境変数
    },
    "<名前2>": {
      "type": "http",              // http / sse / ws
      "url": "https://.../mcp",
      "headers": { "Authorization": "Bearer ..." }
    }
  }
}
```

transport: `stdio`（ローカルプロセス）/ `http`（リモート、`streamable-http` のエイリアス）/ `sse`（非推奨）/ `ws`。

## 秘密情報の扱い（重要）

API キーや接続文字列を `.mcp.json` に**直接書かない**。環境変数展開を使う:

- `${VAR}` — 環境変数 `VAR` の値に展開
- `${VAR:-default}` — `VAR` が未設定なら `default` を使用

展開できる場所: `command` / `args` / `env` / `url` / `headers`。

必要な変数（例の場合）:
- `DATABASE_URL` — PostgreSQL 接続文字列
- `API_KEY` — 外部 API のトークン
- `API_BASE_URL` — 任意（未設定なら example.com）

`.env` に置き、git にはコミットしない。必須変数が未設定だと Claude Code は設定の読み込みに失敗する。

## CLI で追加する

手書きせず CLI でも追加できる:

```bash
# stdio サーバー（プロジェクトスコープ）
claude mcp add --transport stdio --scope project postgres \
  -- npx -y @modelcontextprotocol/server-postgres "$DATABASE_URL"

# http サーバー
claude mcp add --transport http --scope project stripe https://mcp.stripe.com
```

## スコープと優先順位

| スコープ | 場所 | 共有 |
|---------|------|------|
| local（既定） | `~/.claude.json`（プロジェクト別） | 個人 |
| project | `.mcp.json`（リポジトリルート） | チーム（バージョン管理） |
| user | `~/.claude.json` | 個人・全プロジェクト |

優先順位: local > project > user > プラグイン。重複時はマージせず最優先の定義を使う。

## 注意

- リモートサーバーの OAuth 認証は `/mcp` パネルから行う（GitHub MCP など）
- サーバー名 `workspace` は予約済み（使うと無視される）
- MCP ツールの出力が 10,000 トークンを超えると警告が出る（`MAX_MCP_OUTPUT_TOKENS` で調整）
