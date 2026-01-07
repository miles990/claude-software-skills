# 範例：為專案安裝 Skills

> 實際案例：為 omniflow-studio (React + FastAPI + AI) 安裝完整開發 skills

## 專案背景

- **前端**: React + TypeScript
- **後端**: FastAPI (Python)
- **特殊功能**: SSE 即時通訊、AI API 整合
- **目標**: 安裝所有相關 skills 以提升開發效率

## 安裝過程

### 1. 確認 skillpkg 可用

```
User: 檢查 skillpkg 狀態

Claude: [呼叫 mcp__skillpkg__skill_status()]
輸出:
📦 Project
   Name: omniflow-studio
   Config: skillpkg.json ✓
```

### 2. 安裝開發架構 Skills (4 個)

```
User: 安裝 frontend, backend, realtime-systems, ai-ml-integration

Claude: [平行呼叫 4 個 install_skill]

mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#development-stacks/frontend")
→ ✅ Installed: frontend v1.0.0

mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#development-stacks/backend")
→ ✅ Installed: backend v1.0.0

mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#development-stacks/realtime-systems")
→ ✅ Installed: realtime-systems v1.0.0

mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#development-stacks/ai-ml-integration")
→ ✅ Installed: ai-ml-integration v1.0.0
```

### 3. 安裝程式語言 Skills (2 個)

```
Claude: [平行呼叫 2 個 install_skill]

mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#programming-languages/javascript-typescript")
→ ✅ Installed: javascript-typescript v1.0.0

mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#programming-languages/python")
→ ✅ Installed: python v1.0.0
```

### 4. 安裝軟體工程 Skills (2 個)

```
Claude: [平行呼叫 2 個 install_skill]

mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#software-engineering/code-quality")
→ ✅ Installed: code-quality v1.0.0

mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#software-engineering/testing-strategies")
→ ✅ Installed: testing-strategies v1.0.0
```

### 5. 安裝軟體設計 Skills (2 個)

```
Claude: [平行呼叫 2 個 install_skill]

mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#software-design/api-design")
→ ✅ Installed: api-design v1.0.0

mcp__skillpkg__install_skill(source="github:miles990/claude-software-skills#software-design/ux-principles")
→ ✅ Installed: ux-principles v1.0.0
```

### 6. 驗證安裝結果

```
Claude: [呼叫 mcp__skillpkg__list_skills(scope="local")]

Found 10 installed skill(s):
• ai-ml-integration v1.0.0 [local]
• api-design v1.0.0 [local]
• backend v1.0.0 [local]
• code-quality v1.0.0 [local]
• frontend v1.0.0 [local]
• javascript-typescript v1.0.0 [local]
• python v1.0.0 [local]
• realtime-systems v1.0.0 [local]
• testing-strategies v1.0.0 [local]
• ux-principles v1.0.0 [local]
```

## 安裝後的 skillpkg.json

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

## 使用效果

安裝後，Claude Code 會自動載入這些 skills，在開發時提供：

### Frontend Skill 提供
- React 最佳實踐 (Hooks, Context, Performance)
- 狀態管理模式 (Zustand, Redux Toolkit)
- 測試策略 (React Testing Library)

### Backend Skill 提供
- FastAPI 路由設計
- 依賴注入模式
- 錯誤處理策略

### Realtime-Systems Skill 提供
- SSE 實作模式
- WebSocket 連線管理
- 事件驅動架構

### AI-ML-Integration Skill 提供
- LLM API 整合模式
- Prompt Engineering
- 串流回應處理

## 快速複製指令

如果你的專案也是 React + FastAPI + AI，可以直接複製以下指令：

```python
# 在 Claude Code 中執行
skills = [
    "development-stacks/frontend",
    "development-stacks/backend",
    "development-stacks/realtime-systems",
    "development-stacks/ai-ml-integration",
    "programming-languages/javascript-typescript",
    "programming-languages/python",
    "software-engineering/code-quality",
    "software-engineering/testing-strategies",
    "software-design/api-design",
    "software-design/ux-principles",
]

for skill in skills:
    mcp__skillpkg__install_skill(
        source=f"github:miles990/claude-software-skills#{skill}",
        scope="local"
    )
```

## 相關文件

- [完整使用指南](../docs/USAGE-GUIDE.md)
- [Skill 目錄](../README.md#available-skills)
