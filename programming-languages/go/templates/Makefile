# Go Project Makefile Template
# Usage: Copy to project root

# ===========================================
# Variables
# ===========================================

APP_NAME := myapp
VERSION := $(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
BUILD_TIME := $(shell date -u +"%Y-%m-%dT%H:%M:%SZ")
COMMIT := $(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# Go settings
GO := go
GOFLAGS := -v
LDFLAGS := -ldflags "-X main.Version=$(VERSION) -X main.BuildTime=$(BUILD_TIME) -X main.Commit=$(COMMIT)"

# Directories
BUILD_DIR := ./bin
CMD_DIR := ./cmd/$(APP_NAME)
PKG_DIR := ./pkg
INTERNAL_DIR := ./internal

# Docker
DOCKER_IMAGE := $(APP_NAME)
DOCKER_TAG := $(VERSION)

# ===========================================
# Default
# ===========================================

.PHONY: all
all: lint test build

# ===========================================
# Development
# ===========================================

.PHONY: run
run: ## Run the application
	$(GO) run $(CMD_DIR)/main.go

.PHONY: dev
dev: ## Run with hot reload (requires air)
	air

.PHONY: watch
watch: ## Watch for changes (alternative)
	watchexec -e go -r "go run $(CMD_DIR)/main.go"

# ===========================================
# Build
# ===========================================

.PHONY: build
build: ## Build binary
	$(GO) build $(GOFLAGS) $(LDFLAGS) -o $(BUILD_DIR)/$(APP_NAME) $(CMD_DIR)

.PHONY: build-linux
build-linux: ## Build for Linux
	GOOS=linux GOARCH=amd64 $(GO) build $(LDFLAGS) -o $(BUILD_DIR)/$(APP_NAME)-linux-amd64 $(CMD_DIR)

.PHONY: build-darwin
build-darwin: ## Build for macOS
	GOOS=darwin GOARCH=amd64 $(GO) build $(LDFLAGS) -o $(BUILD_DIR)/$(APP_NAME)-darwin-amd64 $(CMD_DIR)
	GOOS=darwin GOARCH=arm64 $(GO) build $(LDFLAGS) -o $(BUILD_DIR)/$(APP_NAME)-darwin-arm64 $(CMD_DIR)

.PHONY: build-windows
build-windows: ## Build for Windows
	GOOS=windows GOARCH=amd64 $(GO) build $(LDFLAGS) -o $(BUILD_DIR)/$(APP_NAME)-windows-amd64.exe $(CMD_DIR)

.PHONY: build-all
build-all: build-linux build-darwin build-windows ## Build for all platforms

.PHONY: install
install: ## Install binary
	$(GO) install $(LDFLAGS) $(CMD_DIR)

# ===========================================
# Testing
# ===========================================

.PHONY: test
test: ## Run tests
	$(GO) test -v ./...

.PHONY: test-race
test-race: ## Run tests with race detector
	$(GO) test -race -v ./...

.PHONY: test-cover
test-cover: ## Run tests with coverage
	$(GO) test -coverprofile=coverage.out ./...
	$(GO) tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report: coverage.html"

.PHONY: test-short
test-short: ## Run short tests only
	$(GO) test -short ./...

.PHONY: bench
bench: ## Run benchmarks
	$(GO) test -bench=. -benchmem ./...

# ===========================================
# Quality
# ===========================================

.PHONY: lint
lint: ## Run linter
	golangci-lint run ./...

.PHONY: fmt
fmt: ## Format code
	$(GO) fmt ./...
	gofumpt -l -w .

.PHONY: vet
vet: ## Run go vet
	$(GO) vet ./...

.PHONY: tidy
tidy: ## Tidy dependencies
	$(GO) mod tidy

.PHONY: verify
verify: ## Verify dependencies
	$(GO) mod verify

.PHONY: check
check: fmt vet lint test ## Run all checks

# ===========================================
# Generation
# ===========================================

.PHONY: generate
generate: ## Run go generate
	$(GO) generate ./...

.PHONY: mock
mock: ## Generate mocks (requires mockgen)
	mockgen -source=$(INTERNAL_DIR)/service/user.go -destination=$(INTERNAL_DIR)/service/mock/user_mock.go

.PHONY: swagger
swagger: ## Generate Swagger docs (requires swag)
	swag init -g $(CMD_DIR)/main.go -o ./docs

# ===========================================
# Docker
# ===========================================

.PHONY: docker-build
docker-build: ## Build Docker image
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .

.PHONY: docker-push
docker-push: ## Push Docker image
	docker push $(DOCKER_IMAGE):$(DOCKER_TAG)

.PHONY: docker-run
docker-run: ## Run Docker container
	docker run --rm -p 8080:8080 $(DOCKER_IMAGE):$(DOCKER_TAG)

# ===========================================
# Database
# ===========================================

.PHONY: migrate-up
migrate-up: ## Run migrations up
	migrate -path ./migrations -database "$(DATABASE_URL)" up

.PHONY: migrate-down
migrate-down: ## Run migrations down
	migrate -path ./migrations -database "$(DATABASE_URL)" down 1

.PHONY: migrate-create
migrate-create: ## Create new migration (usage: make migrate-create name=create_users)
	migrate create -ext sql -dir ./migrations -seq $(name)

# ===========================================
# Cleanup
# ===========================================

.PHONY: clean
clean: ## Clean build artifacts
	rm -rf $(BUILD_DIR)
	rm -f coverage.out coverage.html

.PHONY: clean-cache
clean-cache: ## Clean Go cache
	$(GO) clean -cache -testcache

# ===========================================
# Help
# ===========================================

.PHONY: help
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
