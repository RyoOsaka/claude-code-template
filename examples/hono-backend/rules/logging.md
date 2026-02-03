---
paths:
  - "src/**"
---

# ログルール

## ログレベルの使い分け

- `fatal`: プロセス続行不可能な致命的エラー（DB 接続不可、必須環境変数の欠落等）
- `error`: 復旧不能なエラー、即時対応が必要（未処理例外、外部 API の連続失敗等）
- `warn`: 想定外だが処理は継続可能（非推奨 API の使用、リトライ発生等）
- `info`: ビジネス上重要なイベント（ユーザー登録、決済完了、サーバー起動等）
- `debug`: 開発時のデバッグ情報（本番では無効化する）

## 構造化ログ

- JSON 形式で出力する（pino 推奨）
- 必須フィールド: `timestamp`, `level`, `message`, `requestId`
- リクエスト関連ログには `method`, `path`, `statusCode`, `duration` を含める

```typescript
import { pinoLogger } from 'hono-pino';
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
});

app.use('*', pinoLogger({ logger }));
```

## リクエストログ

- すべてのリクエストの開始と完了をログに記録する
- レスポンスタイムを計測して含める
- 4xx/5xx レスポンスは warn/error レベルで記録する

```typescript
// ログ出力例
// {"level":"info","time":1700000000,"requestId":"abc-123","method":"POST","path":"/api/v1/users","statusCode":201,"duration":42}
// {"level":"error","time":1700000000,"requestId":"abc-123","method":"GET","path":"/api/v1/users/999","statusCode":404,"error":"User not found","duration":5}
```

## 禁止事項

- NEVER: パスワード、トークン、API キー、個人情報（メールアドレス、電話番号等）をログに含めない
- NEVER: `console.log` を本番コードに残さない（pino 等のロガーを使う）
- NEVER: スタックトレースを error 以外のレベルで出力しない
- NEVER: リクエストボディ全体をそのままログに含めない（機密フィールドを除外する）

```typescript
// 機密情報のマスク例
const sanitize = (body: Record<string, unknown>) => {
  const masked = { ...body };
  const sensitiveKeys = ['password', 'token', 'secret', 'authorization'];
  for (const key of sensitiveKeys) {
    if (key in masked) masked[key] = '[REDACTED]';
  }
  return masked;
};
```

## エラーログ

- エラーログには必ず元のエラー情報（message, stack）を含める
- 外部 API エラーはレスポンスステータスとボディの要約を含める
- リトライ可能なエラーは warn、不可能なエラーは error を使う

```typescript
try {
  await externalApi.call();
} catch (err) {
  logger.error({ err, service: 'payment', action: 'charge' }, '決済処理に失敗');
  throw new HTTPException(502, { message: '外部サービスエラー' });
}
```

## 環境別設定

- 開発環境: `debug` レベル、`pino-pretty` で整形出力
- テスト環境: `warn` レベル（テスト出力を汚さない）
- 本番環境: `info` レベル、JSON 出力、エラー詳細をレスポンスに含めない
