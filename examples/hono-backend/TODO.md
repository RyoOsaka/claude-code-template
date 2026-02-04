# Hono Backend サンプル - 追加候補

## 現状あるもの

### rules/
- [x] typescript.md - 型定義、エラーハンドリング、インポート
- [x] hono.md - プロジェクト固有の Hono 規約（ルート構成、ミドルウェア順序、Context 型）（パス条件付き）
- [x] security.md - 認証、CORS、レートリミット、SQLi対策
- [x] logging.md - ログレベル、構造化ログ、機密情報マスク（パス条件付き）
- [x] api-design.md - URL設計、HTTPメソッド、レスポンス形式、ページネーション、エラーコード（パス条件付き）
- [x] database.md - テーブル/カラム命名、Drizzle スキーマ設計、インデックス、マイグレーション（パス条件付き）
- [x] testing.md - テスト構成、モック戦略、テストデータ管理、カバレッジ方針（パス条件付き）
- [x] error-handling.md - エラークラス階層、エラーコード体系、グローバルエラーハンドラ（パス条件付き）

### skills/
- [x] endpoint/ - API エンドポイント生成
- [x] middleware/ - ミドルウェア生成
- [x] migration/ - Drizzle スキーマ + マイグレーション生成
- [x] service/ - サービス層（ビジネスロジック）生成

### その他
- [x] .env.example - 環境変数テンプレート

## 追加候補

### 追加しなくてよいもの

- **CI/CD ルール** → Claude の一般知識で十分、プロジェクトごとに異なる
- **Docker ルール** → 同上
- **パフォーマンス最適化** → 汎用的すぎてルール化しにくい
