---
name: component
description: React コンポーネントを生成する。「コンポーネントを作って」「UIを作って」「画面要素を追加して」などの指示で使用。
argument-hint: <ComponentName>
disable-model-invocation: true
---

# React コンポーネント生成

`$ARGUMENTS` コンポーネントを以下の手順で生成する。

## 1. 配置場所の判断

- 汎用 UI（ボタン、入力など） → `src/components/common/$ARGUMENTS/`
- 機能特化（WorkoutCard 等） → `src/components/features/$ARGUMENTS/`

## 2. ファイル構成

```
src/components/{common|features}/$ARGUMENTS/
├── $ARGUMENTS.tsx          # コンポーネント本体
├── $ARGUMENTS.module.css   # スタイル（CSS Modules）
├── $ARGUMENTS.test.tsx     # テスト
└── index.ts               # re-export
```

## 3. コンポーネントテンプレート

```typescript
import type { FC } from 'react';
import styles from './$ARGUMENTS.module.css';

interface ${ARGUMENTS}Props {
  // TODO: props を定義
}

export const $ARGUMENTS: FC<${ARGUMENTS}Props> = (props) => {
  return (
    <div className={styles.root}>
      {/* TODO: implement */}
    </div>
  );
};
```

## 4. チェックリスト

- [ ] Props の interface を定義した
- [ ] セマンティックな HTML 要素を使用した
- [ ] キーボード操作をサポートした（インタラクティブ要素の場合）
- [ ] aria-label を付与した（アイコンボタン等の場合）
- [ ] レスポンシブデザインを考慮した（モバイルファースト）
- [ ] テストを作成した
- [ ] index.ts で re-export した
