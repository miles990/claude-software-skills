# Automation Scripts Templates

Build automation and task runner configurations.

## Files

| Template | Purpose |
|----------|---------|
| `Makefile.example` | Make-based task automation |
| `turbo.json` | Turborepo monorepo build system |

## Usage

### Makefile

```bash
cp templates/Makefile.example Makefile

# Show available commands
make help

# Common commands
make install      # Install dependencies
make dev          # Start dev server
make build        # Production build
make test         # Run tests
make lint         # Run linter
make deploy-prod  # Deploy to production
```

### Turborepo (Monorepo)

```bash
cp templates/turbo.json turbo.json

# Install Turbo
npm install turbo --save-dev

# Run tasks
npx turbo build      # Build all packages
npx turbo dev        # Start all dev servers
npx turbo test       # Run all tests
npx turbo lint       # Lint all packages

# Run with filters
npx turbo build --filter=@myorg/web
npx turbo test --filter=./packages/*
```

## Why Use These?

### Makefile

- Universal (works anywhere with `make`)
- Self-documenting with `make help`
- No additional dependencies
- Great for polyglot projects

### Turborepo

- Intelligent caching
- Parallel execution
- Perfect for monorepos
- Incremental builds

## package.json Integration

```json
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint"
  }
}
```

## Monorepo Structure

```
my-monorepo/
├── turbo.json
├── package.json
├── apps/
│   ├── web/
│   └── api/
└── packages/
    ├── ui/
    └── utils/
```
