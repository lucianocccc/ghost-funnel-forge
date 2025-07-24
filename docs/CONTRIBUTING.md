# Contributing to GhostFunnel

We welcome contributions to GhostFunnel! This guide will help you get started with contributing to the project.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Supabase CLI
- Basic knowledge of React, TypeScript, and Supabase

### Development Setup

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/ghostfunnel.git
   cd ghostfunnel
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Development Environment**
   ```bash
   npx supabase start
   npm run dev
   ```

## Development Workflow

### Branch Naming

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical fixes
- `docs/description` - Documentation updates

### Commit Messages

Follow conventional commits format:
```
type(scope): description

body

footer
```

Examples:
- `feat(auth): add OAuth login support`
- `fix(dashboard): resolve loading state issue`
- `docs(api): update endpoint documentation`

### Code Style

#### TypeScript Guidelines
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Prefer `const` over `let` when possible
- Use meaningful variable names

#### React Guidelines
- Use functional components with hooks
- Implement proper error boundaries
- Use React.memo for performance optimization
- Follow component composition patterns

#### CSS Guidelines
- Use Tailwind CSS classes
- Follow mobile-first approach
- Use semantic class names
- Avoid inline styles

### Testing

#### Unit Tests
```bash
npm run test
```

#### Integration Tests
```bash
npm run test:integration
```

#### E2E Tests
```bash
npm run test:e2e
```

### Code Quality

#### Linting
```bash
npm run lint
npm run lint:fix
```

#### Type Checking
```bash
npm run type-check
```

#### Formatting
```bash
npm run format
```

## Contribution Guidelines

### Feature Development

1. **Create Issue**
   - Describe the feature clearly
   - Provide use cases
   - Include mockups if applicable

2. **Development Process**
   - Create feature branch
   - Implement changes
   - Add tests
   - Update documentation

3. **Code Review**
   - Create pull request
   - Address feedback
   - Ensure CI passes

### Bug Fixes

1. **Report Bug**
   - Use bug report template
   - Include reproduction steps
   - Provide environment details

2. **Fix Process**
   - Create bugfix branch
   - Implement fix
   - Add regression tests
   - Update documentation

### Documentation

1. **Types of Documentation**
   - API documentation
   - User guides
   - Developer guides
   - Architecture docs

2. **Documentation Standards**
   - Clear and concise
   - Include examples
   - Keep up to date
   - Use proper formatting

## Project Structure

### Frontend Structure
```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin-specific components
│   ├── dashboard/      # Dashboard components
│   ├── strategy/       # Strategic insights components
│   └── ui/             # Base UI components
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── pages/              # Page components
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

### Backend Structure
```
supabase/
├── functions/          # Edge functions
├── migrations/         # Database migrations
└── config.toml         # Supabase configuration
```

## Architecture Guidelines

### Component Design

1. **Single Responsibility**
   - Each component has one purpose
   - Separate concerns properly
   - Use composition over inheritance

2. **Props Interface**
   - Define clear TypeScript interfaces
   - Use optional props appropriately
   - Provide default values

3. **State Management**
   - Use local state when possible
   - Implement proper state lifting
   - Use context for global state

### Hook Design

1. **Custom Hooks**
   - Encapsulate stateful logic
   - Return consistent interface
   - Handle cleanup properly

2. **Data Fetching**
   - Use TanStack Query
   - Implement proper caching
   - Handle loading states

### Database Design

1. **Schema Design**
   - Normalize data appropriately
   - Use proper constraints
   - Implement RLS policies

2. **Performance**
   - Add necessary indexes
   - Optimize queries
   - Use appropriate data types

## Security Guidelines

### Frontend Security

1. **Input Validation**
   - Validate all user inputs
   - Sanitize data properly
   - Use TypeScript for type safety

2. **Authentication**
   - Use Supabase Auth properly
   - Implement route protection
   - Handle session management

### Backend Security

1. **Database Security**
   - Implement RLS policies
   - Use proper permissions
   - Validate all inputs

2. **API Security**
   - Rate limit endpoints
   - Validate JWT tokens
   - Sanitize outputs

## Performance Guidelines

### Frontend Performance

1. **Bundle Optimization**
   - Implement code splitting
   - Use lazy loading
   - Optimize bundle size

2. **Runtime Performance**
   - Use React.memo appropriately
   - Implement proper memoization
   - Avoid unnecessary re-renders

### Backend Performance

1. **Database Performance**
   - Use appropriate indexes
   - Optimize queries
   - Implement connection pooling

2. **Edge Functions**
   - Optimize cold starts
   - Use proper caching
   - Minimize dependencies

## Review Process

### Pull Request Guidelines

1. **PR Description**
   - Clear description of changes
   - Link to relevant issues
   - Include testing instructions

2. **Code Review Checklist**
   - Functionality works as expected
   - Code follows style guidelines
   - Tests are comprehensive
   - Documentation is updated

### Review Criteria

1. **Code Quality**
   - Readability and maintainability
   - Proper error handling
   - Performance considerations

2. **Testing**
   - Unit tests coverage
   - Integration tests
   - Manual testing results

## Getting Help

### Resources

- [Project Documentation](docs/)
- [Supabase Documentation](https://supabase.io/docs)
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

### Community

- GitHub Issues for bug reports
- GitHub Discussions for questions
- Discord community (if available)
- Email support for urgent issues

## License

By contributing to GhostFunnel, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation
- Special recognition for significant contributions

Thank you for contributing to GhostFunnel! 🚀
