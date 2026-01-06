# Project Skills

This directory contains skills used for developing this project.

## Architecture

Skills are managed via **Git Submodules** for version tracking and easy updates:

```
claude-software-skills/
├── vendor/
│   └── self-evolving-agent/    ← Git Submodule
│       └── SKILL.md
├── .claude/skills/
│   ├── README.md               ← This file
│   └── evolve -> ../../vendor/self-evolving-agent  ← Symlink
```

## Installed Skills

### evolve (v3.3.0)

Self-Evolving Agent - 自主學習並迭代改進直到達成目標。

**Source:** https://github.com/miles990/self-evolving-agent

**Usage:**
```
/evolve [目標描述]
```

**Features:**
- 強制檢查點（任務前查 Memory、變更後編譯測試、Milestone 後目標確認）
- Memory 生命週期管理（去蕪存菁）
- Git-based Memory（版本控制、可追溯、可回滾）

## Managing Skills

### First-time clone

```bash
git clone --recursive https://github.com/miles990/claude-software-skills.git
```

Or if already cloned:
```bash
git submodule update --init --recursive
```

### Update to latest version

```bash
# Update all submodules
git submodule update --remote --merge

# Or update specific skill
cd vendor/self-evolving-agent
git pull origin main
cd ../..
git add vendor/self-evolving-agent
git commit -m "chore: update evolve skill to latest"
```

### Check current version

```bash
cd vendor/self-evolving-agent
git log -1 --format="%h %s"
```

## Adding New Skills

1. Add as submodule:
   ```bash
   git submodule add https://github.com/user/skill-repo.git vendor/skill-name
   ```

2. Create symlink:
   ```bash
   cd .claude/skills
   ln -s ../../vendor/skill-name skill-alias
   ```

3. Update this README
