# Email

Merges the former `BASA_EMAIL_SYSTEM.md`, `EMAIL_DEVELOPMENT_GUIDE.md`, `MAILGUN_SETUP.md`, and `EMAIL_FROM_NAME_SETUP.md`. All send/generate functions currently live in `src/lib/basa-emails.ts` (consolidating the other email modules there is tracked as #33).

## Environment variables

```bash
MAILGUN_API_KEY=key-...
MAILGUN_DOMAIN=mg.businessassociationsa.com
MAILGUN_FROM_EMAIL=noreply@businessassociationsa.com
FROM_NAME="BASA - Business Association of San Antonio"   # optional, defaults to "BASA"
```

Set these up in the [Mailgun dashboard](https://app.mailgun.com): add and verify the sending domain, add its DNS records (SPF, DKIM, MX), generate an API key.

## Templates and sending functions

All in `src/lib/basa-emails.ts`:

| Function | Sends |
|---|---|
| `sendWelcomeEmail` | Welcome + account activation link |
| `sendAdminCreatedWelcomeEmail` | Welcome with a temporary password, for admin-created accounts |
| `sendPasswordResetEmail` | Password reset link |
| `sendEventInvitationEmail` | Event invitation with date/time/location/RSVP |
| `sendPaymentReceiptEmail` | Payment receipt |
| `sendMembershipInvitationEmail` | Membership invitation for additional members added at checkout |
| `sendContactFormEmail` | Contact form submission notification |

Each has a matching `generate*Html` function for the raw template, used directly by the preview route.

```typescript
await sendWelcomeEmail(
  'user@example.com',
  'John',
  'https://app.businessassociationsa.com/api/auth/activate?token=abc123&email=user@example.com'
)
```

### Brand

Navy `#1B365D`, gold `#FFD700`, teal `#17A2B8`; system fonts for email-client compatibility; absolute image URLs from `public/`.

## Account activation flow

1. Registration creates the user with `emailVerified: null` and sends the welcome email with an activation link.
2. The link hits `GET /api/auth/activate?token=...&email=...`.
3. On success, `emailVerified` is set and the user gains member access.

## Development and testing

The dev tools below are gated (added in #25): outside `NODE_ENV=production` **and** only for a signed-in admin.

- `pnpm dev`, then visit `http://localhost:3000/dev/email-preview` to render every template with sample data.
- `POST /api/dev/test-email` with `{ template, email, firstName, fromName }` sends a real test email through Mailgun.
- `GET/POST /api/dev/email-status` checks delivery status for a given payment/email.

There is no `email:quick`/`email:test` package script (removed in #31 along with the rest of `scripts/test-system.js`, which they wrapped) — use the API routes above directly, or:

```bash
curl -X POST http://localhost:3000/api/dev/test-email \
  -H 'Content-Type: application/json' \
  -d '{"template":"welcome","email":"you@example.com","firstName":"Test"}'
  # requires an admin session cookie; easiest to drive this from the browser while signed in
```

Test across Gmail, Outlook, Apple Mail, and at least one mobile client before shipping a template change.

## Troubleshooting

- **Not sending**: confirm `MAILGUN_API_KEY`/`MAILGUN_DOMAIN`/`MAILGUN_FROM_EMAIL` are set and the domain is verified in Mailgun; check Mailgun's own delivery logs for bounces/rate limits.
- **Direct API test**:
  ```bash
  curl -s --user "api:$MAILGUN_API_KEY" \
    "https://api.mailgun.net/v3/$MAILGUN_DOMAIN/messages" \
    -F from="$MAILGUN_FROM_EMAIL" -F to="test@example.com" \
    -F subject="Test" -F text="Test message"
  ```
- **Activation link not working**: verify the token/email query params aren't being URL-mangled, and that `NEXTAUTH_URL`/`NEXT_PUBLIC_APP_URL` match the environment the link was generated in.
- **Template rendering issues**: check it first in `/dev/email-preview`, which renders the same HTML the send functions produce.

## Production

The only production domain is `app.businessassociationsa.com`; there is no separate development domain in the current single-server setup (see `docs/DEPLOYMENT.md`). Use a dedicated Mailgun sending subdomain in production, keep preview/test routes admin-only, and never put sensitive data directly in email content.
