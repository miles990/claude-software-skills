# analyze-repo Skill v2.0

> 企業級專案深度分析工具 — 從程式碼到商業價值的完整洞察

## 解決的問題

### 你是否曾遇到這些困境？

| 角色 | 痛點 |
|------|------|
| **新進工程師** | 接手專案卻不知從何下手，文件過時或根本不存在 |
| **技術主管** | 需要快速評估技術債務和風險，卻沒有客觀指標 |
| **架構師** | 想了解系統全貌，卻只能靠人工閱讀數萬行程式碼 |
| **投資人/PM** | 需要評估專案價值，但技術細節太過複雜 |
| **面試官** | 想評估候選人的 Side Project，但時間有限 |

### 傳統方式的問題

- **耗時**：手動分析一個中型專案需要數天甚至數週
- **主觀**：不同人的評估標準不一致，難以比較
- **不完整**：容易遺漏安全性、依賴健康度等重要面向
- **缺乏商業視角**：技術報告無法轉化為商業決策

## 目標與價值

### 核心目標

**在 10 分鐘內，產出一份專業級的專案分析報告**

這份報告能讓：
- 工程師快速上手專案
- 主管做出技術決策
- 投資人評估技術價值
- 團隊識別風險和改善方向

### 提供的價值

| 價值 | 說明 |
|------|------|
| **節省時間** | 將數天的人工分析壓縮到 10 分鐘 |
| **客觀評估** | 8 維度量化指標，消除主觀偏見 |
| **全面覆蓋** | 從程式碼品質到市場價值，一次到位 |
| **可行建議** | 不只指出問題，更提供解決方案和優先順序 |
| **多角色適用** | 同一份報告，不同視角閱讀 |

## 核心特色

| 特色 | 說明 |
|------|------|
| **arc42 + C4 架構** | 業界標準軟體架構文件 + 四層視覺化 |
| **8 維度品質評估** | 可維護性、可測試性、可擴展性、安全性、文件、架構、依賴、DX |
| **技術債務量化** | SQALE 模型 + 修復時間估算 + 優先級矩陣 |
| **安全性評估** | OWASP Top 10 + 依賴漏洞掃描 + 敏感資訊檢測 |
| **市場價值分析** | TAM/SAM/SOM + 技術趨勢對齊 + SWOT + 投資建議 |
| **多視角報告** | Executive / Architect / Developer / Investor |

## 誰適合使用？

| 角色 | 使用情境 | 推薦視角 |
|------|----------|----------|
| **Executive** | 快速了解專案狀況、風險和投資價值 | `--perspective=executive` |
| **Architect** | 深入分析架構設計、技術債務、改善路線圖 | `--perspective=architect` |
| **Developer** | 快速上手專案、了解程式碼結構和開發流程 | `--perspective=developer` |
| **Investor** | Due Diligence、技術資產估值、競品分析 | `--perspective=investor` |

## 使用方式

```bash
# 分析當前目錄
/analyze-repo .

# 分析 GitHub 專案
/analyze-repo https://github.com/owner/repo

# 分析本地路徑
/analyze-repo /path/to/project

# 指定視角
/analyze-repo . --perspective=executive    # 高層摘要
/analyze-repo . --perspective=architect    # 架構深度分析
/analyze-repo . --perspective=developer    # 開發者上手指南
/analyze-repo . --perspective=investor     # Due Diligence 報告
/analyze-repo . --perspective=full         # 完整報告（預設）
```

## 報告結構

完整報告包含 11 個主要區塊：

```
1. Executive Summary
   └── 一句話定位 + 健康分數 + 關鍵發現 + 立即行動

2. Project Overview
   └── 基本資訊 + 技術棧 + 生命週期階段

3. Architecture Analysis (C4 Model)
   ├── Level 1: System Context
   ├── Level 2: Container
   ├── Level 3: Component
   └── Level 4: Code（選擇性）

4. Quality Assessment (8 維度)
   ├── 可維護性 / 可測試性 / 可擴展性 / 安全性
   └── 文件完整度 / 架構健康度 / 依賴健康度 / DX

5. Technical Debt Report
   └── SQALE 分類 + 量化估算 + 優先級矩陣

6. Dependency Analysis
   └── 依賴圖譜 + 健康檢查 + 循環依賴 + 授權合規

7. Security Assessment
   └── 漏洞掃描 + OWASP Top 10 + 敏感資訊

8. Value & Competitive Analysis
   └── UVP + 不可替代性 + 競品比較 + 採用建議

9. Market Future Value Analysis
   └── 技術趨勢對齊 + TAM/SAM/SOM + SWOT + 投資建議

10. Strategic Recommendations
    └── 優先級矩陣 + 時間軸路線圖 + 詳細建議

11. Appendix
    └── 目錄結構 + 關鍵檔案 + 術語表 + 方法說明
```

