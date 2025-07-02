# Admin Settings Functionality

This document describes the admin settings functionality that has been implemented for the BASA application.

## Overview

The admin settings system provides a comprehensive configuration management interface for administrators to control various aspects of the BASA application, including organization information, system settings, security configurations, notifications, integrations, and appearance settings.

## Features

### 1. Organization Information
- Organization name, contact email, phone number
- Website URL and physical address
- Organization description

### 2. System Settings
- Maintenance mode toggle
- Auto-approve members setting
- Email notifications toggle

### 3. Security Settings
- Two-factor authentication requirement
- Session timeout configuration
- Password policy enforcement
- IP address restrictions
- API rate limiting

### 4. Notification Settings
- New member registration notifications
- Payment notifications
- Event registration notifications
- System alerts
- Admin email recipients

### 5. Integration Settings
- Stripe payment gateway configuration
- SMTP email service settings
- Google Analytics integration
- Google Tag Manager integration

### 6. Appearance Settings
- Logo and favicon URLs
- Primary and secondary color customization
- Display toggles for member count, event calendar, and testimonials

### 7. Admin User Management
- Create, edit, and delete admin users
- Role-based access control (Admin, Super Admin)
- User activation/deactivation
- Password management

## Database Schema

### Settings Model
```prisma
model Settings {
  id                    String   @id @default(cuid())
  
  // Organization Information
  organizationName      String   @default("BASA - Business Association of San Antonio")
  contactEmail          String   @default("admin@basa.org")
  phoneNumber           String?
  website               String   @default("https://basa.org")
  address               String?
  description           String?  @db.Text
  
  // System Settings
  maintenanceMode       Boolean  @default(false)
  autoApproveMembers    Boolean  @default(false)
  emailNotifications    Boolean  @default(true)
  
  // Security Settings
  requireTwoFactor      Boolean  @default(true)
  sessionTimeout        Int      @default(30)
  enforcePasswordPolicy Boolean  @default(true)
  allowedIpAddresses    String?
  apiRateLimit          Int      @default(100)
  
  // Notification Settings
  notifyNewMembers      Boolean  @default(true)
  notifyPayments        Boolean  @default(true)
  notifyEventRegistrations Boolean @default(true)
  notifySystemAlerts    Boolean  @default(true)
  adminEmails           String?  @db.Text
  
  // Integration Settings
  stripePublicKey       String?
  stripeSecretKey       String?
  stripeTestMode        Boolean  @default(true)
  smtpHost              String?
  smtpPort              Int?
  smtpUsername          String?
  smtpPassword          String?
  googleAnalyticsId     String?
  googleTagManagerId    String?
  
  // Appearance Settings
  logoUrl               String?
  faviconUrl            String?
  primaryColor          String   @default("#1e40af")
  secondaryColor        String   @default("#059669")
  showMemberCount       Boolean  @default(true)
  showEventCalendar     Boolean  @default(true)
  showTestimonials      Boolean  @default(true)
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

## API Endpoints

### Settings Management
- `GET /api/settings` - Retrieve all settings
- `PUT /api/settings` - Update settings

### Admin User Management
- `GET /api/admin/users` - Get all admin users
- `POST /api/admin/users` - Create new admin user
- `GET /api/admin/users/[id]` - Get specific admin user
- `PUT /api/admin/users/[id]` - Update admin user
- `DELETE /api/admin/users/[id]` - Delete admin user

## Components

### SettingsForm
The main settings form component that provides the tabbed interface for all settings categories.

### AdminUsersManager
A component for managing admin users with CRUD operations.

## Hooks

### useSettings
Custom hook for managing settings state and API calls.

### useAdminUsers
Custom hook for managing admin users state and API calls.

## Utility Functions

### getSettings()
Retrieves settings from the database or creates default settings if none exist.

### isMaintenanceMode()
Checks if maintenance mode is enabled.

### shouldAutoApproveMembers()
Checks if new members should be auto-approved.

### getAdminEmails()
Returns an array of admin email addresses for notifications.

### getStripeConfig()
Returns Stripe configuration settings.

### getSmtpConfig()
Returns SMTP configuration settings.

### getAppearanceSettings()
Returns appearance-related settings.

## Security Features

1. **Role-based Access Control**: Only users with ADMIN role can access settings
2. **Audit Logging**: All settings changes are logged in the AuditLog table
3. **Password Security**: Admin user passwords are hashed using bcrypt
4. **Session Management**: Configurable session timeouts
5. **IP Restrictions**: Optional IP address whitelisting
6. **API Rate Limiting**: Configurable rate limits for API endpoints

## Usage

### Accessing Settings
Navigate to `/admin/settings` to access the admin settings interface.

### Default Settings
Default settings are automatically created when the application starts or when the database is seeded.

### Settings Persistence
All settings are stored in the database and persist across application restarts.

## Migration

The settings functionality requires a database migration to add the Settings table:

```bash
npx prisma migrate dev --name add_settings_model
```

## Seeding

Default settings are created during the seeding process:

```bash
npm run db:seed
```

## Environment Variables

The following environment variables are used for admin user creation during seeding:

- `ADMIN1_EMAIL` - First admin email
- `ADMIN1_PASSWORD` - First admin password
- `ADMIN1_FIRST_NAME` - First admin first name
- `ADMIN1_LAST_NAME` - First admin last name
- `ADMIN2_EMAIL` - Second admin email
- `ADMIN2_PASSWORD` - Second admin password
- `ADMIN2_FIRST_NAME` - Second admin first name
- `ADMIN2_LAST_NAME` - Second admin last name

## Future Enhancements

1. **Settings Validation**: Add comprehensive validation for all settings
2. **Settings Import/Export**: Allow importing and exporting settings
3. **Settings History**: Track settings changes over time
4. **Settings Templates**: Pre-configured settings templates for different use cases
5. **Real-time Updates**: WebSocket integration for real-time settings updates
6. **Settings API**: Public API for accessing non-sensitive settings
7. **Settings Backup**: Automated backup of settings configuration 