---
paths:
  - "src/components/**"
  - "src/pages/**"
  - "src/styles/**"
---

# スタイリングルール

## 方針

CSS Modules を基本とする。TailwindCSS を使う場合はこのファイルを置き換える。

## CSS Modules

- コンポーネントと同じディレクトリに `*.module.css` を配置する
- クラス名はキャメルケース（`buttonPrimary`, `cardHeader`）
- グローバルスタイルは `src/styles/` に配置する

```typescript
import styles from './Button.module.css';

export const Button = ({ variant = 'primary' }: ButtonProps) => {
  return <button className={styles[variant]}>Click</button>;
};
```

```css
/* Button.module.css */
.primary {
  background-color: var(--color-primary);
  color: white;
}

.secondary {
  background-color: transparent;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
}
```

## CSS 変数

- デザイントークン（色、フォントサイズ、スペーシング）は CSS 変数で管理する
- `src/styles/variables.css` に定義する

```css
/* src/styles/variables.css */
:root {
  /* 色 */
  --color-primary: #3b82f6;
  --color-secondary: #6b7280;
  --color-danger: #ef4444;
  --color-success: #22c55e;

  /* テキスト */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.25rem;

  /* スペーシング */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-8: 2rem;

  /* ボーダー */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
}
```

## レスポンシブ

- モバイルファーストで設計する（`min-width` メディアクエリ）
- ブレークポイントは統一する（`640px`, `768px`, `1024px`, `1280px`）

## 禁止事項

- NEVER: インラインスタイル（`style={{ }}`）を使用しない（動的な値を除く）
- NEVER: `!important` を使用しない
- NEVER: ID セレクタ（`#xxx`）を使用しない
- NEVER: グローバルなクラス名汚染を起こさない（CSS Modules で回避される）
