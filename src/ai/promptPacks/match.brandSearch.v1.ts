import { z } from 'zod';

export const MatchBrandSearchSchema = z.object({
  results: z.array(z.object({
    id: z.string(),
    name: z.string(),
    source: z.enum(['google','yelp','serp','seed','csv','mock']),
    domain: z.string().optional(),
    categories: z.array(z.string()),
    geo: z.object({
      location: z.object({ lat: z.number(), lng: z.number() }).partial().optional(),
      distanceKm: z.number().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
    size: z.enum(['solo','1-10','11-50','51-200','201-1000','1000+']).optional(),
    socials: z.object({
      website: z.string().optional(),
      instagram: z.string().optional(),
      tiktok: z.string().optional(),
      youtube: z.string().optional(),
      x: z.string().optional(),
      linkedin: z.string().optional(),
    }).partial().optional(),
    rating: z.number().optional(),
    reviewCount: z.number().optional(),
    hoursOpenNow: z.boolean().optional(),
    score: z.number().min(0).max(100),
    rationale: z.string(),
    pitchIdea: z.string(),
    factors: z.array(z.string()),
  })),
});

export default {
  key: 'match.brandSearch',
  version: 'v1',
  system: `
You are a senior brand partnerships strategist.
Your job: from a list of candidate businesses (local + long-tail), select only those that are *strong fits* for a creator, based on:

1) The creator's AI audit snapshot:
   - content themes & categories
   - audience demographics (age, gender mix, top countries/cities)
   - engagement & platform distribution
2) Brand viability for influencer partnerships:
   - consumer-facing, marketing-active, has social presence or site
   - product/service aligns with creator's content & audience purchasing intent
   - local candidates only if audience *has local overlap*
3) Avoid "random" local businesses that are unlikely to do influencer deals (e.g., government offices, generic B2B without consumer product, unrelated services).

Return only well-matched brands. Provide rationale and a specific "what to pitch".
Use crisp, professional language.
  `.trim(),
  style: {
    determinism: 'high',
    verbosity: 'medium',
  },
  inputSchema: {
    type: 'object',
    properties: {
      auditSnapshot: { type: 'object' },
      candidates: { type: 'array' },
      limit: { type: 'number' },
    },
    required: ['auditSnapshot','candidates'],
  },
  responseSchema: MatchBrandSearchSchema, // for JSON mode
  fewshots: [
    {
      input: { /* redacted */ },
      output: { results: [] }
    }
  ],
};
