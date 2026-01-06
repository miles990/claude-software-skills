# Rust Templates

Configuration templates for Rust projects.

## Files

| Template | Purpose |
|----------|---------|
| `Cargo.toml` | Package manifest with common dependencies |

## Usage

### Initialize Project

```bash
# Create new project
cargo new myproject
cd myproject

# Or use template Cargo.toml
cp templates/Cargo.toml ./Cargo.toml
# Update package name and dependencies

# Build
cargo build
```

### Common Commands

```bash
# Development
cargo run              # Run binary
cargo watch -x run     # Auto-reload (requires cargo-watch)
cargo check            # Fast type checking

# Build
cargo build            # Debug build
cargo build --release  # Release build

# Testing
cargo test             # Run tests
cargo test -- --nocapture  # Show println output
cargo test test_name   # Run specific test

# Quality
cargo fmt              # Format code
cargo clippy           # Linter
cargo doc --open       # Generate docs
```

## Project Structure

```
myproject/
├── Cargo.toml
├── Cargo.lock
├── src/
│   ├── main.rs        # Binary entry
│   ├── lib.rs         # Library entry
│   └── ...
├── tests/             # Integration tests
├── benches/           # Benchmarks
└── examples/          # Example code
```

## Recommended Crates

### Web Frameworks
| Crate | Description |
|-------|-------------|
| `axum` | Ergonomic, modular (Tokio ecosystem) |
| `actix-web` | High performance |
| `rocket` | Developer-friendly |
| `warp` | Composable filters |

### Async Runtimes
| Crate | Description |
|-------|-------------|
| `tokio` | Most popular, full-featured |
| `async-std` | Std-like API |

### Database
| Crate | Description |
|-------|-------------|
| `sqlx` | Async, compile-time checked SQL |
| `diesel` | Type-safe ORM |
| `sea-orm` | Async ORM |

### Error Handling
| Crate | Description |
|-------|-------------|
| `thiserror` | Custom error types |
| `anyhow` | Application errors |
| `miette` | Fancy diagnostics |

## Profile Optimization

```toml
# Fast compile, fast binary
[profile.release]
lto = true           # Link-time optimization
codegen-units = 1    # Single codegen unit
panic = "abort"      # Smaller binary
strip = true         # Strip symbols

# Fast compile in dev
[profile.dev.package."*"]
opt-level = 2        # Optimize dependencies
```

## Useful Dev Tools

```bash
# Install tools
cargo install cargo-watch      # Auto-rebuild
cargo install cargo-edit       # cargo add/rm
cargo install cargo-audit      # Security audit
cargo install cargo-outdated   # Check updates
cargo install cargo-expand     # Macro expansion
cargo install cargo-flamegraph # Profiling

# Usage
cargo watch -x test            # Auto-test
cargo add serde --features derive
cargo audit                    # Check vulnerabilities
cargo outdated                 # Show outdated deps
```

## Feature Flags

```toml
[features]
default = ["json"]
json = ["dep:serde_json"]
full = ["json", "yaml", "toml"]
yaml = ["dep:serde_yaml"]
toml = ["dep:toml"]
```

```bash
# Build with features
cargo build --features "json yaml"
cargo build --all-features
cargo build --no-default-features
```
