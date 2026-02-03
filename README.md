# Claude Code プロジェクトテンプレート 運用ガイド

Claude Code を使った開発の生産性を最大化するためのファイル構成と運用方法。

## ファイル構成

```
project-root/
├── CLAUDE.md                    # コア指示（常時読み込み）
├── CLAUDE.local.md              # 個人設定（自動gitignore）
└── .claude/
    ├── settings.json            # プロジェクト設定
    ├── rules/                   # 分野別ルール（常時読み込み）
    │   ├── typescript.md
    │   ├── react.md
    │   ├── supabase.md
    │   └── security.md
    └── skills/                  # ワークフロー（オンデマンド読み込み）
        ├── component/
        │   └── SKILL.md
        ├── api/
        │   └── SKILL.md
        └── page/
            └── SKILL.md
```

## 3つの仕組みの使い分け

### 1. CLAUDE.md - プロジェクトのコア指示

| 項目 | 内容 |
|------|------|
| **読み込み** | セッション開始時に**常時**読み込まれる |
| **コスト** | 毎セッションでコンテキストを消費し続ける |
| **推奨サイズ** | **500行以下**（長いほど指示の遵守率が下がる） |
| **置き場所** | プロジェクトルート or `.claude/CLAUDE.md` |

#### 書くべきもの
- コミュニケーション言語
- 開発コマンド（`pnpm dev`, `pnpm build` など）
- Git ワークフロー（ブランチ命名、コミット規約）
- 技術スタック概要
- NEVER / YOU MUST ルール（最重要なもののみ）
- プロジェクト固有の注意点

#### 書くべきでないもの
- 長いコードサンプル（Claude はコードを読めば理解できる）
- 標準的な言語規約（TypeScript の基本的な使い方など）
- 詳細な API 仕様やスキーマ定義
- ツールの一般的な使い方（Vercel のセットアップ手順など）
- 変更頻度の高い情報

### 2. .claude/rules/ - 分野別ルール

| 項目 | 内容 |
|------|------|
| **読み込み** | セッション開始時に**常時**読み込まれる |
| **コスト** | CLAUDE.md と同じく毎回消費される |
| **目的** | CLAUDE.md を分割して**メンテナンス性**を向上させる |
| **特徴** | `paths` 指定で特定ファイルにのみ適用可能 |

#### CLAUDE.md との違い
- コンテキストコストは同じ（常時読み込み）
- 純粋にファイル管理の利便性のための分割手段
- パス条件を付けると、そのパスのファイルを扱う時のみ読み込まれる

#### パス指定の例

```yaml
# .claude/rules/supabase.md
---
paths:
  - "src/lib/supabase.ts"
  - "src/hooks/use*.ts"
  - "supabase/**"
---

# Supabase ルール
- RLS は必須
- クライアントは lib/supabase.ts で一元管理
...
```

パス指定なしの場合は CLAUDE.md と同様に常時読み込まれる。

#### 使いどころ
- CLAUDE.md が 500行を超えそうな時の分割先
- 特定技術領域（DB、認証、テストなど）のルールをファイル単位で管理したい時
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

ここに詳細な手順やルールを記述する。
$ARGUMENTS で引数を参照可能。
```

#### 起動方式の2パターン

**手動起動（ユーザーが明示的に呼ぶ）**
```
> /component WorkoutCard
> /api workouts
> /page dashboard
```

**自動起動（Claude が判断して使う）**
- `description` に書かれた内容と、ユーザーの指示がマッチした場合
- `disable-model-invocation: true` にすると自動起動を無効化できる

#### 使いどころ
- コンポーネント生成、API フック生成などの繰り返しタスク
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

## このテンプレートのサンプルファイル

| ファイル | 説明 |
|---------|------|
| [CLAUDE.md](./CLAUDE.md) | スリム化されたコア指示のサンプル（~200行） |
| [.claude/rules/typescript.md](./.claude/rules/typescript.md) | TypeScript ルール |
| [.claude/rules/react.md](./.claude/rules/react.md) | React ルール（パス指定付き） |
| [.claude/rules/supabase.md](./.claude/rules/supabase.md) | Supabase ルール（パス指定付き） |
| [.claude/rules/security.md](./.claude/rules/security.md) | セキュリティルール |
| [.claude/skills/component/SKILL.md](./.claude/skills/component/SKILL.md) | `/component` スキル |
| [.claude/skills/api/SKILL.md](./.claude/skills/api/SKILL.md) | `/api` スキル |
| [.claude/skills/page/SKILL.md](./.claude/skills/page/SKILL.md) | `/page` スキル |

## 現状の CLAUDE.md からの移行イメージ

```
現在の CLAUDE.md（832行）
  │
  ├─ 残す（CLAUDE.md ~200行）
  │   ├─ Communication Preferences
  │   ├─ Development Commands
  │   ├─ Git Workflow
  │   ├─ Tech Stack 概要
  │   └─ Critical Rules（最重要のみ）
  │
  ├─ rules/ に移動（常時読み込み、ファイル分割）
  │   ├─ TypeScript/React ベストプラクティス → rules/typescript.md, rules/react.md
  │   ├─ Supabase 連携ルール → rules/supabase.md
  │   └─ セキュリティルール → rules/security.md
  │
  ├─ skills/ に移動（オンデマンド読み込み）
  │   ├─ コンポーネント生成手順 → skills/component/
  │   ├─ API フック生成手順 → skills/api/
  │   └─ ページ生成手順 → skills/page/
  │
  └─ 削除
      ├─ 長いコードサンプル（Claude はコード読めば分かる）
      ├─ Vercel セットアップ手順（一般知識）
      ├─ CI/CD 設定例（一般知識）
      └─ ツール一覧（一般知識）
```
