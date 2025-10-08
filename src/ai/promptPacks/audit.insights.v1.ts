import type { PromptPack } from '../types';

const pack: PromptPack = {
  key: 'audit.insights',
  version: 'v1',
  systemPrompt:
`You are a senior brand strategist. Analyze creator performance across platforms,
surface crisp insights, risks, and 3–5 recommended moves. Be precise and grounded in the data.`,
  styleKnobs: { tone: true, brevity: true },
  modelHints: { temperature: 0.2, max_output_tokens: 800 },
  inputSchema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    required: ['creator', 'audit'],
    properties: {
      creator: {
        type: 'object',
        required: ['name','niche'],
        properties: { 
          name: {type:'string'}, 
          niche:{type:'string'}, 
          country:{type:'string'} 
        }
      },
      audit: {
        type: 'object',
        required: ['audience','content'],
        properties: {
          audience: {
            type:'object',
            properties:{
              followers:{type:'integer'}, 
              topCountries:{type:'array', items:{type:'string'}}, 
              age:{type:'object'} 
            }
          },
          content: {
            type:'object',
            properties:{
              cadence:{type:'string'}, 
              formats:{type:'array',items:{type:'string'}}, 
              avgEngagement:{type:'number'} 
            }
          }
        }
      }
    }
  },
  outputSchema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    required: ['headline','keyFindings','risks','moves'],
    properties: {
      headline: { type: 'string' },
      keyFindings: { type: 'array', items: { type: 'string' }, minItems: 3 },
      risks: { type: 'array', items: { type: 'string' } },
      moves: {
        type: 'array',
        items: { 
          type: 'object', 
          required:['title','why'], 
          properties:{ 
            title:{type:'string'}, 
            why:{type:'string'} 
          },
          additionalProperties: false  // ADD THIS LINE
        },
        minItems: 3, 
        maxItems: 6
      }
    },
    additionalProperties: false  // MAKE SURE THIS EXISTS
  },
  fewshots: [
    {
      input: { 
        creator:{name:'Maya', niche:'Tech reviews'}, 
        audit:{ 
          audience:{followers:180000, topCountries:['US','UK']}, 
          content:{cadence:'3/wk', formats:['YT long','Shorts'], avgEngagement:4.2} 
        } 
      },
      output: {
        headline: 'Trusted explainer with consistent mid-funnel influence',
        keyFindings: [
          'High comment depth on how-to videos (decision-stage)',
          'Shorts expand reach but dilute conversion content',
          'Audience concentrated in US/UK tech buyers'
        ],
        risks: ['Thumbnails inconsistent; CTR volatility'],
        moves: [
          {title:'Codify "benchmark" format', why:'Converts best to affiliate sales'},
          {title:'Optimize thumbnail strategy', why:'Reduce CTR volatility'},
          {title:'Expand to tech education', why:'Leverage existing authority'}
        ]
      }
    }
  ]
};

export default pack;
