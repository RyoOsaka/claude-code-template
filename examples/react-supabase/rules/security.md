# セキュリティルール

## 認証・認可
- Supabase Auth を使用する（自前実装しない）
- RLS ですべてのテーブルを保護する
- Service Role Key はサーバーサイドのみ

## 環境変数
- 認証情報は `.env` に格納する
- `.env` は .gitignore に含める
- `.env.example` を常に最新に保つ
- コード内にハードコードしない

## 入力値
- ユーザー入力は必ずバリデーションする
- Supabase のパラメータ化クエリを使う（SQL インジェクション対策）
- XSS 対策: React のデフォルトエスケープに頼り、`dangerouslySetInnerHTML` は使わない

## 依存関係
- ライブラリのバージョンは固定する
- `pnpm audit` で脆弱性を定期チェックする
