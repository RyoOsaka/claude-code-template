---
paths:
  - "src/components/**"
  - "src/pages/**"
  - "src/hooks/**"
  - "src/contexts/**"
---

# React ルール

## コンポーネント設計
- 関数コンポーネント + Hooks のみ（クラスコンポーネント禁止）
- 単一責任の原則: 1コンポーネント = 1責務
- Props 型定義は必須
- 条件分岐は早期リターンで可読性を上げる

## Hooks
- useEffect の依存配列は正確に記述する（ESLint exhaustive-deps に従う）
- 1つの useEffect は 1つの副作用のみ
- 複雑なロジックはカスタムフックに抽出する

## 状態管理
- ローカル状態: useState
- サーバー状態: TanStack Query
- グローバル状態: Context API or Zustand
- フォーム状態: React Hook Form（検討）

## パフォーマンス
- React.memo: props が頻繁に変わらないコンポーネントに適用
- useCallback: 子コンポーネントに渡すコールバックをメモ化
- useMemo: 計算コストの高い値をメモ化
- 長いリスト: react-window で仮想化

## アクセシビリティ
- セマンティックな HTML 要素を使用する
- インタラクティブ要素にはキーボード操作をサポート
- 適切な ARIA ラベルを付与する
