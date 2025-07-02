# Environment Setup

This guide covers the complete environment configuration for BASA, including all required environment variables and external service setup.

## 📋 Prerequisites

Before setting up your environment, ensure you have:

- **Node.js 18+** installed
- **pnpm** package manager installed
- **PostgreSQL** database (local or cloud)
- **Git** for version control

## 🔧 Environment Configuration

### 1. Copy Environment Template

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit the environment file with your configuration
nano .env.local
# or
code .env.local
```

### 2. Required Environment Variables

The following variables are **required** for basic functionality:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/basa_db"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Stripe Payment Processing
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email Service (Mailgun)
MAILGUN_API_KEY="key-..."
MAILGUN_DOMAIN="your-domain.com"
MAILGUN_FROM_EMAIL="noreply@your-domain.com"
```

## 🗄️ Database Configuration

### PostgreSQL Setup

#### Local PostgreSQL

```bash
# Install PostgreSQL (macOS with Homebrew)
brew install postgresql
brew services start postgresql

# Create database
createdb basa_db

# Or using psql
psql postgres
CREATE DATABASE basa_db;
\q
```

#### Cloud PostgreSQL (Recommended)

**Supabase (Free Tier)**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your connection string from Settings > Database
4. Use the connection string in your `DATABASE_URL`

