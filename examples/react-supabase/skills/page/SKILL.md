---
name: page
description: ページコンポーネントを生成する。「ページを作って」「画面を作って」「新しい画面を追加して」などの指示で使用。
argument-hint: <PageName>
disable-model-invocation: true
---

# ページコンポーネント生成

`$ARGUMENTS` ページを以下の手順で生成する。

## 1. ファイル配置

```
src/pages/$ARGUMENTS/
├── $ARGUMENTS.tsx          # ページコンポーネント
├── $ARGUMENTS.module.css   # スタイル
└── index.ts               # re-export
```

## 2. ページテンプレート

```typescript
import type { FC } from 'react';
import styles from './$ARGUMENTS.module.css';

export const ${ARGUMENTS}Page: FC = () => {
  // TODO: データ取得フックを使用
  // const { data, isLoading, error } = use___();

  return (
    <div className={styles.root}>
      <header>
        <h1>$ARGUMENTS</h1>
      </header>
      <main>
        {/* TODO: implement */}
      </main>
    </div>
  );
};
```

## 3. 作業手順

1. ページコンポーネントを作成する
2. 必要なデータ取得フック（`/api` スキル）を作成する
3. ルーティングに追加する
4. ナビゲーションにリンクを追加する
5. テストを作成する

## 4. チェックリスト

- [ ] ローディング状態を表示した
- [ ] エラー状態を表示した
- [ ] 空状態（データなし）を表示した
- [ ] レスポンシブデザインを考慮した
- [ ] ルーティングに登録した
- [ ] ナビゲーションからアクセス可能にした
