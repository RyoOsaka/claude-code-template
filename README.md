# Claude Code プロジェクトテンプレート

Claude Code を使った開発の生産性を最大化するための設定テンプレート。
技術スタックに依存しない汎用構成で、プロジェクトに合わせてカスタマイズして使う。

## クイックスタート

### 1. テンプレートをコピー

```bash
# このリポジトリをクローン or テンプレートとして使用
cp -r claude-code-template/.claude your-project/.claude
cp claude-code-template/CLAUDE.md your-project/CLAUDE.md
```

### 2. CHECKLIST.md で設計判断を整理

`CHECKLIST.md` を開き、プロジェクトで必要な設計判断を検討する。
決定した内容は CLAUDE.md や `.claude/rules/` に反映する。

### 3. CLAUDE.md を編集

`CLAUDE.md` のプレースホルダー（`[REQUIRED: ...]`）を自分のプロジェクト情報で埋める:
- Tech Stack
- Development Commands
- Project Structure

### 4. examples/ からルール・スキルをコピー

プロジェクトのスタックに合う例を選んでコピーする:

```bash
# Hono バックエンドの場合
cp examples/hono-backend/rules/* .claude/rules/
cp -r examples/hono-backend/skills/* .claude/skills/

# React + Vite フロントエンドの場合
cp examples/react-vite/rules/* .claude/rules/
cp -r examples/react-vite/skills/* .claude/skills/
```

各 `CLAUDE.md.example` も参考にして CLAUDE.md を追記する。

### 5. 不要な examples/ を削除

セットアップ完了後、examples/ ディレクトリは不要なので削除してよい。

## ファイル構成

```
project-root/
├── CLAUDE.md                    # コア指示（常時読み込み）
├── CHECKLIST.md                 # 設計判断チェックリスト（人間が埋める）
├── .claude/
│   ├── settings.json            # プロジェクト設定（$schema で VS Code 補完対応）
│   ├── rules/                   # 分野別ルール（常時読み込み）
│   └── skills/                  # ワークフロー（オンデマンド読み込み）
└── examples/                    # スタック別サンプル
    ├── hono-backend/            # Hono バックエンド
    └── react-vite/              # React + Vite フロントエンド
```

## 3つの仕組みの使い分け

### 1. CLAUDE.md - プロジェクトのコア指示

| 項目 | 内容 |
|------|------|
| **読み込み** | セッション開始時に**常時**読み込まれる |
| **コスト** | 毎セッションでコンテキストを消費し続ける |
| **推奨サイズ** | **500行以下**（長いほど指示の遵守率が下がる） |

#### 書くべきもの
- コミュニケーション言語
- 開発コマンド（`pnpm dev`, `pnpm build` など）
- Git ワークフロー（ブランチ命名、コミット規約）
- 技術スタック概要
- NEVER / YOU MUST ルール（最重要なもののみ）

#### 書くべきでないもの
- 長いコードサンプル（Claude はコードを読めば理解できる）
- 標準的な言語規約（TypeScript の基本的な使い方など）
- 詳細な API 仕様やスキーマ定義
- ツールの一般的な使い方
- 変更頻度の高い情報

### 2. .claude/rules/ - 分野別ルール

| 項目 | 内容 |
|------|------|
| **読み込み** | セッション開始時に**常時**読み込まれる |
| **コスト** | CLAUDE.md と同じく毎回消費される |
| **目的** | CLAUDE.md を分割して**メンテナンス性**を向上させる |
| **特徴** | `paths` 指定で特定ファイルにのみ適用可能 |

#### パス指定の例

```yaml
# .claude/rules/react.md
---
paths:
  - "src/components/**"
  - "src/pages/**"
---

# React ルール
- 関数コンポーネント + Hooks のみ
...
```

パス指定なしの場合は CLAUDE.md と同様に常時読み込まれる。

#### 使いどころ
- CLAUDE.md が長くなりすぎた時の分割先
- 特定技術領域のルールをファイル単位で管理したい時
- パス条件でコンテキスト消費を抑えたい時

