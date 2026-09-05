# BASA (Business Association of San Antonio) - Web Application

[![CI/CD Pipeline](https://github.com/MannyJMusic/basa-app/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/MannyJMusic/basa-app/actions/workflows/ci-cd.yml)
[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)



A modern, full-stack web application built for the Business Association of San Antonio, providing membership management, event organization, networking opportunities, and community engagement features.

## 🚀 Project Overview

BASA is a comprehensive business association platform that enables:

- **Member Management**: Registration, profiles, directory, and membership tiers
- **Event Management**: Event creation, registration, calendar, and ticketing
- **Networking**: Member directory, messaging, and community features
- **Content Management**: Blog posts, resources, testimonials, and newsletters
- **Payment Processing**: Stripe integration for memberships and event tickets
- **Email System**: Automated email notifications and newsletters via Mailgun
- **Admin Dashboard**: Comprehensive admin panel for managing all aspects

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI, Framer Motion
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js with multiple providers
- **Payments**: Stripe
- **Email**: Mailgun with Nunjucks templates
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **Testing**: Jest, Cypress
- **Deployment**: Docker, Vercel

## 📋 Prerequisites

- Node.js 18+ 
- pnpm package manager
- PostgreSQL database
- Stripe account (for payments)
- Mailgun account (for emails)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd basa-app
pnpm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your configuration
# See .env.example for all available variables and setup instructions
# Required variables:
# - DATABASE_URL
# - NEXTAUTH_SECRET
# - STRIPE_SECRET_KEY
# - MAILGUN_API_KEY
# - MAILGUN_DOMAIN
# TEST
```

### 3. Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Seed the database with initial data
pnpm db:seed
```

### 4. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Testing Setup (Optional)

For comprehensive testing with Testcontainers Cloud:

```bash
# Run integration tests (needs Docker running locally)
pnpm test:integration
```

See [`docs/TESTING.md`](./docs/TESTING.md) for running a single test file and what CI does and does not run.

## 📚 Quick Reference

### Essential Commands
```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm test             # Run tests
pnpm db:migrate       # Run database migrations
pnpm db:seed          # Seed database
```

### Development Tools
Visit `/dev` for interactive development tools and demos.

## 📖 Documentation

BASA uses a dual documentation system for optimal organization:

### 🌐 [GitHub Wiki](https://github.com/MannyJMusic/basa-app/wiki) - User & Community Documentation
- **[🏠 Home](https://github.com/MannyJMusic/basa-app/wiki/Home)** - Project overview and getting started
- **[🚀 Getting Started](https://github.com/MannyJMusic/basa-app/wiki/Getting-Started)** - Quick setup guide
- **[🤝 Contributing](https://github.com/MannyJMusic/basa-app/wiki/Contributing)** - How to contribute to BASA
- **[👥 Project Overview](https://github.com/MannyJMusic/basa-app/wiki/Project-Overview)** - Features and capabilities
- **[🛠️ Developer Tools](https://github.com/MannyJMusic/basa-app/wiki/Developer-Tools)** - Development utilities
- **[⚙️ Environment Setup](https://github.com/MannyJMusic/basa-app/wiki/Environment-Setup)** - Development environment
- **[📋 License Information](https://github.com/MannyJMusic/basa-app/wiki/License-Information)** - Usage terms

### 📚 [Technical Documentation](./docs/README.md) - Developer & Setup Guides
- **[🚀 Deployment](./docs/DEPLOYMENT.md)** - CI/CD, the production host, troubleshooting
- **[🎨 Design System](./docs/BASA_DESIGN_SYSTEM.md)** - UI/UX guidelines
- **[📧 Email](./docs/EMAIL.md)** - Mailgun configuration and email templates
- **[💳 Stripe](./docs/STRIPE.md)** - Payment processing and webhook testing
- **[🔧 Admin Settings](./docs/ADMIN_SETTINGS.md)** - Administrative features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International License**.

### What You Can Do:
- ✅ Use for educational purposes and learning
- ✅ Use for personal projects and portfolios  
- ✅ Use for non-profit organizations
- ✅ Use for community projects
- ✅ White label for non-commercial purposes
- ✅ Use as inspiration for similar projects

### What You Cannot Do:
- ❌ Use for commercial purposes or profit generation
- ❌ Use in for-profit businesses or SaaS platforms
- ❌ Resell or redistribute for profit

### Attribution Required:
When using this work, you must provide attribution to "Business Association of San Antonio (BASA)" in a reasonably discoverable way (footer, about page, source code comments, etc.).

**Full License**: [LICENSE](./LICENSE)  
**License URL**: https://creativecommons.org/licenses/by-nc/4.0/

For commercial licensing inquiries, please contact BASA.

## 🆘 Support

For support and questions:
- **📖 Check the [GitHub Wiki](https://github.com/MannyJMusic/basa-app/wiki)** - User guides and community documentation
- **🔧 Review the [Technical Documentation](./docs/README.md)** - Developer guides and setup instructions
- **📧 Contact the development team** - For additional support

---

**Built with ❤️ for the Business Association of San Antonio**
