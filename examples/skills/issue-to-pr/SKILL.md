---
name: issue-to-pr
description: GitHub Issue を起点として TDD で実装し PR を作成するワークフロー。「Issue を実装して」「#123 を作業して」などの指示で使用。
argument-hint: <issue-number>
---

# Issue → PR ワークフロー

`$ARGUMENTS` の Issue を TDD で実装し、PR を作成する。

## 1. Issue 取得

```bash
gh issue view $ARGUMENTS
```

- 要件と受け入れ条件を確認
- 不明点があれば質問（コメント or 人間に確認）
- 作業範囲を明確化

## 2. ブランチ作成

```bash
# Issue のラベルから type を判定
# feature/bug/chore/docs

git checkout -b <type>/#$ARGUMENTS-<description>
```

### ラベルと type のマッピング

| Issue ラベル | ブランチ type | コミット type |
|-------------|---------------|---------------|
| feature / enhancement | `feature/` | `feat:` |
| bug | `fix/` | `fix:` |
| documentation | `docs/` | `docs:` |
| chore / maintenance | `chore/` | `chore:` |

## 3. TDD サイクル

### 3.1 スキーマ定義（API の場合）

```typescript
// src/schemas/<resource>.ts
import { z } from 'zod';

export const CreateXxxSchema = z.object({
  // フィールド定義
});

export type CreateXxxInput = z.infer<typeof CreateXxxSchema>;
```

### 3.2 Red Phase（テスト先行）

```typescript
// src/services/<resource>.test.ts
describe('XxxService', () => {
  it('正常系: 期待する動作', async () => {
    // テストを書く（この時点では失敗する）
  });

  it('異常系: エラーケース', async () => {
    // エラーケースのテスト
  });
});
```

```bash
pnpm test  # 失敗を確認
```

### 3.3 Green Phase（実装）

```typescript
// src/services/<resource>.ts
export class XxxService {
  // テストが通る最小限の実装
}
```

```bash
pnpm test  # 成功を確認
```

### 3.4 Refactor Phase

```bash
# リファクタリング後
pnpm lint
pnpm typecheck
pnpm test  # 再確認
```

## 4. 品質チェック

```bash
pnpm lint       # 必須
pnpm typecheck  # 必須
pnpm test       # 必須
pnpm test:e2e   # 画面がある場合
```

## 5. コミット

```bash
git add .
git commit -m "$(cat <<'EOF'
<type>: <説明> (#$ARGUMENTS)

<本文>

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

## 6. プッシュと PR 作成

```bash
git push -u origin <branch-name>

gh pr create \
  --title "<type>: <説明>" \
  --body "$(cat <<'EOF'
## 概要
<Issue の内容を要約>

## 変更内容
- <変更点>

## 変更理由
Issue #$ARGUMENTS の要件に基づき実装

## テスト計画
- [x] ユニットテスト追加
- [x] lint / typecheck 通過
- [ ] 既存テスト通過確認

## 関連 Issue
Closes #$ARGUMENTS
EOF
)"
```

## 7. チェックリスト

- [ ] Issue の要件を満たしている
- [ ] テストを先に書いた（TDD）
- [ ] lint / typecheck が通る
- [ ] 全テストが通る
- [ ] PR に `Closes #$ARGUMENTS` を含めた
- [ ] コミットメッセージに Issue 番号を含めた
