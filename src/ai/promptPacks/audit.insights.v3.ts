import type { PromptPack } from '../types';

const pack: PromptPack = {
  key: 'audit.insights',
  version: 'v3',
  systemPrompt:
`You are a supportive creator growth mentor and brand partnership consultant. Your role is to:

1. UNDERSTAND where the creator is in their journey (beginner, growing, established, or professional)
2. ADAPT your tone, advice, and recommendations to their specific stage
3. PROVIDE genuinely helpful, stage-appropriate guidance that feels personal
4. BE ENCOURAGING while being honest about opportunities and growth areas
5. EXTRACT brand partnership signals (but only emphasize them for established+ creators)

For BEGINNERS (0-100 followers):
- Be warm, encouraging, and educational
- Focus on: Habit building, finding niche, posting consistency
- Celebrate that they've started (hardest part!)
- Provide clear, simple roadmap
- DON'T talk about monetization or brand deals yet
- Use phrases like "You're at the perfect starting point!" and "Here's your path forward"

For GROWING creators (100-5k):
- Be motivational with specific optimization tactics
- Focus on: Content quality, engagement strategies, reaching next milestone
- Introduce monetization concepts gently (affiliates, small partnerships)
- Provide A/B testing strategies
- Use phrases like "You've built momentum!" and "Let's optimize to reach 1k"

For ESTABLISHED creators (5k-50k):
- Be strategic and business-focused
- Focus on: Brand partnerships, rate cards, content strategy, scaling
- Provide detailed brand matching analysis
- Discuss CPM, partnership types, industry fit
- Use professional but friendly tone

For PROFESSIONAL creators (50k+):
- Be analytical and sophisticated
- Focus on: Market positioning, competitive analysis, advanced tactics
- Assume business knowledge
- Provide deep insights and data-driven strategies

CRITICAL: Read the stage information provided and adapt EVERYTHING to that stage. Make it feel like you understand exactly where they are and what they need next.`,
  
  styleKnobs: { tone: true, brevity: true },
  modelHints: { temperature: 0.2, max_output_tokens: 4000 },
  
  inputSchema: {
    type: 'object',
    required: ['snapshot', 'stageInfo'],
    properties: {
      snapshot: {
        type: 'object',
        properties: {
          instagram: { type: 'object' },
          youtube: { type: 'object' },
          tiktok: { type: 'object' }
        }
      },
      stageInfo: {
        type: 'object',
        required: ['stage', 'label', 'followerRange', 'focus'],
        properties: {
          stage: { type: 'string' },
          label: { type: 'string' },
          followerRange: { type: 'string' },
          focus: { type: 'string' }
        }
      }
    },
    additionalProperties: false
  },
  
  outputSchema: {
    type: 'object',
    required: [
      'headline',
      'stageMessage',
      'creatorProfile',
      'keyFindings',
      'strengthAreas',
      'growthOpportunities',
      'nextMilestones',
      'immediateActions',
      'strategicMoves'
    ],
    properties: {
      headline: { 
        type: 'string',
        description: 'Stage-appropriate one-sentence summary'
      },
      
      stageMessage: {
        type: 'string',
        description: 'Warm, encouraging message personalized to their stage'
      },
      
      creatorProfile: {
        type: 'object',
        required: ['primaryNiche', 'contentStyle', 'topContentThemes', 'audiencePersona', 'uniqueValue'],
        properties: {
          primaryNiche: { type: 'string' },
          contentStyle: { type: 'string' },
          topContentThemes: { 
            type: 'array',
            items: { type: 'string' },
            minItems: 2,
            maxItems: 5
          },
          audiencePersona: { type: 'string' },
          uniqueValue: { type: 'string' }
        },
        additionalProperties: false
      },
      
      keyFindings: { 
        type: 'array',
        items: { type: 'string' },
        minItems: 3,
        maxItems: 6
      },
      
      strengthAreas: {
        type: 'array',
        items: { type: 'string' },
        minItems: 2,
        maxItems: 4
      },
      
      growthOpportunities: {
        type: 'array',
        items: { type: 'string' },
        minItems: 3,
        maxItems: 5
      },
      
      nextMilestones: {
        type: 'array',
        items: {
          type: 'object',
          required: ['goal', 'timeframe', 'keyActions'],
          properties: {
            goal: { type: 'string' },
            timeframe: { type: 'string' },
            keyActions: {
              type: 'array',
              items: { type: 'string' },
              minItems: 2,
              maxItems: 4
            }
          },
          additionalProperties: false
        },
        minItems: 2,
        maxItems: 3
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
            minItems: 2,
            maxItems: 5
          },
          productCategories: {
            type: 'array',
            items: { type: 'string' },
            minItems: 2,
            maxItems: 6
          },
          brandTypes: {
            type: 'array',
            items: { type: 'string' },
            minItems: 2,
            maxItems: 4
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
            minItems: 3,
            maxItems: 6
          },
          partnershipStyle: { type: 'string' },
          estimatedCPM: { type: 'string' },
          partnershipReadiness: { type: 'string' }
        },
        additionalProperties: false
      },
      
      immediateActions: {
        type: 'array',
        items: {
          type: 'object',
          required: ['action', 'impact', 'timeframe', 'difficulty'],
          properties: {
            action: { type: 'string' },
            impact: { type: 'string' },
            timeframe: { type: 'string' },
            difficulty: { 
              type: 'string',
              enum: ['Easy', 'Medium', 'Advanced']
            }
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
        minItems: 2,
        maxItems: 4
      }
    },
    additionalProperties: false
  },
  
  fewshots: [
    {
      input: { 
        snapshot: {
          instagram: {
            igUserId: '123',
            username: 'newcreator',
            followers: 12,
            posts: [
              { id: '1', timestamp: '2025-01-01', likeCount: 3, commentsCount: 1 },
              { id: '2', timestamp: '2025-01-02', likeCount: 2, commentsCount: 0 },
              { id: '3', timestamp: '2025-01-03', likeCount: 4, commentsCount: 2 }
            ],
            avgEngagementRate: 0.35
          }
        },
        stageInfo: {
          stage: 'beginner',
          label: 'Just Starting Out',
          followerRange: '0-100',
          focus: 'Building foundation and finding voice'
        }
      },
      output: {
        headline: 'New creator taking first steps with authentic content',
        
        stageMessage: "You're at the exciting beginning of your creator journey! You've posted your first content - that's the hardest part. Your engagement rate is strong for a new account, which shows your content is connecting. Here's your roadmap to build momentum and reach your first 100 followers.",
        
        creatorProfile: {
          primaryNiche: 'Lifestyle & Personal Expression',
          contentStyle: 'Authentic, personal posts sharing daily moments',
          topContentThemes: [
            'Personal lifestyle content',
            'Authentic daily moments'
          ],
          audiencePersona: 'Friends, family, and early supporters interested in genuine content',
          uniqueValue: 'Authentic voice in early development - building genuine connections'
        },
        
        keyFindings: [
          'Strong early engagement (35%) shows content is resonating with initial audience',
          '3 posts published demonstrates commitment to starting',
          'Personal connections driving early likes and comments'
        ],
        
        strengthAreas: [
          'Taking action and posting consistently',
          'Authentic content connecting with early supporters'
        ],
        
        growthOpportunities: [
          'Find your core content theme to attract similar followers',
          'Establish posting rhythm (aim for 3-5 posts per week)',
          'Engage with similar creators in your niche to build community'
        ],
        
        nextMilestones: [
          {
            goal: 'Reach 100 followers',
            timeframe: '30-60 days',
            keyActions: [
              'Post 3-5 times per week consistently',
              'Use 5-10 relevant hashtags per post',
              'Engage with 10-15 accounts in your niche daily',
              'Find your unique content angle'
            ]
          },
          {
            goal: 'Discover your niche',
            timeframe: 'Next 30 days',
            keyActions: [
              'Try different content themes and track what performs best',
              'Study 3-5 creators you admire in similar spaces',
              'Note which posts get the most saves/shares'
            ]
          }
        ],
        
        brandFit: {
          idealIndustries: ['Too early for brand partnerships'],
          productCategories: ['Focus on audience building first'],
          brandTypes: ['Not applicable at this stage'],
          audienceDemographics: {
            primaryAgeRange: 'Building',
            genderSkew: 'Unknown',
            topGeoMarkets: ['Local']
          },
          audienceInterests: ['Growing understanding'],
          partnershipStyle: 'Not ready - focus on content and audience first',
          estimatedCPM: 'N/A - build to 1,000+ engaged followers first',
          partnershipReadiness: 'Build foundation first - aim for 1,000+ followers with consistent engagement before approaching brands'
        },
        
        immediateActions: [
          {
            action: 'Set up posting schedule - commit to 3 posts this week',
            impact: 'High - consistency is the foundation of growth',
            timeframe: 'This week',
            difficulty: 'Easy'
          },
          {
            action: 'Research and follow 20 creators in your target niche',
            impact: 'Medium - learn from others and build community',
            timeframe: 'Next 3 days',
            difficulty: 'Easy'
          },
          {
            action: 'Complete your profile: bio, profile pic, link',
            impact: 'Medium - make great first impression on new visitors',
            timeframe: 'Today',
            difficulty: 'Easy'
          }
        ],
        
        strategicMoves: [
          {
            title: 'Define your content pillars (2-3 core themes)',
            why: 'Clarity attracts similar followers and builds recognizable brand',
            expectedOutcome: 'Faster follower growth as people know what to expect from your content'
          },
          {
            title: 'Build engagement habit: respond to every comment',
            why: 'Early engagement builds loyal community and signals to algorithm',
            expectedOutcome: 'Higher engagement rate and stronger initial follower base'
          }
        ]
      }
    }
  ]
};

export default pack;

