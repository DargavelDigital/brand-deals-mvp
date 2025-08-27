import { aiInvoke } from '@/ai/invoke';
import { isFlagEnabled } from '@/lib/flags';
import type { StyleTone, StyleBrevity } from '@/ai/types';

export interface EmailGenerationInput {
  creator: {
    name: string;
    niche: string;
    country: string;
    followers: number;
  };
  brand: {
    name: string;
    industry: string;
    category: string;
    country: string;
  };
  mediaPackUrl?: string;
  audit?: {
    audience: {
      followers: number;
      topCountries: string[];
    };
    content: {
      formats: string[];
      avgEngagement: number;
    };
  };
}

export interface EmailGenerationOutput {
  subject: string;
  body: string;
  toneUsed: string;
  reasoning: string;
  placeholders?: {
    brand_name: string;
    creator_name: string;
    media_pack_url: string;
  };
}

export async function generateOutreachEmail(
  workspaceFlags: any,
  input: EmailGenerationInput,
  opts?: { 
    tone?: StyleTone; 
    brevity?: StyleBrevity;
  }
): Promise<EmailGenerationOutput> {
  const useV2 = isFlagEnabled('OUTREACH_TONES', workspaceFlags);
  
  if (!useV2) {
    // Fallback to basic email if flag is off
    return {
      subject: `Introduction from ${input.brand.name}`,
      body: `Hi ${input.creator.name},

I hope this email finds you well! I'm reaching out from ${input.brand.name} because I believe there's a great opportunity for collaboration.

Your content in the ${input.creator.niche} space and your engaged audience of ${input.creator.followers.toLocaleString()} followers makes you an ideal partner for ${input.brand.industry} brand.

${input.mediaPackUrl ? `I've attached our media pack here: ${input.mediaPackUrl}` : 'I'd love to share more about our partnership opportunities.'}

Would you be interested in a quick call to discuss how we could work together?

Best regards,
[Your Name]
${input.brand.name} Partnership Team`,
      toneUsed: 'basic',
      reasoning: 'Basic email template used. Enable OUTREACH_TONES for AI-powered personalization.'
    };
  }

  // Use AI-powered email generation
  return aiInvoke<EmailGenerationInput, EmailGenerationOutput>(
    'outreach.email',
    input,
    { 
      tone: opts?.tone ?? 'professional', 
      brevity: opts?.brevity ?? 'medium' 
    }
  );
}
