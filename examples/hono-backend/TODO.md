# Hono Backend サンプル - 追加候補

## 現状あるもの

### rules/
- [x] typescript.md - 型定義、エラーハンドリング、インポート
- [x] hono.md - プロジェクト固有の Hono 規約（ルート構成、ミドルウェア順序、Context 型）
- [x] security.md - 認証、CORS、レートリミット、SQLi対策
- [x] logging.md - ログレベル、構造化ログ、機密情報マスク
- [x] api-design.md - URL設計、HTTPメソッド、レスポンス形式、ページネーション、エラーコード

### skills/
- [x] endpoint/ - API エンドポイント生成
- [x] middleware/ - ミドルウェア生成

## 追加候補

### rules（設計規約）- 優先度順

1. **database.md** [高]
   - テーブル命名（スネークケース、複数形）
   - カラム命名（created_at, updated_at, deleted_at）
   - インデックス戦略（検索・ソート対象、複合インデックス）
   - マイグレーション運用（破壊的変更の扱い）
   - Drizzle スキーマ設計パターン
   - リレーション設計
   - パス条件: src/db/**, drizzle/**

2. **testing.md** [高]
   - テスト構成（単体 / 統合 / E2E の境界）
   - 何をテストすべきか（ルート、サービス、バリデーション）
   - モック戦略（DB、外部API）
   - テストデータ管理（factory パターン、seed）
   - カバレッジ方針
   - パス条件: src/**/*.test.ts, tests/**

3. **error-handling.md** [中]
   - エラーコード体系（アプリケーション独自コード）
   - カスタムエラークラスの階層設計
   - クライアント向けエラーレスポンスの形式
   - 注: typescript.md と api-design.md に一部あるが体系的に整理する価値がある

### skills（コード生成）- 優先度順

1. **migration/** [高]
   - Drizzle スキーマ定義 + マイグレーション生成
   - DB変更は頻繁に発生する定型作業

2. **service/** [中]
   - ビジネスロジック層の生成（routes と db の間）
   - プロジェクト構成次第で不要な場合もある

### 追加しなくてよいもの

- **CI/CD ルール** → Claude の一般知識で十分、プロジェクトごとに異なる
- **Docker ルール** → 同上
- **パフォーマンス最適化** → 汎用的すぎてルール化しにくい
