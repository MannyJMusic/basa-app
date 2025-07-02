# BASA Documentation

Welcome to the BASA (Business Association of San Antonio) documentation. This directory contains comprehensive documentation for all aspects of the application.

## 📚 Documentation Index

### 🚀 Getting Started
- **[Main README](../README.md)** - Project overview and quick start guide

### 🛠️ Development
- **[Technology Stack](./TECH_STACK.md)** - Complete technology stack overview
- **[Developer Control Panel](./DEVELOPER_CONTROL_PANEL.md)** - Development tools and utilities
- **[Developer Notifications](./DEVELOPER_NOTIFICATIONS.md)** - Notification system for developers

### 🎨 Design & UI
- **[Design System](./BASA_DESIGN_SYSTEM.md)** - UI/UX guidelines and design principles
- **[Design Improvements](./DESIGN_IMPROVEMENTS.md)** - Ongoing design enhancements and improvements

### 📧 Email System
- **[Email System Overview](./BASA_EMAIL_SYSTEM.md)** - Complete email functionality documentation
- **[Email Development Guide](./EMAIL_DEVELOPMENT_GUIDE.md)** - How to develop and test email templates
- **[Mailgun Setup](./MAILGUN_SETUP.md)** - Email service configuration and setup
- **[Email From Name Setup](./EMAIL_FROM_NAME_SETUP.md)** - Email sender configuration

### 💳 Payment Processing
- **[Stripe Setup](./STRIPE_SETUP.md)** - Payment processing configuration
- **[Stripe Webhook Testing](./STRIPE_WEBHOOK_TESTING.md)** - Webhook testing and debugging

### 🔧 Administration
- **[Admin Settings](./ADMIN_SETTINGS.md)** - Admin panel configuration and management

### 🐳 Deployment
- **[Docker Setup](./DOCKER.md)** - Containerization and deployment guide

### 🔍 Monitoring & Debugging
- **[Sentry Setup](./SENTRY_SETUP.md)** - Error tracking and monitoring configuration

### 🛠️ Development Tools
- **Dev Tools Dashboard** - Visit `/dev` for comprehensive development utilities
- **UI Component Demos** - Interactive showcases of loading states and animations
- **Debug APIs** - Database, session, and user debugging endpoints
- **Email Testing** - Template preview and delivery testing tools

## 📖 How to Use This Documentation

### For New Developers
1. Start with the [Main README](../README.md) for project overview
2. Review the [Technology Stack](./TECH_STACK.md) to understand the codebase
3. Follow the [Developer Control Panel](./DEVELOPER_CONTROL_PANEL.md) for setup
4. Visit `/dev` for development tools and testing utilities

### For Email Development
1. Read the [Email System Overview](./BASA_EMAIL_SYSTEM.md)
2. Follow the [Email Development Guide](./EMAIL_DEVELOPMENT_GUIDE.md)
3. Configure [Mailgun Setup](./MAILGUN_SETUP.md)

### For Payment Integration
1. Review [Stripe Setup](./STRIPE_SETUP.md)
2. Test with [Stripe Webhook Testing](./STRIPE_WEBHOOK_TESTING.md)

### For Design Work
1. Follow the [Design System](./BASA_DESIGN_SYSTEM.md)
2. Check [Design Improvements](./DESIGN_IMPROVEMENTS.md) for ongoing work

## 🔍 Quick Reference

### Common Commands
```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm test                   # Run tests

# Database
pnpm db:migrate            # Run database migrations
pnpm db:seed               # Seed database

# Email Testing
pnpm email:test            # Test email functionality
pnpm email:preview         # Preview email templates

# Webhook Testing
pnpm webhook:test          # Test webhooks
```

### Key Directories
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components
- `src/lib/` - Utility functions and configurations
- `mail-templates/` - Email templates (Nunjucks)
- `prisma/` - Database schema and migrations
- `docs/` - This documentation directory

### Environment Variables
```bash
# Copy the example file
cp .env.example .env.local
```

```env
# Required for development
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
STRIPE_SECRET_KEY="sk_..."
MAILGUN_API_KEY="key_..."
```

**See `.env.example` for complete setup instructions and all available variables.**

## 🤝 Contributing to Documentation

When updating documentation:

1. **Keep it current** - Update docs when changing functionality
2. **Be specific** - Include code examples and step-by-step instructions
3. **Use clear structure** - Organize with headers and sections
4. **Include links** - Cross-reference related documentation
5. **Test instructions** - Verify that setup steps work

## 📞 Support

For questions about the documentation or application:

- Check the [Developer Control Panel](./DEVELOPER_CONTROL_PANEL.md) for debugging tools
- Review the [Developer Notifications](./DEVELOPER_NOTIFICATIONS.md) for system updates
- Contact the development team

---

**Last Updated**: January 2025  
**Version**: 1.0.0 