# プロジェクト設計チェックリスト

プロジェクト開始前に検討すべき設計判断の一覧。
各項目を検討し、決定事項を `CLAUDE.md` や `.claude/rules/` に反映する。

> このチェックリストは Claude が自律的に決めるべきでない「プロジェクト固有の判断」を洗い出すためのもの。
> 決定後は CLAUDE.md やルールファイルに記載し、Claude が一貫した実装を行えるようにする。
>
> **★ = 推奨オプション**（迷ったらこれを選択）
>
> ⚠️ **注意**: 推奨はあくまで一般的なケースでの目安です。プロジェクトの要件・規模・チーム構成によって最適解は異なります。**各選択肢のメリット・デメリットを理解した上で判断してください。** 不明な場合はチームのシニアエンジニアに相談することを推奨します。

---

## データベース設計

- [ ] 論理削除 vs 物理削除（★論理削除 `deleted_at` / 物理削除）
- [ ] マルチテナント構成（スキーマ分離 / ★RLS / テナントID カラム）
- [ ] UUID vs 連番 ID（★UUID / 連番）
- [ ] タイムスタンプのタイムゾーン方針（★UTC 統一 / ローカルタイム）
- [ ] 楽観的ロック（★あり `version` カラム / なし）
- [ ] 監査ログの要否と方式（★`created_by` + `updated_by` / 別テーブル / なし）
- [ ] 全文検索の方式（PostgreSQL `tsvector` / 外部サービス / なし）

## 認証・認可

- [ ] 認証方式（★外部サービス Supabase/Firebase / 自前 JWT / OAuth のみ）
- [ ] ソーシャルログインの対応範囲（Google / GitHub / Apple 等）
- [ ] ロール・権限モデル（★RBAC / ABAC / シンプルなフラグ）
- [ ] セッション管理（★JWT stateless + リフレッシュトークン / サーバーサイドセッション）
- [ ] トークンのリフレッシュ戦略（★短命アクセストークン + 長命リフレッシュ / 単一トークン）
- [ ] API 認証（★Bearer トークン / API キー / セッション Cookie）

## API 設計

- [ ] API バージョニング方針（★URL `/v1/` / ヘッダー / なし）
- [ ] ページネーション方式（offset-based / ★cursor-based）
- [ ] レート制限の要否と方式（★あり / なし）
- [ ] ファイルアップロードの方式（直接アップロード / ★署名付き URL）
- [ ] リアルタイム通信の要否と方式（WebSocket / SSE / ポーリング / なし）
- [ ] API ドキュメント生成（★OpenAPI（zod-to-openapi）/ なし）

## フロントエンド

- [ ] 状態管理の方針（React Context / ★Zustand / Redux / ★Jotai）
- [ ] スタイリング手法（CSS Modules / ★Tailwind / styled-components / Vanilla Extract）
- [ ] フォーム管理（★React Hook Form + Zod / Conform / 自前）
- [ ] コンポーネントライブラリ（★shadcn/ui / Radix / MUI / 自前）
- [ ] ルーティング（React Router / ★TanStack Router / Next.js App Router）
- [ ] 国際化（i18n）の要否と方式（★なし（必要になってから）/ 最初から対応）
- [ ] アクセシビリティの対応レベル（WCAG 2.1 AA / ★最低限 / なし）

## テスト

- [ ] テストカバレッジの目標値（★80% / 90% / 指定なし）
- [ ] E2E テストの要否とツール（★Playwright / Cypress / なし）
- [ ] テストデータの管理方式（★Factory パターン / Fixture / Seed）
- [ ] CI でのテスト実行範囲（Unit のみ / ★Unit + Integration / 全部）

## インフラ・デプロイ

- [ ] ホスティング先（★Vercel / ★Cloudflare / AWS / GCP）
- [ ] CI/CD パイプライン（★GitHub Actions / その他）
- [ ] 環境の種類（★development + staging + production / development + production）
- [ ] モノレポ vs マルチレポ（★モノレポ / マルチレポ）
- [ ] Docker の使用範囲（★開発のみ / 本番も）

## 運用・監視

- [ ] ログ管理の方式と出力先（★構造化ログ JSON / テキスト）
- [ ] エラー追跡サービス（★Sentry / なし）
- [ ] パフォーマンス監視の要否（★あり / なし）
- [ ] バックアップ方針（★日次自動 / 手動 / なし）

