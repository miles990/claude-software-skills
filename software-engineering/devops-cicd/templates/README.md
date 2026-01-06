# DevOps CI/CD Templates

Ready-to-use templates for CI/CD pipelines.

## GitHub Actions

| Template | Purpose |
|----------|---------|
| `github-actions/ci.yml` | Basic CI (lint, test, build) |
| `github-actions/cd-staging.yml` | Deploy to staging (Vercel) |

### Usage

```bash
# Copy CI workflow
cp templates/github-actions/ci.yml .github/workflows/ci.yml

# Copy CD workflow
cp templates/github-actions/cd-staging.yml .github/workflows/cd-staging.yml
```

## Docker

| Template | Purpose |
|----------|---------|
| `docker/Dockerfile.node` | Node.js production image |
| `docker/docker-compose.yml` | Full stack (app + db + redis) |

### Usage

```bash
# Copy Dockerfile
cp templates/docker/Dockerfile.node Dockerfile

# Copy docker-compose
cp templates/docker/docker-compose.yml docker-compose.yml
```
