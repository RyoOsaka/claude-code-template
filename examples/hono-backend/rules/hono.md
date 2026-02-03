---
paths:
  - "src/routes/**"
  - "src/middleware/**"
  - "src/index.ts"
---

# Hono プロジェクト規約

## ルーティング構成

- リソースごとに `new Hono()` でルートを分割し、`app.route()` でマウントする
- ルートハンドラにビジネスロジックを書かない（サービス層に委譲する）
- URL 設計・レスポンス形式は api-design.md に従う

## ミドルウェア適用順序

この順番を守ること:

1. ロギング（`logger()`）
2. CORS（`cors()`）
3. セキュリティヘッダ（`secureHeaders()`）
4. 認証（`authMiddleware` - API ルートのみ）

- グローバルミドルウェア → `src/index.ts`
- ルート固有ミドルウェア → 各ルートファイル内
- カスタムミドルウェアは `createMiddleware` で型安全に作成する

## Context 型定義

- `Bindings`: 環境変数の型
- `Variables`: ミドルウェアで `c.set()` する値の型
- 型定義は `src/types/env.ts` に集約する

## エラーハンドラ

- `app.onError` でグローバルエラーハンドラを定義する
- `app.notFound` で 404 ハンドラを定義する
- 判定順序: カスタムエラー → `HTTPException` → 未知のエラー
- レスポンス形式は api-design.md のエラー形式に従う

## バリデーション

- `@hono/zod-validator` を使用する
- バリデーション対象: `json`, `query`, `param`
- スキーマはルートファイルの上部に定義する
