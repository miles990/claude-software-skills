# Development Environment Templates

VS Code and Dev Container configurations for consistent development environments.

## Files

| Template | Purpose |
|----------|---------|
| `.vscode/settings.json` | VS Code workspace settings |
| `.vscode/extensions.json` | Recommended extensions |
| `devcontainer.json` | Dev Container configuration |

## Usage

### VS Code Settings

```bash
mkdir -p .vscode
cp templates/.vscode/settings.json .vscode/
cp templates/.vscode/extensions.json .vscode/

# Install recommended extensions
code --install-extension esbenp.prettier-vscode
# ... or use VS Code's "Install Recommended Extensions"
```

### Dev Containers

```bash
mkdir -p .devcontainer
cp templates/devcontainer.json .devcontainer/

# Open in container (VS Code)
# Command Palette → "Dev Containers: Reopen in Container"
```

## Key Features

### VS Code Settings

- Format on save with Prettier
- ESLint auto-fix on save
- Organize imports on save
- TypeScript path intellisense
- Consistent rulers at 80/100 chars

### Recommended Extensions

| Category | Extensions |
|----------|------------|
| Essential | Prettier, ESLint, EditorConfig |
| Git | GitLens, Git Graph |
| Productivity | Path Intellisense, Error Lens, Todo Tree |
| Testing | Vitest Explorer, Jest |
| AI | GitHub Copilot, Claude Dev |

### Dev Containers

- Pre-configured Node.js 20 environment
- Git, GitHub CLI, Docker-in-Docker
- Port forwarding (3000, 5432, 6379)
- Automatic `npm ci` on creation

## Customization

### Adding Project-Specific Settings

Edit `.vscode/settings.json`:

```json
{
  // Add project-specific overrides
  "typescript.tsdk": "node_modules/typescript/lib",
  "[markdown]": {
    "editor.wordWrap": "on"
  }
}
```

### Adding Services to Dev Container

Edit `.devcontainer/devcontainer.json`:

```json
{
  "features": {
    "ghcr.io/devcontainers/features/python:1": {},
    "ghcr.io/devcontainers/features/rust:1": {}
  }
}
```
