---
paths:
  - "src/**/*.test.ts"
  - "tests/**"
  - "vitest.config.ts"
---

# テストルール

## テスト構成

### 単体テスト（Unit）
- 対象: サービス層、ユーティリティ関数、バリデーションスキーマ
- DB・外部 API はモックする
- ファイル配置: テスト対象と同じディレクトリに `*.test.ts`

### 統合テスト（Integration）
- 対象: API エンドポイント（ルートハンドラ + ミドルウェア + サービス + DB）
- テスト用 DB を使う（モックしない）
- ファイル配置: テスト対象と同じディレクトリに `*.test.ts`

### E2E テスト
- 対象: ユーザーシナリオ全体（認証 → 操作 → 結果確認）
- ファイル配置: `tests/e2e/` ディレクトリ

## テスト対象の優先度

1. **必須**: API エンドポイント（正常系・異常系・認証）
2. **必須**: ビジネスロジック（サービス層）
3. **推奨**: バリデーションスキーマ（境界値・不正入力）
4. **推奨**: ミドルウェア（認証、エラーハンドラ）
5. **任意**: ユーティリティ関数（純粋関数は優先的にテスト）

## テストの書き方

### 基本構造

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';

describe('対象の名前', () => {
  // セットアップ（テストデータ作成など）
  beforeAll(async () => { /* ... */ });
  afterAll(async () => { /* クリーンアップ */ });

  describe('メソッド名 / シナリオ', () => {
    it('正常系: 期待する動作の説明', async () => {
      // Arrange（準備）
      // Act（実行）
      // Assert（検証）
    });

    it('異常系: エラーケースの説明', async () => {
      // ...
    });
  });
});
```

### テスト名の規約

- `describe`: テスト対象（クラス名、関数名、API パス）
- `it`: 「〜できる」「〜を返す」「〜の場合は〜」の形式
- 正常系・異常系・境界値を明示する

```typescript
describe('UserService', () => {
  describe('findById', () => {
    it('存在するユーザーを取得できる', ...);
    it('存在しない場合は NotFoundError を投げる', ...);
    it('不正な ID 形式の場合は ValidationError を投げる', ...);
  });
});
```

## API テスト

- Hono の `app.request()` を使う（HTTP サーバーを起動しない）
- レスポンスのステータスコードとボディの両方を検証する
- 認証が必要な場合はテスト用トークンを生成する

```typescript
import app from '@/index';

describe('GET /api/v1/users', () => {
  it('一覧を取得できる', async () => {
    const res = await app.request('/api/v1/users');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data).toBeInstanceOf(Array);
    expect(body.meta).toHaveProperty('page');
  });

  it('認証なしで 401 を返す', async () => {
    const res = await app.request('/api/v1/users');
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.error.code).toBe('UNAUTHORIZED');
  });
});
```

## モック戦略

### DB モック（単体テスト用）

```typescript
import { vi } from 'vitest';
import { db } from '@/db/client';

vi.mock('@/db/client', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    // ...
  },
}));
```

### 外部 API モック

```typescript
import { vi } from 'vitest';

// fetch のモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

it('外部 API のエラーを適切にハンドリングする', async () => {
  mockFetch.mockResolvedValueOnce(
    new Response(JSON.stringify({ error: 'rate limited' }), { status: 429 }),
  );
  // ...
});
```

### モック使用の原則

- 統合テストでは DB をモックしない（テスト用 DB を使う）
- 外部 API は常にモックする（テストの安定性確保）
- モックは最小限にする（モックが多い = 設計の見直しサイン）

## テストデータ

### Factory パターン

```typescript
// tests/factories/user.ts
import { faker } from '@faker-js/faker';
import type { NewUser } from '@/db/schema/users';

export const createUserData = (overrides: Partial<NewUser> = {}): NewUser => ({
  name: faker.person.fullName(),
  email: faker.internet.email(),
  isActive: true,
  ...overrides,
});
```

### テストデータの原則

- テストごとにデータを作成・削除する（テスト間で共有しない）
- Factory パターンでデフォルト値を持たせ、テストで必要な値だけ上書きする
- 本番データをテストに使わない
- テスト用 DB は `beforeAll` / `afterAll` でセットアップ・クリーンアップする

## カバレッジ

- カバレッジ目標: サービス層 80% 以上、ルートハンドラ 70% 以上
- カバレッジのためだけにテストを書かない（意味のあるテストを優先）
- カバレッジレポートの確認: `pnpm test -- --coverage`

## 禁止事項

- NEVER: テスト内で `console.log` によるデバッグを残さない
- NEVER: テスト間の実行順序に依存しない（各テストは独立して動くこと）
- NEVER: 本番の DB やサービスに接続するテストを書かない
- NEVER: `sleep` / `setTimeout` での固定待ち時間に依存しない
- NEVER: テスト対象の実装詳細（private メソッド、内部状態）に依存しない
