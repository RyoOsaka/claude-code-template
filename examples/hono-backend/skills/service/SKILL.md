---
name: service
description: サービス層（ビジネスロジック）を生成する。「サービスを作って」「ビジネスロジックを追加して」などの指示で使用。
argument-hint: <resource-name>
disable-model-invocation: true
---

# サービス層生成

`$ARGUMENTS` リソースのサービス層（ビジネスロジック）を以下の手順で生成する。

## 1. ファイル構成

```
src/services/${ARGUMENTS}Service.ts        # サービス本体
src/services/${ARGUMENTS}Service.test.ts   # テスト
```

## 2. サービステンプレート

```typescript
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { $ARGUMENTS } from '@/db/schema/$ARGUMENTS';
import type { ${ARGUMENTS^}, New${ARGUMENTS^} } from '@/db/schema/$ARGUMENTS';
import { NotFoundError, ConflictError } from '@/lib/errors';

// --- 型定義 ---

interface ListOptions {
  page: number;
  limit: number;
}

interface ListResult {
  data: ${ARGUMENTS^}[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

// --- 一覧取得 ---

export const list${ARGUMENTS^} = async (options: ListOptions): Promise<ListResult> => {
  const { page, limit } = options;
  const offset = (page - 1) * limit;

  const [data, [{ count }]] = await Promise.all([
    db
      .select()
      .from($ARGUMENTS)
      .orderBy(desc($ARGUMENTS.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from($ARGUMENTS),
  ]);

  return {
    data,
    meta: {
      total: count,
      page,
      limit,
      hasMore: offset + data.length < count,
    },
  };
};

// --- 単体取得 ---

export const find${ARGUMENTS^}ById = async (id: string): Promise<${ARGUMENTS^}> => {
  const [result] = await db
    .select()
    .from($ARGUMENTS)
    .where(eq($ARGUMENTS.id, id));

  if (!result) {
    throw new NotFoundError('$ARGUMENTS', id);
  }

  return result;
};

// --- 作成 ---

export const create${ARGUMENTS^} = async (input: New${ARGUMENTS^}): Promise<${ARGUMENTS^}> => {
  try {
    const [result] = await db
      .insert($ARGUMENTS)
      .values(input)
      .returning();

    return result;
  } catch (err) {
    if (err instanceof Error && err.message.includes('unique')) {
      throw new ConflictError('リソースが既に存在します');
    }
    throw err;
  }
};

// --- 更新 ---

export const update${ARGUMENTS^} = async (
  id: string,
  input: Partial<New${ARGUMENTS^}>,
): Promise<${ARGUMENTS^}> => {
  const [result] = await db
    .update($ARGUMENTS)
    .set({ ...input, updatedAt: new Date() })
    .where(eq($ARGUMENTS.id, id))
    .returning();

  if (!result) {
    throw new NotFoundError('$ARGUMENTS', id);
  }

  return result;
};

// --- 削除 ---

export const delete${ARGUMENTS^} = async (id: string): Promise<void> => {
  const [result] = await db
    .delete($ARGUMENTS)
    .where(eq($ARGUMENTS.id, id))
    .returning({ id: $ARGUMENTS.id });

  if (!result) {
    throw new NotFoundError('$ARGUMENTS', id);
  }
};
```

## 3. テストテンプレート

```typescript
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import {
  list${ARGUMENTS^},
  find${ARGUMENTS^}ById,
  create${ARGUMENTS^},
  update${ARGUMENTS^},
  delete${ARGUMENTS^},
} from '@/services/${ARGUMENTS}Service';

describe('${ARGUMENTS}Service', () => {
  // テストデータのセットアップ
  // beforeAll(async () => { ... });
  // afterAll(async () => { ... });

  describe('list${ARGUMENTS^}', () => {
    it('ページネーション付きで一覧を返す', async () => {
      const result = await list${ARGUMENTS^}({ page: 1, limit: 20 });

      expect(result.data).toBeInstanceOf(Array);
      expect(result.meta).toHaveProperty('total');
      expect(result.meta).toHaveProperty('page', 1);
      expect(result.meta).toHaveProperty('limit', 20);
      expect(result.meta).toHaveProperty('hasMore');
    });
  });

  describe('find${ARGUMENTS^}ById', () => {
    it('存在するリソースを返す', async () => {
      // TODO: テストデータの ID を使用
      const result = await find${ARGUMENTS^}ById('<test-id>');
      expect(result).toHaveProperty('id');
    });

    it('存在しない場合は NotFoundError を投げる', async () => {
      await expect(
        find${ARGUMENTS^}ById('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow('見つかりません');
    });
  });

  describe('create${ARGUMENTS^}', () => {
    it('正しい入力でリソースを作成できる', async () => {
      const input = {
        // TODO: テストデータ
      };
      const result = await create${ARGUMENTS^}(input);
      expect(result).toHaveProperty('id');
    });

    it('重複時に ConflictError を投げる', async () => {
      // TODO: ユニーク制約違反のテスト
    });
  });

  describe('update${ARGUMENTS^}', () => {
    it('正しい入力でリソースを更新できる', async () => {
      const result = await update${ARGUMENTS^}('<test-id>', {
        // TODO: 更新データ
      });
      expect(result).toHaveProperty('updatedAt');
    });

    it('存在しない場合は NotFoundError を投げる', async () => {
      await expect(
        update${ARGUMENTS^}('00000000-0000-0000-0000-000000000000', {}),
      ).rejects.toThrow('見つかりません');
    });
  });

  describe('delete${ARGUMENTS^}', () => {
    it('存在するリソースを削除できる', async () => {
      await expect(delete${ARGUMENTS^}('<test-id>')).resolves.toBeUndefined();
    });

    it('存在しない場合は NotFoundError を投げる', async () => {
      await expect(
        delete${ARGUMENTS^}('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow('見つかりません');
    });
  });
});
```

## 4. ルートハンドラとの連携

サービスを作成したら、既存のルートハンドラからサービス関数を呼び出すようにリファクタリングする:

```typescript
// src/routes/$ARGUMENTS.ts
import {
  list${ARGUMENTS^},
  find${ARGUMENTS^}ById,
  create${ARGUMENTS^},
  update${ARGUMENTS^},
  delete${ARGUMENTS^},
} from '@/services/${ARGUMENTS}Service';

${ARGUMENTS}Routes.get('/', zValidator('query', listQuerySchema), async (c) => {
  const query = c.req.valid('query');
  const result = await list${ARGUMENTS^}(query);
  return c.json(result);
});

${ARGUMENTS}Routes.get('/:id', zValidator('param', idParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  const result = await find${ARGUMENTS^}ById(id);
  return c.json({ data: result });
});
```

## 5. 作業手順

1. サービスファイルを作成する（`src/services/${ARGUMENTS}Service.ts`）
2. CRUD 関数を実装する（不要な関数は削除してよい）
3. テストを作成する（`src/services/${ARGUMENTS}Service.test.ts`）
4. ルートハンドラからサービス関数を呼び出すようにリファクタリングする
5. `pnpm test` で動作確認する

## 6. チェックリスト

- [ ] サービス関数が DB 操作とビジネスロジックを担当している
- [ ] ルートハンドラにビジネスロジックが残っていない
- [ ] エラーは適切なカスタムエラークラスで投げている
- [ ] 一覧取得にページネーションメタ情報を含めている
- [ ] テストを作成した（正常系・異常系）
- [ ] ルートハンドラからサービスを呼び出すようにリファクタリングした
