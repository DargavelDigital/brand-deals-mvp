import { prisma } from '@/lib/prisma';
import Handlebars from 'handlebars';

export interface EmailTemplate {
  id: string;
  key: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariables {
  [key: string]: string;
}

/**
 * Get an email template by key for a specific workspace
 */
export async function getEmailTemplate(
  key: string, 
  workspaceId: string
): Promise<EmailTemplate | null> {
  return await prisma.emailTemplate.findUnique({
    where: {
      workspaceId_key: {
        workspaceId,
        key
      }
    }
  });
}

/**
 * Get all email templates for a workspace
 */
export async function getEmailTemplates(workspaceId: string): Promise<EmailTemplate[]> {
  return await prisma.emailTemplate.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'asc' }
  });
}

/**
 * Render an email template with variables
 */
export function renderTemplate(
  template: EmailTemplate, 
  variables: TemplateVariables
): { subject: string; body: string } {
  // Validate that all required variables are provided
  const missingVars = template.variables.filter(varName => !variables[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required template variables: ${missingVars.join(', ')}. ` +
      `Required: ${template.variables.join(', ')}`
    );
  }

  try {
    // Compile and render subject
    const subjectTemplate = Handlebars.compile(template.subject);
    const renderedSubject = subjectTemplate(variables);

    // Compile and render body
    const bodyTemplate = Handlebars.compile(template.body);
    const renderedBody = bodyTemplate(variables);

    return {
      subject: renderedSubject,
      body: renderedBody
    };
  } catch (error) {
    throw new Error(`Failed to render template: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Render an email template by key with variables
 */
export async function renderTemplateByKey(
  key: string,
  workspaceId: string,
  variables: TemplateVariables
): Promise<{ subject: string; body: string }> {
  const template = await getEmailTemplate(key, workspaceId);
  
  if (!template) {
    throw new Error(`Email template not found: ${key}`);
  }

  return renderTemplate(template, variables);
}

/**
 * Sync email templates from seed definitions
 * This ensures the database has the latest template versions
 */
export async function syncEmailTemplates(workspaceId: string): Promise<void> {
  // Import seed templates dynamically to avoid circular dependencies
  const { seedEmailTemplates } = await import('@/../../prisma/seed-data/templates');
  
  for (const seedTemplate of seedEmailTemplates) {
    await prisma.emailTemplate.upsert({
      where: {
        workspaceId_key: {
          workspaceId,
          key: seedTemplate.key
        }
      },
      update: {
        name: seedTemplate.name,
        subject: seedTemplate.subject,
        body: seedTemplate.body,
        variables: seedTemplate.variables
      },
      create: {
        key: seedTemplate.key,
        name: seedTemplate.name,
        subject: seedTemplate.subject,
        body: seedTemplate.body,
        variables: seedTemplate.variables,
        workspaceId
      }
    });
  }
}

/**
 * Validate template variables against a template
 */
export function validateTemplateVariables(
  template: EmailTemplate,
  variables: TemplateVariables
): { isValid: boolean; missing: string[]; extra: string[] } {
  const requiredVars = template.variables;
  const providedVars = Object.keys(variables);
  
  const missing = requiredVars.filter(varName => !providedVars.includes(varName));
  const extra = providedVars.filter(varName => !requiredVars.includes(varName));
  
  return {
    isValid: missing.length === 0,
    missing,
    extra
  };
}
