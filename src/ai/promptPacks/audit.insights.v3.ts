import type { PromptPack } from '../types';

const pack: PromptPack = {
  key: 'audit.insights',
  version: 'v3',
  systemPrompt:
`Analyze this creator profile and provide strategic insights.

Return a JSON object with this EXACT structure:

{
  "creatorProfile": {
    "stage": "Growing/Established/Pro",
    "niche": "Brief description",
    "audienceSize": 50000,
    "engagementRate": "4.2%",
    "contentPillars": ["Topic 1", "Topic 2", "Topic 3"],
    "uniqueStrengths": ["Strength 1", "Strength 2"],
    "growthTrajectory": "Description of growth"
  },
  "brandFitAnalysis": {
    "idealBrandTypes": ["Type 1", "Type 2", "Type 3"],
    "whyBrandsWantYou": ["Reason 1", "Reason 2", "Reason 3"],
    "estimatedValue": "$2,500-$5,000 per post"
  },
  "contentAnalysis": {
    "topPerformingTypes": ["Tutorial", "Tips", "Behind-the-scenes"],
    "contentGaps": ["Gap 1", "Gap 2"],
    "toneAndStyle": "Description"
  },
  "actionableStrategy": {
    "immediate": ["Action 1", "Action 2", "Action 3"],
    "shortTerm": ["Action 1", "Action 2", "Action 3"],
    "longTerm": ["Action 1", "Action 2", "Action 3"]
  },
  "nextMilestones": [
    {
      "milestone": "Milestone description",
      "difficulty": "Easy/Medium/Hard",
      "impact": "High/Medium/Low"
    }
  ]
}

Provide detailed, actionable insights based on the creator data provided.`,
  
  styleKnobs: { tone: true, brevity: true },
  modelHints: { temperature: 0.7, max_output_tokens: 4000 },  // GPT-4o optimized for speed and reliability
  
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
        },
        additionalProperties: false
      },
      stageInfo: {
        type: 'object',
        required: ['stage', 'label', 'followerRange', 'focus'],
        properties: {
          stage: { type: 'string' },
          label: { type: 'string' },
          followerRange: { type: 'string' },
          focus: { type: 'string' }
        },
        additionalProperties: false
      }
    },
    additionalProperties: false
  },
  
  outputSchema: {
    type: 'object',
    required: ['creatorProfile', 'brandFitAnalysis', 'contentAnalysis', 'actionableStrategy', 'nextMilestones'],
    properties: {
      creatorProfile: {
        type: 'object',
        properties: {
          stage: { type: 'string' },
          niche: { type: 'string' },
          audienceSize: { type: 'number' },
          engagementRate: { type: 'string' },
          contentPillars: {
            type: 'array',
            items: { type: 'string' }
          },
          uniqueStrengths: {
            type: 'array',
            items: { type: 'string' }
          },
          growthTrajectory: { type: 'string' }
        },
        required: ['stage', 'niche', 'audienceSize', 'engagementRate', 'contentPillars', 'uniqueStrengths', 'growthTrajectory'],
        additionalProperties: false
      },
      
      brandFitAnalysis: {
        type: 'object',
        properties: {
          idealBrandTypes: {
            type: 'array',
            items: { type: 'string' }
          },
          whyBrandsWantYou: {
            type: 'array',
            items: { type: 'string' }
          },
          estimatedValue: { type: 'string' }
        },
        required: ['idealBrandTypes', 'whyBrandsWantYou', 'estimatedValue'],
        additionalProperties: false
      },
      
      contentAnalysis: {
        type: 'object',
        properties: {
          topPerformingTypes: {
            type: 'array',
            items: { type: 'string' }
          },
          contentGaps: {
            type: 'array',
            items: { type: 'string' }
          },
          toneAndStyle: { type: 'string' }
        },
        required: ['topPerformingTypes', 'contentGaps', 'toneAndStyle'],
        additionalProperties: false
      },
      
      actionableStrategy: {
        type: 'object',
        properties: {
          immediate: {
            type: 'array',
            items: { type: 'string' }
          },
          shortTerm: {
            type: 'array',
            items: { type: 'string' }
          },
          longTerm: {
            type: 'array',
            items: { type: 'string' }
          }
        },
        required: ['immediate', 'shortTerm', 'longTerm'],
        additionalProperties: false
      },
      
      nextMilestones: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            milestone: { type: 'string' },
            difficulty: { type: 'string' },
            impact: { type: 'string' }
          },
          required: ['milestone', 'difficulty', 'impact'],
          additionalProperties: false
        }
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
        creatorProfile: {
          stage: 'Beginner',
          niche: 'Lifestyle & Personal Expression',
          audienceSize: 12,
          engagementRate: '35%',
          contentPillars: ['Personal lifestyle content', 'Authentic daily moments'],
          uniqueStrengths: ['Taking action and posting consistently', 'Authentic content connecting with early supporters'],
          growthTrajectory: 'Just starting out with strong early engagement showing content resonance'
        },
        
        brandFitAnalysis: {
          idealBrandTypes: ['Too early for brand partnerships'],
          whyBrandsWantYou: ['Build foundation first - aim for 1,000+ engaged followers'],
          estimatedValue: 'N/A - focus on audience building first'
        },
        
        contentAnalysis: {
          topPerformingTypes: ['Personal lifestyle content', 'Authentic daily moments'],
          contentGaps: ['Find core content theme', 'Establish posting rhythm'],
          toneAndStyle: 'Authentic, personal posts sharing daily moments'
        },
        
        actionableStrategy: {
          immediate: ['Set up posting schedule - commit to 3 posts this week', 'Complete your profile: bio, profile pic, link', 'Research and follow 20 creators in your target niche'],
          shortTerm: ['Define your content pillars (2-3 core themes)', 'Build engagement habit: respond to every comment', 'Try different content themes and track what performs best'],
          longTerm: ['Reach 100 followers', 'Discover your niche', 'Build community with similar creators']
        },
        
        nextMilestones: [
          {
            milestone: 'Reach 100 followers',
            difficulty: 'Medium',
            impact: 'High'
          },
          {
            milestone: 'Discover your niche',
            difficulty: 'Easy',
            impact: 'Medium'
          }
        ]
      }
    }
  ]
};

export default pack;

