# Claude Software Skills 使用指南

> 如何在你的專案中安裝和使用 claude-software-skills

## 目錄

- [前置需求](#前置需求)
- [安裝方式](#安裝方式)
- [使用範例](#使用範例)
- [完整安裝流程](#完整安裝流程)
- [常見問題](#常見問題)

---

## 前置需求

### 1. 安裝 skillpkg MCP Server

claude-software-skills 使用 [skillpkg](https://github.com/anthropics/skillpkg) 作為套件管理工具。

```bash
# 透過 Claude Code 安裝 skillpkg MCP
claude mcp add skillpkg
```

或手動加入 `~/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "skillpkg": {
      "command": "npx",
      "args": ["-y", "@anthropic/skillpkg-mcp"]
    }
  }
}
```

### 2. 初始化專案

在你的專案根目錄執行：

```bash
# Claude Code 會自動建立 skillpkg.json
# 或手動建立
echo '{
  "$schema": "https://skillpkg.dev/schemas/skillpkg.json",
  "name": "your-project",
  "skills": {},
  "sync_targets": {
    "claude-code": true
  }
}' > skillpkg.json
```

---

## 安裝方式

### 方式一：安裝單一 Skill

```
github:miles990/claude-software-skills#{skill-path}
```

**範例：**

```python
# 安裝 frontend skill
mcp__skillpkg__install_skill(
    source="github:miles990/claude-software-skills#development-stacks/frontend",
    scope="local"  # 或 "global"
)

# 安裝 python skill
mcp__skillpkg__install_skill(
    source="github:miles990/claude-software-skills#programming-languages/python",
    scope="local"
)
```

### 方式二：批量安裝多個 Skills

```python
# 一次安裝多個（平行執行）
skills_to_install = [
    "development-stacks/frontend",
    "development-stacks/backend",
    "programming-languages/javascript-typescript",
    "programming-languages/python",
    "software-engineering/code-quality",
    "software-design/api-design",
]

for skill_path in skills_to_install:
    mcp__skillpkg__install_skill(
        source=f"github:miles990/claude-software-skills#{skill_path}",
        scope="local"
    )
```

### 方式三：使用本地路徑（開發者模式）

如果你 clone 了 repo：

```bash
git clone https://github.com/miles990/claude-software-skills.git
```

可以使用本地路徑安裝：

```python
mcp__skillpkg__install_skill(
    source="/path/to/claude-software-skills/development-stacks/frontend",
    scope="local"
)
```

---

## 使用範例

### 範例 1：Web 全端專案

適用於 React + FastAPI 專案：

```python
# 前端
mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#development-stacks/frontend")
mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#programming-languages/javascript-typescript")

# 後端
mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#development-stacks/backend")
mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#programming-languages/python")

# API 設計
mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#software-design/api-design")

# 品質與測試
mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#software-engineering/code-quality")
mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#software-engineering/testing-strategies")
```

### 範例 2：AI 應用專案

適用於 LLM 整合專案：

```python
# AI/ML 整合
mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#development-stacks/ai-ml-integration")

# 後端
mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#development-stacks/backend")
mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#programming-languages/python")

# API 設計（for AI endpoints）
mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#software-design/api-design")
```

### 範例 3：即時通訊應用

適用於 WebSocket/SSE 應用：

```python
# 即時系統
mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#development-stacks/realtime-systems")

# 前後端
mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#development-stacks/frontend")
mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#development-stacks/backend")
```

### 範例 4：純後端 API 服務

```python
# 後端開發
mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#development-stacks/backend")
mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#programming-languages/python")
# 或 Go
mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#programming-languages/go")

# API 設計
mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#software-design/api-design")

# 資料庫
mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#development-stacks/database")

# 可靠性
mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#software-engineering/reliability-engineering")
```

---

## 完整安裝流程

以下是在 omniflow-studio 專案中安裝 claude-software-skills 的完整過程記錄：

### Step 1: 確認 skillpkg MCP 可用

```python
# 檢查 skill 狀態
mcp__skillpkg__skill_status()
```

### Step 2: 安裝開發架構 Skills

```python
# 前端 (React)
mcp__skillpkg__install_skill(
    source="github:miles990/claude-software-skills#development-stacks/frontend",
    scope="local"
)
# 輸出: ✅ Installed 1 skill(s): frontend v1.0.0

# 後端 (FastAPI)
mcp__skillpkg__install_skill(
    source="github:miles990/claude-software-skills#development-stacks/backend",
    scope="local"
)
# 輸出: ✅ Installed 1 skill(s): backend v1.0.0

# 即時系統 (SSE/WebSocket)
mcp__skillpkg__install_skill(
    source="github:miles990/claude-software-skills#development-stacks/realtime-systems",
    scope="local"
)
# 輸出: ✅ Installed 1 skill(s): realtime-systems v1.0.0

# AI 整合
mcp__skillpkg__install_skill(
    source="github:miles990/claude-software-skills#development-stacks/ai-ml-integration",
    scope="local"
)
# 輸出: ✅ Installed 1 skill(s): ai-ml-integration v1.0.0
```

### Step 3: 安裝程式語言 Skills

```python
# JavaScript/TypeScript
mcp__skillpkg__install_skill(
    source="github:miles990/claude-software-skills#programming-languages/javascript-typescript",
    scope="local"
)

# Python
mcp__skillpkg__install_skill(
    source="github:miles990/claude-software-skills#programming-languages/python",
    scope="local"
)
```

### Step 4: 安裝軟體工程 Skills

```python
# 程式碼品質
mcp__skillpkg__install_skill(
    source="github:miles990/claude-software-skills#software-engineering/code-quality",
    scope="local"
)

# 測試策略
mcp__skillpkg__install_skill(
    source="github:miles990/claude-software-skills#software-engineering/testing-strategies",
    scope="local"
)
```

### Step 5: 安裝軟體設計 Skills

```python
# API 設計
mcp__skillpkg__install_skill(
    source="github:miles990/claude-software-skills#software-design/api-design",
    scope="local"
)

# UX 原則
mcp__skillpkg__install_skill(
    source="github:miles990/claude-software-skills#software-design/ux-principles",
    scope="local"
)
```

### Step 6: 驗證安裝結果

```python
# 列出所有已安裝的 skills
mcp__skillpkg__list_skills(scope="local")

# 輸出:
# Found 16 installed skill(s):
# • ai-ml-integration v1.0.0 [local]
# • api-design v1.0.0 [local]
# • backend v1.0.0 [local]
# • code-quality v1.0.0 [local]
# • frontend v1.0.0 [local]
# • javascript-typescript v1.0.0 [local]
# • python v1.0.0 [local]
# • realtime-systems v1.0.0 [local]
# • testing-strategies v1.0.0 [local]
# • ux-principles v1.0.0 [local]
# ...
```

### Step 7: 查看專案狀態

```python
mcp__skillpkg__skill_status()

# 輸出:
# 📦 Project
#    Name: omniflow-studio
#    Config: skillpkg.json ✓
#
# 🔧 Skills
#    Total: 16 (16 direct, 0 transitive)
#
# 🔄 Sync Targets
#    • claude-code: ✓ synced
```

### 安裝後的 skillpkg.json

```json
{
  "$schema": "https://skillpkg.dev/schemas/skillpkg.json",
  "name": "omniflow-studio",
  "skills": {
    "frontend": "github:miles990/claude-software-skills#development-stacks/frontend",
    "backend": "github:miles990/claude-software-skills#development-stacks/backend",
    "realtime-systems": "github:miles990/claude-software-skills#development-stacks/realtime-systems",
    "ai-ml-integration": "github:miles990/claude-software-skills#development-stacks/ai-ml-integration",
    "javascript-typescript": "github:miles990/claude-software-skills#programming-languages/javascript-typescript",
    "python": "github:miles990/claude-software-skills#programming-languages/python",
    "code-quality": "github:miles990/claude-software-skills#software-engineering/code-quality",
    "testing-strategies": "github:miles990/claude-software-skills#software-engineering/testing-strategies",
    "api-design": "github:miles990/claude-software-skills#software-design/api-design",
    "ux-principles": "github:miles990/claude-software-skills#software-design/ux-principles"
  },
  "sync_targets": {
    "claude-code": true
  }
}
```

---

## 可用 Skills 一覽

### Development Stacks

| Skill | 路徑 | 說明 |
|-------|------|------|
| frontend | `development-stacks/frontend` | React, Vue, Web 技術 |
| backend | `development-stacks/backend` | Node.js, Express, NestJS |
| database | `development-stacks/database` | SQL, NoSQL, ORM |
| cloud-platforms | `development-stacks/cloud-platforms` | AWS, GCP, Azure |
| mobile | `development-stacks/mobile` | React Native, Flutter |
| realtime-systems | `development-stacks/realtime-systems` | WebSocket, SSE |
| ai-ml-integration | `development-stacks/ai-ml-integration` | LLM, AI APIs |
| edge-iot | `development-stacks/edge-iot` | IoT, 邊緣運算 |

### Programming Languages

| Skill | 路徑 | 說明 |
|-------|------|------|
| javascript-typescript | `programming-languages/javascript-typescript` | JS/TS 開發 |
| python | `programming-languages/python` | Python 開發 |
| go | `programming-languages/go` | Go 開發 |
| rust | `programming-languages/rust` | Rust 開發 |
| java-kotlin | `programming-languages/java-kotlin` | Java/Kotlin |
| csharp-dotnet | `programming-languages/csharp-dotnet` | C#/.NET |
| ruby | `programming-languages/ruby` | Ruby 開發 |
| php | `programming-languages/php` | PHP 開發 |
| swift | `programming-languages/swift` | Swift 開發 |
| shell-bash | `programming-languages/shell-bash` | Shell 腳本 |
| sql | `programming-languages/sql` | SQL 查詢 |
| cpp | `programming-languages/cpp` | C++ 開發 |

### Software Engineering

| Skill | 路徑 | 說明 |
|-------|------|------|
| code-quality | `software-engineering/code-quality` | Clean Code, SOLID |
| testing-strategies | `software-engineering/testing-strategies` | TDD, 測試 |
| devops-cicd | `software-engineering/devops-cicd` | CI/CD, Docker |
| security-practices | `software-engineering/security-practices` | 安全實踐 |
| performance-optimization | `software-engineering/performance-optimization` | 效能優化 |
| reliability-engineering | `software-engineering/reliability-engineering` | 可靠性 |
| documentation | `software-engineering/documentation` | 文件撰寫 |

### Software Design

| Skill | 路徑 | 說明 |
|-------|------|------|
| api-design | `software-design/api-design` | REST, GraphQL |
| architecture-patterns | `software-design/architecture-patterns` | 架構模式 |
| design-patterns | `software-design/design-patterns` | GoF 設計模式 |
| system-design | `software-design/system-design` | 系統設計 |
| data-design | `software-design/data-design` | 資料建模 |
| ux-principles | `software-design/ux-principles` | UX/無障礙設計 |

### Domain Applications

| Skill | 路徑 | 說明 |
|-------|------|------|
| e-commerce | `domain-applications/e-commerce` | 電商系統 |
| saas-platforms | `domain-applications/saas-platforms` | SaaS 平台 |
| content-platforms | `domain-applications/content-platforms` | CMS |
| communication-systems | `domain-applications/communication-systems` | 通訊系統 |
| developer-tools | `domain-applications/developer-tools` | 開發工具 |
| desktop-apps | `domain-applications/desktop-apps` | 桌面應用 |
| game-development | `domain-applications/game-development` | 遊戲開發 |

### Tools & Integrations

| Skill | 路徑 | 說明 |
|-------|------|------|
| git-workflows | `tools-integrations/git-workflows` | Git 工作流 |
| development-environment | `tools-integrations/development-environment` | 開發環境 |
| monitoring-logging | `tools-integrations/monitoring-logging` | 監控日誌 |
| api-tools | `tools-integrations/api-tools` | API 工具 |
| automation-scripts | `tools-integrations/automation-scripts` | 自動化腳本 |
| project-management | `tools-integrations/project-management` | 專案管理 |

---

## 常見問題

### Q: 安裝失敗怎麼辦？

```python
# 檢查網路連線
# 確認 GitHub repo 路徑正確

# 嘗試使用本地路徑
mcp__skillpkg__install_skill(
    source="/local/path/to/claude-software-skills#development-stacks/frontend"
)
```

### Q: 如何更新已安裝的 skill？

```python
# 重新安裝會覆蓋舊版本
mcp__skillpkg__install_skill(
    source="github:miles990/claude-software-skills#development-stacks/frontend",
    scope="local"
)
```

### Q: 如何移除 skill？

```python
mcp__skillpkg__uninstall_skill(
    id="frontend",
    scope="local"
)
```

### Q: local vs global 的差別？

| Scope | 儲存位置 | 用途 |
|-------|----------|------|
| `local` | `.skillpkg/` (專案目錄) | 專案專用，隨 Git 版控 |
| `global` | `~/.skillpkg/` | 跨專案共用 |

### Q: 如何載入 skill 查看內容？

```python
result = mcp__skillpkg__load_skill(id="frontend")
print(result)  # 顯示 SKILL.md 內容
```

### Q: 如何搜尋可用的 skills？

```python
# 搜尋已安裝的 skills
mcp__skillpkg__search_skills(query="react", source="local")

# 搜尋 GitHub 上的 skills
mcp__skillpkg__search_skills(query="react", source="github")
```

---

## 相關資源

- [skillpkg 官方文件](https://github.com/anthropics/skillpkg)
- [Claude Code Skills 文件](https://docs.anthropic.com/en/docs/claude-code/skills)
- [SKILL.md 格式規範](./SKILL-TEMPLATE.md)
- [貢獻指南](../CONTRIBUTING.md)
