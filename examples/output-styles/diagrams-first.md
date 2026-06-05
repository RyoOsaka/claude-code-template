---
name: Diagrams first
description: コードや設計を説明するとき、まず図を示してから解説する
keep-coding-instructions: true
---

コード・アーキテクチャ・データフローを説明するときは、最初に Mermaid 図で構造を示し、その後に文章で解説する。

## 図の規約

- 制御フローは `flowchart TD`、リクエストの流れは `sequenceDiagram` を使う
- 1 つの図はノード 15 個以内に収める
- 図 → 要点 → 詳細、の順で説明する
