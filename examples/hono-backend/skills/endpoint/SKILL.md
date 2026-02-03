---
name: endpoint
description: API エンドポイントを生成する。「エンドポイントを作って」「APIを追加して」「ルートを作って」などの指示で使用。
argument-hint: <resource-name>
disable-model-invocation: true
---

# API エンドポイント生成

`$ARGUMENTS` リソースに対する CRUD エンドポイントを以下の手順で生成する。

## 1. ファイル構成

```
src/routes/$ARGUMENTS.ts           # ルートハンドラ
src/routes/$ARGUMENTS.test.ts      # テスト
src/services/${ARGUMENTS}Service.ts  # ビジネスロジック（必要に応じて）
```

## 2. ルートテンプレート

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { $ARGUMENTS } from '@/db/schema/$ARGUMENTS';
import { NotFoundError } from '@/lib/errors';

// --- バリデーションスキーマ ---

const idParamSchema = z.object({
  id: z.string().uuid(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const createSchema = z.object({
  // TODO: $ARGUMENTS の作成に必要なフィールドを定義
  // name: z.string().min(1).max(100),
});

const updateSchema = z.object({
  // TODO: $ARGUMENTS の更新に必要なフィールドを定義
  // name: z.string().min(1).max(100).optional(),
});

// --- ルート定義 ---

const ${ARGUMENTS}Routes = new Hono();

// 一覧取得
${ARGUMENTS}Routes.get(
  '/',
  zValidator('query', listQuerySchema),
  async (c) => {
    const { page, limit } = c.req.valid('query');
    const offset = (page - 1) * limit;

    const results = await db
      .select()
      .from($ARGUMENTS)
      .limit(limit)
      .offset(offset);

    return c.json({
      data: results,
      meta: { page, limit },
    });
  },
);

// 単体取得
${ARGUMENTS}Routes.get(
  '/:id',
  zValidator('param', idParamSchema),
  async (c) => {
    const { id } = c.req.valid('param');

    const [result] = await db
      .select()
      .from($ARGUMENTS)
      .where(eq($ARGUMENTS.id, id));

    if (!result) {
      throw new NotFoundError('$ARGUMENTS', id);
    }

    return c.json({ data: result });
  },
);

// 作成
${ARGUMENTS}Routes.post(
  '/',
  zValidator('json', createSchema),
  async (c) => {
    const input = c.req.valid('json');

    const [result] = await db
      .insert($ARGUMENTS)
      .values(input)
      .returning();

    return c.json({ data: result }, 201);
  },
);

// 更新
${ARGUMENTS}Routes.put(
  '/:id',
  zValidator('param', idParamSchema),
  zValidator('json', updateSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const input = c.req.valid('json');

    const [result] = await db
      .update($ARGUMENTS)
      .set({ ...input, updatedAt: new Date() })
      .where(eq($ARGUMENTS.id, id))
      .returning();

    if (!result) {
      throw new NotFoundError('$ARGUMENTS', id);
    }

    return c.json({ data: result });
  },
);

// 削除
${ARGUMENTS}Routes.delete(
  '/:id',
  zValidator('param', idParamSchema),
  async (c) => {
    const { id } = c.req.valid('param');

    const [result] = await db
      .delete($ARGUMENTS)
      .where(eq($ARGUMENTS.id, id))
      .returning();

    if (!result) {
      throw new NotFoundError('$ARGUMENTS', id);
    }

    return c.body(null, 204);
  },
);

export { ${ARGUMENTS}Routes };
```

## 3. テストテンプレート

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '@/index';

describe('$ARGUMENTS API', () => {
  // テストデータのセットアップ・クリーンアップ
  // beforeAll(async () => { ... });
  // afterAll(async () => { ... });

  describe('GET /$ARGUMENTS', () => {
    it('一覧を取得できる', async () => {
      const res = await app.request('/api/v1/$ARGUMENTS');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.data).toBeInstanceOf(Array);
      expect(body.meta).toHaveProperty('page');
      expect(body.meta).toHaveProperty('limit');
    });

    it('ページネーションが動作する', async () => {
      const res = await app.request('/api/v1/$ARGUMENTS?page=1&limit=5');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /$ARGUMENTS/:id', () => {
    it('存在する場合は取得できる', async () => {
      // TODO: テストデータのIDを使用
      const res = await app.request('/api/v1/$ARGUMENTS/<test-id>');
      expect(res.status).toBe(200);
    });

    it('存在しない場合は404を返す', async () => {
      const res = await app.request(
        '/api/v1/$ARGUMENTS/00000000-0000-0000-0000-000000000000',
      );
      expect(res.status).toBe(404);
    });

    it('不正なIDで400を返す', async () => {
      const res = await app.request('/api/v1/$ARGUMENTS/invalid');
      expect(res.status).toBe(400);
    });
  });

  describe('POST /$ARGUMENTS', () => {
    it('正しい入力で作成できる', async () => {
      const res = await app.request('/api/v1/$ARGUMENTS', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // TODO: 有効なデータ
        }),
      });
      expect(res.status).toBe(201);
    });

    it('不正な入力で400を返す', async () => {
      const res = await app.request('/api/v1/$ARGUMENTS', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /$ARGUMENTS/:id', () => {
    it('正しい入力で更新できる', async () => {
      const res = await app.request('/api/v1/$ARGUMENTS/<test-id>', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // TODO: 更新データ
        }),
      });
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /$ARGUMENTS/:id', () => {
    it('存在する場合は削除できる', async () => {
      const res = await app.request('/api/v1/$ARGUMENTS/<test-id>', {
        method: 'DELETE',
      });
      expect(res.status).toBe(204);
    });

    it('存在しない場合は404を返す', async () => {
      const res = await app.request(
        '/api/v1/$ARGUMENTS/00000000-0000-0000-0000-000000000000',
        { method: 'DELETE' },
      );
      expect(res.status).toBe(404);
    });
  });
});
```

## 4. 作業手順

1. Drizzle スキーマが未定義なら `src/db/schema/$ARGUMENTS.ts` を作成する
2. マイグレーションを生成・適用する（`pnpm db:generate && pnpm db:migrate`）
3. ルートハンドラを作成する（`src/routes/$ARGUMENTS.ts`）
4. `src/index.ts` でルートをマウントする（`app.route('/$ARGUMENTS', ${ARGUMENTS}Routes)`）
5. テストを作成する（`src/routes/$ARGUMENTS.test.ts`）
6. `pnpm test` で動作確認する

## 5. チェックリスト

- [ ] すべてのリクエスト入力を Zod でバリデーションした
- [ ] エラーハンドリングを実装した（404, 400, 500）
- [ ] 認証ミドルウェアを適用した（必要な場合）
- [ ] レスポンス形式が統一されている（`{ data }`, `{ error }`）
- [ ] ページネーションを実装した（一覧取得の場合）
- [ ] テストを作成した（正常系・異常系・境界値）
- [ ] `src/index.ts` にルートを登録した
