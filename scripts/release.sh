#!/bin/bash

# Build script for types-package
# Usage: ./scripts/release.sh

set -e

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Error: You must be on the main branch to build"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: You have uncommitted changes"
    git status --short
    exit 1
fi

# Run lint
echo "🔍 Running lint..."
npm run lint

# Run build
echo "🔨 Running build..."
npm run build

echo "✅ Build completed successfully!"
echo "📋 Build output is available in the dist/ directory"
