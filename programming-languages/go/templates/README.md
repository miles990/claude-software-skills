# Go Templates

Configuration templates for Go projects.

## Files

| Template | Purpose |
|----------|---------|
| `go.mod` | Module dependencies template |
| `Makefile` | Build and development commands |

## Usage

### Initialize Project

```bash
# Create project directory
mkdir myproject && cd myproject

# Initialize module
go mod init github.com/yourorg/myproject

# Copy Makefile
cp templates/Makefile ./Makefile

# Update APP_NAME in Makefile
sed -i '' 's/myapp/myproject/g' Makefile
```

### Makefile Commands

```bash
make help        # Show all commands

# Development
make run         # Run application
make dev         # Run with hot reload (air)

# Build
make build       # Build binary
make build-all   # Build for all platforms

# Testing
make test        # Run tests
make test-cover  # Run with coverage
make bench       # Run benchmarks

# Quality
make lint        # Run linter
make fmt         # Format code
make check       # Run all checks

# Docker
make docker-build
make docker-run
```

## Project Structure

```
myproject/
├── cmd/
│   └── myproject/
│       └── main.go
├── internal/
│   ├── handler/
│   ├── service/
│   └── repository/
├── pkg/
│   └── (public packages)
├── api/
│   └── (OpenAPI specs)
├── migrations/
├── go.mod
├── go.sum
└── Makefile
```

## Recommended Dependencies

### Web Framework
| Package | Description |
|---------|-------------|
| `gin-gonic/gin` | High performance, minimalist |
| `labstack/echo` | Feature-rich, extensible |
| `gofiber/fiber` | Express-inspired, fast |
| `go-chi/chi` | Lightweight, idiomatic |

### Database
| Package | Description |
|---------|-------------|
| `jackc/pgx` | PostgreSQL driver |
| `gorm.io/gorm` | ORM with associations |
| `sqlc` | Type-safe SQL codegen |
| `ent` | Entity framework |

### Configuration
| Package | Description |
|---------|-------------|
| `spf13/viper` | Full-featured config |
| `kelseyhightower/envconfig` | Env vars only |
| `joho/godotenv` | .env file loading |

## Build with Version Info

```go
// main.go
var (
    Version   = "dev"
    BuildTime = "unknown"
    Commit    = "unknown"
)

func main() {
    fmt.Printf("%s %s (%s)\n", Version, BuildTime, Commit)
}
```

Build injects these via ldflags:
```bash
make build  # Uses git tags and commit
```

## Required Tools

```bash
# Linter
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# Hot reload
go install github.com/cosmtrek/air@latest

# Formatter
go install mvdan.cc/gofumpt@latest

# Migrations
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# Mock generation
go install github.com/golang/mock/mockgen@latest

# Swagger
go install github.com/swaggo/swag/cmd/swag@latest
```
