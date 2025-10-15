import type { PromptPack } from '../types';

const pack: PromptPack = {
  key: 'audit.insights',
  version: 'v2',
  systemPrompt:
`You are an expert creator strategist and brand partnership consultant. Your role is to:

1. DEEPLY ANALYZE the creator's content, audience, and performance
2. IDENTIFY their unique value proposition and content positioning
3. EXTRACT brand partnership signals from their content themes and audience
4. PROVIDE actionable growth strategies and partnership opportunities

Be specific, data-driven, and focused on both creator growth AND brand matching potential.

Analyze content themes, engagement patterns, audience demographics, and extract signals that indicate:
- What brands would be a natural fit
- What industries align with their content
- What audience interests drive engagement
- What partnership styles would work best

Be precise, grounded in the data provided, and focused on actionable insights.`,
  
  styleKnobs: { tone: true, brevity: true },
  modelHints: { temperature: 0.7, max_output_tokens: 4000 },  // GPT-4o optimized for speed and reliability
  
  inputSchema: {
    type: 'object',
    required: ['snapshot'],
    properties: {
      snapshot: {
        type: 'object',
        properties: {
          instagram: { type: 'object' },
          youtube: { type: 'object' },
          tiktok: { type: 'object' }
        }
      }
    },
    additionalProperties: false
  },
  
  outputSchema: {
    type: 'object',
    required: [
      'headline',
      'creatorProfile',
      'keyFindings',
      'strengthAreas',
      'growthOpportunities',
      'brandFit',
      'immediateActions',
      'strategicMoves'
    ],
    properties: {
      headline: { 
        type: 'string',
        description: 'One-sentence summary of creator positioning'
      },
      
      creatorProfile: {
        type: 'object',
        required: ['primaryNiche', 'contentStyle', 'topContentThemes', 'audiencePersona', 'uniqueValue'],
        properties: {
          primaryNiche: { 
            type: 'string',
            description: 'Main content category, e.g., "Beauty & Lifestyle"'
          },
          contentStyle: { 
            type: 'string',
            description: 'How they create content, e.g., "Educational tutorials with aesthetic visuals"'
          },
          topContentThemes: { 
            type: 'array',
            items: { type: 'string' },
            minItems: 3,
            maxItems: 5,
            description: 'Top 3-5 recurring themes in their content'
          },
          audiencePersona: { 
            type: 'string',
            description: 'Who their audience is, e.g., "Young women 18-25 interested in affordable beauty"'
          },
          uniqueValue: { 
            type: 'string',
            description: 'What makes this creator stand out from others'
          }
        },
        additionalProperties: false
      },
      
      keyFindings: { 
        type: 'array',
        items: { type: 'string' },
        minItems: 4,
        maxItems: 6,
        description: 'Critical insights about performance and audience'
      },
      
      strengthAreas: {
        type: 'array',
        items: { type: 'string' },
        minItems: 3,
        maxItems: 4,
        description: 'What they are doing exceptionally well'
      },
      
      growthOpportunities: {
        type: 'array',
        items: { type: 'string' },
        minItems: 3,
        maxItems: 4,
        description: 'Specific untapped opportunities for growth'
      },
      
      brandFit: {
        type: 'object',
        required: [
          'idealIndustries',
          'productCategories',
          'brandTypes',
          'audienceDemographics',
          'audienceInterests',
          'partnershipStyle',
          'estimatedCPM',
          'partnershipReadiness'
        ],
        properties: {
          idealIndustries: {
            type: 'array',
            items: { type: 'string' },
            minItems: 3,
            maxItems: 5,
            description: 'Industries that align with content, e.g., ["Beauty", "Fashion", "Wellness"]'
          },
          productCategories: {
            type: 'array',
            items: { type: 'string' },
            minItems: 3,
            maxItems: 6,
            description: 'Specific product types that fit, e.g., ["Skincare", "Makeup", "Hair care"]'
          },
          brandTypes: {
            type: 'array',
            items: { type: 'string' },
            minItems: 2,
            maxItems: 4,
            description: 'Brand positioning that fits, e.g., ["Affordable", "DTC", "Sustainable"]'
          },
          audienceDemographics: {
            type: 'object',
            required: ['primaryAgeRange', 'genderSkew', 'topGeoMarkets'],
            properties: {
              primaryAgeRange: { type: 'string' },
              genderSkew: { type: 'string' },
              topGeoMarkets: {
                type: 'array',
                items: { type: 'string' },
                minItems: 1,
                maxItems: 3
              }
            },
            additionalProperties: false
          },
          audienceInterests: {
            type: 'array',
            items: { type: 'string' },
            minItems: 4,
            maxItems: 6,
            description: 'Key interests of their audience for brand targeting'
          },
          partnershipStyle: {
            type: 'string',
            description: 'How they should work with brands, e.g., "Authentic product reviews and tutorials"'
          },
          estimatedCPM: {
            type: 'string',
            description: 'Estimated cost per 1000 impressions based on engagement and reach'
          },
          partnershipReadiness: {
            type: 'string',
            description: 'Assessment of readiness for brand deals'
          }
        },
        additionalProperties: false
      },
      
      immediateActions: {
        type: 'array',
        items: {
          type: 'object',
          required: ['action', 'impact', 'timeframe'],
          properties: {
            action: { type: 'string' },
            impact: { type: 'string' },
            timeframe: { type: 'string' }
          },
          additionalProperties: false
        },
        minItems: 3,
        maxItems: 5
      },
      
      strategicMoves: {
        type: 'array',
        items: {
          type: 'object',
          required: ['title', 'why', 'expectedOutcome'],
          properties: {
            title: { type: 'string' },
            why: { type: 'string' },
            expectedOutcome: { type: 'string' }
          },
          additionalProperties: false
        },
        minItems: 3,
        maxItems: 5
      }
    },
    additionalProperties: false
  },
  
  fewshots: [
    {
      input: { 
        snapshot: {
          instagram: {
            profile: { username: 'beautybyemma', followers_count: 12500 },
            posts: [
              { caption: 'Affordable drugstore makeup haul! 💄 These products are under $15', like_count: 450, comments_count: 23 },
              { caption: 'Quick 5-min morning skincare routine for busy moms', like_count: 380, comments_count: 31 },
              { caption: 'Trying viral TikTok beauty trends - do they actually work?', like_count: 520, comments_count: 45 }
            ],
            insights: { engagement_rate: 3.8, reach: 45000 }
          }
        }
      },
      output: {
        headline: 'Budget-conscious beauty educator with authentic, relatable approach',
        
        creatorProfile: {
          primaryNiche: 'Beauty & Lifestyle',
          contentStyle: 'Practical tutorials with affordability focus and honest product reviews',
          topContentThemes: [
            'Affordable/drugstore beauty products',
            'Quick skincare routines for busy lifestyles',
            'Trend testing and honest reviews',
            'Mom-friendly beauty tips'
          ],
          audiencePersona: 'Women 25-35, budget-conscious, looking for practical beauty solutions that fit busy schedules',
          uniqueValue: 'Authentic voice cutting through luxury beauty content with accessible, tested recommendations'
        },
        
        keyFindings: [
          'Strong engagement on affordable product content (avg 450 likes vs 380 overall)',
          'Trend-testing content drives 35% more comments (social proof seeking)',
          'Morning routine content resonates with working mothers demographic',
          'Honest review approach builds trust - high comment engagement asking for recs'
        ],
        
        strengthAreas: [
          'Authenticity in product recommendations builds audience trust',
          'Budget-focused content fills gap in beauty space',
          'Relatable mom persona connects with underserved demographic'
        ],
        
        growthOpportunities: [
          'Expand drugstore brand partnerships (high engagement, authentic fit)',
          'Create budget beauty guides/collections for different life stages',
          'Develop quick tutorial series for time-strapped audience',
          'Partner with mass-market retailers for exclusive codes'
        ],
        
        brandFit: {
          idealIndustries: [
            'Beauty & Personal Care',
            'Mass Market Retail',
            'Lifestyle & Wellness',
            'Motherhood & Parenting'
          ],
          productCategories: [
            'Drugstore makeup',
            'Affordable skincare',
            'Quick beauty tools',
            'Multi-use products',
            'Travel-size beauty',
            'Time-saving beauty gadgets'
          ],
          brandTypes: [
            'Mass market/drugstore brands',
            'Affordable DTC beauty',
            'Value-focused retailers',
            'Mom-targeted brands'
          ],
          audienceDemographics: {
            primaryAgeRange: '25-35',
            genderSkew: '85% Female',
            topGeoMarkets: ['United States', 'Canada', 'United Kingdom']
          },
          audienceInterests: [
            'Budget shopping and deals',
            'Time-saving beauty hacks',
            'Honest product reviews',
            'Work-life balance',
            'Practical parenting tips',
            'Trending beauty products'
          ],
          partnershipStyle: 'Authentic product testing and honest reviews with budget-conscious angle',
          estimatedCPM: '$18-28 based on 3.8% engagement and niche audience trust',
          partnershipReadiness: 'Ready - consistent content, authentic voice, engaged niche audience'
        },
        
        immediateActions: [
          {
            action: 'Reach out to 3 drugstore beauty brands with media kit',
            impact: 'High - perfect audience match, proven engagement with affordable products',
            timeframe: 'This week'
          },
          {
            action: 'Create "Best Under $15" series for each product category',
            impact: 'Medium - builds authority, drives product discovery, attracts brand attention',
            timeframe: 'Next 2 weeks'
          },
          {
            action: 'Develop affiliate partnerships with Target, CVS, Ulta',
            impact: 'Medium - monetize existing content while building retail relationships',
            timeframe: 'This month'
          }
        ],
        
        strategicMoves: [
          {
            title: 'Position as "Budget Beauty Expert"',
            why: 'Clear differentiation in crowded beauty space, aligns with proven content performance',
            expectedOutcome: 'Become go-to resource for affordable beauty, attract mass-market brand partnerships'
          },
          {
            title: 'Develop "Busy Mom Beauty" sub-brand',
            why: 'Resonates with audience, underserved market segment, multiple partnership angles',
            expectedOutcome: 'Expand to parenting/lifestyle brands, increase audience loyalty'
          },
          {
            title: 'Create seasonal drugstore beauty guides',
            why: 'Evergreen content, SEO potential, recurring brand partnership opportunities',
            expectedOutcome: 'Year-round brand campaigns, predictable partnership revenue'
          }
        ]
      }
    }
  ]
};

export default pack;

