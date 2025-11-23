#!/bin/bash

echo "🧪 Running tests..."

# Run tests with coverage
npm test -- --coverage

# Check coverage threshold
if [ $? -eq 0 ]; then
  echo "✅ All tests passed!"
else
  echo "❌ Tests failed!"
  exit 1
fi