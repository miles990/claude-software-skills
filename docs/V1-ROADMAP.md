# V1 Roadmap: Skills Enhancement Plan

> 從 MVP 到 V1 的完整升級計劃

## 目標

將 48 個 skills 從「純知識型」升級為「混合型」，加入實用的 templates/、scripts/、reference.md。

## 現況分析

### 統計

| 指標 | 數量 |
|------|------|
| 總 skills | 48 |
| > 500 行 (官方建議上限) | 27 |
| 已有 templates/ (MVP) | 4 |
| 需要額外資源 | ~35 |
| 純知識型（不需要） | ~8 |

### MVP 已完成

- ✅ `software-engineering/devops-cicd/templates/`
- ✅ `tools-integrations/git-workflows/scripts/` + `templates/`
- ✅ `development-stacks/frontend/templates/`
- ✅ `development-stacks/backend/templates/`

---

## 官方結構建議

根據 [Claude Code Skills 官方文檔](https://docs.anthropic.com/en/docs/claude-code/skills)：

```
my-skill/
├── SKILL.md              # 必須，< 500 行
├── reference.md          # 可選，詳細 API/參數說明
├── examples.md           # 可選，使用範例
├── scripts/              # 可選，工具腳本
│   └── helper.py
└── templates/            # 可選，可直接使用的範本
    └── config.example
```

**原則：**
- SKILL.md 保持 < 500 行
- 長內容拆分到 reference.md
- 可執行範例放 scripts/
- 可複製設定放 templates/

---

## V1 詳細計劃

### P0: MVP 已完成 ✅

| Skill | 新增資源 | 狀態 |
|-------|----------|------|
| devops-cicd | templates/github-actions/, templates/docker/ | ✅ |
| git-workflows | scripts/pre-commit, commit-msg + templates/gitignore-* | ✅ |
| frontend | templates/react/, templates/vite/ | ✅ |
| backend | templates/express/, templates/fastapi/ | ✅ |

---

### P1: 高價值 (12 skills) ✅

**狀態：已完成** (45 檔案, 4169 行)

#### software-engineering/

| Skill | 行數 | 新增 | 內容 | 狀態 |
|-------|------|------|------|------|
| testing-strategies | 532 | `templates/` | jest.config.ts, vitest.config.ts, pytest.ini | ✅ |
| code-quality | 501 | `templates/` | eslint.config.js, .prettierrc, .editorconfig | ✅ |
| security-practices | 486 | `templates/` | helmet-config.js, csp-policy.json, .env.example | ✅ |

#### development-stacks/

| Skill | 行數 | 新增 | 內容 | 狀態 |
|-------|------|------|------|------|
| database | 644 | `templates/` | schema.prisma, migration.sql, docker-compose.db.yml | ✅ |
| cloud-platforms | 540 | `templates/` | main.tf, cdk-stack.ts, serverless.yml | ✅ |

#### tools-integrations/

| Skill | 行數 | 新增 | 內容 | 狀態 |
|-------|------|------|------|------|
| automation-scripts | 570 | `templates/` | Makefile.example, turbo.json | ✅ |
| development-environment | 610 | `templates/` | .vscode/settings.json, extensions.json, devcontainer.json | ✅ |
| monitoring-logging | 500 | `templates/` | prometheus.yml, grafana-dashboard.json, docker-compose.monitoring.yml | ✅ |
| project-management | 438 | `templates/` | ISSUE_TEMPLATE/, PULL_REQUEST_TEMPLATE.md | ✅ |

#### software-design/

| Skill | 行數 | 新增 | 內容 | 狀態 |
|-------|------|------|------|------|
| api-design | 463 | `templates/` | openapi.yaml, schema.graphql | ✅ |

#### programming-languages/

| Skill | 行數 | 新增 | 內容 | 狀態 |
|-------|------|------|------|------|
| javascript-typescript | 536 | `templates/` | tsconfig.json, tsconfig.react.json, package.json | ✅ |
| python | 467 | `templates/` | pyproject.toml, requirements.txt, requirements-dev.txt | ✅ |

---

### P2: 中價值 (13 skills)

**預估工作量：3-4 小時**

#### development-stacks/

| Skill | 行數 | 新增 | 內容 |
|-------|------|------|------|
| mobile | 662 | `templates/` + `reference.md` | react-native config, flutter pubspec |
| realtime-systems | 689 | `templates/` + `reference.md` | websocket-server.ts, sse-handler.ts |
| ai-ml-integration | 564 | `templates/` | llm-config.ts, embedding-utils.py |

#### tools-integrations/

| Skill | 行數 | 新增 | 內容 |
|-------|------|------|------|
| api-tools | 590 | `scripts/` + `templates/` | curl-examples.sh, postman-collection.json |

#### domain-applications/

| Skill | 行數 | 新增 | 內容 |
|-------|------|------|------|
| e-commerce | 539 | `templates/` | cart-schema.ts, checkout-flow.ts |
| saas-platforms | 464 | `templates/` | tenant-schema.prisma, billing-config.ts |

#### programming-languages/

| Skill | 行數 | 新增 | 內容 |
|-------|------|------|------|
| go | 623 | `templates/` | go.mod, Makefile |
| rust | 540 | `templates/` | Cargo.toml, build.rs |
| shell-bash | 528 | `scripts/` | common-utils.sh, logging.sh |
| sql | 578 | `templates/` | migration-template.sql |

#### software-design/

| Skill | 行數 | 新增 | 內容 |
|-------|------|------|------|
| data-design | 464 | `templates/` | schema-examples.sql, erd-template.md |

#### software-engineering/

| Skill | 行數 | 新增 | 內容 |
|-------|------|------|------|
| reliability-engineering | 470 | `templates/` | health-check.ts, circuit-breaker.ts |
| documentation | 493 | `templates/` | README-template.md, CHANGELOG-template.md |

---

### P3: 低價值 (11 skills)

**預估工作量：2-3 小時**

#### programming-languages/

| Skill | 行數 | 新增 | 內容 |
|-------|------|------|------|
| java-kotlin | 499 | `templates/` | build.gradle.kts, pom.xml |
| csharp-dotnet | 588 | `templates/` | .csproj, appsettings.json |
| cpp | 607 | `templates/` | CMakeLists.txt |
| ruby | 604 | `templates/` | Gemfile, .rubocop.yml |
| php | 682 | `templates/` + `reference.md` | composer.json, phpunit.xml |
| swift | 617 | `templates/` + `reference.md` | Package.swift |

#### domain-applications/

| Skill | 行數 | 新增 | 內容 |
|-------|------|------|------|
| content-platforms | 502 | `templates/` | cms-schema.ts |
| communication-systems | 530 | `templates/` | email-template.html |
| developer-tools | 485 | `templates/` | cli-boilerplate/ |
| desktop-apps | 515 | `templates/` | electron-main.ts, tauri.conf.json |

#### 需要拆分 (reference.md)

| Skill | 行數 | 新增 |
|-------|------|------|
| edge-iot | 659 | `reference.md` |
| ux-principles | 554 | `reference.md` |
| performance-optimization | 515 | `reference.md` |

---

### 不需要額外資源 (8 skills)

純知識型，SKILL.md 已足夠：

| Skill | 行數 | 原因 |
|-------|------|------|
| architecture-patterns | 214 | 純架構概念 |
| design-patterns | 490 | GoF 模式說明 |
| system-design | 468 | 分散式系統概念 |
| application-patterns | 378 | MVC/CQRS 概念 |
| game-development | 408 | 遊戲開發概念 |
| auto-dev-setup | 151 | 已完整（有獨立 scripts/） |

---

## 實作指南

### 目錄結構範例

```
my-skill/
├── SKILL.md                    # 主文件 (< 500 行)
├── reference.md                # 詳細參考 (可選)
├── templates/
│   ├── README.md               # 範本使用說明
│   ├── config-a.example        # 設定範本 A
│   └── config-b.example        # 設定範本 B
└── scripts/
    ├── setup.sh                # 設定腳本
    └── helper.py               # 工具腳本
```

### templates/README.md 範本

```markdown
# [Skill Name] Templates

Ready-to-use templates for [purpose].

## Files

| Template | Purpose |
|----------|---------|
| `file-a.example` | Description |
| `file-b.example` | Description |

## Usage

\`\`\`bash
cp templates/file-a.example ./file-a
\`\`\`
```

### 命名規範

| 類型 | 命名規則 | 範例 |
|------|----------|------|
| 設定檔 | 原檔名 | `tsconfig.json`, `eslint.config.js` |
| 需修改的範本 | `.example` 後綴 | `config.example.yaml` |
| 腳本 | 功能描述 | `setup-hooks.sh`, `validate.py` |

---

## 時程建議

| 階段 | 內容 | 預估時間 |
|------|------|----------|
| V1.0 | P1 完成 (12 skills) | 3-4 小時 |
| V1.1 | P2 完成 (13 skills) | 3-4 小時 |
| V1.2 | P3 完成 (11 skills) | 2-3 小時 |
| V1.3 | reference.md 拆分 | 1-2 小時 |

**總計：約 10-13 小時**

---

## 驗收標準

### 每個 templates/ 必須包含

- [ ] README.md 說明使用方式
- [ ] 至少 2-3 個實用範本
- [ ] 範本可直接複製使用

### 每個 scripts/ 必須包含

- [ ] 腳本有執行權限 (`chmod +x`)
- [ ] 腳本頂部有用途說明
- [ ] 腳本可獨立執行

### CI 驗證

- [ ] 所有 SKILL.md frontmatter 有效
- [ ] 無重複 skill name
- [ ] templates/ 下有 README.md

---

## 相關文件

- [SKILL-TEMPLATE.md](./SKILL-TEMPLATE.md) - Skill 撰寫範本
- [CONTRIBUTING.md](../CONTRIBUTING.md) - 貢獻指南
- [Claude Code Skills 官方文檔](https://docs.anthropic.com/en/docs/claude-code/skills)
