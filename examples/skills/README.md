# Skills サンプル

Claude Code のスキルファイル（`.claude/skills/`）のサンプル集。

## 使い方

必要なスキルを `.claude/skills/` にコピーする:

```bash
cp -r examples/skills/<skill-name>/ .claude/skills/
```

## スタック別おすすめ組み合わせ

### Hono バックエンド

```bash
cp -r examples/skills/endpoint/ .claude/skills/
cp -r examples/skills/service/ .claude/skills/
cp -r examples/skills/middleware/ .claude/skills/
cp -r examples/skills/migration/ .claude/skills/
```

### React + Vite フロントエンド

```bash
cp -r examples/skills/component/ .claude/skills/
cp -r examples/skills/hook/ .claude/skills/
```

### 共通（どのプロジェクトでも推奨）

```bash
cp -r examples/skills/tdd/ .claude/skills/
cp -r examples/skills/issue-to-pr/ .claude/skills/
```

## スキル一覧

| スキル | コマンド | 内容 |
|--------|---------|------|
| endpoint | `/endpoint <リソース>` | API エンドポイント + Zod スキーマ + CRUD 生成 |
| service | `/service <リソース>` | サービス層（ビジネスロジック）+ テスト生成 |
| middleware | `/middleware <名前>` | Hono ミドルウェア + テスト生成 |
| migration | `/migration <テーブル>` | Drizzle スキーマ + マイグレーション生成 |
| component | `/component <名前>` | React コンポーネント + スタイル + テスト生成 |
| hook | `/hook <名前>` | カスタムフック + テスト生成 |
| tdd | `/tdd <機能名>` | TDD で新機能を開発 |
| issue-to-pr | `/issue-to-pr <issue番号>` | Issue → TDD → PR の一連フロー |
| agent-team | `/agent-team <タスク>` | 複数エージェントでタスク分担 |
