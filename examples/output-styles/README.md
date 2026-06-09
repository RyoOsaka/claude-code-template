# 出力スタイル サンプル

Claude の応答スタイル（役割・トーン・出力フォーマット）を変える「出力スタイル」のサンプル。

## 出力スタイルとは

**何を知っているか**ではなく**どう応答するか**を変える仕組み。システムプロンプトを書き換え、役割・口調・出力形式を設定する。毎ターン同じ言い回しや形式を指示し直しているなら出力スタイルにする。

- プロジェクトの規約・コードベースの説明 → **CLAUDE.md**（出力スタイルではない）
- 役割・トーン・既定フォーマットの変更 → **出力スタイル**

## 組み込みスタイル

| スタイル | 内容 |
|---------|------|
| Default | 通常のソフトウェア開発向け |
| Proactive | 即実行・自律寄り（確認は残る） |
| Explanatory | 実装の合間に教育的な「Insights」を挟む |
| Learning | 学びながら進める。`TODO(human)` を置いて一部を人間に書かせる |

## 使い方

カスタムスタイルの Markdown を配置する:

- ユーザー: `~/.claude/output-styles/`
- プロジェクト: `.claude/output-styles/`

```bash
cp examples/output-styles/diagrams-first.md .claude/output-styles/
```

切り替えは `/config` の **Output style** から選ぶか、設定ファイルに直接書く:

```json
{ "outputStyle": "Diagrams first" }
```

> 旧 `/output-style` コマンドは v2.1.91 で削除済み。`/config` か `outputStyle` 設定を使う。
> 出力スタイルはセッション開始時に読まれる → 変更は `/clear` か新セッションで反映。

## ファイル形式

```markdown
---
name: スタイル名                    # 省略時はファイル名
description: /config の一覧に表示    # 任意
keep-coding-instructions: true      # true=開発向け組込み指示を残す（既定 false）
---

システムプロンプトに追加する指示。
```

`keep-coding-instructions`:
- `true` — コーディング挙動は維持しつつ伝え方だけ変える（例: 常に図から説明）
- 省略/`false` — 開発以外の用途（ライティング・データ分析など）

## 同梱サンプル

### diagrams-first.md

コード・設計を説明するとき、まず Mermaid 図を示してから文章で解説する（`keep-coding-instructions: true`）。

## 関連機能との違い

- **CLAUDE.md** — システムプロンプト後の user メッセージ。プロジェクト知識向け
- **サブエージェント** — 独立したシステムプロンプト・モデル・ツールで別タスク
- **スキル** — 呼び出し時に読むワークフロー
