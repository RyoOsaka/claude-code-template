# React + Vite サンプル - 追加候補

## 現状あるもの

### rules/
- [x] react.md - コンポーネント設計、Hooks、状態管理
- [x] typescript.md - 型定義、バリデーション、エラーハンドリング
- [x] styling.md - CSS Modules、CSS 変数、レスポンシブ
- [x] testing.md - React Testing Library、MSW、テスト方針

### skills/
- [x] component/ - React コンポーネント + スタイル + テスト生成
- [x] hook/ - カスタムフック + テスト生成

## 追加候補

### rules（設計規約）

1. **accessibility.md** [中]
   - ARIA 属性の使い方
   - キーボードナビゲーション
   - カラーコントラスト
   - スクリーンリーダー対応

2. **routing.md** [中]
   - React Router の使い方（使用する場合）
   - ルート設計パターン
   - 認証ガード

### skills（コード生成）

1. **page/** [中]
   - ページコンポーネント生成（ルーティング込み）
   - データフェッチ + ローディング + エラー表示の定型パターン

### 追加しなくてよいもの

- **パフォーマンス最適化ルール** → 汎用的すぎてルール化しにくい
- **CI/CD ルール** → プロジェクトごとに異なる
- **デプロイルール** → Vercel 等の一般知識で十分
