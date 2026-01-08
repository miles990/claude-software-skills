# Claude Software Skills Quick Start

> 3 分鐘開始使用 50+ 軟體開發技能

## 什麼是 Claude Software Skills？

這是為 Claude Code 設計的軟體開發技能庫，涵蓋：

| 類別 | 技能數 | 範例 |
|------|--------|------|
| Programming Languages | 12 | python, typescript, rust, go |
| Software Engineering | 8 | backend, frontend, database, api-design |
| Software Design | 6 | architecture-patterns, design-patterns |
| Tools & Integrations | 8 | git-workflows, devops-ci-cd |
| Development Stacks | 8 | react-ecosystem, node-backend |
| Domain Applications | 8 | ai-ml-integration, data-analysis |

---

## Step 1: 安裝完整技能庫 (1 分鐘)

### 方式 A: 在 Claude Code 中

```
安裝 claude-software-skills 技能庫
```

### 方式 B: 使用 CLI

```bash
npx skillpkg-cli install miles990/claude-software-skills
```

---

## Step 2: 安裝單一技能 (30 秒)

只需要特定技能？

```bash
# 安裝 backend 技能
npx skillpkg-cli install github:miles990/claude-software-skills#skills/backend

# 安裝 python 技能
npx skillpkg-cli install github:miles990/claude-software-skills#skills/python

# 安裝 testing-strategies 技能
npx skillpkg-cli install github:miles990/claude-software-skills#skills/testing-strategies
```

---

## Step 3: 使用技能 (1 分鐘)

安裝後，Claude 會自動套用相關知識。

### 範例對話

```
# 使用 backend 技能
/evolve 建立一個 Express + TypeScript 的 RESTful API

# 使用 testing-strategies 技能
幫這個模組寫單元測試，覆蓋率要達到 80%

# 使用 python 技能
用 Python 寫一個爬蟲，抓取網站資料並存到 SQLite
```

---

## 技能目錄

### 程式語言
`python` `typescript` `javascript` `rust` `go` `java` `csharp` `cpp` `ruby` `php` `swift` `kotlin`

### 軟體工程
`backend` `frontend` `database` `api-design` `testing-strategies` `security` `performance-optimization` `documentation`

### 軟體設計
`architecture-patterns` `design-patterns` `clean-code` `refactoring` `system-design` `ddd`

### 工具整合
`git-workflows` `devops-ci-cd` `docker-containers` `aws-cloud` `monitoring-observability` `debugging-profiling` `ide-productivity` `cli-tools`

### 開發框架
`react-ecosystem` `vue-ecosystem` `node-backend` `python-web` `mobile-development` `serverless` `microservices` `monorepo`

### 領域應用
`ai-ml-integration` `data-analysis` `blockchain-web3` `game-development` `iot-embedded` `real-time-systems` `fintech` `healthcare-systems`

---

## 常見問題

### Q: 安裝所有技能會很慢嗎？

技能是 Markdown 文件，不需編譯。完整安裝約 30 秒。

### Q: 技能之間會衝突嗎？

不會。技能設計為可疊加使用。

### Q: 如何知道載入了哪些技能？

```bash
npx skillpkg-cli list
```

或在 Claude Code 中說：
```
列出已載入的技能
```

---

## 下一步

| 目標 | 指令 |
|------|------|
| 查看完整技能清單 | [README.md](../README.md) |
| 了解使用方式 | [USAGE-GUIDE.md](USAGE-GUIDE.md) |
| 查看技能模板 | [SKILL-TEMPLATE.md](SKILL-TEMPLATE.md) |
| 貢獻新技能 | [CONTRIBUTING.md](../CONTRIBUTING.md) |

---

## 成功！

```
✅ 技能庫已安裝
✅ Claude 可以使用軟體開發知識
✅ 開始你的專案吧！

/evolve [你的目標]
```