**Railway**
1. Go to [railway.app](https://railway.app)
2. Create a new PostgreSQL service
3. Copy the connection string to your `DATABASE_URL`

**Neon**
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Get your connection string from the dashboard

### Database URL Format

```env
# Local PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/basa_db"

# Cloud PostgreSQL (example)
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
```

## 🔐 Authentication Configuration

### NextAuth.js Setup

```env
# Generate a secure secret
NEXTAUTH_SECRET="your-32-character-secret-here"

# Development URL
NEXTAUTH_URL="http://localhost:3000"

# Production URL (when deploying)
# NEXTAUTH_URL="https://your-domain.com"
```

### Generating a Secure Secret

```bash
# Generate a random secret
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### OAuth Providers (Optional)

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
```

## 💳 Stripe Configuration

### Stripe Account Setup

1. **Create Stripe Account**
   - Go to [stripe.com](https://stripe.com)
   - Sign up for a free account
   - Complete account verification

2. **Get API Keys**
   - Go to Developers > API keys
   - Copy your publishable and secret keys
   - Use test keys for development

3. **Configure Webhooks**
   - Go to Developers > Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `customer.subscription.created`, etc.

### Stripe Environment Variables

```env
# Test keys (development)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Live keys (production)
# STRIPE_SECRET_KEY="sk_live_..."
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Webhook secret (from webhook configuration)
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Stripe Test Cards

Use these test card numbers for development:

- **Visa**: `4242424242424242`
- **Mastercard**: `5555555555554444`
- **Declined**: `4000000000000002`
- **Requires Authentication**: `4000002500003155`

## 📧 Mailgun Configuration

### Mailgun Account Setup

1. **Create Mailgun Account**
   - Go to [mailgun.com](https://www.mailgun.com)
   - Sign up for a free account
   - Verify your email

2. **Add Domain**
   - Go to Sending > Domains
   - Add your domain or use the sandbox domain
   - Follow DNS setup instructions

3. **Get API Key**
   - Go to Settings > API keys
   - Copy your private API key

### Mailgun Environment Variables

```env
# API Configuration
MAILGUN_API_KEY="key-..."

# Domain Configuration
MAILGUN_DOMAIN="your-domain.com"
# or for testing: "sandbox123.mailgun.org"

# From Email Address
MAILGUN_FROM_EMAIL="noreply@your-domain.com"
MAILGUN_FROM_NAME="BASA"

# Optional: EU Region
# MAILGUN_REGION="eu"
```

### Mailgun Sandbox Domain

For development, you can use Mailgun's sandbox domain:

```env
MAILGUN_DOMAIN="sandbox123.mailgun.org"
MAILGUN_FROM_EMAIL="noreply@sandbox123.mailgun.org"
```

**Note**: With sandbox domain, you can only send to verified email addresses.

## 🔍 Error Tracking (Optional)

### Sentry Setup

```env
# Sentry DSN (optional)
SENTRY_DSN="https://..."

# Environment
SENTRY_ENVIRONMENT="development"
```

### Sentry Account Setup

1. **Create Sentry Account**
   - Go to [sentry.io](https://sentry.io)
   - Sign up for a free account
   - Create a new project

2. **Get DSN**
   - Copy the DSN from your project settings
   - Add it to your environment variables

## 🌐 Application Configuration

### Base Configuration

```env
# Application
NEXT_PUBLIC_APP_NAME="BASA"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Environment
NODE_ENV="development"

# Port (optional, defaults to 3000)
PORT=3000
```

### Feature Flags

```env
# Enable/disable features
NEXT_PUBLIC_ENABLE_ANALYTICS="false"
NEXT_PUBLIC_ENABLE_DEBUG="true"
NEXT_PUBLIC_ENABLE_EMAIL_PREVIEW="true"
```

## 🔒 Security Configuration

### Security Headers

```env
# Security
NEXT_PUBLIC_ENABLE_HTTPS="false"
NEXT_PUBLIC_CONTENT_SECURITY_POLICY="default-src 'self'"
```

### Rate Limiting

```env
# Rate limiting (optional)
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
```

## 📊 Analytics (Optional)

### Google Analytics

```env
# Google Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

### Vercel Analytics

```env
# Vercel Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID="your-analytics-id"
```

## 🧪 Testing Configuration

### Test Environment

```env
# Test database
TEST_DATABASE_URL="postgresql://username:password@localhost:5432/basa_test"

# Test Stripe keys
STRIPE_TEST_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY="pk_test_..."

# Test email
TEST_EMAIL="test@example.com"
```

## 🔄 Environment Management

### Development vs Production

Create separate environment files:

```bash
# Development
.env.local

# Production
.env.production

# Testing
.env.test
```

### Environment File Priority

Next.js loads environment files in this order:
1. `.env.local` (always loaded, ignored by git)
2. `.env.development` (development only)
3. `.env.production` (production only)
4. `.env` (always loaded)

### Environment Validation

Add environment validation to your application:

```typescript
// lib/env.ts
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'STRIPE_SECRET_KEY',
  'MAILGUN_API_KEY',
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

## 🚨 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check database connection
psql $DATABASE_URL

# Verify DATABASE_URL format
echo $DATABASE_URL
```

**Authentication Issues**
```bash
# Verify NEXTAUTH_SECRET is set
echo $NEXTAUTH_SECRET

# Check NEXTAUTH_URL
echo $NEXTAUTH_URL
```

**Stripe Issues**
```bash
# Test Stripe connection
curl -u $STRIPE_SECRET_KEY: https://api.stripe.com/v1/account
```

**Email Issues**
```bash
# Test Mailgun connection
curl -s --user "api:$MAILGUN_API_KEY" \
  https://api.mailgun.net/v3/$MAILGUN_DOMAIN/messages \
  -F from="$MAILGUN_FROM_EMAIL" \
  -F to="test@example.com" \
  -F subject="Test" \
  -F text="Test message"
```

### Environment Variable Debugging

```bash
# Check all environment variables
printenv | grep -E "(DATABASE|NEXTAUTH|STRIPE|MAILGUN)"

# Validate environment setup
node -e "
const required = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'STRIPE_SECRET_KEY', 'MAILGUN_API_KEY'];
required.forEach(key => {
  if (!process.env[key]) {
    console.error('Missing:', key);
  } else {
    console.log('✓', key);
  }
});
"
```

## 📚 Next Steps

After configuring your environment:

1. **[Database Setup](Database-Setup)** - Set up your database schema
2. **[Developer Tools](Developer-Tools)** - Test your configuration
3. **[Stripe Integration](Stripe-Integration)** - Configure payment processing
4. **[Email System](Email-System)** - Set up email functionality

---

**Need help?** Check the [Developer Tools](Developer-Tools) for debugging utilities! 