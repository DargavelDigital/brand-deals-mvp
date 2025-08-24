export const mockEmailService = {
  async sendEmail(to: string, subject: string, html: string, from?: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('📧 Mock Email Sent:', {
      to,
      subject,
      from: from || 'noreply@hyper.com',
      timestamp: new Date().toISOString()
    });
    
    return {
      messageId: `mock-${Date.now()}`,
      status: 'sent',
      to: [to],
      timestamp: new Date().toISOString()
    };
  },

  async sendTemplateEmail(to: string, templateName: string, variables: any) {
    // Simulate template email sending
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    console.log('📧 Mock Template Email Sent:', {
      to,
      template: templateName,
      variables,
      timestamp: new Date().toISOString()
    });
    
    return {
      messageId: `mock-template-${Date.now()}`,
      status: 'sent',
      to: [to],
      template: templateName,
      timestamp: new Date().toISOString()
    };
  }
};
