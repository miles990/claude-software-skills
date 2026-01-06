# JavaScript/TypeScript Templates

TypeScript configuration and package.json templates.

## Files

| Template | Purpose |
|----------|---------|
| `tsconfig.json` | Node.js/ESM TypeScript config |
| `tsconfig.react.json` | React/Vite TypeScript config |
| `package.json` | Node.js project with modern tooling |

## Usage

### Node.js Project

```bash
cp templates/tsconfig.json ./tsconfig.json
cp templates/package.json ./package.json

# Update package.json name/description
# Install dependencies
npm install
```

### React Project

```bash
cp templates/tsconfig.react.json ./tsconfig.json

# For Vite, also create tsconfig.node.json:
# { "extends": "./tsconfig.json", "include": ["vite.config.ts"] }
```

## Key Configuration

### tsconfig.json (Node.js)

- **Target**: ES2022 (modern Node.js)
- **Module**: NodeNext (native ESM)
- **Strict**: All strict checks enabled
- **Path aliases**: `@/*` → `./src/*`

### tsconfig.react.json

- **Target**: ES2020 (browser compatibility)
- **JSX**: react-jsx (React 17+)
- **Module**: ESNext (bundler mode)
- **No emit**: Bundler handles output

### package.json

Modern tooling stack:
- **tsx**: Fast TypeScript execution
- **vitest**: Fast testing
- **eslint 9**: Flat config
- **prettier**: Formatting
- **husky + lint-staged**: Pre-commit hooks

## Scripts

```bash
npm run dev          # Development with watch
npm run build        # Production build
npm test             # Run tests
npm run lint         # Lint code
npm run format       # Format code
npm run typecheck    # Type check only
```

## Path Aliases

Configure in both `tsconfig.json` and bundler:

```json
// tsconfig.json
{
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

## ESM vs CommonJS

This template uses ESM (`"type": "module"`). For CommonJS:

```json
{
  "type": "commonjs",
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "Node"
  }
}
```
