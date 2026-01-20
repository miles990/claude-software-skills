# analyze-repo Skill

> 專業的 GitHub Repo / 本地專案深度分析工具

## 安裝

### 方式 1：直接複製（推薦）

```bash
# 複製 Skill 到你的專案
cp -r .claude/skills/analyze-repo ~/.claude/skills/
```

### 方式 2：從 commands 使用

如果你的 Claude Code 支援 commands：

```bash
cp .claude/commands/analyze-repo.md ~/.claude/commands/
```

## 使用方式

```bash
# 分析 GitHub Repo
/analyze-repo https://github.com/owner/repo

# 分析當前目錄
/analyze-repo .

# 分析指定路徑
/analyze-repo /path/to/project
```

## 功能特色

- **結構化報告**：完整 Markdown 格式，可直接用於文檔
- **Mermaid 圖表**：自動產生架構圖、技術棧圖、模組關係圖
- **品質評估**：5 維度量化評分（結構/可維護/測試/文件/安全）
- **價值分析**：UVP、不可替代性、競品比較
- **改進建議**：具體可執行的行動項目

## 輸出範例

報告包含以下區塊：

1. **專案概覽** — 基本資訊表格 + 一句話總結
2. **技術棧** — 語言、框架、工具表格 + Mermaid 圖
3. **架構分析** — 模式說明 + 元件表 + 架構圖 + 目錄結構
4. **程式碼品質** — 視覺化分數條 + 優點 + 待改進
5. **改進建議** — 按優先級分類的具體建議
6. **價值評估** — UVP、不可替代性、競品比較、採用建議
7. **建議下一步** — 3-5 個具體行動
8. **推薦資源** — 相關文檔連結

## 檔案結構

```
analyze-repo/
├── SKILL.md              # 核心 Skill 定義（< 150 行）
├── README.md             # 本文件
└── extended/
    └── output-template.md  # 完整輸出模板
```

## 優化記錄

| 版本 | 行數 | 優化 |
|------|------|------|
| 原始 commands 版本 | 519 行 | - |
| v1.0.0 Skill 版本 | ~140 行 | 拆分模板至 extended/ |

Token 節省：約 73%

## 相關 Skill

- [self-evolving-agent](https://github.com/miles990/self-evolving-agent) — 自主完成複雜目標
- [claude-domain-skills](https://github.com/miles990/claude-domain-skills) — 領域知識 Skills

## 授權

MIT License
