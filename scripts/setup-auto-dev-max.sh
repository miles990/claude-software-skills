#!/bin/bash
# ============================================================================
# Auto-Dev 設定腳本 (Claude Max 版本)
# ============================================================================
# 使用方式：
#   curl -fsSL https://raw.githubusercontent.com/miles990/claude-software-skills/main/scripts/setup-auto-dev-max.sh | bash
# ============================================================================

set -e

echo "🤖 Auto-Dev 設定腳本 (Claude Max 版本)"
echo "======================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 檢查是否在 git repo 中
if [ ! -d .git ]; then
    echo -e "${RED}錯誤：請在 Git repository 根目錄執行此腳本${NC}"
    exit 1
fi

echo -e "${BLUE}📁 建立目錄結構...${NC}"
mkdir -p .github/workflows
mkdir -p .github/memory/{learnings,failures,decisions,patterns,strategies}
mkdir -p .github/ISSUE_TEMPLATE
touch .github/memory/{learnings,failures,decisions,patterns,strategies}/.gitkeep

echo -e "${GREEN}✓ 目錄建立完成${NC}"

# ============================================================================
# 建立 Workflow
# ============================================================================
echo -e "${BLUE}📝 建立 Workflow...${NC}"

cat > .github/workflows/auto-dev.yml << 'EOF'
# Auto-Dev Workflow (Claude Max)
# 使用官方 claude-code-action + OAuth Token

name: 🤖 Auto-Dev

on:
  issues:
    types: [labeled, opened]
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

permissions:
  contents: write
  pull-requests: write
  issues: write
  id-token: write

jobs:
  auto-dev:
    if: |
      (github.event_name == 'issues' && contains(github.event.issue.labels.*.name, 'auto-dev')) ||
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'pull_request_review_comment')

    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          prompt: |
            請使用繁體中文回覆，除非是專有名詞（如 HTML、JavaScript、CSS 等技術名詞）。

            你是一個專業的軟體開發助手。
            請根據 Issue 或 Comment 的描述完成任務。
            如果是開發任務，完成後建立 PR。

            ## 完成報告格式
            任務完成後，請在回覆中包含：

            ### 🛠️ 使用的工具與技能
            - 列出完成此任務使用的程式語言/框架
            - 使用的 CLI 工具或特殊技術

            ### 📝 任務摘要
            - 完成了什麼
            - 建立/修改了哪些檔案
EOF

echo -e "${GREEN}✓ Workflow 建立完成${NC}"

# ============================================================================
# 建立 Issue Template
# ============================================================================
echo -e "${BLUE}📝 建立 Issue Template...${NC}"

cat > .github/ISSUE_TEMPLATE/auto-dev.yml << 'EOF'
name: 🤖 Auto-Dev Task
description: 建立一個自動開發任務
title: "[Auto-Dev] "
labels: ["auto-dev"]
body:
  - type: textarea
    id: goal
    attributes:
      label: 目標
      description: 描述你想要達成的開發目標
      placeholder: "例如：建立一個 Hello World 程式"
    validations:
      required: true

  - type: textarea
    id: acceptance
    attributes:
      label: 驗收標準
      description: 如何判斷任務完成？
    validations:
      required: false
EOF

echo -e "${GREEN}✓ Issue Template 建立完成${NC}"

# ============================================================================
# 初始化 Memory
# ============================================================================
echo -e "${BLUE}📝 初始化 Memory 系統...${NC}"

cat > .github/memory/index.md << 'EOF'
# 專案記憶索引

## 最近學習
<!-- LEARNINGS_START -->
<!-- LEARNINGS_END -->

## 失敗經驗
<!-- FAILURES_START -->
<!-- FAILURES_END -->
EOF

echo -e "${GREEN}✓ Memory 系統初始化完成${NC}"

# ============================================================================
# 完成提示
# ============================================================================
echo ""
echo "============================================"
echo -e "${GREEN}🎉 Auto-Dev 設定完成！${NC}"
echo "============================================"
echo ""
echo "接下來請："
echo ""
echo -e "  ${YELLOW}1. 安裝 GitHub App（設定 OAuth Token）：${NC}"
echo ""
echo "     在此目錄執行："
echo -e "     ${BLUE}claude /install-github-app${NC}"
echo ""
echo "     這會自動："
echo "     - 安裝 Claude Code GitHub App"
echo "     - 設定 CLAUDE_CODE_OAUTH_TOKEN 到 repo secrets"
echo ""
echo -e "  ${YELLOW}2. 提交變更：${NC}"
echo "     git add .github/"
echo "     git commit -m 'feat: Add Auto-Dev workflow'"
echo "     git push"
echo ""
echo -e "  ${YELLOW}3. 使用方式：${NC}"
echo "     - 建立 Issue → 加上 'auto-dev' label"
echo "     - 或在 Issue/PR 留言 @claude [指令]"
echo ""
echo -e "${BLUE}💡 提示：Claude Max 訂閱的用量包含在訂閱費用中${NC}"
echo ""
