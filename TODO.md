# テンプレート改善 TODO

Claude Code ベストプラクティス調査（2026-02-16）に基づく改善アクション。

---

## 高優先度

### TODO-001: infrastructure-design.md と terraform.md を examples/ に移動 ✅

`examples/rules/infrastructure/` に移動し、paths フロントマター付きで配置。

---

### TODO-002: agent-team.md を skills に移行 ✅

`examples/skills/agent-team/SKILL.md` として再構成。

---

### TODO-003: api-mock.md を examples/ に移動 ✅

`examples/rules/api-mock/` に移動し、paths フロントマター付きで配置。

---

## 中優先度

### TODO-004: settings.json に $schema を追加 ✅

`$schema` フィールドを追加し、README.md に説明を記載。

---

### TODO-005: settings.json のセキュリティ強化 ✅

`.env` の Read deny ルールを追加。

---

### TODO-006: CLAUDE.md のプレースホルダーを目立つ形式に変更 ✅

HTML コメントを `[REQUIRED: ...]` 形式に変更。README.md も更新。

---

## 低優先度

### TODO-007: Hooks のサンプル設定を追加 ✅

`examples/hooks/settings.json.example` として配置。README.md に Hooks セクションを追加。

---

### TODO-008: speckit commands の skills 移行を検討 - N/A

`.claude/commands/` が存在しないため対象なし。

---

### TODO-009: README.md にコンテキストコスト試算を追加 ✅

改善前後の比較テーブルを README.md に追加（~1,355行 → ~131行、約90%削減）。

---

## 完了条件

- [x] TODO-001 ~ TODO-003 完了後、毎セッションのルール読み込みが 200行以下
- [x] TODO-004 ~ TODO-005 完了後、settings.json がセキュリティベストプラクティスに準拠
- [x] TODO-006 完了後、テンプレートのプレースホルダーが視覚的に識別可能
- [x] README.md が最新状態に更新されている

---

## 参考資料

- [Claude Code Best Practices（公式）](https://code.claude.com/docs/en/best-practices)
- [Manage Claude's Memory（公式）](https://code.claude.com/docs/en/memory)
- [Extend Claude with Skills（公式）](https://code.claude.com/docs/en/skills)
- [Claude Code Settings Reference（公式）](https://code.claude.com/docs/en/settings)
- [Trail of Bits claude-code-config](https://github.com/trailofbits/claude-code-config)
- [7 CLAUDE.md Mistakes（コミュニティ）](https://allahabadi.dev/blogs/ai/7-claude-md-mistakes-developers-make/)
