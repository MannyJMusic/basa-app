# Getting Started

Welcome to BASA! This guide will help you set up your development environment and get the application running locally.

## 📋 Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **pnpm** - Package manager (install with `npm install -g pnpm`)
- **PostgreSQL** - Database (local or cloud)
- **Git** - Version control

## 🚀 Quick Setup

### 1. Clone the Repository

```bash
git clone https://github.com/MannyJMusic/basa-app.git
cd basa-app
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Configuration

```bash
# Copy the environment template
cp .env.example .env.local

# Edit .env.local with your configuration
# See Environment Setup for detailed instructions
```

**Required Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Authentication secret
- `STRIPE_SECRET_KEY` - Stripe payment processing
- `MAILGUN_API_KEY` - Email service
- `MAILGUN_DOMAIN` - Email domain

### 4. Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Seed the database with initial data
pnpm db:seed
```

### 5. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Detailed Setup

### Environment Variables

The `.env.example` file contains all available environment variables with detailed comments. Key sections include:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/basa_db"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Stripe Payment Processing
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email Service (Mailgun)
MAILGUN_API_KEY="key-..."
MAILGUN_DOMAIN="your-domain.com"
MAILGUN_FROM_EMAIL="noreply@your-domain.com"

# Optional: Error Tracking
SENTRY_DSN="https://..."
```

### Database Configuration

BASA uses PostgreSQL with Prisma ORM. Key models include:

- **User** - Member accounts and authentication
- **Event** - Event management and registration
- **Membership** - Membership tiers and subscriptions
- **Content** - Blog posts, resources, testimonials
- **Payment** - Payment records and receipts

### External Services Setup

#### Stripe (Payments)
1. Create a [Stripe account](https://stripe.com/)
2. Get your API keys from the dashboard
3. Set up webhook endpoints
4. Configure in your `.env.local`

#### Mailgun (Email)
1. Create a [Mailgun account](https://www.mailgun.com/)
2. Add your domain
3. Get your API key
4. Configure in your `.env.local`

## 🧪 Testing Your Setup

### Development Tools
Visit `/dev` for interactive development tools:
- UI component demos
- Email testing utilities
- Debug tools
- Technology stack showcase

### Basic Tests
```bash
# Run unit tests
pnpm test

# Run end-to-end tests
pnpm cypress:open

# Test email functionality
pnpm email:test
```

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
- Verify PostgreSQL is running
- Check `DATABASE_URL` format
- Ensure database exists

**Authentication Issues**
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your setup

**Email Not Sending**
- Verify Mailgun credentials
- Check domain verification
- Test with development tools

**Payment Processing Issues**
- Verify Stripe keys are correct
- Check webhook configuration
- Use test mode for development

### Getting Help

1. Check the [Developer Tools](Developer-Tools) for debugging utilities
2. Review the [Technology Stack](Technology-Stack) documentation
3. Contact the development team

## 📚 Next Steps

Once you have the application running:

1. **[Technology Stack](Technology-Stack)** - Understand the codebase architecture
2. **[Developer Tools](Developer-Tools)** - Explore development utilities
3. **[Design System](Design-System)** - Learn about UI/UX guidelines
4. **[Email System](Email-System)** - Understand email functionality

## 🔄 Development Workflow

### Daily Development
```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Check code quality
pnpm lint
pnpm type-check
```

### Database Changes
```bash
# After schema changes
pnpm db:generate
pnpm db:migrate

# Reset database (development only)
pnpm db:reset
```

### Email Development
```bash
# Test email templates
pnpm email:preview

# Send test emails
pnpm email:test
```

---

**Need help?** Check the [Developer Tools](Developer-Tools) or contact the team! 