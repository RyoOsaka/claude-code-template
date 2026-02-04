# TypeScript ルール（フロントエンド）

## 型定義

- `any` 禁止。`unknown` + 型ガードで絞り込む
- コンポーネントの Props は `interface` で定義する
- API レスポンスの型を定義し、`fetch` の戻り値に適用する
- Union 型で取りうる値を制限する（`'primary' | 'secondary'` など）
- Zod スキーマから `z.infer<typeof schema>` で型を導出する（型の二重定義を避ける）

```typescript
// 良い例: API レスポンスの型定義
interface ApiResponse<T> {
  data: T;
}

interface ApiListResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

## ランタイムバリデーション

- フォーム入力は Zod でバリデーションする
- API レスポンスは型アサーション（`as`）ではなく Zod でパースする（外部データを信頼しない）

```typescript
// 良い例: Zod でレスポンスを検証
const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
});
type User = z.infer<typeof userSchema>;

const fetchUser = async (id: string): Promise<User> => {
  const res = await fetch(`/api/v1/users/${id}`);
  const json = await res.json();
  return userSchema.parse(json.data);
};

// 悪い例: 型アサーション（実行時に検証されない）
const user = (await res.json()) as User;
```

## エラーハンドリング

- 非同期処理は必ず try-catch で囲む（または TanStack Query の `onError` を使う）
- `error instanceof Error` で型ガードしてからメッセージを参照する
- エラーはユーザーに通知する（トースト、フォームエラー等）
- ネットワークエラーと API エラーを区別する

```typescript
// TanStack Query のエラーハンドリング
const { data, error, isError } = useQuery({
  queryKey: ['users', id],
  queryFn: () => fetchUser(id),
});

if (isError) {
  if (error instanceof ApiError) {
    // API エラー（4xx, 5xx）
    showToast(error.message);
  } else {
    // ネットワークエラー等
    showToast('通信エラーが発生しました');
  }
}
```

## インポート

- ESModules（`import/export`）を使用する
- パスエイリアス `@/` を使用する（`@/components/Button` など）
- 型のインポートには `import type` を使う
- React の名前付きインポートを使う（`import { useState }` not `React.useState`）

```typescript
// 良い例
import type { User } from '@/types/user';
import { useState, useCallback } from 'react';
import { Button } from '@/components/common/Button';

// 悪い例
import { User } from '@/types/user';                 // import type を使う
import React from 'react';                            // 名前付きインポート推奨
import { Button } from '../../components/common/Button'; // 相対パスは避ける
```
