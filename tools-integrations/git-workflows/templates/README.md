# Git Workflows Templates

Git hooks and configuration templates.

## Scripts (Git Hooks)

| Script | Purpose |
|--------|---------|
| `scripts/pre-commit` | ESLint + TypeScript check on staged files |
| `scripts/commit-msg` | Conventional commits validation |
| `scripts/setup-hooks.sh` | One-click hooks installation |

### Quick Setup

```bash
./scripts/setup-hooks.sh
```

### Manual Setup

```bash
cp scripts/pre-commit .git/hooks/pre-commit
cp scripts/commit-msg .git/hooks/commit-msg
chmod +x .git/hooks/pre-commit .git/hooks/commit-msg
```

## Templates

| Template | Purpose |
|----------|---------|
| `templates/gitignore-node` | Node.js/TypeScript projects |
| `templates/gitignore-python` | Python projects |

### Usage

```bash
cp templates/gitignore-node .gitignore
```
