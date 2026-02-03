---
name: middleware
description: Hono ミドルウェアを生成する。「ミドルウェアを作って」「認証を追加して」「ログ機能を追加して」などの指示で使用。
argument-hint: <MiddlewareName>
disable-model-invocation: true
---

# Hono ミドルウェア生成

`$ARGUMENTS` ミドルウェアを以下の手順で生成する。

## 1. ファイル構成

```
src/middleware/$ARGUMENTS.ts        # ミドルウェア本体
src/middleware/$ARGUMENTS.test.ts   # テスト
```

## 2. ミドルウェアテンプレート

```typescript
import { createMiddleware } from 'hono/factory';
import type { Context, Next } from 'hono';

// --- Context で共有する変数の型定義 ---

type ${ARGUMENTS}Variables = {
  // TODO: ミドルウェアがセットする値の型を定義
  // 例: userId: string;
  // 例: startTime: number;
};

// --- 設定の型定義 ---

interface ${ARGUMENTS}Options {
  // TODO: ミドルウェアのオプションを定義
  // 例: excludePaths?: string[];
  // 例: logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

// --- デフォルト設定 ---

const defaultOptions: ${ARGUMENTS}Options = {
  // TODO: デフォルト値を設定
};

// --- ミドルウェア本体 ---

export const $ARGUMENTS = (options: ${ARGUMENTS}Options = {}) => {
  const config = { ...defaultOptions, ...options };

  return createMiddleware<{ Variables: ${ARGUMENTS}Variables }>(
    async (c, next) => {
      // --- リクエスト処理前 ---
      // TODO: 前処理を実装
      // 例: 認証チェック、ログ記録開始、ヘッダ検証など

      // c.set() で後続のハンドラに値を渡す
      // c.set('userId', verifiedUserId);

      // --- 次のハンドラを実行 ---
      await next();

      // --- レスポンス処理後 ---
      // TODO: 後処理を実装（必要な場合）
      // 例: レスポンスログ記録、ヘッダ追加など
    },
  );
};
```

## 3. 具体例: 認証ミドルウェア

```typescript
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { verify } from 'hono/jwt';

type AuthVariables = {
  userId: string;
  userRole: 'admin' | 'user';
};

interface AuthOptions {
  excludePaths?: string[];
}

export const auth = (options: AuthOptions = {}) => {
  return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    // 除外パスのチェック
    const path = c.req.path;
    if (options.excludePaths?.some((p) => path.startsWith(p))) {
      await next();
      return;
    }

    // Authorization ヘッダの検証
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new HTTPException(401, {
        message: '認証トークンが必要です',
      });
    }

    const token = authHeader.slice(7);

    try {
      const payload = await verify(token, c.env.JWT_SECRET);
      c.set('userId', payload.sub as string);
      c.set('userRole', payload.role as 'admin' | 'user');
    } catch {
      throw new HTTPException(401, {
        message: '無効な認証トークンです',
      });
    }

    await next();
  });
};
```

## 4. 具体例: リクエストロガーミドルウェア

```typescript
import { createMiddleware } from 'hono/factory';

interface LoggerOptions {
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  excludePaths?: string[];
}

export const requestLogger = (options: LoggerOptions = {}) => {
  const { logLevel = 'info', excludePaths = [] } = options;

  return createMiddleware(async (c, next) => {
    const path = c.req.path;
    if (excludePaths.some((p) => path.startsWith(p))) {
      await next();
      return;
    }

    const startTime = Date.now();
    const method = c.req.method;
    const url = c.req.url;

    console.log(
      JSON.stringify({
        level: logLevel,
        type: 'request',
        method,
        url,
        timestamp: new Date().toISOString(),
      }),
    );

    await next();

    const duration = Date.now() - startTime;
    const status = c.res.status;

    console.log(
      JSON.stringify({
        level: status >= 400 ? 'error' : logLevel,
        type: 'response',
        method,
        url,
        status,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      }),
    );
  });
};
```

## 5. テストテンプレート

```typescript
import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { $ARGUMENTS } from '@/middleware/$ARGUMENTS';

describe('$ARGUMENTS ミドルウェア', () => {
  // テスト用アプリを作成
  const createApp = (options = {}) => {
    const app = new Hono();
    app.use('*', $ARGUMENTS(options));
    app.get('/test', (c) => c.json({ message: 'ok' }));
    return app;
  };

  it('正常なリクエストを通過させる', async () => {
    const app = createApp();
    const res = await app.request('/test');
    expect(res.status).toBe(200);
  });

  it('異常なリクエストを拒否する', async () => {
    const app = createApp();
    // TODO: 異常なリクエストのテスト
    const res = await app.request('/test', {
      // 異常な条件を設定
    });
    // expect(res.status).toBe(401);
  });

  it('オプションが正しく適用される', async () => {
    const app = createApp({
      // TODO: テスト対象のオプション
    });
    const res = await app.request('/test');
    expect(res.status).toBe(200);
  });

  it('除外パスで処理をスキップする', async () => {
    const app = new Hono();
    app.use('*', $ARGUMENTS({ excludePaths: ['/health'] }));
    app.get('/health', (c) => c.json({ status: 'ok' }));

    const res = await app.request('/health');
    expect(res.status).toBe(200);
  });

  it('Context に値がセットされる', async () => {
    const app = new Hono();
    app.use('*', $ARGUMENTS());
    app.get('/test', (c) => {
      // TODO: c.get() で値を検証
      return c.json({ message: 'ok' });
    });

    const res = await app.request('/test');
    expect(res.status).toBe(200);
  });
});
```

## 6. 作業手順

1. ミドルウェアファイルを作成する（`src/middleware/$ARGUMENTS.ts`）
2. Context で共有する変数の型を定義する
3. `createMiddleware` でミドルウェアを実装する
4. テストを作成する（`src/middleware/$ARGUMENTS.test.ts`）
5. `src/index.ts` または該当ルートでミドルウェアを適用する
6. `pnpm test` で動作確認する

## 7. 適用方法

```typescript
// グローバル適用（src/index.ts）
app.use('*', $ARGUMENTS());

// 特定パスのみ適用
app.use('/api/*', $ARGUMENTS());

// ルート個別に適用
app.get('/api/protected', $ARGUMENTS(), handler);
```

## 8. チェックリスト

- [ ] `createMiddleware` を使って型安全に実装した
- [ ] Context に渡す変数の型（Variables）を定義した
- [ ] オプションの型（Options）とデフォルト値を定義した
- [ ] エラーハンドリングを実装した（`HTTPException` を使用）
- [ ] 除外パスの仕組みを用意した（必要な場合）
- [ ] `await next()` を正しい位置で呼び出した
- [ ] テストを作成した（正常系・異常系・オプション適用）
- [ ] 適用方法をコメントまたはドキュメントに記載した
