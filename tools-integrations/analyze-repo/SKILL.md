---
name: analyze-repo
description: Deep analysis tool for GitHub repos and local projects, generates comprehensive Markdown reports with Mermaid diagrams
domain: tools-integrations
version: 1.0.0
tags: [analysis, architecture, mermaid, report, quality, review, codebase]
triggers:
  keywords:
    primary: [analyze repo, analyze project, repo analysis, codebase analysis, project review]
    secondary: [architecture analysis, code quality, tech stack, mermaid diagram]
  context_boost: [understand codebase, evaluate project, code review]
  context_penalty: [write code, implement feature, fix bug]
  priority: medium
---

# /analyze-repo

> 從 0 到 1 理解任何專案，只需一個指令

## 核心價值

| 輸入 | 輸出 |
|------|------|
| GitHub URL 或本地路徑 | 專業級 Markdown 分析報告 + Mermaid 圖表 |

**適用場景**：接手新專案 | 評估開源專案 | 技術面試準備 | Code Review 前置理解

## 使用方式

```bash
/analyze-repo https://github.com/owner/repo  # GitHub Repo
/analyze-repo .                               # 當前目錄
/analyze-repo /path/to/project               # 指定路徑
```

## 分析流程

你是資深軟體架構師。依序執行：

### Phase 1: 資料收集

**1.1 判斷類型**
- `https://github.com/` → GitHub API 分析
- 本地路徑 → 直接讀取檔案

**1.2 關鍵檔案（依重要性）**

| 類別 | 檔案 |
|------|------|
| 套件管理 | `package.json`, `requirements.txt`, `pyproject.toml`, `Cargo.toml`, `go.mod` |
| 容器化 | `Dockerfile`, `docker-compose.yml` |
| 文件 | `README.md`, `CLAUDE.md` |
| 配置 | `tsconfig.json`, `next.config.js`, `.env.example` |
| CI/CD | `.github/workflows/*.yml`, `Makefile` |
| 入口點 | `main.py`, `index.ts`, `main.go`, `main.rs` |

### Phase 2: 深度分析

**2.1 技術棧識別**
- 程式語言與版本
- 框架（Web/UI/測試）
- 建置工具、資料庫、雲端平台

**2.2 架構模式**
- 架構類型（MVC/Clean/Microservices/Serverless）
- 目錄結構設計
- 主要元件與職責
- 資料流向

**2.3 程式碼品質（5 維度 1-100 分）**

| 指標 | 評估標準 |
|------|---------|
| 結構清晰度 | 目錄組織、命名規範、模組劃分 |
| 可維護性 | 複雜度、抽象層次、依賴管理 |
| 測試覆蓋 | 測試檔案、測試框架配置 |
| 文件品質 | README、程式碼註解、API 文件 |
| 安全性 | 依賴漏洞、敏感資訊暴露風險 |

**2.4 價值與不可替代性**

評估以下維度（各 1-5 分）：
1. **解決的問題** — 核心痛點、目標用戶
2. **獨特價值 (UVP)** — 與替代方案的差異
3. **不可替代性** — 技術門檻、生態整合、學習曲線、社群規模
4. **競品比較** — 列出 2-3 個替代方案並比較
5. **採用建議** — 適合/不適合的場景

### Phase 3: 產生 Mermaid 圖表

選擇最適合的 2-3 種：

- **架構圖** (flowchart TB) — 系統元件與關係
- **技術棧圖** — 分層技術概覽
- **模組關係圖** (flowchart LR) — 模組依賴

### Phase 4: 改進建議

每項建議包含：
- **類別**: architecture / performance / security / quality / documentation
- **優先級**: high / medium / low
- **行動項目**: 具體實施步驟

## 輸出格式

產生標準 Markdown 報告，結構如下：

1. 專案概覽（表格 + 一句話總結）
2. 技術棧（表格 + Mermaid 圖）
3. 架構分析（模式說明 + 元件表 + 架構圖 + 目錄結構）
4. 程式碼品質（分數條 + 優點 + 待改進）
5. 改進建議（按優先級分類）
6. 價值評估（問題/UVP/不可替代性/競品比較/採用建議）
7. 建議下一步
8. 推薦資源

> 詳細輸出模板見：[extended/output-template.md](./extended/output-template.md)

## 執行要求

1. **完整讀取** — 確保足夠檔案進行準確分析
2. **客觀評估** — 基於實際品質評分，避免過度樂觀或悲觀
3. **具體建議** — 改進建議必須具體可行
4. **圖表正確** — 確保 Mermaid 語法正確可渲染
5. **格式一致** — 嚴格遵守輸出格式

## 相關 Skills

- `/evolve` — 自主完成複雜目標
- `/commit` — 提交程式碼變更

---

ARGUMENTS: $ARGUMENTS
