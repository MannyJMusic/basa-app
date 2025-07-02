# Contributing to BASA

Thank you for your interest in contributing to the Business Association of San Antonio (BASA) project! We welcome contributions from the community and appreciate your help in making BASA better.

## 🤝 How to Contribute

### Types of Contributions We Welcome

- **Bug Reports** - Help us identify and fix issues
- **Feature Requests** - Suggest new features and improvements
- **Code Contributions** - Submit pull requests with code changes
- **Documentation** - Improve documentation and guides
- **Testing** - Help test features and report issues
- **Design Feedback** - Provide UI/UX suggestions and feedback

## 🚀 Getting Started

### 1. Set Up Your Development Environment

Follow the [Getting Started](Getting-Started) guide to set up your local development environment.

### 2. Choose an Issue to Work On

- **Browse Issues** - Check the [GitHub Issues](https://github.com/MannyJMusic/basa-app/issues) page
- **Good First Issues** - Look for issues labeled "good first issue" or "help wanted"
- **Bug Reports** - Help fix reported bugs
- **Feature Requests** - Implement requested features

### 3. Fork and Clone the Repository

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/basa-app.git
cd basa-app

# Add the original repository as upstream
git remote add upstream https://github.com/MannyJMusic/basa-app.git
```

## 🔄 Development Workflow

### 1. Create a Feature Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 2. Make Your Changes

- **Follow the Code Style** - Use the established coding standards
- **Write Tests** - Add tests for new features or bug fixes
- **Update Documentation** - Update relevant documentation
- **Test Your Changes** - Ensure everything works correctly

### 3. Commit Your Changes

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "feat: add new feature description"

# Push to your fork
git push origin feature/your-feature-name
```

### 4. Create a Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your feature branch
4. Fill out the pull request template
5. Submit the pull request

## 📝 Pull Request Guidelines

### Pull Request Template

When creating a pull request, please include:

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] I have tested my changes locally
- [ ] I have added tests for my changes
- [ ] All tests pass

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have updated the documentation
- [ ] I have added comments to my code where necessary
- [ ] My changes generate no new warnings
- [ ] I have tested the application thoroughly
```

### Code Review Process

1. **Automated Checks** - CI/CD pipeline runs tests and checks
2. **Code Review** - Team members review your code
3. **Feedback** - Address any feedback or requested changes
4. **Approval** - Once approved, your PR will be merged

## 🎨 Code Style Guidelines

### General Guidelines

- **Follow Existing Patterns** - Match the existing code style
- **Use TypeScript** - All new code should be in TypeScript
- **Add Comments** - Comment complex logic and business rules
- **Keep Functions Small** - Aim for single responsibility
- **Use Meaningful Names** - Variables, functions, and components

### React/Next.js Guidelines

```typescript
// Component naming
const UserProfile = ({ user }: { user: User }) => {
  // Component logic
};

// Hook naming
const useUserData = (userId: string) => {
  // Hook logic
};

// File naming
// user-profile.tsx (kebab-case for files)
// UserProfile.tsx (PascalCase for components)
```

### Database Guidelines

```typescript
// Prisma model naming
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Migration naming
// YYYYMMDDHHMMSS_description.sql
```

## 🧪 Testing Guidelines

### Unit Tests

```typescript
// Test file naming
// component.test.tsx or component.spec.tsx

import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
// API route testing
import { createMocks } from 'node-mocks-http';
import handler from '../pages/api/users';

describe('/api/users', () => {
  it('returns users list', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          email: expect.any(String),
        }),
      ])
    );
  });
});
```

## 📚 Documentation Guidelines

### Code Documentation

```typescript
/**
 * Calculates the total price including tax
 * @param subtotal - The subtotal amount
 * @param taxRate - The tax rate as a decimal (e.g., 0.08 for 8%)
 * @returns The total price including tax
 */
const calculateTotal = (subtotal: number, taxRate: number): number => {
  return subtotal * (1 + taxRate);
};
```

### README Updates

- **Update README** - If your changes affect setup or usage
- **Update Wiki** - Add relevant wiki pages or updates
- **Update Comments** - Add inline comments for complex logic

## 🐛 Bug Reports

### Before Reporting a Bug

1. **Check Existing Issues** - Search for similar issues
2. **Test in Development** - Ensure the bug exists in the latest version
3. **Reproduce the Issue** - Create steps to reproduce the bug

### Bug Report Template

```markdown
## Bug Description
Clear and concise description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Environment
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Safari, Firefox]
- Version: [e.g., 22]

## Additional Context
Any other context about the problem.
```

## 💡 Feature Requests

### Feature Request Template

```markdown
## Feature Description
Clear and concise description of the feature.

## Problem Statement
What problem does this feature solve?

## Proposed Solution
How would you like this feature to work?

## Alternative Solutions
Any alternative solutions you've considered.

## Additional Context
Any other context or screenshots about the feature request.
```

## 🔒 Security Issues

### Reporting Security Issues

If you discover a security vulnerability, please:

1. **Do Not Open a Public Issue** - Security issues should be reported privately
2. **Email the Team** - Send details to [security@businessassociationsa.com]
3. **Provide Details** - Include steps to reproduce and potential impact
4. **Wait for Response** - Allow time for the team to investigate

## 🏷️ Issue Labels

We use the following labels to categorize issues:

- **bug** - Something isn't working
- **enhancement** - New feature or request
- **documentation** - Improvements or additions to documentation
- **good first issue** - Good for newcomers
- **help wanted** - Extra attention is needed
- **question** - Further information is requested
- **wontfix** - This will not be worked on

## 📞 Getting Help

### Need Help?

- **Check Documentation** - Review the [wiki pages](Home)
- **Search Issues** - Look for similar questions in GitHub issues
- **Ask Questions** - Open an issue with the "question" label
- **Join Discussions** - Participate in GitHub discussions

### Communication Channels

- **GitHub Issues** - For bug reports and feature requests
- **GitHub Discussions** - For questions and general discussion
- **Email** - For security issues or private matters

## 🎉 Recognition

### Contributors

We recognize contributors in several ways:

- **Contributors List** - GitHub automatically tracks contributors
- **Release Notes** - Credit in release announcements
- **Documentation** - Recognition in documentation
- **Community** - Acknowledgment in community discussions

### Contributor Levels

- **First Time Contributor** - Welcome to the community!
- **Regular Contributor** - Consistent contributions
- **Core Contributor** - Significant contributions and leadership

## 📄 License

By contributing to BASA, you agree that your contributions will be licensed under the same [Creative Commons Attribution-NonCommercial 4.0 International License](../LICENSE) that covers the project.

---

**Thank you for contributing to BASA! Your help makes this project better for everyone.** 