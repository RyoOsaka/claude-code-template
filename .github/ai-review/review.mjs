#!/usr/bin/env node

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { parse } from "yaml";
import { execSync } from "child_process";

// 設定ファイルの読み込み
const configPath = ".github/ai-review/config.yml";
const config = parse(readFileSync(configPath, "utf8"));

// 環境変数から変更ファイル一覧を取得
const changedFiles = process.env.CHANGED_FILES?.split(" ").filter(Boolean) || [];

if (changedFiles.length === 0) {
  console.log("No files to review");
  writeFileSync(".github/ai-review/result.md", "");
  process.exit(0);
}

// 除外パターンのチェック
function shouldExclude(filePath) {
  const excludePatterns = config.exclude?.paths || [];
  return excludePatterns.some((pattern) => {
    const regex = new RegExp(pattern.replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*"));
    return regex.test(filePath);
  });
}

// ファイルサイズチェック
function isFileTooLarge(filePath) {
  try {
    const stats = execSync(`wc -c < "${filePath}"`, { encoding: "utf8" });
    const size = parseInt(stats.trim(), 10);
    return size > (config.exclude?.max_file_size || 100000);
  } catch {
    return false;
  }
}

// レビュー対象ファイルのフィルタリング
const filesToReview = changedFiles.filter((file) => {
  if (!existsSync(file)) return false;
  if (shouldExclude(file)) return false;
  if (isFileTooLarge(file)) return false;
  return true;
});

if (filesToReview.length === 0) {
  console.log("No files to review after filtering");
  writeFileSync(".github/ai-review/result.md", "");
  process.exit(0);
}

// 有効なレビュー観点を取得
const enabledReviews = config.reviews.filter((r) => r.enabled);

// プロンプトファイルの読み込み
function loadPrompt(review) {
  const promptFile = review.prompt_file || `prompts/${review.name}.md`;
  const promptPath = `.github/ai-review/${promptFile}`;

  if (existsSync(promptPath)) {
    return readFileSync(promptPath, "utf8");
  }

  // デフォルトのチェック項目からプロンプト生成
  if (review.checks) {
    return `## ${review.description}\n\n以下の項目をチェックしてください:\n${review.checks.map((c) => `- ${c}`).join("\n")}`;
  }

  return `## ${review.description}`;
}

// 差分の取得
function getFileDiff(filePath) {
  try {
    const diff = execSync(`git diff origin/main...HEAD -- "${filePath}"`, {
      encoding: "utf8",
      maxBuffer: 1024 * 1024,
    });
    return diff || readFileSync(filePath, "utf8");
  } catch {
    return readFileSync(filePath, "utf8");
  }
}

// ファイル内容の収集
const fileContents = filesToReview.map((file) => {
  const diff = getFileDiff(file);
  return `### ${file}\n\`\`\`\n${diff}\n\`\`\``;
});

// 統合プロンプトの生成
function buildUnifiedPrompt() {
  const reviewPrompts = enabledReviews.map((r) => loadPrompt(r)).join("\n\n---\n\n");

  return `あなたはコードレビューの専門家です。以下の観点でコードをレビューしてください。

# レビュー観点

${reviewPrompts}

# レビュー対象のコード（差分）

${fileContents.join("\n\n")}

# 出力形式

問題が見つかった場合のみ、以下の形式で出力してください:

### [ファイル名]

${config.output?.emoji?.error || "🚨"} **[severity: error]** 問題の説明
- 該当箇所: \`該当コード\`
- 理由: なぜ問題なのか
- 修正案: どう修正すべきか

${config.output?.emoji?.warning || "⚠️"} **[severity: warning]** 問題の説明
...

${config.output?.emoji?.info || "💡"} **[severity: info]** 問題の説明
...

# ルール
- 問題がない場合は「問題は見つかりませんでした」とだけ出力
- 推測や曖昧な指摘は避け、具体的な問題のみ指摘
- 重要度の高い問題を優先して報告
- ${config.output?.language === "ja" ? "日本語" : "English"}で出力`;
}

// 分離プロンプトの生成（観点ごと）
function buildSeparatePrompt(review) {
  const prompt = loadPrompt(review);

  return `あなたはコードレビューの専門家です。以下の観点でコードをレビューしてください。

# レビュー観点: ${review.name}

${prompt}

# レビュー対象のコード（差分）

${fileContents.join("\n\n")}

# 出力形式

問題が見つかった場合のみ、以下の形式で出力してください:

### [ファイル名]

${config.output?.emoji?.[review.severity] || "⚠️"} **問題の説明**
- 該当箇所: \`該当コード\`
- 理由: なぜ問題なのか
- 修正案: どう修正すべきか

# ルール
- 問題がない場合は空文字を出力
- 推測や曖昧な指摘は避け、具体的な問題のみ指摘
- ${config.output?.language === "ja" ? "日本語" : "English"}で出力`;
}

// Claude API呼び出し
async function callClaude(prompt) {
  const client = new Anthropic();

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  return response.content[0].text;
}

// メイン処理
async function main() {
  console.log(`Reviewing ${filesToReview.length} files...`);
  console.log(`Enabled reviews: ${enabledReviews.map((r) => r.name).join(", ")}`);

  let result = "";

  if (config.mode === "separate") {
    // 観点ごとに分離実行
    for (const review of enabledReviews) {
      console.log(`Running ${review.name} review...`);
      const prompt = buildSeparatePrompt(review);
      const response = await callClaude(prompt);

      if (response.trim() && !response.includes("問題は見つかりませんでした")) {
        result += `## ${review.description}\n\n${response}\n\n`;
      }
    }
  } else {
    // 統合実行
    console.log("Running unified review...");
    const prompt = buildUnifiedPrompt();
    const response = await callClaude(prompt);

    if (!response.includes("問題は見つかりませんでした")) {
      result = response;
    }
  }

  // 結果を保存
  writeFileSync(".github/ai-review/result.md", result);
  console.log("Review completed");

  if (result) {
    console.log("Issues found:");
    console.log(result);
  } else {
    console.log("No issues found");
  }
}

main().catch((error) => {
  console.error("Review failed:", error);
  process.exit(1);
});
