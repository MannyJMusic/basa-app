# Mailgun Email Service Setup Guide

This guide explains how to set up and configure Mailgun for the BASA application's email functionality.

## 📧 Overview

The BASA application uses Mailgun for all email communications, including:
- Welcome emails for new members
- Password reset emails
- Email verification
- Event reminders
- Newsletter distribution
- Bulk email campaigns

## 🚀 Getting Started with Mailgun

### 1. Create a Mailgun Account

1. Visit [Mailgun.com](https://www.mailgun.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Add a Domain

1. In your Mailgun dashboard, go to "Sending" → "Domains"
2. Click "Add New Domain"
3. Choose "Custom Domain" (recommended for production)
4. Follow the DNS configuration instructions provided by Mailgun

### 3. Get Your API Key

1. Go to "Settings" → "API Keys"
2. Copy your Private API Key
3. Keep this key secure and never commit it to version control

## 🔧 Environment Configuration

Add the following environment variables to your `.env.local` file:

```bash
# Mailgun Configuration
MAILGUN_API_KEY="your-mailgun-api-key"
MAILGUN_DOMAIN="your-mailgun-domain.com"
FROM_EMAIL="noreply@your-mailgun-domain.com"

# Optional SMTP Configuration (for additional flexibility)
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_USER="your-smtp-username"
SMTP_PASS="your-smtp-password"
```

## 📋 Email Templates

The application includes several pre-built email templates:

### Welcome Email
- **Trigger**: New user registration
- **Template**: `emailTemplates.welcome`
- **Features**: Personalized greeting, next steps, dashboard link

### Password Reset Email
- **Trigger**: Password reset request
- **Template**: `emailTemplates.passwordReset`
- **Features**: Secure reset link, expiration notice, security warnings

### Email Verification
- **Trigger**: Email verification request
- **Template**: `emailTemplates.emailVerification`
- **Features**: Verification link, expiration notice

### Event Reminders
- **Trigger**: Upcoming event notifications
- **Template**: `emailTemplates.eventReminder`
- **Features**: Event details, location, date/time

### Newsletter
- **Trigger**: Newsletter distribution
- **Template**: `emailTemplates.newsletter`
- **Features**: Customizable content, branding, call-to-action

## 🛠️ Implementation Details

### Email Service Location
- **File**: `src/lib/email.ts`
- **Main Functions**: 
  - `sendEmail()` - Core email sending function
  - `sendWelcomeEmail()` - Welcome email
  - `sendPasswordResetEmail()` - Password reset
  - `sendEmailVerification()` - Email verification
  - `sendEventReminder()` - Event reminders
  - `sendNewsletter()` - Newsletter emails
  - `sendBulkEmail()` - Bulk email campaigns

### API Routes Using Mailgun
- `src/app/api/auth/register/route.ts` - Welcome emails
- `src/app/api/auth/forgot-password/route.ts` - Password reset emails
- `src/app/api/newsletter/route.ts` - Newsletter functionality

### Features
- **Rate Limiting**: Built-in rate limiting (10 emails per hour per user)
- **Error Handling**: Comprehensive error handling and logging
- **Template System**: HTML email templates with responsive design
- **Bulk Sending**: Support for bulk email campaigns with segmentation
- **Analytics**: Email delivery tracking and analytics

## 📊 Email Analytics

Mailgun provides comprehensive analytics for your emails:

### Key Metrics
- **Delivery Rate**: Percentage of emails successfully delivered
- **Open Rate**: Percentage of emails opened by recipients
- **Click Rate**: Percentage of emails with clicked links
- **Bounce Rate**: Percentage of emails that bounced
- **Spam Complaints**: Number of spam complaints

### Accessing Analytics
1. Log into your Mailgun dashboard
2. Go to "Analytics" → "Events"
3. View detailed metrics for your domain

## 🔒 Security Best Practices

### API Key Security
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate API keys regularly
- Use different keys for development and production

### Email Security
- Implement rate limiting to prevent abuse
- Validate email addresses before sending
- Use SPF, DKIM, and DMARC records for your domain
- Monitor for spam complaints and bounces

### Domain Verification
- Verify your sending domain with Mailgun
- Set up proper DNS records (SPF, DKIM, DMARC)
- Use a dedicated subdomain for sending (e.g., `mail.basa.com`)

## 🧪 Testing

### Development Testing
```bash
# Test email sending
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Production Testing
1. Use Mailgun's test mode for initial setup
2. Send test emails to verified addresses
3. Monitor delivery and bounce rates
4. Check spam folder placement

## 📈 Performance Optimization

### Sending Limits
- **Free Tier**: 5,000 emails per month
- **Paid Plans**: Higher limits based on plan
- **Rate Limits**: 10 emails per second (free tier)

### Best Practices
- Use bulk sending for large campaigns
- Implement proper error handling
- Monitor delivery rates
- Clean your email list regularly

## 🚨 Troubleshooting

### Common Issues

#### Emails Not Sending
1. Check API key configuration
2. Verify domain setup
3. Check rate limits
4. Review error logs

#### High Bounce Rate
1. Clean your email list
2. Verify email addresses
3. Check domain reputation
4. Review email content

#### Emails Going to Spam
1. Set up proper DNS records
2. Use consistent sending patterns
3. Avoid spam trigger words
4. Monitor sender reputation

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG="mailgun:*"
```

## 📞 Support

### Mailgun Support
- [Mailgun Documentation](https://documentation.mailgun.com/)
- [Mailgun Support](https://www.mailgun.com/support/)
- [Mailgun Status Page](https://status.mailgun.com/)

### Application Support
- Check application logs for detailed error messages
- Review Mailgun dashboard for delivery issues
- Contact development team for application-specific issues

## 🔄 Migration from Resend

If migrating from Resend to Mailgun:

1. **Update Dependencies**
   ```bash
   pnpm remove resend
   pnpm add mailgun.js form-data
   ```

2. **Update Environment Variables**
   - Remove `RESEND_API_KEY`
   - Add Mailgun configuration variables

3. **Update Code**
   - Replace Resend imports with Mailgun
   - Update email sending functions
   - Test all email functionality

4. **Verify Setup**
   - Test email sending
   - Check delivery rates
   - Monitor for errors

## 📝 Configuration Checklist

- [ ] Mailgun account created
- [ ] Domain added and verified
- [ ] API key obtained
- [ ] Environment variables configured
- [ ] DNS records set up (SPF, DKIM, DMARC)
- [ ] Test emails sent successfully
- [ ] Error handling implemented
- [ ] Rate limiting configured
- [ ] Analytics monitoring set up
- [ ] Security measures implemented

This setup ensures reliable email delivery for all BASA application communications. 