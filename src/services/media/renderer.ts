import fs from 'fs';
import path from 'path';

export interface MediaPackVars {
  // Audit data
  audienceSize: string;
  topGeo: string[];
  topAge: string[];
  engagementRate: string;
  insightOne: string;
  insightTwo: string;
  
  // Brand data
  brandName: string;
  brandLogoUrl?: string;
  brandPrimaryColor?: string;
  brandSecondaryColor?: string;
  
  // Formatting
  formatA: string;
  formatB: string;
  
  // Metadata
  generatedAt: string;
  workspaceName: string;
}

export type MediaPackVariant = 'default' | 'brand';

export function renderHTML(variant: MediaPackVariant, vars: MediaPackVars): string {
  try {
    // Load the appropriate template
    const templatePath = path.join(process.cwd(), 'src', 'services', 'media', 'templates', `mediaPack${variant === 'brand' ? 'Brand' : 'Default'}.html`);
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }
    
    let html = fs.readFileSync(templatePath, 'utf-8');
    
    // Safely replace variables in the template
    const replacements: Record<string, string> = {
      '{{audienceSize}}': vars.audienceSize || '0',
      '{{topGeo}}': vars.topGeo?.join(', ') || 'Global',
      '{{topAge}}': vars.topAge?.join(', ') || 'All ages',
      '{{engagementRate}}': vars.engagementRate || '0%',
      '{{insightOne}}': vars.insightOne || 'Continue building authentic content',
      '{{insightTwo}}': vars.insightTwo || 'Focus on community engagement',
      '{{brandName}}': vars.brandName || 'Your Brand',
      '{{brandLogoUrl}}': vars.brandLogoUrl || '',
      '{{brandPrimaryColor}}': vars.brandPrimaryColor || '#3B82F6',
      '{{brandSecondaryColor}}': vars.brandSecondaryColor || '#1E40AF',
      '{{formatA}}': vars.formatA || 'Standard',
      '{{formatB}}': vars.formatB || 'Premium',
      '{{generatedAt}}': vars.generatedAt || new Date().toLocaleDateString(),
      '{{workspaceName}}': vars.workspaceName || 'Your Workspace'
    };
    
    // Apply all replacements
    Object.entries(replacements).forEach(([placeholder, value]) => {
      html = html.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    });
    
    return html;
  } catch (error) {
    console.error('Failed to render HTML template:', error);
    throw new Error('Failed to generate media pack HTML');
  }
}
