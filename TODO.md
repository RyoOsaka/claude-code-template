# テンプレート改善 TODO

Claude Code ベストプラクティス調査（2026-02-16）に基づく改善アクション。
優先度順に実施する。

---

## 高優先度

### TODO-001: infrastructure-design.md と terraform.md に paths フロントマターを追加

**現状**: `.claude/rules/` に配置されており、毎セッション合計 763行が無条件ロードされる。
**問題**: インフラ作業時以外はコンテキストの無駄消費。Claude の指示遵守率低下の原因になる。
**対応**:

1. `infrastructure-design.md` の先頭に paths フロントマターを追加:
   ```yaml
   ---
   paths:
     - "infrastructure/**"
     - "terraform/**"
   ---
   ```
2. `terraform.md` の先頭に paths フロントマターを追加:
   ```yaml
   ---
   paths:
     - "infrastructure/**"
     - "**/*.tf"
     - "**/*.tfvars"
   ---
   ```
3. これらのルールを `examples/infrastructure/` に移動することを検討（インフラ不要なプロジェクトではルール自体が不要なため）

**効果**: インフラ関連ファイルを触ったときのみルールがロードされる。インフラ作業をしないセッションでは 763行分の読み込みが不要に。
**備考**: `infrastructure/` ディレクトリが存在しなくても問題ない。ファイル作成時点からルールが自動適用される。

---

### TODO-002: agent-team.md を skills に移行

**現状**: `.claude/rules/agent-team.md`（260行）が毎セッション無条件ロード。
**問題**: agent team 機能は実験的機能であり、使用しないセッションではコンテキストの無駄。
**対応**:

1. `.claude/skills/agent-team/SKILL.md` を作成
   ```yaml
   ---
   name: agent-team
   description: agent team 機能を使った機能開発のガイドライン。チーム構成・開発フロー・モック戦略・進捗ログの書き方を含む。
   disable-model-invocation: true
   user-invocable: true
   ---
   ```
2. `.claude/skills/agent-team/` 配下に現 `agent-team.md` の内容を移動
3. `.claude/rules/agent-team.md` を削除

**効果**: 毎セッションのルール読み込みが 260行分削減。

---

### TODO-003: api-mock.md に paths フロントマターを追加

**現状**: `.claude/rules/api-mock.md`（195行）が毎セッション無条件ロード。
**問題**: API スキーマ・モック関連ファイルを扱う時だけ必要。
**対応**:

1. `api-mock.md` の先頭に paths フロントマターを追加:
   ```yaml
   ---
   paths:
     - "src/schemas/**"
     - "src/mocks/**"
     - "src/api/**"
   ---
   ```

**効果**: API/モック関連ファイルの作業時のみロードされ、通常セッションでは読み込まれない。
**注意**: 新規プロジェクト立ち上げ時にまだディレクトリが存在しない場合、ルールが適用されない。初期セットアップ手順に「ディレクトリを先に作成」の注記を追加すること。

---

## 中優先度

### TODO-004: settings.json に $schema を追加