## コード品質

- [ ] Linter 設定（ESLint / ★Biome）
- [ ] フォーマッター（Prettier / ★Biome）
- [ ] PR レビュー方針（必須 / 任意 / ★AI レビュー併用）
- [ ] ブランチ保護ルール（★main 保護 + CI 必須 / なし）

## 機能設計

- [ ] 1機能の粒度定義（★画面単位 / ユースケース単位 / API エンドポイント単位）
- [ ] 機能完了の定義（★「画面が動く」+ テスト通過 / テスト通過のみ / レビュー完了）
- [ ] 機能間の依存関係の管理方法（★共通機能を先に実装 / Feature Flag / なし）
- [ ] 共通機能の切り出し基準（2回以上使う / ★3回以上使う）

## AI 委任範囲

- [ ] 自動判断 OK な項目（★命名、コードスタイル、リファクタリング、テスト作成）
- [ ] 人間承認必須な項目（★認証方式、DB スキーマ、外部サービス選定、課金関連）
- [ ] 設計提案時の確認フロー（★プラン承認必須 / 事後報告 OK）
- [ ] agent team 使用時のリーダー権限（★デリゲートモード / フル権限）

## スキーマ設計

- [ ] Zod スキーマの配置場所（★`src/schemas/` / `src/types/` / 各機能フォルダ内）
- [ ] スキーマの粒度（エンドポイント単位 / ★ドメインモデル単位）
- [ ] 共通型の管理方法（★`schemas/common.ts` に集約 / 各ファイルで定義）
- [ ] バリデーションエラーメッセージの言語（★日本語 / 英語）
- [ ] 型の export 方針（★`z.infer` で生成 / 別途 interface 定義）

## モック戦略

- [ ] モックの範囲（全 API / 外部 API のみ / ★開発中 API + 外部 API）
- [ ] モックデータの生成方法（★faker 自動生成 / 固定データ / 混合）
- [ ] 外部 API 連携のモック方針（★MSW / 専用モックサーバー / 実環境）
- [ ] モックとテストの関係（テストは必ずモック使用 / ★単体はモック、統合は実 API）

## エラーハンドリング

- [ ] エラーコード体系（HTTP ステータスのみ / ★独自コード併用）
- [ ] エラーレスポンス形式（`{ error: string }` / ★`{ code, message, details }`）
- [ ] ユーザー向けエラーメッセージ方針（★技術詳細を隠す / 開発時は表示）
- [ ] ログ出力レベル（エラーのみ / ★警告含む / デバッグ含む）
- [ ] 予期しないエラーのフォールバック UI（★あり / なし）

## UI/UX 方針

- [ ] デザインシステム（自前定義 / ★既存ライブラリ準拠 shadcn/ui）
- [ ] レスポンシブ対応（★モバイルファースト / デスクトップファースト / 両対応）
- [ ] ブレークポイント定義（★Tailwind デフォルト sm:640 md:768 lg:1024 xl:1280）
- [ ] アニメーション方針（★最小限 / 積極的に使用 / ユーザー設定で切替）
- [ ] ローディング表示（★スケルトン / スピナー / プログレスバー）
- [ ] 空状態・エラー状態の表示方針（★専用コンポーネント / インライン表示）

---

## 使い方

1. プロジェクト開始時にこのファイルをコピーする
2. 各項目を検討し、チェックを入れる（★推奨を参考に）
3. 決定事項を以下に反映する:
   - **CLAUDE.md** の Tech Stack / Critical Rules セクション
   - **.claude/rules/** の各ルールファイル
4. 推奨設定をそのまま使う場合は `.claude/presets/recommended.md` を参照
5. このチェックリスト自体はプロジェクトに含めても含めなくてもよい

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
| 機能設計 | `CLAUDE.md` AI Assistant Behavior |
| AI 委任範囲 | `CLAUDE.md` AI Assistant Behavior、Critical Rules |
| スキーマ設計 | `.claude/rules/api-mock.md` |
| モック戦略 | `.claude/rules/api-mock.md` |
| エラーハンドリング | `.claude/rules/error-handling.md` |
| UI/UX 方針 | `.claude/rules/ui-ux.md` |