### 3. .claude/skills/ - オンデマンドワークフロー

| 項目 | 内容 |
|------|------|
| **読み込み** | **呼び出し時のみ**（`/skill-name` または Claude が自動判断） |
| **コスト** | 使わない時はコンテキストを消費しない |
| **目的** | 繰り返しタスクの手順書 + コンテキスト節約 |
| **ファイル** | `.claude/skills/<name>/SKILL.md`（必須） |

#### SKILL.md の構造

```yaml
---
name: skill-name                     # スキル名
description: いつ使うかの説明          # Claude が自動起動の判断に使う
argument-hint: [引数の説明]            # /skill-name の後に渡す引数のヒント
disable-model-invocation: true        # true = ユーザーが /skill-name した時のみ起動
user-invocable: false                 # false = Claude が内部的に使うだけ（/呼び出し不可）
allowed-tools: Read, Grep, Bash       # 使用可能なツールを制限
---

# スキルの指示内容
$ARGUMENTS で引数を参照可能。
```

#### 起動方式

**手動起動（ユーザーが明示的に呼ぶ）**
```
> /component WorkoutCard
> /endpoint users
```

**自動起動（Claude が判断して使う）**
- `description` の内容とユーザーの指示がマッチした場合
- `disable-model-invocation: true` で自動起動を無効化できる

#### 使いどころ
- コンポーネント生成、API エンドポイント生成などの繰り返しタスク
- 長い手順書が必要だが、常時読み込みたくないもの
- デプロイ、マイグレーションなどの定型ワークフロー

## 判断フローチャート

```
新しいルールや手順を追加したい
  │
  ├─ すべてのセッションで常に守るべき？
  │   ├─ YES → 短い？ → CLAUDE.md
  │   │         長い？ → .claude/rules/ (パス指定も検討)
  │   │
  │   └─ NO ↓
  │
  ├─ 特定タスク時だけ必要？
  │   └─ YES → .claude/skills/
  │
  └─ 自分だけの設定？
      └─ YES → CLAUDE.local.md
```

## コンテキストコストの考え方

```
セッション開始時に自動読み込み（常にコスト発生）:
  CLAUDE.md + .claude/rules/*.md（パス指定なし）

条件付き読み込み（該当ファイル操作時のみ）:
  .claude/rules/*.md（paths 指定あり）

呼び出し時のみ読み込み（普段はコストゼロ）:
  .claude/skills/*/SKILL.md
```

CLAUDE.md が長いほど:
- 毎セッションのコンテキスト消費が増える
- 重要な指示が埋もれて遵守率が下がる
- セッションで使える残りコンテキストが減る

### このテンプレートのコンテキストコスト

| ファイル | 改善前（常時読み込み） | 改善後 |
|---------|---------------------|--------|
| CLAUDE.md | ~137行 | ~131行 |
| .claude/rules/ 合計 | ~1,218行（常時） | 0行（全て examples/ に移動済み） |
| **通常セッション合計** | **~1,355行** | **~131行** |

改善により、通常セッションのコンテキスト消費が約 90% 削減。
必要なルールは examples/ からコピーし、paths 指定で条件付きロードにできる。

## サンプルスタック

> **Note**: 現在のサンプルは Node.js ランタイムを前提としています。
> Bun / Deno / Cloudflare Workers を使用する場合は、各ランタイムの特性に合わせてルール・スキルを調整してください。

### hono-backend/

Hono + TypeScript + Drizzle ORM のバックエンド構成。

