---
name: tdd
description: TDD で新機能を開発する。「TDDで作って」「テストファーストで」などの指示で使用。
argument-hint: <機能名>
---

# TDD 機能開発

`$ARGUMENTS` を TDD（テスト駆動開発）で実装する。

## 開発フロー

### Phase 1: 要件理解

1. 機能の目的を確認する
2. 入力・出力を明確にする
3. 正常系・異常系のケースを洗い出す

### Phase 2: テストケース設計

実装前にテストケースを列挙する:

```
正常系
- [ ] $ARGUMENTS の基本的な動作
- [ ] ...

異常系
- [ ] 無効な入力の場合
- [ ] ...

境界値
- [ ] 空の場合
- [ ] 最大値の場合
- [ ] ...
```

### Phase 3: TDD サイクル実行

各テストケースについて以下を繰り返す:

#### RED（テストを書く）

```bash
# 1. テストファイルを作成
# 2. テストを実行して失敗を確認
pnpm test -- --run
# → FAIL を確認してから次へ
```

#### GREEN（実装する）

```bash
# 1. 最小限の実装を書く
# 2. テストを実行して成功を確認
pnpm test -- --run
# → PASS を確認してから次へ
```

#### REFACTOR（改善する）

```bash
# 1. コードを改善する
# 2. テストを実行して成功を維持
pnpm test -- --run
# → PASS を維持
```

### Phase 4: 完了確認

```bash
# 全テストが通ることを確認
pnpm test -- --run

# lint と型チェック
pnpm lint
pnpm typecheck

# カバレッジ確認（任意）
pnpm test -- --coverage
```

## テストテンプレート

### バックエンド（サービス層）

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
// import { ... } from './$ARGUMENTS';  // まだ存在しない

describe('$ARGUMENTS', () => {
  describe('基本動作', () => {
    it('正常な入力で期待する結果を返す', async () => {
      // Arrange
      const input = { /* ... */ };

      // Act
      // const result = await $ARGUMENTS(input);  // まだ存在しない

      // Assert
      // expect(result).toEqual({ /* ... */ });
      expect(true).toBe(false); // RED: 最初は必ず失敗させる
    });
  });

  describe('異常系', () => {
    it('無効な入力でエラーを投げる', async () => {
      // ...
      expect(true).toBe(false); // RED
    });
  });
});
```

### フロントエンド（コンポーネント）

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
// import { $ARGUMENTS } from './$ARGUMENTS';  // まだ存在しない

describe('$ARGUMENTS', () => {
  it('正しくレンダリングされる', () => {
    // render(<$ARGUMENTS />);  // まだ存在しない
    // expect(screen.getByRole('...')).toBeInTheDocument();
    expect(true).toBe(false); // RED
  });

  it('ユーザー操作に応答する', async () => {
    const user = userEvent.setup();
    // ...
    expect(true).toBe(false); // RED
  });
});
```

## チェックリスト

- [ ] Phase 1: 要件を理解した
- [ ] Phase 2: テストケースを設計した
- [ ] Phase 3: 各テストケースで TDD サイクルを回した
  - [ ] RED: テストが失敗することを確認した
  - [ ] GREEN: テストが成功することを確認した
  - [ ] REFACTOR: 品質改善後もテストが通ることを確認した
- [ ] Phase 4: 全テスト・lint・型チェックが通った
