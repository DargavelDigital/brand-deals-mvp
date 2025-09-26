import sgMail from '@sendgrid/mail';
import { recordSend } from '@/services/outreach/telemetry';
import { env } from '@/lib/env';
import { log } from '@/lib/log';
import { shouldSendEmail, appendComplianceFooter, logEmailBlocked, getListUnsubscribeHeader } from './policies';

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
  // Telemetry context
  workspaceId?: string;
  brand?: { industry?: string; size?: number; region?: string; domain?: string | null };
  templateKey?: string;
  tone?: 'professional'|'relaxed'|'fun';
  stepsPlanned?: number;
}

export interface EmailResult {
  messageId: string;
  provider: 'sendgrid' | 'smtp';
}

export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  const { to, subject, html, attachments, from, replyTo, workspaceId, brand, templateKey, tone, stepsPlanned } = payload;
  
  // Convert to array for consistent processing
  const recipients = Array.isArray(to) ? to : [to];
  const allowedRecipients: string[] = [];
  
  // Check each recipient against safety policies
  for (const recipient of recipients) {
    const safetyCheck = shouldSendEmail(recipient);
    
    if (!safetyCheck.allowed) {
      logEmailBlocked(recipient, safetyCheck.reason!, {
        workspaceId,
        templateKey,
        subject
      });
      continue;
    }
    
    allowedRecipients.push(recipient);
  }
  
  // If no recipients are allowed, return early
  if (allowedRecipients.length === 0) {
    throw new Error('All recipients blocked by email safety policies');
  }
  
  // Apply compliance footer to HTML
  const workspaceInfo = {
    id: workspaceId || 'unknown',
    name: brand?.domain || 'Brand Deals MVP'
  };
  
  const compliantHtml = appendComplianceFooter(html, workspaceInfo);
  
  // Try SendGrid first
  if (env.SENDGRID_API_KEY) {
    try {
      sgMail.setApiKey(env.SENDGRID_API_KEY);
      
      const msg = {
        to: allowedRecipients,
        from: from || env.FROM_EMAIL || 'noreply@yourdomain.com',
        subject,
        html: compliantHtml,
        attachments,
        replyTo,
        headers: {
          'List-Unsubscribe': getListUnsubscribeHeader(workspaceInfo)
        }
      };
      
      const response = await sgMail.send(msg);
      
      // Record telemetry if context is provided
      if (workspaceId) {
        await recordSend({
          workspaceId,
          brand,
          templateKey,
          tone,
          stepsPlanned,
          sentAt: new Date()
        });
      }
      
      return {
        messageId: response[0]?.headers['x-message-id'] || `sg-${Date.now()}`,
        provider: 'sendgrid'
      };
    } catch (error) {
      log.error('SendGrid failed:', error);
      // Fall through to SMTP
    }
  }
  
  // Try SMTP fallback
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    try {
      // For now, we'll use a simple SMTP implementation
      // In production, you might want to use nodemailer or similar
      throw new Error('SMTP implementation not yet complete');
    } catch (error) {
      log.error('SMTP failed:', error);
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
      log.error('Failed to send email:', error);
      // Continue with other emails
      results.push({
        messageId: `failed-${Date.now()}`,
        provider: 'sendgrid'
      });
    }
  }
  
  return results;
}
