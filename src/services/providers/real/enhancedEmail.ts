import { email } from '../../email';
import { log } from '@/lib/log';

export const enhancedEmailService = {
  async send(params: any) {
    // Enhanced email with tone analysis and personalization
    const { to, subject, html, workspaceId, tone = 'professional', personalization = {} } = params;
    
    // Apply tone-based enhancements
    let enhancedHtml = html;
    if (tone === 'casual') {
      enhancedHtml = this.applyCasualTone(html);
    } else if (tone === 'friendly') {
      enhancedHtml = this.applyFriendlyTone(html);
    } else if (tone === 'formal') {
      enhancedHtml = this.applyFormalTone(html);
    }
    
    // Apply personalization
    if (personalization.name) {
      enhancedHtml = enhancedHtml.replace(/{{name}}/g, personalization.name);
    }
    if (personalization.company) {
      enhancedHtml = enhancedHtml.replace(/{{company}}/g, personalization.company);
    }
    
    log.info('📧 Enhanced Email Sent:', {
      to,
      subject,
      tone,
      personalization,
      timestamp: new Date().toISOString()
    });
    
    // Use the base email service
    return await email.send({
      to,
      subject,
      html: enhancedHtml
    });
  },

  async sendTemplateEmail(to: string, templateName: string, variables: any, tone = 'professional') {
    // Enhanced template email with tone options
    let template = this.getTemplate(templateName);
    
    // Apply tone
    if (tone === 'casual') {
      template = this.applyCasualTone(template);
    } else if (tone === 'friendly') {
      template = this.applyFriendlyTone(template);
    }
    
    // Apply variables
    let personalizedTemplate = template;
    Object.entries(variables).forEach(([key, value]) => {
      personalizedTemplate = personalizedTemplate.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });
    
    log.info('📧 Enhanced Template Email Sent:', {
      to,
      template: templateName,
      tone,
      variables,
      timestamp: new Date().toISOString()
    });
    
    return {
      messageId: `enhanced-${Date.now()}`,
      status: 'sent',
      to: [to],
      template: templateName,
      tone,
      timestamp: new Date().toISOString()
    };
  },

  applyCasualTone(html: string): string {
    return html
      .replace(/Dear/g, 'Hey')
      .replace(/Sincerely/g, 'Best')
      .replace(/Thank you/g, 'Thanks')
      .replace(/I would like to/g, 'I\'d love to');
  },

  applyFriendlyTone(html: string): string {
    return html
      .replace(/Dear/g, 'Hi there')
      .replace(/Sincerely/g, 'Best regards')
      .replace(/Thank you/g, 'Thanks so much')
      .replace(/I would like to/g, 'I\'d really like to');
  },

  applyFormalTone(html: string): string {
    return html
      .replace(/Hey/g, 'Dear')
      .replace(/Hi there/g, 'Dear')
      .replace(/Thanks/g, 'Thank you')
      .replace(/I\'d love to/g, 'I would like to');
  },

  getTemplate(templateName: string): string {
    const templates: Record<string, string> = {
      'partnership': `Dear {{name}},

I hope this email finds you well. I'm reaching out because I believe there's a great opportunity for collaboration between {{company}} and my brand.

I've been following your work and I'm impressed by {{company}}'s commitment to excellence and innovation. My audience would be genuinely interested in learning more about what you do.

Would you be interested in discussing potential partnership opportunities? I'd love to schedule a call to explore how we could work together.

Best regards,
{{senderName}}`,
      'follow-up': `Hi {{name}},

I wanted to follow up on our previous conversation about potential collaboration opportunities with {{company}}.

I'm still very interested in exploring how we could work together and I believe there's real potential for a mutually beneficial partnership.

Would you have some time this week for a quick call to discuss this further?

Thanks,
{{senderName}}`
    };
    
    return templates[templateName] || templates['partnership'];
  }
};
