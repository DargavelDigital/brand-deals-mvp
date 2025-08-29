import { PromptPack } from '../types';

export const counterOfferPromptPack: PromptPack = {
  id: 'outreach.counterOffer.v1',
  version: '1.0.0',
  name: 'Counter-Offer Email Generator',
  description: 'Generates professional counter-offer emails for creator deals',
  
  systemPrompt: `You are a deal negotiation strategist for creators. Your job is to help creators craft compelling counter-offers that are professional, respectful, and maximize their value while maintaining positive relationships with brands.

Key principles:
- Always be professional and courteous
- Use data and metrics to justify your position
- Suggest specific counter amounts within reasonable ranges
- Explain the value proposition clearly
- Keep the tone collaborative, not confrontational
- Respect minimum floors and industry standards`,

  inputSchema: {
    type: 'object',
    properties: {
      brandOffer: {
        type: 'object',
        properties: {
          amount: { type: 'number', description: 'The brand\'s initial offer amount' },
          deliverables: { type: 'string', description: 'What the creator is expected to deliver' },
          format: { type: 'string', description: 'Content format (post, video, story, etc.)' },
          timeline: { type: 'string', description: 'When the content is due' }
        },
        required: ['amount', 'deliverables']
      },
      creatorMetrics: {
        type: 'object',
        properties: {
          audienceSize: { type: 'number', description: 'Creator\'s audience size' },
          engagementRate: { type: 'number', description: 'Average engagement rate' },
          cpm: { type: 'number', description: 'Creator\'s typical CPM rate' },
          previousBrands: { type: 'array', items: { type: 'string' }, description: 'Previous brand collaborations' }
        },
        required: ['audienceSize', 'engagementRate']
      },
      minCpm: { type: 'number', description: 'Minimum acceptable CPM rate' },
      floorFee: { type: 'number', description: 'Minimum acceptable flat fee' },
      tone: { 
        type: 'string', 
        enum: ['professional', 'relaxed', 'fun'],
        description: 'Desired tone of the email'
      },
      additionalValue: {
        type: 'string',
        description: 'Any additional value the creator can offer (exclusivity, longer timeline, etc.)'
      }
    },
    required: ['brandOffer', 'creatorMetrics', 'minCpm', 'floorFee']
  },

  outputSchema: {
    type: 'object',
    properties: {
      counterAmount: { type: 'number', description: 'Suggested counter amount' },
      reasoning: { type: 'string', description: 'Brief explanation of the counter strategy' },
      draftEmail: { type: 'string', description: 'Complete counter-offer email draft' },
      negotiationTips: { type: 'array', items: { type: 'string' }, description: 'Additional negotiation advice' }
    },
    required: ['counterAmount', 'reasoning', 'draftEmail', 'negotiationTips']
  },

  examples: [
    {
      input: {
        brandOffer: {
          amount: 500,
          deliverables: 'One Instagram post and two stories',
          format: 'Instagram post + stories',
          timeline: 'Within 2 weeks'
        },
        creatorMetrics: {
          audienceSize: 25000,
          engagementRate: 4.2,
          cpm: 12,
          previousBrands: ['Brand A', 'Brand B']
        },
        minCpm: 10,
        floorFee: 750,
        tone: 'professional',
        additionalValue: 'Can offer 30-day exclusivity in the beauty category'
      },
      output: {
        counterAmount: 1200,
        reasoning: 'Based on 25K audience at $12 CPM, plus exclusivity premium',
        draftEmail: `Hi [Brand Name],

Thank you for the opportunity to collaborate on your [Campaign Name] campaign. I'm excited about the project and believe my audience would be a great fit for your brand.

After reviewing the deliverables (one Instagram post and two stories), I'd like to propose a counter-offer of $1,200. This reflects:

• My audience of 25,000 engaged followers with a 4.2% engagement rate
• Industry-standard CPM rates for creators in my tier
• The value of 30-day exclusivity in the beauty category, which I'm happy to offer

I'm confident this partnership will deliver strong results for your brand. I can complete the content within your 2-week timeline and am open to discussing any adjustments to ensure we find the right fit.

Looking forward to working together!

Best regards,
[Creator Name]`,
        negotiationTips: [
          'Emphasize the exclusivity value',
          'Be ready to discuss timeline flexibility',
          'Have engagement metrics ready to share'
        ]
      }
    }
  ],

  validationRules: [
    'counterAmount must be >= minCpm * (audienceSize / 1000) OR >= floorFee',
    'tone must match the requested style (professional/relaxed/fun)',
    'email must be professional and respectful',
    'reasoning must be clear and data-driven'
  ]
};
