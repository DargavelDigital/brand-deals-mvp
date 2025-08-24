import { compile } from 'handlebars';

export interface EmailTemplate {
  subject: string;
  html: string;
}

export interface TemplateVars {
  [key: string]: string | number;
}

export async function renderTemplate(
  templateName: string, 
  variables: TemplateVars
): Promise<EmailTemplate> {
  // For now, return a basic template
  // In production, you'd load templates from a database or file system
  const templates: Record<string, EmailTemplate> = {
    'intro_v1': {
      subject: 'Introduction from {{creatorName}}',
      html: `
        <h2>Hello {{contactFirstName}},</h2>
        <p>My name is {{creatorName}} and I'm reaching out about a potential collaboration with {{brandName}}.</p>
        <p>{{creatorUSP}}</p>
        <p>Would you be interested in discussing this further?</p>
        <p>Best regards,<br>{{creatorName}}</p>
      `
    },
    'proof_v1': {
      subject: 'Follow-up: {{brandName}} collaboration',
      html: `
        <h2>Hi {{contactFirstName}},</h2>
        <p>I wanted to follow up on my previous email about collaborating with {{brandName}}.</p>
        <p>Here are some key insights about my audience:</p>
        <ul>
          <li>{{insightOne}}</li>
          <li>{{insightTwo}}</li>
        </ul>
        <p>Would you like to schedule a call to discuss this further?</p>
        <p>Best regards,<br>{{creatorName}}</p>
      `
    }
  };

  const template = templates[templateName] || templates['intro_v1'];
  
  // Render the template with variables
  const compiledSubject = compile(template.subject);
  const compiledHtml = compile(template.html);
  
  return {
    subject: compiledSubject(variables),
    html: compiledHtml(variables)
  };
}
