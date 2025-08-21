export const email = {
  send: async ({ to, subject, html, attachments }: { to: string; subject: string; html: string; attachments?: any[] }) => {
    // DEMO: never deliver for real; log to server console
    const timestamp = new Date().toISOString();
    const messageId = `demo-${Date.now()}`;
    
    console.info(`[DEMO EMAIL] ${timestamp} | ID: ${messageId}`);
    console.info(`  To: ${to}`);
    console.info(`  Subject: ${subject}`);
    console.info(`  Attachments: ${attachments?.length || 0}`);
    console.info(`  HTML Length: ${html.length} characters`);
    console.info(`  ---`);
    
    // In a real implementation, you might also log to a database or file
    // For now, we just return a mock message ID
    
    return { 
      messageId,
      sentAt: timestamp,
      demo: true,
      status: 'delivered' // Mock successful delivery
    };
  }
};
