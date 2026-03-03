---
paths:
  - "src/components/**"
  - "src/pages/**"
  - "src/App.tsx"
---

# React ルール

## コンポーネント設計

- 関数コンポーネント + Hooks のみ使用する（クラスコンポーネントは使わない）
- Props は `interface` で定義し、コンポーネントと同じファイルに配置する
- `children` を受け取る場合は `React.PropsWithChildren` を使う
- デフォルト値は引数のデストラクチャリングで設定する

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick: () => void;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
}: React.PropsWithChildren<ButtonProps>) => {
  return (
    <button
      className={styles[variant]}
      data-size={size}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

## ファイル構成

- 1 ファイル 1 コンポーネントを原則とする
- コンポーネント名とファイル名を一致させる（PascalCase）
- `common/`: 汎用 UI コンポーネント（Button, Modal, Input 等）
- `features/`: 機能特化コンポーネント（LoginForm, UserCard 等）
- コンポーネントに紐づくスタイル・テストは同じディレクトリに配置する

```
components/
└── features/
    └── UserCard/
        ├── UserCard.tsx
        ├── UserCard.module.css
        └── UserCard.test.tsx
```

## Hooks

- カスタムフックは `use` プレフィックスを付ける
- データフェッチには TanStack Query の `useQuery` / `useMutation` を使う
- `useEffect` は副作用の管理のみに使う（データフェッチに使わない）
- 依存配列には必要な値をすべて含める（ESLint の `exhaustive-deps` に従う）

```typescript
// 良い例: TanStack Query でデータフェッチ
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.get<User[]>('/api/v1/users'),
  });
};

// 悪い例: useEffect でデータフェッチ
export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    fetch('/api/v1/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);
  return users;
};
```

## 状態管理

- ローカル状態: `useState` / `useReducer`
- コンポーネント間共有: React Context（小規模）または Zustand（中〜大規模）
- サーバー状態: TanStack Query
- Props のバケツリレーが 3 階層以上になったら Context または Zustand を検討する

## イベントハンドラ

- ハンドラ名は `handle` プレフィックス（`handleClick`, `handleSubmit`）
- Props として渡すハンドラは `on` プレフィックス（`onClick`, `onSubmit`）
- インラインの矢印関数は避け、コンポーネント内で関数定義する

## パフォーマンス

- `useMemo` / `useCallback` は実際にパフォーマンス問題がある場合のみ使う（早すぎる最適化を避ける）
- リストのレンダリングには一意の `key` を付ける（`index` を key にしない）
- 重いコンポーネントは `React.lazy` + `Suspense` で遅延ロードする

## 禁止事項

- NEVER: `dangerouslySetInnerHTML` を使用しない
- NEVER: `key` に配列のインデックスを使用しない（順序が変わるリストの場合）
- NEVER: レンダリング中に副作用を実行しない（`useEffect` 内で行う）
- NEVER: `document.querySelector` 等の直接 DOM 操作を行わない（`useRef` を使う）
