---
schema: "1.0"
name: claude-code-plugin
version: "1.1.0"
description: Claude Code Plugin 開發、發布、安裝、更新與 Marketplace 管理完整指南
triggers:
  keywords:
    primary: [plugin, claude-code, claude code plugin, 插件, hooks, commands, marketplace]
    secondary: [mcp, skill, subagent, 版本控管, version, publish, 發布, 安裝, 更新, sync]
  context_boost: [claude, anthropic, cli, automation, workflow]
  context_penalty: [game, trading, design]
  priority: high
keywords: [claude-code, plugin, development, automation, marketplace]
dependencies:
  software-skills: [git-workflows, automation-scripts]
author: claude-software-skills
---

# Claude Code Plugin 完整指南

> 建立、發布、安裝、更新、同步 Claude Code Plugin 的完整指南

## 適用場景

- 開發新的 Claude Code Plugin
- 發布 Plugin 到 Marketplace
- 安裝和更新 Plugin
- 管理 Plugin 版本
- 同步最新版本
- 建立自訂 Marketplace

---

## Part 1: Plugin 架構

### 目錄結構

```
my-plugin/
├── .claude-plugin/
│   ├── plugin.json          # Plugin manifest（必要）
│   └── marketplace.json     # Marketplace 索引（選用）
├── commands/                # Slash 命令（在根目錄！）
│   └── my-command.md
├── skills/                  # Agent Skills
│   └── my-skill/
│       └── SKILL.md
├── hooks/
│   └── hooks.json           # Hook 配置
├── agents/                  # Subagent 定義
├── .mcp.json               # MCP 伺服器配置
├── CHANGELOG.md
└── README.md
```

⚠️ **重要**：commands/、skills/、hooks/ 必須在根目錄，不要放進 .claude-plugin/

### plugin.json 規範

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Plugin 功能描述",
  "author": {
    "name": "作者名稱",
    "email": "email@example.com"
  },
  "license": "MIT",
  "keywords": ["keyword1", "keyword2"]
}
```

### 四大組件

| 組件 | 用途 | 觸發方式 | 檔案格式 |
|------|------|----------|----------|
| **Commands** | 用戶執行的斜線命令 | `/command` 手動 | Markdown |
| **Skills** | 教 Claude 如何做事 | 自動根據上下文 | SKILL.md |
| **Hooks** | 事件驅動自動化 | 系統事件觸發 | JSON + Shell |
| **MCP** | 提供工具能力 | Claude 呼叫 | .mcp.json |

---

## Part 2: 發布 Plugin

### 方式一：GitHub Marketplace（推薦）

**Step 1: 建立 marketplace.json**

```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "my-marketplace",
  "description": "我的 Plugin 集合",
  "owner": {
    "name": "username",
    "email": "email@example.com"
  },
  "plugins": [
    {
      "name": "my-plugin",
      "version": "1.0.0",
      "source": "./",
      "description": "Plugin 描述",
      "category": "development"
    }
  ]
}
```

**Step 2: 推送到 GitHub**

```bash
git add .
git commit -m "feat: add Plugin marketplace format"
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main
git push origin v1.0.0
```

**Step 3: 用戶安裝**

```bash
# 添加 marketplace
/plugin marketplace add owner/repo

# 安裝 plugin
/plugin install my-plugin@my-marketplace
```

### 方式二：npm 發布

```bash
# 1. 在 package.json 中命名（加 claude-plugin- 前綴）
{
  "name": "claude-plugin-my-plugin",
  "version": "1.0.0"
}

# 2. 發布
npm publish

# 3. 用戶安裝
npm install -g claude-plugin-my-plugin
```

### 方式三：直接分享

```bash
# 用戶下載後本地安裝
/plugin install /path/to/my-plugin
```

---

## Part 3: 安裝 Plugin

### 從 Marketplace 安裝

```bash
# 1. 先添加 marketplace（只需一次）
/plugin marketplace add owner/repo

# 2. 列出可用 plugins
/plugin marketplace list

# 3. 安裝 plugin
/plugin install plugin-name@marketplace-name
```

### 從 GitHub 直接安裝

```bash
# 完整路徑安裝
/plugin install github:owner/repo#path/to/plugin

# 範例
/plugin install github:miles990/evolve-plugin
```

### 本地安裝

```bash
# 從本地目錄安裝
/plugin install /path/to/my-plugin
```

### 查看已安裝

```bash
# 列出所有已安裝的 plugins
/plugin list

# 查看詳細資訊
/plugin info plugin-name@marketplace
```

### 解除安裝

```bash
# 解除安裝特定 plugin
/plugin uninstall plugin-name@marketplace

# 範例
/plugin uninstall evolve@evolve-plugin

# 強制解除安裝（忽略相依性）
/plugin uninstall plugin-name@marketplace --force
```

**解除安裝注意事項**：
- 解除安裝不會移除 marketplace，只移除已安裝的 plugin
- 如果其他 plugin 依賴此 plugin，會警告
- 解除安裝後可隨時重新安裝

---

## Part 4: 更新 Plugin

### 檢查更新

```bash
# 檢查所有 plugins 是否有更新
/plugin update --check

