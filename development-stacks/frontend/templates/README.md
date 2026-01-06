# Frontend Templates

Configuration templates for React/TypeScript projects.

## React + TypeScript

| Template | Purpose |
|----------|---------|
| `react/tsconfig.json` | TypeScript config with path aliases |
| `react/eslint.config.js` | ESLint flat config for React |

### Usage

```bash
cp templates/react/tsconfig.json tsconfig.json
cp templates/react/eslint.config.js eslint.config.js
```

## Vite

| Template | Purpose |
|----------|---------|
| `vite/vite.config.ts` | Vite config with aliases and proxy |

### Usage

```bash
cp templates/vite/vite.config.ts vite.config.ts
```

## Quick Start (New React Project)

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
# Copy templates
cp path/to/templates/react/tsconfig.json .
cp path/to/templates/react/eslint.config.js .
cp path/to/templates/vite/vite.config.ts .
```
