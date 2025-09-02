import type { PromptPack } from '../types';

const pack: PromptPack = {
  key: 'outreach.mediaPackCopy',
  version: 'v1',
  systemPrompt: `You are a senior brand strategist. Write concise, punchy copy for a creator's media pack.

Your goal is to create compelling, professional copy that:
- Highlights the creator's unique value proposition
- Showcases their audience and engagement metrics
- Positions them as an ideal brand partner
- Uses specific data points to build credibility

Keep copy concise, professional, and data-driven. Avoid generic statements.`,
  styleKnobs: { tone: true, brevity: true },
  modelHints: { temperature: 0.3, max_output_tokens: 600 },
  inputSchema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    required: ['creatorName', 'socialsSummary', 'audienceSummary'],
    properties: {
      creatorName: { type: 'string' },
      niche: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Creator\'s content niches/categories'
      },
      socialsSummary: { 
        type: 'string',
        description: 'Summary of social media metrics and performance'
      },
      audienceSummary: { 
        type: 'string',
        description: 'Summary of audience demographics and engagement'
      },
      brandName: { 
        type: 'string', 
        nullable: true,
        description: 'Target brand name for personalized copy'
      }
    }
  },
  outputSchema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    required: ['elevatorPitch', 'highlights'],
    properties: {
      elevatorPitch: { 
        type: 'string',
        description: 'Short, compelling introduction paragraph (2-3 sentences)'
      },
      whyThisBrand: { 
        type: 'string', 
        nullable: true,
        description: 'Brand-specific value proposition paragraph (only when brandName provided)'
      },
      highlights: { 
        type: 'array', 
        items: { type: 'string' },
        minItems: 3,
        maxItems: 5,
        description: '3-5 key bullet points highlighting creator strengths'
      }
    }
  },
  fewshots: [
    {
      input: {
        creatorName: 'Sarah Chen',
        niche: ['Fitness', 'Wellness', 'Lifestyle'],
        socialsSummary: '150K+ followers across Instagram (85K), TikTok (45K), and YouTube (20K) with 6.8% average engagement rate',
        audienceSummary: 'Primarily 25-34 female audience (65%) in US/Canada with high disposable income, interested in health and wellness',
        brandName: 'FitFuel'
      },
      output: {
        elevatorPitch: 'Sarah Chen is a fitness and wellness creator with 150K+ engaged followers who trust her authentic approach to healthy living. Her 6.8% engagement rate and premium audience make her an ideal partner for brands looking to connect with health-conscious consumers.',
        whyThisBrand: 'Sarah\'s focus on sustainable fitness and nutrition aligns perfectly with FitFuel\'s mission to provide clean, effective supplements. Her audience of health-conscious women aged 25-34 represents your ideal customer demographic, with the purchasing power to invest in quality wellness products.',
        highlights: [
          '150K+ engaged followers across 3 major platforms',
          '6.8% engagement rate (2x industry average)',
          'Premium audience: 65% female, 25-34, high disposable income',
          'Authentic content that drives real behavior change',
          'Proven track record with wellness brand partnerships'
        ]
      }
    },
    {
      input: {
        creatorName: 'Marcus Johnson',
        niche: ['Tech', 'Gaming', 'Reviews'],
        socialsSummary: '200K+ followers with 4.2% engagement, specializing in tech reviews and gaming content',
        audienceSummary: '18-34 male audience (70%) with strong tech purchasing intent, primarily US-based',
        brandName: null
      },
      output: {
        elevatorPitch: 'Marcus Johnson is a tech and gaming creator with 200K+ followers who rely on his honest, detailed reviews. His 4.2% engagement rate and tech-savvy audience make him a powerful voice for reaching early adopters and gaming enthusiasts.',
        whyThisBrand: null,
        highlights: [
          '200K+ followers in tech and gaming space',
          '4.2% engagement rate with highly engaged community',
          '70% male audience aged 18-34 with strong purchasing power',
          'Expertise in detailed product reviews and comparisons',
          'Strong influence on tech purchasing decisions'
        ]
      }
    }
  ]
};

export default pack;
