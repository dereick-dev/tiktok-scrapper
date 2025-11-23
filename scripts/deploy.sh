#!/bin/bash

echo "🚀 Starting deployment..."

# Check if on main branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
  echo "❌ You must be on main branch to deploy"
  exit 1
fi

# Run tests
echo "🧪 Running tests..."
npm test

if [ $? -ne 0 ]; then
  echo "❌ Tests failed. Aborting deployment."
  exit 1
fi

# Run linter
echo "🔍 Running linter..."
npm run lint

if [ $? -ne 0 ]; then
  echo "❌ Linter failed. Aborting deployment."
  exit 1
fi

# Build and push
echo "📦 Building and pushing..."
git push origin main

echo "✅ Deployment initiated!"
echo "🌐 Check Koyeb dashboard for deployment status"