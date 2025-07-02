# Developer Tools

BASA includes a comprehensive set of development tools to help you build, test, and debug the application efficiently.

## 🎯 Dev Tools Dashboard

Visit `/dev` in your browser to access the interactive development tools dashboard. This centralized hub provides access to all development utilities.

### Dashboard Features
- **Quick Navigation** - Easy access to all tools
- **Status Indicators** - System health and configuration status
- **Interactive Demos** - Live component and feature demonstrations
- **Debug Utilities** - Database, session, and API debugging tools

## 🧪 Testing Tools

### Unit Testing
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test -- src/components/Button.test.tsx
```

### End-to-End Testing
```bash
# Open Cypress test runner
pnpm cypress:open

# Run Cypress tests headlessly
pnpm cypress:run

# Run E2E tests
pnpm e2e
```

### Component Testing
- **React Testing Library** - Component behavior testing
- **Jest** - Unit and integration testing
- **Cypress** - End-to-end user flow testing

## 📧 Email Testing

### Email Preview
```bash
# Preview email templates
pnpm email:preview

# Test email delivery
pnpm email:test

# Quick email test
pnpm email:quick
```

### Email Development Tools
- **Template Preview** - Visual email template testing
- **Delivery Testing** - Send test emails to verify delivery
- **Template Editor** - Live template editing and preview
- **Mailgun Integration** - Direct Mailgun API testing

## 🔍 Debug Tools

### Database Debugging
Visit `/api/dev/debug-db` for database debugging tools:
- **Database Connection Test** - Verify database connectivity
- **Schema Validation** - Check database schema integrity
- **Query Testing** - Test database queries
- **Migration Status** - Check migration history

### Session Debugging
Visit `/api/dev/debug-session` for session debugging:
- **Session Information** - View current session data
- **Authentication Status** - Check user authentication
- **Token Validation** - Verify JWT tokens
- **Provider Testing** - Test authentication providers

### User Debugging
Visit `/api/dev/debug-users` for user management debugging:
- **User List** - View all users in the system
- **User Details** - Detailed user information
- **Permission Testing** - Test user permissions
- **Account Status** - Check account verification status

## 🎨 UI Component Demos

### Loading Demo
Visit `/dev/loading-demo` for interactive loading state demonstrations:
- **Skeleton Loaders** - Various skeleton loading patterns
- **Spinner Animations** - Different loading animations
- **Progress Indicators** - Progress bar and step indicators
- **Loading States** - Component loading state examples

### Technology Stack Demo
Visit `/dev/tech-demo` for technology showcase:
- **Component Library** - shadcn/ui component showcase
- **Animation Examples** - Framer Motion demonstrations
- **Responsive Design** - Mobile and desktop layouts
- **Interactive Elements** - Form and UI interactions

## 🔧 API Testing

### Webhook Testing
```bash
# Test webhook endpoints
pnpm webhook:test

# Test Stripe webhooks
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type": "payment_intent.succeeded"}'
```

### API Endpoint Testing
- **Health Check** - `/api/health`
- **Database Debug** - `/api/dev/debug-db`
- **Session Debug** - `/api/dev/debug-session`
- **User Debug** - `/api/dev/debug-users`

## 🗄️ Database Tools

### Prisma Studio
```bash
# Open Prisma Studio
pnpm db:studio
```
Access the database GUI at `http://localhost:5555`

### Database Commands
```bash
# Generate Prisma client
pnpm db:generate

# Push schema changes
pnpm db:push

# Run migrations
pnpm db:migrate

# Reset database (development only)
pnpm db:reset

# Seed database
pnpm db:seed
```

### Migration Tools
- **Migration History** - View applied migrations
- **Schema Diff** - Compare schema changes
- **Migration Testing** - Test migrations before applying
- **Rollback Support** - Revert migrations if needed

## 🐛 Error Tracking

### Sentry Integration
Visit `/dev/sentry-example-page` for Sentry testing:
- **Error Simulation** - Test error tracking
- **Performance Monitoring** - Test performance tracking
- **User Feedback** - Test user feedback collection
- **Release Tracking** - Test release monitoring

### Error Testing
```bash
# Test Sentry error reporting
curl http://localhost:3000/api/dev/sentry-example-api
```

## 📊 Performance Tools

### Bundle Analysis
```bash
# Analyze bundle size
pnpm build
# Check .next/analyze for bundle reports
```

### Performance Monitoring
- **Core Web Vitals** - Performance metrics
- **Lighthouse Scores** - Performance auditing
- **Memory Usage** - Application memory monitoring
- **Database Performance** - Query performance analysis

## 🔒 Security Testing

### Authentication Testing
- **Provider Testing** - Test OAuth providers
- **Session Validation** - Test session security
- **Permission Testing** - Test role-based access
- **CSRF Protection** - Test CSRF prevention

### Input Validation
- **Form Validation** - Test form input validation
- **API Validation** - Test API endpoint validation
- **XSS Prevention** - Test cross-site scripting protection
- **SQL Injection** - Test database injection prevention

## 🚀 Development Workflow

### Daily Development Commands
```bash
# Start development server
pnpm dev

# Run linting
pnpm lint

# Type checking
pnpm type-check

# Full code quality check
pnpm check
```

### Code Quality Tools
- **ESLint** - Code linting and standards
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **Husky** - Git hooks for quality

## 📱 Mobile Testing

### Responsive Design Testing
- **Browser DevTools** - Mobile device simulation
- **Touch Testing** - Touch interaction testing
- **Performance Testing** - Mobile performance analysis
- **Accessibility Testing** - Screen reader compatibility

## 🔄 Continuous Integration

### Pre-commit Hooks
- **Code Formatting** - Automatic Prettier formatting
- **Linting** - ESLint checks before commit
- **Type Checking** - TypeScript validation
- **Test Running** - Automated test execution

### CI/CD Pipeline
- **Automated Testing** - Run tests on every push
- **Code Quality** - Automated code quality checks
- **Deployment** - Automated deployment to staging
- **Monitoring** - Automated performance monitoring

## 📚 Documentation Tools

### Code Documentation
- **JSDoc** - Function and component documentation
- **TypeScript** - Type documentation
- **README Files** - Component and feature documentation
- **API Documentation** - Endpoint documentation

### Living Documentation
- **Storybook** - Component documentation (if configured)
- **API Examples** - Live API documentation
- **Code Examples** - Working code examples
- **Tutorials** - Step-by-step guides

---

**Need help with a specific tool?** Check the relevant documentation or contact the development team! 