## 評估框架

### 8 維度品質評估（1-100 分）

| 維度 | 權重 | 回答的問題 | 評估標準 |
|------|------|------------|----------|
| 可維護性 | 15% | 程式碼好不好改？ | 複雜度、命名、模組化、Maintainability Index |
| 可測試性 | 12% | 測試覆蓋率夠嗎？ | 覆蓋率、測試品質、Mock 使用 |
| 可擴展性 | 12% | 能撐住 10 倍流量嗎？ | 架構彈性、水平擴展、設計模式 |
| 安全性 | 15% | 有沒有安全漏洞？ | 依賴漏洞、敏感資訊、OWASP |
| 文件完整度 | 10% | 新人能看懂嗎？ | README、API 文件、註解 |
| 架構健康度 | 15% | 設計有沒有問題？ | SOLID、關注點分離、依賴方向 |
| 依賴健康度 | 11% | 依賴穩定嗎？ | 數量、版本、循環依賴 |
| 開發者體驗 | 10% | 開發順不順手？ | 上手難度、工具配置、錯誤訊息 |

### 技術債務分類（SQALE 模型）

| 類別 | 偵測指標 |
|------|----------|
| 可靠性債務 | 未處理例外、空指標、資源洩漏 |
| 安全性債務 | 已知漏洞、硬編碼密鑰、注入風險 |
| 可維護性債務 | 重複程式碼、過長函數、過深巢狀 |
| 效能債務 | N+1 查詢、無快取、同步阻塞 |
| 測試債務 | 低覆蓋率、無整合測試、脆弱測試 |

### 建議優先級框架

**重要性**（對專案的長期影響）：

| 重要性 | 說明 |
|--------|------|
| ⭐⭐⭐ 核心/必要 | 不做會導致專案失敗或嚴重風險 |
| ⭐⭐ 重要/建議 | 顯著提升品質或降低風險 |
| ⭐ 可選/增強 | 錦上添花，提升體驗 |

**優先級**（何時執行）：

| 優先級 | 時間軸 |
|--------|--------|
| 🔴 Critical | 立即（本週內） |
| 🟠 High | 短期（1-3 個月） |
| 🟡 Medium | 中期（3-6 個月） |
| 🟢 Low | 長期（6-12 個月） |

## 檔案結構

```
analyze-repo/
├── SKILL.md              # 核心 Skill 定義
├── README.md             # 本文件
└── extended/
    └── output-template.md  # 完整輸出模板
```

## v2.0 更新記錄

| 項目 | v1.0 | v2.0 |
|------|------|------|
| 架構標準 | 自訂 | arc42 + C4 Model |
| 品質維度 | 5 維度 | 8 維度 |
| 技術債務 | 簡單列表 | SQALE 量化 |
| 安全評估 | 基本檢查 | OWASP Top 10 |
| 市場分析 | 競品比較 | TAM/SAM/SOM + SWOT |
| 建議系統 | 優先級 | 重要性 + 優先級 + 路線圖 |
| 輸出格式 | 6 區塊 | 11 區塊 |

## 採用的業界標準

| 標準 | 用途 |
|------|------|
| [arc42](https://arc42.org/overview) | 軟體架構文件標準 |
| [C4 Model](https://c4model.com/) | 架構視覺化方法 |
| [SQALE](https://www.sqale.org/) | 技術債務量化 |
| [OWASP Top 10](https://owasp.org/www-project-top-ten/) | Web 安全風險 |

## 相關 Skill

- [/evolve](../../.claude/skills/evolve/) — 自主完成複雜目標
- [/commit](../../.claude/skills/commit/) — 提交程式碼變更
- [/code-review](../../.claude/skills/code-review/) — 深度程式碼審查

## 安裝

### 方式 1：Claude Code Plugin Marketplace（推薦）

```bash
/install plugin:claude-software-skills
```

### 方式 2：手動安裝

```bash
cp -r tools-integrations/analyze-repo ~/.claude/skills/
```

## 授權

MIT License
