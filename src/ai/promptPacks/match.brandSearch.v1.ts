import type { PromptPack } from '../types';

const pack: PromptPack = {
  key: 'match.brandSearch',
  version: 'v1',
  systemPrompt:
`You are a brand-creator matchmaker. Analyze creator profile and brand requirements to find optimal partnerships.
Score matches 0-100 and provide clear rationale for each recommendation.`,
  styleKnobs: { tone: true, brevity: true },
  modelHints: { temperature: 0.3, max_output_tokens: 600 },
  inputSchema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    required: ['creator', 'audit', 'brands'],
    properties: {
      creator: {
        type: 'object',
        required: ['name', 'niche', 'country'],
        properties: {
          name: { type: 'string' },
          niche: { type: 'string' },
          country: { type: 'string' },
          followers: { type: 'integer' }
        }
      },
      audit: {
        type: 'object',
        required: ['audience', 'content'],
        properties: {
          audience: {
            type: 'object',
            properties: {
              followers: { type: 'integer' },
              topCountries: { type: 'array', items: { type: 'string' } },
              age: { type: 'object' }
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
      },
      brands: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id', 'name', 'industry', 'category'],
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            industry: { type: 'string' },
            category: { type: 'string' },
            country: { type: 'string' },
            targetAudience: { type: 'string' }
          }
        }
      }
    }
  },
  outputSchema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    required: ['matches', 'notes'],
    properties: {
      matches: {
        type: 'array',
        items: {
          type: 'object',
          required: ['brandId', 'score', 'rationale'],
          properties: {
            brandId: { type: 'string' },
            score: { type: 'integer', minimum: 0, maximum: 100 },
            rationale: { type: 'string' },
            strengths: { type: 'array', items: { type: 'string' } },
            concerns: { type: 'array', items: { type: 'string' } }
          }
        },
        minItems: 1
      },
      notes: { type: 'string' }
    }
  },
  fewshots: [
    {
      input: {
        creator: { name: 'TechGuru', niche: 'Tech reviews', country: 'US', followers: 150000 },
        audit: {
          audience: { followers: 150000, topCountries: ['US', 'CA'], age: { avg: 28 } },
          content: { formats: ['YouTube', 'TikTok'], avgEngagement: 5.2 }
        },
        brands: [
          { id: 'tech1', name: 'GadgetPro', industry: 'Technology', category: 'Consumer Electronics', country: 'US', targetAudience: 'Tech enthusiasts 18-35' }
        ]
      },
      output: {
        matches: [
          {
            brandId: 'tech1',
            score: 87,
            rationale: 'Strong audience overlap with tech-savvy demographic',
            strengths: ['Perfect niche alignment', 'Geographic match', 'High engagement rate'],
            concerns: ['Consider brand safety with review content']
          }
        ],
        notes: 'TechGuru shows excellent potential for GadgetPro partnership with strong audience alignment.'
      }
    }
  ]
};

export default pack;
