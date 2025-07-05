# BASA Email Development Guide

This guide covers how to test, preview, and develop email templates for the BASA (Business Association of San Antonio) application.

## 🚀 Quick Start

### 1. Start Development Server
```bash
npm run dev
```

### 2. Test Email System
```bash
# Quick test with default email
npm run email:quick

# Quick test with custom email
npm run email:quick your-email@example.com

# Full comprehensive test
npm run email:test

# Open preview page
npm run email:preview
```

## 📧 Email Preview Tools

### Web Preview Interface
Visit: `http://localhost:3000/dev/email-preview`

Features:
- **Live Preview**: See emails rendered in real-time
- **Template Selection**: Switch between different email templates
- **Customization**: Modify recipient data, URLs, and content
- **Responsive Testing**: Test how emails look on different screen sizes
- **Send Test Emails**: Send actual emails to test addresses

### API Preview Endpoints
- **Preview HTML**: `GET /api/dev/email-preview?template=welcome&firstName=John&email=test@example.com`
- **Send Test Email**: `POST /api/dev/test-email`

## 🧪 Testing Methods

### 1. Browser Preview
```bash
# Open preview in browser
open http://localhost:3000/dev/email-preview

# Direct template preview
open "http://localhost:3000/api/dev/email-preview?template=welcome&firstName=John&email=test@example.com"
```

### 2. Command Line Testing
```bash
# Quick test
npm run email:quick your-email@example.com

# Comprehensive test
npm run email:test
```

### 3. Manual API Testing
```bash
# Test preview generation
curl "http://localhost:3000/api/dev/email-preview?template=welcome&firstName=John&email=test@example.com"

# Test email sending
curl -X POST http://localhost:3000/api/dev/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "template": "welcome",
    "email": "your-email@example.com",
    "firstName": "John",
    "activationUrl": "https://app.businessassociationsa.com/api/auth/activate?token=test123&email=test@example.com"
  }'
```

## 📱 Email Client Testing

### Recommended Testing Order
1. **Gmail** (Web & Mobile)
2. **Outlook** (Web & Desktop)
3. **Apple Mail** (iOS & macOS)
4. **Thunderbird**
5. **Mobile Email Apps**

### Testing Checklist
- [ ] Email renders correctly in all clients
- [ ] Images load properly
- [ ] Links work and are clickable
- [ ] Responsive design works on mobile
- [ ] Text is readable (contrast, font size)
- [ ] Buttons are properly styled
- [ ] No broken HTML or CSS

## 🔧 Development Workflow

### 1. Template Development
```bash
# 1. Start development server
npm run dev

# 2. Open preview page
npm run email:preview

# 3. Edit template in src/lib/basa-emails.ts

# 4. Refresh preview to see changes
```

### 2. Testing Changes
```bash
# Test preview generation
npm run email:quick

# Send test email to yourself
npm run email:quick your-email@example.com

# Check email in different clients
```

### 3. Iterative Development
1. Make changes to template
2. Preview in browser
3. Send test email
4. Check in email clients
5. Repeat until satisfied

## 🎨 Template Customization

### Available Templates
- `welcome` - New user registration
- `password-reset` - Password reset request
- `event-invitation` - Event invitations
- `newsletter` - Newsletter updates

### Template Parameters
```typescript
// Welcome email
{
  firstName: string
  activationUrl: string
  email: string
}

// Password reset
{
  firstName: string
  resetUrl: string
  email: string
}

// Event invitation
{
  firstName: string
  eventName: string
  eventDate: string
  eventTime: string
  eventLocation: string
  rsvpUrl: string
  email: string
}
```

## 🔒 Security Considerations

### Development vs Production
- Preview endpoints only work in development
- Test emails are clearly marked
- Activation links use test tokens
- No sensitive data in test emails

### Environment Variables
```bash
# Required for email sending
MAILGUN_API_KEY=your-api-key
MAILGUN_DOMAIN=your-domain.com
MAILGUN_FROM_EMAIL=noreply@your-domain.com

# Optional for testing
TEST_EMAIL=your-test-email@example.com
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Development vs Production URLs
# Development: https://dev.businessassociationsa.com
# Production: https://app.businessassociationsa.com
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Preview Not Loading
```bash
# Check if server is running
npm run dev

# Check console for errors
# Verify template name is correct
```

#### 2. Emails Not Sending
```bash
# Check Mailgun configuration
echo $MAILGUN_API_KEY
echo $MAILGUN_DOMAIN
echo $MAILGUN_FROM_EMAIL

# Test with quick script
npm run email:quick your-email@example.com
```

#### 3. Images Not Loading
- Check image URLs are absolute
- Verify images exist in public folder
- Test with different email clients

#### 4. Links Not Working
- Verify activation URLs are correct
- Check if links are properly encoded
- Test in different email clients

### Debug Commands
```bash
# Check environment variables
node -e "console.log(process.env.MAILGUN_API_KEY ? 'API Key set' : 'API Key missing')"

# Test Mailgun connection
curl -s --user "api:$MAILGUN_API_KEY" \
  "https://api.mailgun.net/v3/$MAILGUN_DOMAIN/messages" \
  -F from="$MAILGUN_FROM_EMAIL" \
  -F to="test@example.com" \
  -F subject="Test" \
  -F text="Test message"
```

## 📚 Additional Resources

### Email Testing Tools
- **Email on Acid** - Professional email testing
- **Litmus** - Email client testing
- **Mailtrap** - Email testing environment
- **PutsMail** - Free email testing

### Email Development Best Practices
- Use inline CSS for email clients
- Test on multiple devices and clients
- Keep images under 1MB
- Use alt text for images
- Ensure good contrast ratios
- Test with images disabled

### BASA Brand Guidelines
- **Organization**: Business Association of San Antonio
- **Production Domain**: app.businessassociationsa.com
- **Development Domain**: dev.businessassociationsa.com
- **Primary Color**: #1B365D (Navy)
- **Secondary Color**: #FFD700 (Gold)
- **Accent Color**: #17A2B8 (Teal)
- **Font**: System fonts for email compatibility
- **Logo**: Use absolute URLs from public folder

## 🎯 Next Steps

1. **Set up your environment variables**
2. **Start the development server**
3. **Visit the preview page**
4. **Send your first test email**
5. **Test in different email clients**
6. **Customize templates as needed**

Happy email development! 🚀 