| 種別 | ファイル | 内容 |
|------|---------|------|
| rules | typescript.md | 型定義・Zod バリデーション・エラーハンドリング |
| rules | api-design.md | URL設計・レスポンス形式・ステータスコード・ページネーション（パス条件付き） |
| rules | hono.md | Hono プロジェクト規約（ルート構成・ミドルウェア順序・Context 型）（パス条件付き） |
| rules | security.md | 認証・CORS・レートリミット・SQLインジェクション対策 |
| rules | logging.md | ログレベル・構造化ログ・機密情報マスク（パス条件付き） |
| rules | database.md | テーブル/カラム命名・Drizzle スキーマ設計・インデックス・マイグレーション（パス条件付き） |
| rules | testing.md | テスト構成・モック戦略・テストデータ管理・カバレッジ方針（パス条件付き） |
| rules | error-handling.md | エラークラス階層・エラーコード体系・グローバルエラーハンドラ（パス条件付き） |
| skills | `/endpoint <リソース>` | API エンドポイント + Zod スキーマ + CRUD 生成 |
| skills | `/middleware <名前>` | Hono ミドルウェア + テスト生成 |
| skills | `/migration <テーブル名>` | Drizzle スキーマ + マイグレーション生成 |
| skills | `/service <リソース名>` | サービス層（ビジネスロジック）+ テスト生成 |
| other | .env.example | 環境変数テンプレート |

### react-vite/

React + TypeScript + Vite のフロントエンド構成。

| 種別 | ファイル | 内容 |
|------|---------|------|
| rules | react.md | コンポーネント設計・Hooks・状態管理（パス条件付き） |
| rules | typescript.md | 型定義・Zod バリデーション・環境変数・エラーハンドリング |
| rules | styling.md | CSS Modules・CSS 変数・レスポンシブ（パス条件付き） |
| rules | testing.md | React Testing Library・MSW・テスト方針（パス条件付き） |
| rules | api-client.md | API クライアント設計・エラークラス・レスポンス型（パス条件付き） |
| skills | `/component <名前>` | React コンポーネント + スタイル + テスト生成 |
| skills | `/hook <名前>` | カスタムフック + テスト生成 |

## 独自ルール・スキルの作り方

### ルールの追加

`.claude/rules/` に Markdown ファイルを作成する:

```markdown
---
paths:                    # 省略可。省略すると常時読み込み
  - "src/db/**"
  - "drizzle/**"
---

# データベースルール

- マイグレーションは Drizzle Kit で管理する
- テーブル名はスネークケース
- ...
```

### スキルの追加

`.claude/skills/<name>/SKILL.md` を作成する:

```markdown
---
name: migration
description: DBマイグレーションを作成する
argument-hint: <migration-name>
disable-model-invocation: true
---

# マイグレーション生成

$ARGUMENTS マイグレーションを作成する。

## 手順
1. `src/db/schema/` にスキーマを追加
2. `pnpm db:generate` でマイグレーション生成
3. ...
```

#### 変数記法について

スキル内では `$ARGUMENTS` で引数を参照できる。コードテンプレート内で JavaScript のテンプレートリテラルとして `${ARGUMENTS}` と書く場合があるが、これは Claude が解釈時に適切に置換する。

```markdown
# 正しい使い方
$ARGUMENTS を処理する           # → "users" を処理する
const ${ARGUMENTS}Routes = ... # → const usersRoutes = ...（JS変数名として）
```

## Hooks（ツール実行前後の自動処理）

Claude がツールを使う前後にシェルコマンドを自動実行する仕組み。CLAUDE.md のルールは「お願い」だが、Hooks は「仕組みで強制」できる。

サンプル設定が `examples/hooks/settings.json.example` にある。必要な部分を `.claude/settings.json` にマージして使う。

| Hook | タイミング | 内容 |
|------|-----------|------|
| PreToolUse | Edit/Write の**前** | `.env` やロックファイルの編集をブロック |
| PostToolUse | Edit/Write の**後** | Prettier で自動フォーマット |

## ルールファイルのベストプラクティス

### コード例の量に注意

ルールファイル（`.claude/rules/`）は常時読み込まれるため、長いコード例を含めるとコンテキスト消費が増える。

**推奨アプローチ**:
- ルールファイル: 方針・禁止事項・短い例のみ（50〜100行目安）
- 詳細なテンプレート: スキルファイルに記載（オンデマンド読み込み）

例えば `api-client.md` のような詳細なコード例は、プロジェクトの初期セットアップ後は不要になることが多い。必要に応じてスキル化を検討する。
