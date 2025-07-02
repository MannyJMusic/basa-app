# BASA Technology Stack Documentation

This document outlines the complete technology stack powering the BASA (Business Association of San Antonio) application, including implementation details and usage examples.

## 🚀 Core Technologies

### Next.js 15+ with App Router
- **Version**: 15.3.4
- **Features**: App Router, Server Components, Streaming, Suspense
- **Configuration**: `next.config.js` with Sentry integration
- **Benefits**: Optimal performance, SEO, and developer experience

### TypeScript
- **Version**: 5.3.3
- **Configuration**: `tsconfig.json` with strict mode enabled
- **Features**: Full type safety, IntelliSense, compile-time error checking
- **Path Aliases**: `@/*` → `./src/*`

### Tailwind CSS + shadcn/ui
- **Version**: 3.4.1
- **Configuration**: `tailwind.config.js` with custom design system
- **Components**: `components.json` configured for shadcn/ui
- **Features**: Utility-first CSS, responsive design, dark mode support

## 🎨 UI & Animation

### Framer Motion
- **Version**: 12.19.1
- **Location**: `src/components/ui/motion.tsx`
- **Features**:
  - Page transitions
  - Staggered animations
  - Hover effects
  - Loading spinners
  - Modal animations
  - Notification animations

#### Usage Examples:
```tsx
import { PageTransition, AnimatedCard, AnimatedButton } from '@/components/ui/motion'

// Page transition
<PageTransition>
  <YourPageContent />
</PageTransition>

// Animated card with hover effects
<AnimatedCard delay={0.2} index={0}>
  <CardContent>Your content</CardContent>
</AnimatedCard>

// Animated button
<AnimatedButton onClick={handleClick}>
  Click me
</AnimatedButton>
```

## 📝 Form Management

### React Hook Form + Zod
- **Versions**: 7.49.3 + 3.22.4
- **Location**: `src/hooks/use-form.ts`, `src/components/ui/enhanced-form.tsx`
- **Features**:
  - Type-safe form validation
  - Auto-save functionality
  - Field-level validation
  - Form state management
  - Error handling

#### Enhanced Form Usage:
```tsx
import { EnhancedForm, FormField } from '@/components/ui/enhanced-form'
import { z } from 'zod'

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
})

<EnhancedForm
  schema={formSchema}
  onSubmit={handleSubmit}
  autoSave={true}
  onAutoSave={handleAutoSave}
  showReset={true}
>
  <FormField
    name="name"
    label="Full Name"
    placeholder="Enter your name"
    required
  />
  <FormField
    name="email"
    label="Email"
    type="email"
    placeholder="Enter your email"
    required
  />
</EnhancedForm>
```

## 🗃️ State Management

### Zustand
- **Version**: 5.0.5
- **Location**: `src/lib/store.ts`
- **Features**:
  - Lightweight state management
  - Persistence with localStorage
  - Type-safe selectors
  - Modular state slices

#### Usage Examples:
```tsx
import { useUser, useUI, useEvents } from '@/lib/store'

// User state
const { user, setUser, logout } = useUser()

// UI state
const { sidebarOpen, toggleSidebar, addNotification } = useUI()

// Event state
const { savedEvents, toggleSavedEvent } = useEvents()
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm package manager
- PostgreSQL database

### Installation
```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

## 🎯 Best Practices

### TypeScript
- Use strict mode
- Define interfaces for all data structures
- Use type guards for runtime type checking
- Leverage utility types

### State Management
- Use Zustand for global state
- Keep state minimal and normalized
- Use selectors for derived state
- Implement persistence where appropriate

### Forms
- Always use Zod for validation
- Implement proper error handling
- Use React Hook Form for performance
- Add auto-save for better UX

### Animations
- Use Framer Motion for complex animations
- Keep animations subtle and purposeful
- Respect user preferences (reduced motion)
- Optimize for performance

## 🔍 Demo & Examples

Visit `/dev/tech-demo` to see a comprehensive demonstration of all technology stack features.

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Zustand Documentation](https://github.com/pmndrs/zustand) 