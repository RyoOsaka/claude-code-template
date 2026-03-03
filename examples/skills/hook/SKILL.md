---
name: hook
description: カスタムフックを生成する。「フックを作って」「データ取得を追加して」「ロジックを切り出して」などの指示で使用。
argument-hint: <hookName>
disable-model-invocation: true
---

# カスタムフック生成

`$ARGUMENTS` フックを以下の手順で生成する。

## 1. ファイル構成

```
src/hooks/$ARGUMENTS.ts          # フック本体
src/hooks/$ARGUMENTS.test.ts     # テスト
```

## 2. データフェッチフック（TanStack Query）

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { api } from '@/lib/api';

// --- 型定義 ---

// TODO: $ARGUMENTS が扱うデータの型を定義
// interface Item { id: string; name: string; }

// --- クエリキー ---

const QUERY_KEYS = {
  all: ['$ARGUMENTS'] as const,
  detail: (id: string) => ['$ARGUMENTS', id] as const,
};

// --- 一覧取得 ---

export const ${ARGUMENTS}List = () => {
  return useQuery({
    queryKey: QUERY_KEYS.all,
    queryFn: async () => {
      // TODO: API 呼び出しを実装
      // const res = await api.get('/api/v1/...');
      // return res.data;
    },
  });
};

// --- 単体取得 ---

export const $ARGUMENTS = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: async () => {
      // TODO: API 呼び出しを実装
      // const res = await api.get(`/api/v1/.../${id}`);
      // return res.data;
    },
    enabled: !!id,
  });
};

// --- 作成 ---

export const ${ARGUMENTS}Create = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: unknown) => {
      // TODO: API 呼び出しを実装
      // const res = await api.post('/api/v1/...', input);
      // return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
    },
  });
};
```

## 3. ロジックフック（非 API）

```typescript
import { useState, useCallback } from 'react';

// --- 型定義 ---

interface ${ARGUMENTS^}Options {
  // TODO: オプションを定義
}

interface ${ARGUMENTS^}Return {
  // TODO: 戻り値の型を定義
}

// --- フック本体 ---

export const $ARGUMENTS = (options: ${ARGUMENTS^}Options = {}): ${ARGUMENTS^}Return => {
  // TODO: フックのロジックを実装
  // const [state, setState] = useState(...);
  // const handleAction = useCallback(() => { ... }, []);

  return {
    // TODO: 戻り値を定義
  };
};
```

## 4. テストテンプレート

```typescript
import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { $ARGUMENTS } from '@/hooks/$ARGUMENTS';
// TanStack Query を使う場合はプロバイダを用意
// import { createWrapper } from '@/tests/test-utils';

describe('$ARGUMENTS', () => {
  it('初期値が正しい', () => {
    const { result } = renderHook(() => $ARGUMENTS());
    // TODO: 初期状態を検証
  });

  it('状態が更新される', async () => {
    const { result } = renderHook(() => $ARGUMENTS());

    act(() => {
      // TODO: 状態変更を実行
    });

    // TODO: 更新後の状態を検証
  });

  // TanStack Query を使う場合
  it('データを取得できる', async () => {
    const { result } = renderHook(() => $ARGUMENTS(), {
      // wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // TODO: データを検証
  });
});
```

## 5. 作業手順

1. フックの種別を決める（データフェッチ or ロジック切り出し）
2. フック名を決める（`use` プレフィックス）
3. フックファイルを作成する（`src/hooks/$ARGUMENTS.ts`）
4. 型を定義する（引数、戻り値）
5. テストを作成する（`src/hooks/$ARGUMENTS.test.ts`）
6. `pnpm test` で動作確認する

## 6. チェックリスト

- [ ] フック名が `use` プレフィックスで始まっている
- [ ] 引数と戻り値に型定義がある
- [ ] TanStack Query を使う場合、クエリキーが一意で管理されている
- [ ] `useEffect` の依存配列が正しい
- [ ] エラーハンドリングを実装した
- [ ] テストを作成した
