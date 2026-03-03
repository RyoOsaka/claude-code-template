---
paths:
  - "src/lib/api*"
  - "src/hooks/**"
---

# API クライアントルール

> **Note**: このルールは `examples/hono-backend/rules/api-design.md` のレスポンス形式に準拠しています。
> バックエンドが異なる場合は、レスポンス型（`ApiResponse`, `ApiListResponse`）を実際の API 仕様に合わせて調整してください。

## API クライアントの構成

`src/lib/api.ts` に一元管理する。各コンポーネントやフックから直接 `fetch` を呼ばない。

```typescript
// src/lib/api.ts
import { env } from '@/lib/env';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // 認証トークンがあれば付与
    const token = localStorage.getItem('access_token');
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new ApiError(res.status, body?.error?.code ?? 'UNKNOWN', body?.error?.message ?? 'エラーが発生しました');
    }

    // 204 No Content
    if (res.status === 204) {
      return undefined as T;
    }

    return res.json() as Promise<T>;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path);
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

export const api = new ApiClient(env.VITE_API_BASE_URL);
```

## エラークラス

```typescript
// src/lib/api.ts（同ファイルに定義）

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isValidationError(): boolean {
    return this.status === 400;
  }
}
```

## フックでの使い方

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse, ApiListResponse } from '@/types/api';
import type { User } from '@/types/user';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.get<ApiListResponse<User>>('/api/v1/users'),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserInput) =>
      api.post<ApiResponse<User>>('/api/v1/users', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
```

## レスポンス型

バックエンドの api-design.md のレスポンス形式と一致させる:

```typescript
// src/types/api.ts

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

## エラー表示

```typescript
import { ApiError } from '@/lib/api';

// TanStack Query のエラーハンドリング
const { error, isError } = useQuery({ ... });

if (isError) {
  if (error instanceof ApiError) {
    // バックエンドが返したエラー
    showToast(error.message);
  } else {
    // ネットワークエラー等
    showToast('通信エラーが発生しました');
  }
}
```

## 禁止事項

- NEVER: コンポーネントやフックから直接 `fetch` を呼ばない（`api` クライアントを使う）
- NEVER: API キーやシークレットをフロントエンドコードに含めない
- NEVER: レスポンスを `as` で型アサーションしない（Zod でパースするか、ジェネリクスで型指定する）
