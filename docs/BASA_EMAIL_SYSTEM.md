# BASA Email System

This document describes the email system for BASA (Business Association of San Antonio), including templates, sending functionality, and testing procedures.

## Overview

The BASA email system provides branded email templates for various user interactions including:
- Welcome emails with account activation
- Password reset emails
- Event invitations
- Newsletter updates

## Architecture

### Components
- **Email Templates**: HTML templates with BASA branding
- **Email Service**: Mailgun integration for sending emails
- **Preview System**: Development tools for testing emails
- **Activation Flow**: Account verification system

### Technology Stack
- **Mailgun**: Email delivery service
- **Nunjucks**: Template engine (for future Maizzle integration)
- **Next.js API Routes**: Email sending endpoints
- **TypeScript**: Type safety and development experience

## Email Templates

### Welcome Email
**Purpose**: Sent to new users after registration
**Features**:
- BASA branding and colors
- Account activation link
- Member benefits overview
- Quick links to key sections

**Template**: `generateWelcomeEmailHtml()`
**Parameters**:
- `firstName`: User's first name
- `activationUrl`: Account activation link
- `siteUrl`: Website URL (defaults to businessassociationsa.com)
- `logoUrl`: BASA logo URL

### Password Reset Email
**Purpose**: Sent when users request password reset
**Features**:
- Secure reset link
- Clear instructions
- Security warnings

### Event Invitation Email
**Purpose**: Invite members to events
**Features**:
- Event details (date, time, location)
- RSVP functionality
- Calendar integration
- Speaker information

## Email Service Configuration

### Environment Variables
```bash
# Required
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-mailgun-domain
MAILGUN_FROM_EMAIL=noreply@your-domain.com

# Optional
NEXTAUTH_URL=https://dev.businessassociationsa.com  # Development
# NEXTAUTH_URL=https://app.businessassociationsa.com   # Production
```

### Mailgun Setup
1. Create Mailgun account
2. Add domain verification
3. Configure DNS records
4. Set up API key
5. Test email delivery

## Email Sending Functions

### `sendWelcomeEmail()`
Sends welcome email with activation link.

```typescript
const result = await sendWelcomeEmail(
  'user@example.com',
  'John',
  'https://app.businessassociationsa.com/api/auth/activate?token=abc123&email=user@example.com'
)
```

### `sendPasswordResetEmail()`
Sends password reset email.

```typescript
const result = await sendPasswordResetEmail(
  'user@example.com',
  'John',
  'https://app.businessassociationsa.com/auth/reset-password?token=reset123&email=user@example.com'
)
```

### `sendEventInvitationEmail()`
Sends event invitation email.

```typescript
const result = await sendEventInvitationEmail(
  'user@example.com',
  'John',
  {
    title: 'BASA Networking Mixer',
    date: new Date('2024-01-15'),
    time: '6:00 PM',
    location: 'San Antonio Business Hub',
    address: '123 Business St, San Antonio, TX',
    capacity: 100,
    price: 25,
    rsvpUrl: 'https://dev.businessassociationsa.com/events/mixer/rsvp',
    calendarUrl: 'https://dev.businessassociationsa.com/events/mixer/calendar',
    shareUrl: 'https://dev.businessassociationsa.com/events/mixer'
  }
)
```

## Account Activation Flow

### 1. User Registration
- User fills out registration form
- System creates user record with `emailVerified: false`
- Welcome email sent with activation link

### 2. Email Activation
- User clicks activation link in email
- Link contains token and email parameters
- System verifies token and updates user record

### 3. Account Activation
- `emailVerified` set to `true`
- `memberSince` set to current date
- User can now access member features

### API Endpoint
```
POST /api/auth/activate?token={token}&email={email}
```

## Development and Testing

### Preview System
Visit `http://localhost:3000/dev/email-preview` for:
- Live email preview
- Template customization
- Responsive testing
- Test email sending

### Test Scripts
```bash
# Quick test
npm run email:quick your-email@example.com

# Comprehensive test
npm run email:test

# Preview page
npm run email:preview
```

### Email Client Testing
Test emails in:
- Gmail (web & mobile)
- Outlook (web & desktop)
- Apple Mail
- Thunderbird
- Mobile email apps

## BASA Branding

### Colors
- **Primary Navy**: #1B365D
- **Secondary Gold**: #FFD700
- **Accent Teal**: #17A2B8

### Typography
- System fonts for email compatibility
- Responsive design for mobile devices

### Logo
- BASA logo with "Business Association of San Antonio" text
- Absolute URLs from public folder
- Alt text for accessibility

## Security Considerations

### Email Security
- HTTPS links only
- Secure token generation
- Rate limiting on email sending
- Spam prevention measures

### Data Protection
- No sensitive data in email content
- Secure token storage
- Email verification required
- GDPR compliance considerations

### Development vs Production
- Preview endpoints disabled in production
- Test emails clearly marked
- Separate Mailgun domains for testing

## Monitoring and Analytics

### Mailgun Analytics
- Delivery rates
- Open rates
- Click rates
- Bounce rates
- Spam complaints

### Custom Tracking
- Email template usage
- Activation success rates
- User engagement metrics

## Troubleshooting

### Common Issues

#### Emails Not Sending
1. Check Mailgun API key
2. Verify domain configuration
3. Check rate limits
4. Review error logs

#### Activation Links Not Working
1. Verify token generation
2. Check URL encoding
3. Test in different browsers
4. Review server logs

#### Template Rendering Issues
1. Test in email preview
2. Check HTML validation
3. Verify image URLs
4. Test responsive design

### Debug Commands
```bash
# Test Mailgun connection
curl -s --user "api:$MAILGUN_API_KEY" \
  "https://api.mailgun.net/v3/$MAILGUN_DOMAIN/messages" \
  -F from="$MAILGUN_FROM_EMAIL" \
  -F to="test@example.com" \
  -F subject="Test" \
  -F text="Test message"

# Check environment variables
node -e "console.log('API Key:', process.env.MAILGUN_API_KEY ? 'Set' : 'Missing')"
```

## Future Enhancements

### Planned Features
- Maizzle template builder integration
- Advanced email analytics
- A/B testing for email templates
- Automated email campaigns
- Email preference management

### Template Improvements
- More email templates
- Dynamic content injection
- Personalization features
- Multi-language support

## Support and Maintenance

### Regular Tasks
- Monitor email delivery rates
- Update email templates
- Test in new email clients
- Review security measures
- Backup email configurations

### Contact Information
- **Technical Support**: dev@businessassociationsa.com
- **General Inquiries**: info@businessassociationsa.com
- **Development Website**: https://dev.businessassociationsa.com
- **Production Website**: https://businessassociationsa.com

---

*Last updated: January 2024* 