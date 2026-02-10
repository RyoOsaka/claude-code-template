---
name: component
description: React コンポーネントを生成する。「コンポーネントを作って」「UIを追加して」「画面を作って」などの指示で使用。
argument-hint: <ComponentName>
disable-model-invocation: true
---

# React コンポーネント生成

`$ARGUMENTS` コンポーネントを以下の手順で生成する。

## 1. ファイル構成

```
src/components/<common or features>/$ARGUMENTS/
├── $ARGUMENTS.tsx              # コンポーネント本体
├── $ARGUMENTS.module.css       # スタイル
└── $ARGUMENTS.test.tsx         # テスト
```

- 汎用 UI → `common/`（Button, Modal, Input 等）
- 機能特化 → `features/`（LoginForm, UserCard 等）

## 2. コンポーネントテンプレート

```typescript
import type { ReactNode } from 'react';
import styles from './$ARGUMENTS.module.css';

// --- Props 型定義 ---

interface ${ARGUMENTS}Props {
  // TODO: $ARGUMENTS の Props を定義
  // children?: ReactNode;
}

// --- コンポーネント ---

export const $ARGUMENTS = ({}: ${ARGUMENTS}Props) => {
  return (
    <div className={styles.root}>
      {/* TODO: $ARGUMENTS の UI を実装 */}
    </div>
  );
};
```

## 3. スタイルテンプレート

```css
/* $ARGUMENTS.module.css */

.root {
  /* TODO: $ARGUMENTS のスタイルを定義 */
}
```

## 4. テストテンプレート

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { $ARGUMENTS } from './$ARGUMENTS';

describe('$ARGUMENTS', () => {
  it('正しくレンダリングされる', () => {
    render(<$ARGUMENTS />);
    // TODO: 表示要素を検証
    // expect(screen.getByRole('...')).toBeInTheDocument();
  });

  it('ユーザー操作に応答する', async () => {
    const user = userEvent.setup();
    render(<$ARGUMENTS />);

    // TODO: ユーザー操作とその結果を検証
    // await user.click(screen.getByRole('button'));
    // expect(...).toBe(...);
  });

  it('Props に応じた表示が切り替わる', () => {
    // TODO: 条件付きレンダリングのテスト
  });
});
```

## 5. 作業手順

1. コンポーネントの配置先を決める（`common/` or `features/`）
2. ディレクトリとファイルを作成する
3. Props 型を定義する
4. コンポーネントを実装する
5. スタイルを定義する
6. テストを作成する
7. `pnpm test` で動作確認する

## 6. チェックリスト

- [ ] Props を `interface` で型定義した
- [ ] コンポーネント名とファイル名が PascalCase で一致している
- [ ] CSS Modules でスタイルを定義した（インラインスタイルを使っていない）
- [ ] アクセシビリティを考慮した（適切な HTML 要素、aria 属性）
- [ ] テストを作成した（レンダリング、ユーザー操作、Props の切り替え）
- [ ] 不要な `useEffect` を使っていない
