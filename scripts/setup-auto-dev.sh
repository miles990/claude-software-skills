#!/bin/bash
# ============================================================================
# Auto-Dev 快速設定腳本
# ============================================================================
# 使用方式：
#   curl -fsSL https://raw.githubusercontent.com/user/claude-software-skills/main/scripts/setup-auto-dev.sh | bash
#
# 或下載後執行：
#   chmod +x setup-auto-dev.sh
#   ./setup-auto-dev.sh
# ============================================================================

set -e

echo "🤖 Auto-Dev 設定腳本"
echo "===================="
echo ""

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 檢查是否在 git repo 中
if [ ! -d .git ]; then
    echo -e "${RED}錯誤：請在 Git repository 根目錄執行此腳本${NC}"
    exit 1
fi

# 取得 repo 資訊
REPO_URL=$(git config --get remote.origin.url 2>/dev/null || echo "")
if [ -z "$REPO_URL" ]; then
    echo -e "${YELLOW}警告：無法取得 remote URL${NC}"
fi

echo -e "${BLUE}📁 建立目錄結構...${NC}"

# 建立目錄
mkdir -p .github/workflows
mkdir -p .github/memory/{learnings,failures,decisions,patterns,strategies}
mkdir -p .github/ISSUE_TEMPLATE

echo -e "${GREEN}✓ 目錄建立完成${NC}"

# ============================================================================
# 方式選擇
# ============================================================================
echo ""
echo "請選擇設定方式："
echo "  1) 使用 Reusable Workflow（推薦，自動取得更新）"
echo "  2) 複製完整 Workflow（獨立，可自訂）"
echo ""
read -p "選擇 [1/2]: " CHOICE

if [ "$CHOICE" = "1" ]; then
    # ========================================================================
    # 方式 1: Reusable Workflow
    # ========================================================================
    echo -e "${BLUE}📝 建立 Reusable Workflow 設定...${NC}"

    cat > .github/workflows/auto-dev.yml << 'EOF'
# Auto-Dev Workflow
# 使用 claude-software-skills 的 reusable workflow

name: 🤖 Auto-Dev

on:
  issues:
    types: [labeled]
  issue_comment:
    types: [created]
  workflow_dispatch:
    inputs:
      goal:
        description: '開發目標'
        required: true
        type: string

concurrency:
  group: auto-dev-${{ github.event.issue.number || github.run_id }}
  cancel-in-progress: false

jobs:
  auto-dev:
    # TODO: 替換成你的 skills repo
    uses: user/claude-software-skills/.github/workflows/auto-dev-reusable.yml@main
    with:
      goal: ${{ github.event.inputs.goal || '' }}
      # skills_repo: 'user/claude-software-skills'  # 可選：載入額外 skills
      # custom_instructions: '使用 TypeScript，遵循專案風格'  # 可選
    secrets:
      ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
EOF

    echo -e "${YELLOW}⚠️  請編輯 .github/workflows/auto-dev.yml${NC}"
    echo -e "${YELLOW}   將 'user/claude-software-skills' 替換成正確的 repo 路徑${NC}"

else
    # ========================================================================
    # 方式 2: 完整複製
    # ========================================================================
    echo -e "${BLUE}📝 下載完整 Workflow...${NC}"

    SKILLS_REPO="https://raw.githubusercontent.com/user/claude-software-skills/main"

    curl -fsSL "$SKILLS_REPO/.github/workflows/auto-dev.yml" -o .github/workflows/auto-dev.yml
    curl -fsSL "$SKILLS_REPO/.github/workflows/auto-dev-feedback.yml" -o .github/workflows/auto-dev-feedback.yml
    curl -fsSL "$SKILLS_REPO/.github/workflows/auto-dev-queue.yml" -o .github/workflows/auto-dev-queue.yml

    echo -e "${GREEN}✓ Workflow 檔案下載完成${NC}"
fi

# ============================================================================
# 共用設定
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
      placeholder: "例如：實作用戶登入功能，支援 Email + 密碼登入"
    validations:
      required: true

  - type: textarea
    id: acceptance
    attributes:
      label: 驗收標準
      description: 如何判斷任務完成？
      placeholder: |
        - [ ] 功能正常運作
        - [ ] 有測試
    validations:
      required: false

  - type: dropdown
    id: priority
    attributes:
      label: 優先級
      options:
        - normal
        - high
        - low
EOF

echo -e "${GREEN}✓ Issue Template 建立完成${NC}"

echo -e "${BLUE}📝 初始化 Memory 系統...${NC}"

cat > .github/memory/index.md << 'EOF'
# 專案記憶索引

> 自動維護

## 最近學習
<!-- LEARNINGS_START -->
<!-- LEARNINGS_END -->

## 失敗經驗
<!-- FAILURES_START -->
<!-- FAILURES_END -->

## 決策記錄
<!-- DECISIONS_START -->
<!-- DECISIONS_END -->
EOF

# 建立 .gitkeep
touch .github/memory/{learnings,failures,decisions,patterns,strategies}/.gitkeep

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
echo "  1. 設定 GitHub Secret："
echo "     Repository Settings → Secrets → Actions"
echo -e "     新增 ${YELLOW}ANTHROPIC_API_KEY${NC}"
echo ""
echo "  2. 提交變更："
echo "     git add .github/"
echo "     git commit -m 'feat: Add Auto-Dev workflow'"
echo "     git push"
echo ""
echo "  3. 使用方式："
echo "     - 建立 Issue → 加上 'auto-dev' label"
echo "     - 或在任意 Issue 留言 '/evolve [目標]'"
echo ""
echo "文檔：https://github.com/user/claude-software-skills/blob/main/.github/AUTO-DEV.md"
echo ""
