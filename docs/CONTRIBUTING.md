# Contributing Guide

Thank you for considering contributing to TikTok API! This document provides guidelines for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported
2. Use the bug report template
3. Include:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Screenshots if applicable

### Suggesting Features

1. Check if feature has been suggested
2. Use the feature request template
3. Explain:
   - Use case
   - Proposed solution
   - Alternatives considered

### Pull Requests

1. **Fork the repository**

2. **Create a branch**
```bash
git checkout -b feature/your-feature-name
```

3. **Make your changes**
   - Follow coding standards
   - Write clear commit messages
   - Add tests if applicable
   - Update documentation

4. **Test your changes**
```bash
npm test
npm run lint
```

5. **Commit your changes**
```bash
git commit -m "feat: add amazing feature"
```

Use conventional commits:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

6. **Push to your fork**
```bash
git push origin feature/your-feature-name
```

7. **Open a Pull Request**
   - Use the PR template
   - Link related issues
   - Describe changes clearly

## Coding Standards

### JavaScript Style

- Use ES6+ features
- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- Meaningful variable names

### File Structure
```javascript
// 1. Imports
const express = require('express');
const someUtil = require('./utils/someUtil');

// 2. Constants
const CONSTANT_VALUE = 100;

// 3. Class/Function definitions
class MyClass {
  // ...
}

// 4. Exports
module.exports = MyClass;
```

### Error Handling
```javascript
try {
  // code
} catch (error) {
  logger.error('Description', { error: error.message });
  throw new AppError('User-friendly message', 500);
}
```

### Documentation

- Add JSDoc comments for functions
- Update README.md if needed
- Add examples for new features

Example:
```javascript
/**
 * Fetches user profile from TikTok
 * @param {string} username - TikTok username
 * @returns {Promise<Object>} User profile data
 * @throws {NotFoundError} If user doesn't exist
 */
async function fetchUserProfile(username) {
  // ...
}
```

## Testing

- Write tests for new features
- Ensure all tests pass
- Maintain code coverage above 80%
```bash
npm test
```

## Review Process

1. Automated checks run on PR
2. Code review by maintainers
3. Changes requested if needed
4. Approval and merge

## Questions?

Open an issue or contact maintainers.

Thank you for contributing! 🎉