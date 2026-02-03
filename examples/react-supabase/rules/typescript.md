# TypeScript ルール

## 型定義
- `any` 禁止。`unknown` + 型ガードで絞り込む
- Props は必ず interface で定義する
- Union 型で取りうる値を制限する（`'primary' | 'secondary'` など）
- Supabase の型は `database.types.ts` から自動生成したものを使う

## エラーハンドリング
- 非同期処理は必ず try-catch で囲む
- `error instanceof Error` で型ガードしてからメッセージを参照する
- エラーは握りつぶさない。ログ出力 or ユーザー通知を行う

## インポート
- ESModules（`import/export`）を使用
- パスエイリアス `@/` を使用する
- 型のインポートには `import type` を使う