# 檢查特定 plugin
/plugin update --check plugin-name@marketplace
```

### 執行更新

```bash
# 更新特定 plugin
/plugin update plugin-name@marketplace

# 更新所有 plugins
/plugin update --all
```

### 自動版本檢查流程

```
本地版本 → 遠端版本 → 比較
    ↓           ↓
plugin.json  GitHub API / marketplace.json
    ↓
若遠端較新 → 提示用戶更新
```

### 手動版本檢查

```bash
# 取得本地版本
cat ~/.claude/plugins/installed_plugins.json | jq '.plugins["plugin@marketplace"][0].version'

# 取得遠端版本
curl -s https://raw.githubusercontent.com/owner/repo/main/.claude-plugin/plugin.json | jq -r '.version'
```

---

## Part 5: 版本控管

### 版本位置（必須同步）

| 位置 | 說明 |
|------|------|
| `.claude-plugin/plugin.json` | Plugin manifest |
| `.claude-plugin/marketplace.json` | Marketplace 索引 |
| `skills/*/SKILL.md` | Skill 版本（如適用） |
| `CHANGELOG.md` | 變更記錄 |
| Git tag | 發布標記 |

### 語意化版本

```
MAJOR.MINOR.PATCH
  │     │     └── Bug fixes（修復）
  │     └── 新功能（向後相容）
  └── 破壞性變更（不相容）
```

### 發布檢查清單

```bash
# 更新所有版本位置
- [ ] plugin.json → version
- [ ] marketplace.json → plugins[].version
- [ ] SKILL.md → version: (如適用)
- [ ] CHANGELOG.md → 新條目
- [ ] README.md → 版本徽章

# Git 操作
git add .
git commit -m "chore: bump version to vX.Y.Z"
git tag -a vX.Y.Z -m "Release vX.Y.Z: 描述"
git push origin main
git push origin vX.Y.Z
```

### CHANGELOG.md 格式

```markdown
## [1.1.0] - 2026-01-16

### Added
- 新功能描述

### Changed
- 變更描述

### Fixed
- 修復描述

### Security
- 安全修復
```

---

## Part 6: 同步最新版本

### 從主 repo 同步到獨立 plugin repo

當 plugin 是從主專案分離出來時：

```bash
# 1. 複製 skills 目錄
cp -r /path/to/main-project/skills /path/to/plugin-repo/

# 2. 更新版本
# 編輯 plugin.json, marketplace.json

# 3. 提交並推送
cd /path/to/plugin-repo
git add -A
git commit -m "chore: sync with main-project vX.Y.Z"
git push origin main
```

### 同步腳本範例

```bash
#!/bin/bash
# sync-plugin.sh - 同步 plugin 到獨立 repo

MAIN_REPO="$1"
PLUGIN_REPO="$2"
VERSION="$3"

# 複製 skills
rm -rf "$PLUGIN_REPO/skills"
cp -r "$MAIN_REPO/skills" "$PLUGIN_REPO/"

# 更新版本
sed -i '' "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" \
    "$PLUGIN_REPO/.claude-plugin/plugin.json"

# 提交
cd "$PLUGIN_REPO"
git add -A
git commit -m "chore: sync with main-project v$VERSION"
git push origin main
```

### 自動同步（使用 GitHub Actions）

```yaml
# .github/workflows/sync-plugin.yml
name: Sync Plugin

on:
  push:
    branches: [main]
    paths:
      - 'skills/**'
      - 'evolve-plugin/**'

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Sync to plugin repo
        run: |
          # Clone plugin repo
          git clone https://github.com/owner/plugin-repo.git

          # Copy files
          cp -r skills/ plugin-repo/
          cp evolve-plugin/.claude-plugin/* plugin-repo/.claude-plugin/

          # Push
          cd plugin-repo
          git add -A
          git commit -m "chore: auto-sync from main repo"
          git push
```

---

## Part 7: Marketplace 管理

### 建立自己的 Marketplace

**Step 1: 建立 marketplace.json**

```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "my-marketplace",
  "description": "我的 Plugin 集合",
  "owner": {
    "name": "username"
  },
  "plugins": [
    {
      "name": "plugin-a",
      "version": "1.0.0",
      "source": "./plugin-a",
      "description": "Plugin A 描述",
      "category": "development"
    },
    {
      "name": "plugin-b",
      "version": "2.0.0",
      "source": "./plugin-b",
      "description": "Plugin B 描述",
      "category": "productivity"
    }
  ]
}
```

**Step 2: 組織目錄結構**

```
my-marketplace/
├── .claude-plugin/
│   └── marketplace.json
├── plugin-a/
│   ├── .claude-plugin/
│   │   └── plugin.json
│   ├── commands/
│   └── skills/
├── plugin-b/
│   ├── .claude-plugin/
│   │   └── plugin.json
│   └── commands/
└── README.md
```

### 管理已添加的 Marketplace

```bash
# 列出已添加的 marketplaces
/plugin marketplace list

# 添加新 marketplace
/plugin marketplace add owner/repo

# 移除 marketplace
/plugin marketplace remove marketplace-name

# 更新 marketplace 索引
/plugin marketplace refresh
```

### 已知 Marketplaces 儲存位置

```
~/.claude/plugins/known_marketplaces.json
```

---

## Part 8: Hooks 開發

### Hook 事件類型

| 事件 | 時機 | 用途 |
|------|------|------|
| **PreToolUse** | 工具執行前 | 阻擋/修改工具調用 |
| **PostToolUse** | 工具執行後 | 後處理、通知 |
| **UserPromptSubmit** | 用戶輸入時 | 輸入驗證 |
| **SessionStart** | 會話開始 | 初始化 |
| **SessionEnd** | 會話結束 | 清理 |
| **Stop** | AI 完成回應 | 後處理 |
| **SubagentStop** | Subagent 完成 | 子任務處理 |

### hooks.json 配置

```json
{
  "hooks": [
    {
      "type": "command",
      "event": "PreToolUse",
      "command": "./hooks/protect-env.sh"
    },
    {
      "type": "command",
      "event": "PostToolUse",
      "command": "./hooks/format-code.sh"
    },
    {
      "type": "command",
      "event": "SessionStart",
      "command": "./hooks/init.sh"
    }
  ]
}
```

### 範例 Hook：保護敏感檔案

```bash
#!/bin/bash
# hooks/protect-env.sh

FILE_PATH=$(echo "$1" | jq -r '.tool.input.path // .tool.input.file_path // empty')

if [[ "$FILE_PATH" =~ \.(env|key|secret|credentials)$ ]]; then
    echo '{"decision": "block", "reason": "Protected file type"}' >&2
    exit 1
fi

exit 0
```

### 範例 Hook：自動格式化

```bash
#!/bin/bash
# hooks/format-code.sh

FILE_PATH=$(echo "$1" | jq -r '.tool.input.path // empty')

if [[ "$FILE_PATH" =~ \.(ts|tsx|js|jsx)$ ]]; then
    prettier --write "$FILE_PATH" 2>/dev/null
fi

exit 0
```

---

## Part 9: 常見錯誤與解決

### Sharp Edges

#### SE-1: 目錄結構錯誤
- **嚴重度**: critical
- **症狀**: `/plugin list` 顯示 plugin 但命令不存在
- **原因**: commands/、skills/ 放進 .claude-plugin/ 目錄
- **解決**: 把所有組件目錄移到 plugin 根目錄

#### SE-2: 版本不同步
- **嚴重度**: high
- **症狀**: `/plugin list` 與 CHANGELOG 版本不符
- **原因**: plugin.json、marketplace.json 版本不一致
- **解決**: 建立發布 checklist，每次都檢查所有位置

#### SE-3: Hook 權限過高
- **嚴重度**: high
- **症狀**: 意外的檔案變更、數據丟失
- **原因**: Hook 以用戶權限執行，範圍太廣
- **解決**: 精確指定 Hook 目標，加入安全檢查

#### SE-4: MCP Prompt Injection
- **嚴重度**: critical
- **症狀**: Claude 執行意外操作
- **原因**: MCP 從不信任來源獲取內容
- **解決**: 只使用信任來源的 MCP

### 常見錯誤對照表

| 錯誤 | 正確做法 |
|------|----------|
| 把 commands/ 放進 .claude-plugin/ | 放在 plugin 根目錄 |
| 版本號不一致 | 同步更新所有位置 |
| Hook 範圍太廣 | 精確指定目標工具 |
| 忘記 git tag | 每次發布都要 tag |
| 直接上線未測試 | 先用 --plugin-dir 測試 |

---

## Part 10: 本地測試

```bash
# 測試 plugin（不安裝）
claude-code --plugin-dir /path/to/my-plugin

# 驗證結構
tree /path/to/my-plugin

# 檢查 plugin.json 語法
cat /path/to/my-plugin/.claude-plugin/plugin.json | jq .

# 驗證 hooks
cat /path/to/my-plugin/hooks/hooks.json | jq .
```

---

## 官方文檔

- [Plugins](https://code.claude.com/docs/en/plugins)
- [Plugins Reference](https://code.claude.com/docs/en/plugins-reference)
- [Plugin Marketplaces](https://code.claude.com/docs/en/plugin-marketplaces)
- [Hooks Guide](https://code.claude.com/docs/en/hooks-guide)
- [Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Skills](https://code.claude.com/docs/en/skills)
- [MCP](https://code.claude.com/docs/en/mcp)
- [Subagents](https://code.claude.com/docs/en/sub-agents)
- [Slash Commands](https://code.claude.com/docs/en/slash-commands)

## 延伸資源

- [Claude Code GitHub](https://github.com/anthropics/claude-code)
- [Official Plugins](https://github.com/anthropics/claude-plugins-official)
- evolve-plugin 範例：參考 `evolve-plugin/.claude-plugin/` 結構
