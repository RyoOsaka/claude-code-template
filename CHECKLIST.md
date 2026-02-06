# プロジェクト設計チェックリスト

プロジェクト開始前に検討すべき設計判断の一覧。
各項目を検討し、決定事項を `CLAUDE.md` や `.claude/rules/` に反映する。

> このチェックリストは Claude が自律的に決めるべきでない「プロジェクト固有の判断」を洗い出すためのもの。
> 決定後は CLAUDE.md やルールファイルに記載し、Claude が一貫した実装を行えるようにする。

---

## データベース設計

- [ ] 論理削除 vs 物理削除（`deleted_at` カラム or 実際に DELETE）
- [ ] マルチテナント構成（テナント分離の方式: スキーマ分離 / RLS / テナントID カラム）
- [ ] UUID vs 連番 ID（主キーの形式）
- [ ] タイムスタンプのタイムゾーン方針（UTC 統一 / ローカルタイム）
- [ ] 楽観的ロック（`version` カラム）の要否
- [ ] 監査ログの要否と方式（`created_by` / `updated_by` / 別テーブル）
- [ ] 全文検索の方式（PostgreSQL `tsvector` / 外部サービス / なし）

## 認証・認可

- [ ] 認証方式（Supabase Auth / Firebase Auth / 自前 JWT / OAuth のみ）
- [ ] ソーシャルログインの対応範囲（Google / GitHub / Apple 等）
- [ ] ロール・権限モデル（RBAC / ABAC / シンプルなフラグ）
- [ ] セッション管理（JWT stateless / サーバーサイドセッション）
- [ ] トークンのリフレッシュ戦略
- [ ] API 認証（Bearer トークン / API キー / セッション Cookie）

## API 設計

- [ ] API バージョニング方針（URL `/v1/` / ヘッダー / なし）
- [ ] ページネーション方式（offset-based / cursor-based）
- [ ] レート制限の要否と方式
- [ ] ファイルアップロードの方式（直接アップロード / 署名付き URL）
- [ ] リアルタイム通信の要否と方式（WebSocket / SSE / ポーリング）
- [ ] API ドキュメント生成（OpenAPI / なし）

## フロントエンド

- [ ] 状態管理の方針（React Context / Zustand / Redux / Jotai）
- [ ] スタイリング手法（CSS Modules / Tailwind / styled-components / Vanilla Extract）
- [ ] フォーム管理（React Hook Form / Conform / 自前）
- [ ] コンポーネントライブラリ（shadcn/ui / Radix / MUI / 自前）
- [ ] ルーティング（React Router / TanStack Router / Next.js App Router）
- [ ] 国際化（i18n）の要否と方式
- [ ] アクセシビリティの対応レベル（WCAG 2.1 AA / 最低限 / なし）

## テスト

- [ ] テストカバレッジの目標値（例: 80%）
- [ ] E2E テストの要否とツール（Playwright / Cypress）
- [ ] テストデータの管理方式（Factory / Fixture / Seed）
- [ ] CI でのテスト実行範囲（Unit のみ / Unit + Integration / 全部）

## インフラ・デプロイ

- [ ] ホスティング先（Vercel / Cloudflare / AWS / GCP）
- [ ] CI/CD パイプライン（GitHub Actions / その他）
- [ ] 環境の種類（development / staging / production）
- [ ] モノレポ vs マルチレポ
- [ ] Docker の使用範囲（開発のみ / 本番も）

## 運用・監視

- [ ] ログ管理の方式と出力先
- [ ] エラー追跡サービス（Sentry / なし）
- [ ] パフォーマンス監視の要否
- [ ] バックアップ方針

## コード品質

- [ ] Linter 設定（ESLint / Biome）のカスタムルール
- [ ] フォーマッター（Prettier / Biome）の設定
- [ ] PR レビュー方針（必須 / 任意 / AI レビュー併用）
- [ ] ブランチ保護ルール

---

## 使い方

1. プロジェクト開始時にこのファイルをコピーする
2. 各項目を検討し、チェックを入れる
3. 決定事項を以下に反映する:
   - **CLAUDE.md** の Tech Stack / Critical Rules セクション
   - **.claude/rules/** の各ルールファイル
4. このチェックリスト自体はプロジェクトに含めても含めなくてもよい

---

## 反映先マッピング

| チェック項目 | 反映先 |
|------------|-------|
| データベース設計 | `CLAUDE.md` Tech Stack、`.claude/rules/database.md` |
| 認証・認可 | `CLAUDE.md` Critical Rules、`.claude/rules/security.md` |
| API 設計 | `.claude/rules/api-design.md` |
| フロントエンド | `CLAUDE.md` Tech Stack、`.claude/rules/react.md` 等 |
| テスト | `.claude/rules/testing.md` |
| インフラ・デプロイ | `CLAUDE.md` Tech Stack / Development Commands |
| 運用・監視 | `.claude/rules/logging.md` |
| コード品質 | `CLAUDE.md` Critical Rules |
