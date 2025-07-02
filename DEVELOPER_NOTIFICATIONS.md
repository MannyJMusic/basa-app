# Developer Notifications System

This document describes the developer notification system implemented for the BASA application to help developers track email sending and payment processing in the development environment.

## Overview

The developer notification system provides real-time feedback and debugging information for email sending and payment processing. It only appears in the development environment (`NODE_ENV=development`) and helps developers verify that emails are being sent correctly during payment completion.

## Components

### 1. DevBanner (`src/components/ui/dev-banner.tsx`)

A banner that appears at the top of pages in development mode, providing quick access to debugging tools.

**Features:**
- Shows on payment success and membership join pages
- Provides direct links to email preview and webhook testing tools
- Can be dismissed by the user
- Page-specific information and links

### 2. DevNotifications (`src/components/ui/dev-notifications.tsx`)

A comprehensive notification panel that shows detailed information about email sending status.

**Features:**
- Payment details (ID, customer info, amount)
- Email notification status (welcome, receipt, invitations)
- Additional member information
- Debug actions (check email status, send test emails)
- Environment information
- Copy-to-clipboard functionality for payment IDs

### 3. DevEmailLogger (`src/components/ui/dev-email-logger.tsx`)

A real-time email log viewer that simulates and displays email sending events.

**Features:**
- Real-time email logs
- Email status tracking (success, failed, attempting)
- Test log generation
- Scrollable log history
- Environment information

### 4. Email Status API (`src/app/api/dev/email-status/route.ts`)

A development-only API endpoint for checking and simulating email status.

**Endpoints:**
- `GET /api/dev/email-status` - Check email status for a payment
- `POST /api/dev/email-status` - Simulate sending test emails

## Usage

### Payment Success Page

When a user completes a payment and reaches the success page, developers will see:

1. **DevBanner** at the top with payment-specific links
2. **DevNotifications** panel showing:
   - Payment details
   - Email notification status
   - Additional member information
   - Debug actions
3. **DevEmailLogger** showing real-time email logs

### Membership Join Page

During the membership registration process (Step 3), developers will see:

1. **DevBanner** at the top with membership-specific links
2. **DevNotifications** panel in the sidebar
3. **DevEmailLogger** in the sidebar

## Email Types Tracked

The system tracks the following email types:

1. **Welcome Email** - Sent to new users after payment
2. **Payment Receipt Email** - Sent to all users after payment
3. **Membership Invitation Email** - Sent to additional members

## Debug Actions

### Check Email Status
- Verifies if emails were sent for a specific payment
- Shows email history and status
- Displays Mailgun configuration status

### Send Test Emails
- Sends test welcome emails
- Sends test receipt emails
- Simulates email sending for debugging

### Email Preview
- Opens the email preview tool in a new tab
- Allows testing email templates with different data

### Test Webhooks
- Opens the webhook testing tool
- Allows testing Stripe webhook events

## Console Logging

The webhook handler includes enhanced console logging for development:

```javascript
console.log('🔔 PAYMENT SUCCEEDED:', paymentIntent.id)
console.log('📋 Payment metadata:', paymentIntent.metadata)
console.log('🚀 DEV MODE: Processing payment webhook')
console.log('📧 Email notifications will be sent for this payment')
```

## Environment Detection

The system automatically detects the environment using:

```javascript
process.env.NODE_ENV === 'development'
```

All developer notifications are automatically hidden in production.

## Configuration

### Required Environment Variables

For email status checking to work properly, ensure these are configured:

```env
NODE_ENV=development
MAILGUN_DOMAIN=your-mailgun-domain
MAILGUN_API_KEY=your-mailgun-api-key
NEXTAUTH_URL=http://localhost:3000
```

### Optional Features

- **Email Status API**: Only available in development
- **Test Email Sending**: Simulates email sending for debugging
- **Real-time Logs**: Shows email events as they occur

## Troubleshooting

### Emails Not Showing in Logs

1. Check that `NODE_ENV=development` is set
2. Verify the webhook is being triggered
3. Check browser console for webhook processing logs
4. Use the "Check Email Status" button to verify

### Payment ID Not Available

1. Ensure the payment was completed successfully
2. Check that the payment ID is being passed to the success page
3. Verify the webhook processed the payment

### Email Status API Errors

1. Check that the API endpoint is accessible
2. Verify required parameters (paymentId, email)
3. Check server logs for API errors

## Security

- All developer notifications are only shown in development mode
- No sensitive information is exposed in production
- API endpoints are protected by environment checks
- Payment IDs and emails are only logged in development

## Future Enhancements

Potential improvements to the system:

1. **Real-time WebSocket Updates**: Live email status updates
2. **Email Template Testing**: Test email templates with real data
3. **Webhook Event Simulation**: Simulate Stripe webhook events
4. **Email Delivery Tracking**: Track email delivery status
5. **Performance Metrics**: Email sending performance data

## Support

For issues with the developer notification system:

1. Check the browser console for errors
2. Verify environment variables are set correctly
3. Test email sending manually using the debug tools
4. Check server logs for webhook processing issues 