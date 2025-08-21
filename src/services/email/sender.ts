import sgMail from '@sendgrid/mail';

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
  from?: string;
  replyTo?: string;
}

export interface EmailResult {
  messageId: string;
  provider: 'sendgrid' | 'smtp';
}

export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  const { to, subject, html, attachments, from, replyTo } = payload;
  
  // Try SendGrid first
  if (process.env.SENDGRID_API_KEY) {
    try {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      
      const msg = {
        to,
        from: from || process.env.FROM_EMAIL || 'noreply@yourdomain.com',
        subject,
        html,
        attachments,
        replyTo
      };
      
      const response = await sgMail.send(msg);
      
      return {
        messageId: response[0]?.headers['x-message-id'] || `sg-${Date.now()}`,
        provider: 'sendgrid'
      };
    } catch (error) {
      console.error('SendGrid failed:', error);
      // Fall through to SMTP
    }
  }
  
  // Try SMTP fallback
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      // For now, we'll use a simple SMTP implementation
      // In production, you might want to use nodemailer or similar
      throw new Error('SMTP implementation not yet complete');
    } catch (error) {
      console.error('SMTP failed:', error);
    }
  }
  
  // No email providers configured
  throw new Error('No email providers configured. Please set SENDGRID_API_KEY or SMTP_* environment variables.');
}

export async function sendBulkEmails(emails: EmailPayload[]): Promise<EmailResult[]> {
  const results: EmailResult[] = [];
  
  for (const email of emails) {
    try {
      const result = await sendEmail(email);
      results.push(result);
    } catch (error) {
      console.error('Failed to send email:', error);
      // Continue with other emails
      results.push({
        messageId: `failed-${Date.now()}`,
        provider: 'sendgrid'
      });
    }
  }
  
  return results;
}
