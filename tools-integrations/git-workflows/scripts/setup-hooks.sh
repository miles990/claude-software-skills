#!/bin/bash
# Setup git hooks for this repository
# Usage: ./scripts/setup-hooks.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HOOKS_DIR="$(git rev-parse --show-toplevel)/.git/hooks"

echo "🔧 Setting up git hooks..."

# Copy hooks
cp "$SCRIPT_DIR/pre-commit" "$HOOKS_DIR/pre-commit"
cp "$SCRIPT_DIR/commit-msg" "$HOOKS_DIR/commit-msg"

# Make executable
chmod +x "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/commit-msg"

echo "✅ Git hooks installed!"
echo ""
echo "Installed hooks:"
echo "  - pre-commit: ESLint + TypeScript check"
echo "  - commit-msg: Conventional commits validation"
