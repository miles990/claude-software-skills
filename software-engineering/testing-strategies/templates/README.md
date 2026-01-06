# Testing Strategies Templates

Ready-to-use test configuration templates for JavaScript/TypeScript and Python projects.

## Files

| Template | Purpose |
|----------|---------|
| `jest.config.ts` | Jest configuration for Node.js/TypeScript |
| `vitest.config.ts` | Vitest configuration (Vite-native testing) |
| `pytest.ini` | Pytest configuration for Python |

## Usage

### Jest (Node.js/TypeScript)

```bash
cp templates/jest.config.ts ./jest.config.ts

# Install dependencies
npm install -D jest ts-jest @types/jest

# Create setup file
touch jest.setup.ts

# Run tests
npm test
```

### Vitest (Vite Projects)

```bash
cp templates/vitest.config.ts ./vitest.config.ts

# Install dependencies
npm install -D vitest @vitest/coverage-v8

# Create setup file
touch vitest.setup.ts

# Run tests
npx vitest
```

### Pytest (Python)

```bash
cp templates/pytest.ini ./pytest.ini

# Install dependencies
pip install pytest pytest-cov pytest-asyncio pytest-timeout

# Create tests directory
mkdir -p tests

# Run tests
pytest
```

## Configuration Notes

### Coverage Thresholds

All templates set 80% coverage threshold. Adjust as needed:

```typescript
// Jest/Vitest
coverageThreshold: {
  global: { branches: 80, functions: 80, lines: 80, statements: 80 }
}
```

```ini
# Pytest - run with:
pytest --cov=src --cov-fail-under=80
```

### Path Aliases

Templates include `@/` alias for `src/` directory. Match your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}
```
