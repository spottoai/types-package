#!/bin/bash

# Release script for types-package
# Usage: ./scripts/release.sh [patch|minor|major]

set -e

# 检查参数
if [ $# -eq 0 ]; then
    echo "Usage: $0 [patch|minor|major]"
    echo "  patch: 1.0.0 -> 1.0.1"
    echo "  minor: 1.0.0 -> 1.1.0"
    echo "  major: 1.0.0 -> 2.0.0"
    exit 1
fi

VERSION_TYPE=$1

# 检查当前分支
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Error: You must be on the main branch to release"
    exit 1
fi

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: You have uncommitted changes"
    git status --short
    exit 1
fi

# 运行测试
echo "🔍 Running tests..."
npm run lint
npm run build

# 更新版本
echo "📦 Updating version..."
npm version $VERSION_TYPE --no-git-tag-version

# 获取新版本号
NEW_VERSION=$(node -p "require('./package.json').version")
echo "✅ New version: $NEW_VERSION"

# 提交更改
echo "📝 Committing changes..."
git add package.json package-lock.json
git commit -m "chore: bump version to $NEW_VERSION"

# 创建标签
echo "🏷️ Creating tag..."
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

# 推送更改和标签
echo "🚀 Pushing to remote..."
git push origin main
git push origin "v$NEW_VERSION"

echo "🎉 Release v$NEW_VERSION completed!"
echo "📋 Next steps:"
echo "  1. Check GitHub Actions for build status"
echo "  2. Verify the release on GitHub"
echo "  3. Update dependent projects if needed"
