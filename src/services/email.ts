export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  attachments?: any[];
}

export interface EmailResult {
  messageId: string;
  sentAt?: string;
  demo?: boolean;
  status?: string;
}

export const email = {
  send: async (params: EmailParams): Promise<EmailResult> => {
    // TODO: Implement real email sending
    // For now, return mock result
    const messageId = `email-${Date.now()}`;
    const sentAt = new Date().toISOString();
    
    console.info(`[EMAIL] Sending to ${params.to}: ${params.subject}`);
    
    return {
      messageId,
      sentAt,
      status: 'sent'
    };
  }
};
