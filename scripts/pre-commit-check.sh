#!/bin/bash

# Pre-commit check script
# Runs essential checks before allowing commits

set -e

echo "🔍 Running pre-commit checks..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Get the current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📋 Current branch: $CURRENT_BRANCH"

# Skip checks for certain branches or commits
if [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "prod" ]]; then
    echo "⚠️  Skipping pre-commit checks for protected branch: $CURRENT_BRANCH"
    echo "   (These branches should only be updated via pull requests)"
    exit 0
fi

# Check if pnpm is available
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first."
    exit 1
fi

# Check if we're in the project root
if [[ ! -f "package.json" ]]; then
    echo "❌ Not in project root. Please run from the project directory."
    exit 1
fi

echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

echo "🔍 Running type check..."
pnpm run type-check || {
    echo "❌ Type check failed"
    exit 1
}

echo "🧹 Running linter..."
pnpm run lint || {
    echo "❌ Linting failed"
    exit 1
}

echo "🧪 Running critical tests..."
pnpm test:critical || {
    echo "❌ Critical tests failed"
    exit 1
}

echo "✅ Pre-commit checks passed!"
echo "🚀 Ready to commit"