**現状**: `$schema` フィールドが未設定。
**問題**: IDE（VS Code 等）での自動補完・バリデーションが効かない。
**対応**:

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": { ... }
}
```

**効果**: 設定ファイル編集時の DX 向上。

---

### TODO-005: settings.json のセキュリティ強化

**現状**:
- `Bash(curl:*)` が allow に含まれている
- 機密ファイルの Read deny が未設定

**問題**:
- `curl` はデータ流出経路になり得る（Trail of Bits 推奨で deny 対象）
- `.env` や SSH キー等の読み取りがブロックされていない

**対応**:

1. allow リストから `Bash(curl:*)` を削除（必要時はユーザーが都度承認）
2. deny リストに以下を追加:
   ```json
   "deny": [
     "Read(.env)",
     "Read(.env.*)",
     "Read(.env.local)",
     "Read(.env.*.local)"
   ]
   ```

**判断ポイント**: テンプレートとして配布する以上、セキュリティはデフォルトで厳しく設定し、必要に応じてユーザーが緩和する方向が望ましい。`curl` は API 確認等で便利だが、テンプレートとしては外す方が安全。

---

### TODO-006: CLAUDE.md のプレースホルダーを目立つ形式に変更

**現状**:
```markdown
- Runtime: <!-- Node.js / Bun / Deno / Cloudflare Workers -->
```

**問題**: HTML コメントは Claude に読まれるため、未記入でもコンテキストを消費する。実プロジェクトで記入忘れに気づきにくい。

**対応**:

1. プレースホルダーを明示的なマーカーに変更:
   ```markdown
   - Runtime: [REQUIRED: Node.js / Bun / Deno / Cloudflare Workers から選択]
   ```
2. Project Structure の「フロントエンドの場合」「バックエンドの場合」を1つに統合するか、選択式に変更
3. README.md に「プレースホルダーは必ず埋めてから使用する。未記入のコメントはコンテキストの無駄消費になる」と注意書きを追加

---

## 低優先度

### TODO-007: Hooks のサンプル設定を追加

**現状**: Hooks の設定が一切ない。
**問題**: CLAUDE.md の NEVER/YOU MUST ルールは「助言的（advisory）」でしかなく、Claude が無視する可能性がある。
**対応**:

1. `.claude/settings.json` の hooks セクションに以下を追加:

   **Hook 1: 保護ファイルの編集ブロック（PreToolUse）**
   `.env` やロックファイルの意図しない書き換えを防止する。settings.json の deny ではパターンマッチが難しいため Hooks で対応。
   ```json
   {
     "hooks": {
       "PreToolUse": [
         {
           "matcher": "Edit|Write",
           "hooks": [
             {
               "type": "command",
               "command": "FILE=$(jq -r '.tool_input.file_path'); case \"$FILE\" in *.env|*.env.*|pnpm-lock.yaml|package-lock.json|yarn.lock) echo \"Protected: $FILE\" >&2; exit 2;; esac"
             }
           ]
         }
       ]
     }
   }
   ```

   **Hook 2: ファイル編集後の自動フォーマット（PostToolUse）**
   Claude がファイルを編集するたびに Prettier でフォーマットする。コミット前の lint エラーを削減。
   ```json
   {
     "hooks": {
       "PostToolUse": [
         {
           "matcher": "Edit|Write",
           "hooks": [
             {
               "type": "command",
               "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write 2>/dev/null || true"
             }
           ]
         }
       ]
     }
   }
   ```

2. または `.claude/hooks/` にサンプルスクリプトを配置
3. README.md に Hooks の使い方セクションを追加

**効果**: 保護ファイルの編集を機械的に防止 + 自動フォーマットで lint エラー削減。
**注意**: Hooks はセキュリティ境界ではない（公式注記）。あくまで補助的な仕組みとして位置づける。

---

### TODO-008: speckit commands の skills 移行を検討

**現状**: speckit 関連が `.claude/commands/`（9ファイル）にある。
**背景**: 公式は commands → skills への移行を推奨。ただし speckit は外部ツール連携ワークフローであり、commands でも正常に動作する。
**対応**:

1. 各 command ファイルの内容を確認し、skills 移行のメリットを評価
2. 移行する場合:
   - `.claude/skills/speckit-xxx/SKILL.md` として再構成
   - `disable-model-invocation: true` を設定（ユーザー明示呼び出しのみ）
   - `allowed-tools` で使用ツールを制限
3. 移行しない場合: 現状維持で問題なし（commands は引き続きサポートされる）

**判断基準**: speckit ワークフローが頻繁に更新されるなら skills の方がメンテナンスしやすい。安定しているなら現状維持で可。

---

### TODO-009: README.md にコンテキストコスト試算を追加

**現状**: README.md にコンテキストコストの「考え方」は書かれているが、具体的な数値がない。
**対応**:

1. 現テンプレートのデフォルト状態でのコンテキスト消費量を計測:
   - CLAUDE.md: 約 137行（推定 ~3,000 トークン）
   - rules/ 合計: 約 1,218行（推定 ~25,000 トークン）
   - 合計: 約 ~28,000 トークン
2. 改善後の消費量:
   - CLAUDE.md: 約 137行（~3,000 トークン）
   - rules/ 合計: 約 195行（api-mock.md のみ、paths 付き）
   - 合計: 約 ~3,000 トークン（通常セッション）
3. README.md に「テンプレート適用前後のコンテキストコスト比較」セクションを追加

---

### TODO-010: examples/ に汎用スキルのサンプルを追加

**現状**: examples/ にはルールとスタック固有スキルのみ。
**対応**:

1. 以下の汎用スキルサンプルを追加:
   - `/catchup` - 最近の変更ファイルを読み込んで状況把握
   - `/review` - 現在のブランチの差分をレビュー
   - `/debug` - エラーの調査・修正ワークフロー
2. `examples/common-skills/` ディレクトリに配置

---

## 完了条件

- [ ] TODO-001 ~ TODO-003 完了後、毎セッションのルール読み込みが 200行以下
- [ ] TODO-004 ~ TODO-005 完了後、settings.json がセキュリティベストプラクティスに準拠
- [ ] TODO-006 完了後、テンプレートのプレースホルダーが視覚的に識別可能
- [ ] 全 TODO 完了後、README.md が最新状態に更新されている

---

## 参考資料

- [Claude Code Best Practices（公式）](https://code.claude.com/docs/en/best-practices)
- [Manage Claude's Memory（公式）](https://code.claude.com/docs/en/memory)
- [Extend Claude with Skills（公式）](https://code.claude.com/docs/en/skills)
- [Claude Code Settings Reference（公式）](https://code.claude.com/docs/en/settings)
- [Trail of Bits claude-code-config](https://github.com/trailofbits/claude-code-config)
- [7 CLAUDE.md Mistakes（コミュニティ）](https://allahabadi.dev/blogs/ai/7-claude-md-mistakes-developers-make/)
