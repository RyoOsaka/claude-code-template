---
paths:
  - "src/**/*.test.tsx"
  - "src/**/*.test.ts"
  - "tests/**"
  - "vitest.config.ts"
---

# テストルール（フロントエンド）

## テスト構成

### 単体テスト（Unit）
- 対象: カスタムフック、ユーティリティ関数、バリデーションスキーマ
- ライブラリ: Vitest + React Testing Library
- ファイル配置: テスト対象と同じディレクトリに `*.test.ts(x)`

### コンポーネントテスト
- 対象: UI コンポーネント（レンダリング、ユーザー操作、表示条件）
- ライブラリ: Vitest + React Testing Library + @testing-library/user-event
- ファイル配置: コンポーネントと同じディレクトリに `*.test.tsx`

### 統合テスト（Integration）
- 対象: ページコンポーネント（API 連携含む）
- API モック: MSW（Mock Service Worker）
- ファイル配置: `tests/` ディレクトリ

## テストの書き方

### コンポーネントテスト

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('テキストが表示される', () => {
    render(<Button onClick={() => {}}>保存</Button>);
    expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
  });

  it('クリックでハンドラが呼ばれる', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>保存</Button>);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 時はクリックできない', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>保存</Button>);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

### カスタムフックテスト

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useUsers } from '@/hooks/useUsers';
import { QueryClientProvider } from './test-utils';

describe('useUsers', () => {
  it('ユーザー一覧を取得できる', async () => {
    const { result } = renderHook(() => useUsers(), {
      wrapper: QueryClientProvider,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeInstanceOf(Array);
  });
});
```

## クエリの原則

- `getByRole` を最優先で使う（アクセシビリティとテストを両立）
- `getByText` はボタンやリンクのテキストに使う
- `getByTestId` は最終手段（他の方法でクエリできない場合のみ）
- `container.querySelector` は使わない

```typescript
// 良い例（優先度順）
screen.getByRole('button', { name: '送信' });
screen.getByRole('textbox', { name: 'メールアドレス' });
screen.getByText('ログイン');
screen.getByLabelText('パスワード');

// 悪い例
screen.getByTestId('submit-button');  // 最終手段
container.querySelector('.btn');       // 使わない
```

## API モック（MSW）

```typescript
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const handlers = [
  http.get('/api/v1/users', () => {
    return HttpResponse.json({
      data: [
        { id: '1', name: 'テストユーザー', email: 'test@example.com' },
      ],
      meta: { total: 1, page: 1, limit: 20, hasMore: false },
    });
  }),
];

export const server = setupServer(...handlers);

// vitest.setup.ts
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## 禁止事項

- NEVER: 実装の詳細（state の値、内部メソッド）をテストしない
- NEVER: スナップショットテストに頼らない（壊れやすく、レビューされない）
- NEVER: `act()` 警告を無視しない
- NEVER: テスト間で状態を共有しない
- NEVER: `sleep` / `setTimeout` で非同期を待たない（`waitFor` を使う）
