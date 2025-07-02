# BASA (Business Association of San Antonio) - Web Application

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

## 📚 Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to database
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed database
pnpm db:studio        # Open Prisma Studio

# Testing
pnpm test             # Run Jest tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage
pnpm cypress:open     # Open Cypress
pnpm cypress:run      # Run Cypress tests
pnpm e2e              # Run end-to-end tests

# Code Quality
pnpm lint             # Run ESLint
pnpm type-check       # Run TypeScript type checking
pnpm check            # Run lint + type check

# Email & Webhooks
pnpm email:test       # Test email functionality
pnpm email:quick      # Quick email test
pnpm webhook:test     # Test webhooks
pnpm email:preview    # Preview email templates

# Development Tools
pnpm setup:dev        # Setup development environment
```

## 🏗️ Project Structure

```
basa-app/
├── docs/                     # Documentation files
├── prisma/                   # Database schema and migrations
├── public/                   # Static assets
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── api/             # API routes
│   │   ├── admin/           # Admin dashboard
│   │   ├── auth/            # Authentication pages
│   │   ├── dashboard/       # Member dashboard
│   │   └── ...
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── admin/          # Admin-specific components
│   │   ├── auth/           # Authentication components
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and configurations
│   └── styles/             # Global styles
├── mail-templates/          # Email templates (Nunjucks)
├── scripts/                # Utility scripts
└── cypress/                # End-to-end tests
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file by copying the example:

```bash
cp .env.example .env.local
```

The `.env.example` file contains all available environment variables with detailed comments and setup instructions. Key variables include:

```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Mailgun
MAILGUN_API_KEY="key-..."
MAILGUN_DOMAIN="your-domain.com"
MAILGUN_FROM_EMAIL="noreply@your-domain.com"

# Sentry (Optional)
SENTRY_DSN="https://..."
```

**See `.env.example` for complete list of variables and setup instructions.**

### Database Configuration

The application uses Prisma ORM with PostgreSQL. Key models include:

- **User**: Member accounts and authentication
- **Event**: Event management and registration
- **Membership**: Membership tiers and subscriptions
- **Content**: Blog posts, resources, testimonials
- **Payment**: Payment records and receipts

## 🧪 Testing & Development Tools

### Unit Tests
```bash
pnpm test
```

### End-to-End Tests
```bash
pnpm cypress:open
```

### Development Tools
Visit `/dev` for a comprehensive collection of development and testing tools:

- **UI Components Demo** - Interactive loading states and animations
- **Technology Stack Demo** - Complete technology showcase
- **Email Testing** - Preview templates and test delivery
- **Debug Tools** - Database, session, and user debugging
- **Sentry Testing** - Error tracking and monitoring tests
- **Webhook Testing** - Test webhook endpoints

### Email Testing
```bash
# Test email delivery
pnpm email:test

# Quick email test
pnpm email:quick

# Preview email templates
pnpm email:preview
```

## 🚀 Deployment

### Docker Deployment
```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose -f docker-compose.prod.yml up
```

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 📖 Documentation

Comprehensive documentation is available in the `docs/` directory:

**[📚 View All Documentation](./docs/README.md)** - Complete documentation index

### Key Documentation:
- [Technology Stack](./docs/TECH_STACK.md) - Detailed tech stack overview
- [Developer Control Panel](./docs/DEVELOPER_CONTROL_PANEL.md) - Development tools
- [Design System](./docs/BASA_DESIGN_SYSTEM.md) - UI/UX guidelines
- [Email System](./docs/BASA_EMAIL_SYSTEM.md) - Email functionality
- [Stripe Setup](./docs/STRIPE_SETUP.md) - Payment processing setup
- [Docker Setup](./docs/DOCKER.md) - Containerization guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software for the Business Association of San Antonio.

## 🆘 Support

For support and questions:
- Check the documentation in the `docs/` directory
- Review the [Developer Control Panel](./docs/DEVELOPER_CONTROL_PANEL.md)
- Contact the development team

---

**Built with ❤️ for the Business Association of San Antonio**
