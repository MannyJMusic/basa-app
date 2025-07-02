# Email From Name Setup

This document explains how to configure and use the "from name" feature for BASA emails.

## Environment Variables

Add the following environment variable to your `.env` file:

```bash
FROM_NAME="BASA - Business Association of San Antonio"
```

If `FROM_NAME` is not set, it will default to "BASA".

## How It Works

The from name feature allows you to customize the sender name that appears in email clients. Instead of just showing the email address, recipients will see:

```
BASA - Business Association of San Antonio <noreply@your-domain.com>
```

## Usage in Code

### Email Functions

All email functions now accept an optional `fromName` parameter:

```typescript
import { sendWelcomeEmail } from '@/lib/basa-emails'

// Use default from name (FROM_NAME env var or "BASA")
await sendWelcomeEmail(email, firstName, activationUrl)

// Use custom from name
await sendWelcomeEmail(email, firstName, activationUrl, {
  fromName: "BASA Events Team"
})
```

### Email Preview Page

The email preview page (`/dev/email-preview`) now includes a "From Name" field where you can test different sender names.

## Supported Email Functions

The following email functions support the `fromName` option:

- `sendWelcomeEmail()`
- `sendPasswordResetEmail()`
- `sendEventInvitationEmail()`
- `sendPaymentReceiptEmail()`
- `sendMembershipInvitationEmail()`

## Email Client Compatibility

The from name format `"Display Name <email@domain.com>"` is supported by all major email clients:

- Gmail
- Outlook
- Apple Mail
- Thunderbird
- Mobile email apps

## Testing

1. Set the `FROM_NAME` environment variable
2. Use the email preview page to test different from names
3. Check that emails are received with the correct sender name
4. Verify the format appears correctly in different email clients

## Troubleshooting

If emails are not showing the from name:

1. Check that `FROM_NAME` is set in your environment variables
2. Verify the email function is passing the `fromName` option
3. Test with the email preview page to ensure the feature is working
4. Check Mailgun logs for any delivery issues 