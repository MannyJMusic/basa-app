/**
 * Fallback email system for development
 * Logs emails to console when Mailgun is not properly configured
 */

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmailFallback(
  to: string, 
  subject: string, 
  html: string,
  options: {
    from?: string;
    replyTo?: string;
  } = {}
): Promise<EmailResult> {
  try {
    // Log the email details
    console.log('\n📧 EMAIL SENT (Fallback Mode):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`From: ${options.from || 'noreply@member.businessassociationsa.com'}`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Reply-To: ${options.replyTo || 'info@businessassociationsa.com'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('HTML Content:');
    console.log(html);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Generate a fake message ID
    const messageId = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      messageId
    };
  } catch (error) {
    console.error('❌ Fallback email failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Export fallback functions that match the basa-emails interface
export async function sendWelcomeEmailFallback(
  email: string, 
  firstName: string, 
  activationUrl: string,
  options: { 
    siteUrl?: string;
    logoUrl?: string;
  } = {}
): Promise<EmailResult> {
  const html = `
    <h1>Welcome to BASA, ${firstName}!</h1>
    <p>Thank you for joining the Business Association of San Antonio.</p>
    <p>Please click the link below to activate your account:</p>
    <a href="${activationUrl}">Activate Account</a>
    <p>Best regards,<br>The BASA Team</p>
  `;

  return sendEmailFallback(email, 'Welcome to BASA - Activate Your Account', html);
}

export async function sendPaymentReceiptEmailFallback(
  email: string,
  firstName: string,
  paymentData: {
    paymentId: string;
    amount: number;
    currency: string;
    cart: Array<{ tierId: string; quantity: number; price: number; name: string }>;
    customerInfo: any;
    businessInfo: any;
    paymentDate: string;
  },
  options: { 
    siteUrl?: string;
    logoUrl?: string;
  } = {}
): Promise<EmailResult> {
  const html = `
    <h1>Payment Receipt - BASA Membership</h1>
    <p>Hello ${firstName},</p>
    <p>Thank you for your payment. Here are your payment details:</p>
    <ul>
      <li>Payment ID: ${paymentData.paymentId}</li>
      <li>Amount: ${paymentData.currency.toUpperCase()} ${paymentData.amount}</li>
      <li>Date: ${new Date(paymentData.paymentDate).toLocaleDateString()}</li>
    </ul>
    <p>Best regards,<br>The BASA Team</p>
  `;

  return sendEmailFallback(email, 'BASA Membership Payment Receipt', html);
}

export async function sendMembershipInvitationEmailFallback(
  email: string,
  name: string,
  tierId: string,
  options: { 
    siteUrl?: string;
    logoUrl?: string;
  } = {}
): Promise<EmailResult> {
  const html = `
    <h1>You're Invited to Join BASA!</h1>
    <p>Hello ${name},</p>
    <p>You've been invited to join the Business Association of San Antonio.</p>
    <p>Membership Tier: ${tierId}</p>
    <p>Best regards,<br>The BASA Team</p>
  `;

  return sendEmailFallback(email, 'You\'re Invited to Join BASA', html);
} 