# Code Quality Templates

Ready-to-use linting and formatting configuration templates.

## Files

| Template | Purpose |
|----------|---------|
| `eslint.config.js` | ESLint 9+ flat config for TypeScript |
| `.prettierrc` | Prettier formatting rules |
| `.editorconfig` | Cross-editor consistency settings |

## Usage

### ESLint (TypeScript)

```bash
cp templates/eslint.config.js ./eslint.config.js

# Install dependencies
npm install -D eslint typescript-eslint @eslint/js eslint-config-prettier

# Run lint
npx eslint .
```

### Prettier

```bash
cp templates/.prettierrc ./.prettierrc

# Install
npm install -D prettier

# Format
npx prettier --write .
```

### EditorConfig

```bash
cp templates/.editorconfig ./.editorconfig

# Install VS Code extension: EditorConfig.EditorConfig
# Most editors support EditorConfig natively or via plugin
```

## Integration

### package.json Scripts

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

### Pre-commit Hook (with lint-staged)

```bash
npm install -D husky lint-staged
npx husky init
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml}": ["prettier --write"]
  }
}
```

### VS Code Settings

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```
