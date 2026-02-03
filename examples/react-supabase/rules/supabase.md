---
paths:
  - "src/lib/supabase.ts"
  - "src/hooks/**"
  - "src/types/database.types.ts"
  - "supabase/**"
---

# Supabase ルール

## クライアント
- `lib/supabase.ts` で一元管理する
- `createClient<Database>()` で型パラメータを指定する
- URL と Anon Key は環境変数（`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`）

## セキュリティ
- NEVER: Service Role Key をクライアントサイドで使用しない
- NEVER: `auth.users` に直接アクセスしない（Supabase Auth API を使う）
- YOU MUST: すべてのテーブルに RLS を設定する
- YOU MUST: `auth.uid()` でユーザーを識別する

## クエリ
- select で必要な列のみ取得する（`select('*')` は避ける）
- リレーションは JOIN で取得する（N+1 問題を防ぐ）
- 大量データは `range()` でページネーション
- 頻繁に検索・ソートする列にインデックスを作成する

## 型定義
- スキーマ変更後は `pnpm types:gen` で型を再生成する
- 自動生成された型をそのまま使う（手動で編集しない）

## リアルタイム
- Realtime は必要な場合のみ使用する
- useEffect のクリーンアップで `unsubscribe()` を必ず呼ぶ
