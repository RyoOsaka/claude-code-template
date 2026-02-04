---
paths:
  - "src/routes/**"
---

# API 設計ルール

## URL 設計

- ベースパス: `/api/v1/`
- リソース名は**複数形**の名詞（`/users`, `/posts`, `/comments`）
- ケバブケースを使用する（`/user-profiles`, `/order-items`）
- ネストは1階層まで（`/users/:userId/posts` は OK、3階層以上は避ける）
- 動詞は使わない（`/users/create` ではなく `POST /users`）
- IDは UUID を使用する

```
GET    /api/v1/users           # 一覧取得
POST   /api/v1/users           # 作成
GET    /api/v1/users/:id       # 単体取得
PUT    /api/v1/users/:id       # 更新
DELETE /api/v1/users/:id       # 削除
GET    /api/v1/users/:id/posts # ユーザーの投稿一覧
```

## HTTP メソッド

| メソッド | 用途 | 冪等性 | リクエストボディ |
|---------|------|--------|---------------|
| GET | リソース取得 | Yes | なし |
| POST | リソース作成 | No | あり |
| PUT | リソース更新 | Yes | あり |
| DELETE | リソース削除 | Yes | なし |

- 更新は **PUT に統一** する（PATCH は使わない）
- 部分更新も PUT で受け付ける（送られたフィールドのみ更新する）

## レスポンス形式

### 成功時

```json
// 単体
{ "data": { "id": "xxx", "name": "..." } }

// 一覧（ページネーション付き）
{
  "data": [{ "id": "xxx", "name": "..." }],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "hasMore": true
  }
}

// 作成成功（201）
{ "data": { "id": "newly-created-id", "name": "..." } }

// 削除成功（204）
// ボディなし
```

### エラー時

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です",
    "details": [
      { "field": "email", "message": "有効なメールアドレスを入力してください" }
    ]
  }
}
```

- `code`: 機械可読なエラーコード（大文字スネークケース）
- `message`: 人間可読なメッセージ
- `details`: バリデーションエラー時のみ、フィールドごとの詳細

### エラーコード一覧

| コード | HTTPステータス | 意味 |
|-------|--------------|------|
| VALIDATION_ERROR | 400 | 入力値バリデーション失敗 |
| UNAUTHORIZED | 401 | 未認証 |
| FORBIDDEN | 403 | 権限不足 |
| NOT_FOUND | 404 | リソースが存在しない |
| CONFLICT | 409 | 重複・競合 |
| INTERNAL_ERROR | 500 | サーバー内部エラー |

## ステータスコード

- `200` 取得・更新成功
- `201` 作成成功
- `204` 削除成功（ボディなし）
- `400` バリデーションエラー
- `401` 未認証
- `403` 権限不足
- `404` リソースなし
- `409` 競合（重複）
- `500` サーバー内部エラー

## ページネーション

- オフセットベース（シンプルな一覧向け）
- クエリパラメータ: `?page=1&limit=20`
- デフォルト: `page=1`, `limit=20`
- `limit` の上限は 100
- レスポンスの `meta` に総数とページ情報を含める

## フィルタ・ソート

- フィルタ: クエリパラメータで指定（`?status=active&role=admin`）
- ソート: `?sort=created_at&order=desc`
- 複数ソートが必要な場合: `?sort=created_at:desc,name:asc`
- ソート可能なフィールドはホワイトリストで制限する

## バージョニング

- URL パスに含める（`/api/v1/`）
- 破壊的変更がある場合のみバージョンを上げる
- 旧バージョンは非推奨（deprecated）にしてから一定期間後に廃止する
