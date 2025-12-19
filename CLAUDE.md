# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BASA (Business Association of San Antonio) is a full-stack web application for membership management, events, and business networking. Built with Next.js 15 App Router, TypeScript, PostgreSQL/Prisma, and Stripe integration.

## Development Commands

```bash
# Development
pnpm dev                    # Start dev server (binds to 0.0.0.0)
pnpm build                  # Production build (runs type-check & lint first)
pnpm check                  # Type-check + lint only

# Database (Prisma)
pnpm db:generate            # Generate Prisma client
pnpm db:migrate             # Run migrations (dev)
pnpm db:seed                # Seed database
pnpm db:studio              # Open Prisma Studio

# Testing
pnpm test                   # Integration tests (Testcontainers)
pnpm test:unit              # Unit tests only
pnpm test:integration       # Integration tests with Testcontainers
pnpm cypress:open           # Open Cypress for E2E

# Docker (required for deployment)
docker compose -f docker-compose.dev.yml up    # Development environment
docker compose -f docker-compose.prod.yml up   # Production environment
```

## Architecture

### Directory Structure
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components organized by domain (admin, auth, dashboard, events, forms, layout, marketing, members, membership, payments, ui)
- `src/lib/` - Core utilities and configurations
- `src/hooks/` - Custom React hooks (use-auth, use-events, use-members, use-payments, use-profile, use-settings)
- `prisma/` - Database schema and migrations

### Key Libraries (src/lib/)
- `auth.ts` - NextAuth.js v5 configuration with Google OAuth and credentials providers
- `db.ts` - Prisma client singleton (exports `prisma` and `db`)
- `store.ts` - Zustand store for client-side state (user, UI, events)
- `stripe.ts` - Stripe payment integration
- `basa-emails.ts` - Email templates and Mailgun integration
- `validations.ts` - Zod validation schemas

### API Routes Pattern
API routes are in `src/app/api/`. Key domains:
- `/api/auth/` - Authentication (NextAuth, password reset, verification)
- `/api/members/` - Member CRUD, bulk upload, export
- `/api/events/` - Event management and registration
- `/api/payments/` - Stripe payments and webhooks
- `/api/content/` - Blog posts, testimonials, resources
- `/api/admin/` - Admin-only operations
- `/api/dev/` - Development tools (email preview, database inspection)

### Database Schema
Key models in `prisma/schema.prisma`:
- User/Member - User accounts with membership details
- Event/EventRegistration - Events with ticketing
- Payment - Stripe payment records
- BlogPost, Testimonial, Resource - Content management
- Settings - Application configuration

### Component Organization
UI components use shadcn/ui (in `src/components/ui/`). Domain components are colocated:
- `components/admin/` - Admin dashboard components
- `components/auth/` - Sign-in, sign-up forms
- `components/events/` - Event cards, calendars, registration
- `components/membership/` - Tier selection, payment forms

### State Management
- Server state: Direct Prisma queries in API routes and Server Components
- Client state: Zustand store (`useAppStore`, `useUser`, `useUI`, `useEvents` hooks)
- Forms: React Hook Form with Zod validation

## Testing

Integration tests use Testcontainers for isolated PostgreSQL instances:
- Tests in `src/__tests__/integration/` use `jest.config.testcontainers.js`
- Unit tests in `src/__tests__/unit/` use `jest.config.js`
- Test setup helpers in `src/__tests__/integration/helpers/`

## Path Alias

Use `@/` for imports from `src/`:
```typescript
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
```
