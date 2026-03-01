---
paths:
  - "src/schemas/**"
  - "src/mocks/**"
  - "src/api/**"
---

# API スキーマ & モック ガイドライン

## 基本方針

Zod スキーマを Single Source of Truth として、型・バリデーション・モックを統一管理する。

## ディレクトリ構成

```
src/
├── schemas/           # Zod スキーマ定義
│   ├── user.ts
│   └── index.ts       # 全スキーマの re-export
├── mocks/
│   ├── handlers/      # MSW ハンドラー
│   │   ├── user.ts
│   │   └── index.ts
│   ├── data/          # モックデータ生成
│   │   └── user.ts
│   └── server.ts      # MSW サーバー設定
└── api/               # 実際の API 実装
    └── user.ts
```

## Zod スキーマの書き方

```typescript
// src/schemas/user.ts
import { z } from 'zod';

// リクエスト/レスポンスごとにスキーマを定義
export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  createdAt: z.string().datetime(),
});

export const CreateUserRequestSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

export const CreateUserResponseSchema = UserSchema;

// 型を export
export type User = z.infer<typeof UserSchema>;
export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
```

## モックデータ生成

```typescript
// src/mocks/data/user.ts
import { faker } from '@faker-js/faker';
import { generateMock } from '@anatine/zod-mock';
import { UserSchema, type User } from '@/schemas/user';

// 方法1: 手動で作成（細かい制御が必要な場合）
export const createMockUser = (overrides?: Partial<User>): User => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  createdAt: faker.date.recent().toISOString(),
  ...overrides,
});

// 方法2: Zod スキーマから自動生成
export const generateMockUser = (): User => generateMock(UserSchema);

// リスト生成
export const createMockUsers = (count: number): User[] =>
  Array.from({ length: count }, () => createMockUser());
```

## MSW ハンドラー

```typescript
// src/mocks/handlers/user.ts
import { http, HttpResponse } from 'msw';
import { CreateUserRequestSchema } from '@/schemas/user';
import { createMockUser, createMockUsers } from '@/mocks/data/user';

export const userHandlers = [
  // GET /api/users
  http.get('/api/users', () => {
    return HttpResponse.json(createMockUsers(10));
  }),

  // GET /api/users/:id
  http.get('/api/users/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json(createMockUser({ id: id as string }));
  }),

  // POST /api/users
  http.post('/api/users', async ({ request }) => {
    const body = await request.json();

    // Zod でバリデーション
    const result = CreateUserRequestSchema.safeParse(body);
    if (!result.success) {
      return HttpResponse.json(
        { error: result.error.flatten() },
        { status: 400 }
      );
    }

    return HttpResponse.json(createMockUser(result.data), { status: 201 });
  }),

  // エラーケース用ハンドラー
  http.get('/api/users/error', () => {
    return HttpResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }),
];
```

## MSW サーバー設定

```typescript
// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { userHandlers } from './handlers/user';

export const server = setupServer(...userHandlers);

// src/mocks/browser.ts（ブラウザ用）
import { setupWorker } from 'msw/browser';
import { userHandlers } from './handlers/user';

export const worker = setupWorker(...userHandlers);
```

## テストでの使用

```typescript
// vitest.setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from '@/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

```typescript
// src/api/user.test.ts
import { describe, it, expect } from 'vitest';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';
import { getUser } from './user';

describe('getUser', () => {
  it('ユーザーを取得できる', async () => {
    const user = await getUser('123');
    expect(user.id).toBe('123');
  });

  it('エラー時は例外を投げる', async () => {
    // 特定のテストだけハンドラーを上書き
    server.use(
      http.get('/api/users/:id', () => {
        return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
      })
    );

    await expect(getUser('999')).rejects.toThrow();
  });
});
```

## 必要なパッケージ

```bash
# 本体
pnpm add zod

# モック関連（devDependencies）
pnpm add -D msw @faker-js/faker @anatine/zod-mock
```

## チェックリスト

API 作成時は以下を確認:

- [ ] Zod スキーマを `src/schemas/` に作成した
- [ ] リクエスト/レスポンスの型を export した
- [ ] モックデータ生成関数を `src/mocks/data/` に作成した
- [ ] MSW ハンドラーを `src/mocks/handlers/` に作成した
- [ ] 正常系・異常系のハンドラーを用意した
- [ ] テストで MSW を使用している
