---
name: api
description: Supabase データ取得用のカスタムフックを生成する。「API を作って」「データ取得フックを作って」「Supabase クエリを作って」などの指示で使用。
argument-hint: <resource-name>
disable-model-invocation: true
---

# API フック生成

`$ARGUMENTS` リソースに対する Supabase データ取得フックを生成する。

## 1. ファイル配置

```
src/hooks/use$ARGUMENTS.ts     # カスタムフック
src/hooks/use$ARGUMENTS.test.ts  # テスト
```

## 2. フックテンプレート（TanStack Query + Supabase）

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

// 型定義
type ${ARGUMENTS}Row = Database['public']['Tables']['$ARGUMENTS']['Row'];
type ${ARGUMENTS}Insert = Database['public']['Tables']['$ARGUMENTS']['Insert'];

// クエリキー
const QUERY_KEY = ['$ARGUMENTS'] as const;

// 一覧取得
export function use${ARGUMENTS}List(userId: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('$ARGUMENTS')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// 単体取得
export function use${ARGUMENTS}(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('$ARGUMENTS')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// 作成
export function useCreate${ARGUMENTS}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ${ARGUMENTS}Insert) => {
      const { data, error } = await supabase
        .from('$ARGUMENTS')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
```

## 3. チェックリスト

- [ ] Supabase の自動生成型を使用した
- [ ] エラーハンドリングを実装した
- [ ] クエリキーを適切に設定した
- [ ] select で必要な列のみ取得した（`*` は開発初期のみ許容）
- [ ] ページネーションが必要な場合は `range()` を使った
- [ ] テストを作成した
