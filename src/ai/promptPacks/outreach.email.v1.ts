import type { PromptPack } from '../types';

const pack: PromptPack = {
  key: 'outreach.email',
  version: 'v1',
  systemPrompt:
`You are an expert outreach specialist. Create personalized, compelling emails that connect creators with brands.
Use the creator's audit data and brand information to craft relevant, engaging messages.`,
  styleKnobs: { tone: true, brevity: true },
  modelHints: { temperature: 0.4, max_output_tokens: 1000 },
  inputSchema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    required: ['creator', 'brand'],
    properties: {
      creator: {
        type: 'object',
        required: ['name', 'niche'],
        properties: {
          name: { type: 'string' },
          niche: { type: 'string' },
          country: { type: 'string' },
          followers: { type: 'integer' }
        }
      },
      brand: {
        type: 'object',
        required: ['name', 'industry'],
        properties: {
          name: { type: 'string' },
          industry: { type: 'string' },
          category: { type: 'string' },
          country: { type: 'string' }
        }
      },
      mediaPackUrl: { type: 'string' },
      audit: {
        type: 'object',
        properties: {
          audience: {
            type: 'object',
            properties: {
              followers: { type: 'integer' },
              topCountries: { type: 'array', items: { type: 'string' } }
            }
          },
          content: {
            type: 'object',
            properties: {
              formats: { type: 'array', items: { type: 'string' } },
              avgEngagement: { type: 'number' }
            }
          }
        }
      }
    }
  },
  outputSchema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    required: ['subject', 'body', 'toneUsed', 'reasoning'],
    properties: {
      subject: { type: 'string' },
      body: { type: 'string' },
      toneUsed: { type: 'string' },
      reasoning: { type: 'string' },
      placeholders: {
        type: 'object',
        properties: {
          brand_name: { type: 'string' },
          creator_name: { type: 'string' },
          media_pack_url: { type: 'string' }
        }
      }
    }
  },
  fewshots: [
    {
      input: {
        creator: { name: 'Sarah', niche: 'Fitness & Wellness', country: 'US', followers: 85000 },
        brand: { name: 'FitFuel', industry: 'Health & Wellness', category: 'Nutrition', country: 'US' },
        mediaPackUrl: 'https://example.com/media-pack',
        audit: {
          audience: { followers: 85000, topCountries: ['US', 'CA'] },
          content: { formats: ['Instagram', 'YouTube'], avgEngagement: 6.8 }
        }
      },
      output: {
        subject: '{{brand_name}} × {{creator_name}}: Perfect Partnership Opportunity',
        body: `Hi {{creator_name}},

I hope this email finds you well! I'm reaching out because I believe there's a fantastic opportunity for collaboration between {{brand_name}} and your amazing fitness content.

Your authentic approach to wellness and impressive 6.8% engagement rate with your 85K+ fitness-focused audience makes you an ideal partner for {{brand_name}}. We're looking to connect with creators who genuinely care about their community's health journey.

I've attached our media pack here: {{media_pack_url}}

Would you be interested in a quick call to discuss how we could work together? I'd love to share more about our vision and explore potential collaboration ideas.

Best regards,
[Your Name]
{{brand_name}} Partnership Team`,
        toneUsed: 'professional',
        reasoning: 'Used professional tone to establish credibility while highlighting specific metrics and authentic connection to fitness niche.',
        placeholders: {
          brand_name: 'FitFuel',
          creator_name: 'Sarah',
          media_pack_url: 'https://example.com/media-pack'
        }
      }
    }
  ]
};

export default pack;
