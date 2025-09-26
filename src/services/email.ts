import { log } from '@/lib/log';
import { shouldSendEmail, appendComplianceFooter, logEmailBlocked, getListUnsubscribeHeader } from './email/policies';
export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  attachments?: any[];
  workspaceId?: string;
}

export interface EmailResult {
  messageId: string;
  sentAt?: string;
  demo?: boolean;
  status?: string;
}

export const email = {
  send: async (params: EmailParams): Promise<EmailResult> => {
    // Check email safety policies
    const safetyCheck = shouldSendEmail(params.to);
    
    if (!safetyCheck.allowed) {
      logEmailBlocked(params.to, safetyCheck.reason!, {
        workspaceId: params.workspaceId,
        subject: params.subject
      });
      throw new Error(`Email blocked: ${safetyCheck.reason?.reason}`);
    }
    
    // Apply compliance footer
    const workspaceInfo = {
      id: params.workspaceId || 'unknown',
      name: 'Brand Deals MVP'
    };
    
    const compliantHtml = appendComplianceFooter(params.html, workspaceInfo);
    
    // TODO: Implement real email sending
    // For now, return mock result
    const messageId = `email-${Date.now()}`;
    const sentAt = new Date().toISOString();
    
    log.info(`[EMAIL] Sending to ${params.to}: ${params.subject}`, {
      feature: 'email-send',
      workspaceId: params.workspaceId,
      messageId
    });
    
    return {
      messageId,
      sentAt,
      status: 'sent'
    };
  }
};
