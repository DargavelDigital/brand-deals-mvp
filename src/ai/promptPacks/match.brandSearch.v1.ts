/* Prompt pack: Brand Matching v2 (Local + Long-Tail + Why-Now)
 * Uses structured JSON output; compatible with aiInvoke()
 */
import type { JSONSchema7 } from "json-schema";

const matchBrandSearchV1 = {
  key: "match.brandSearch",
  version: "v1",
  model: "gpt-4o-mini", // or your default model
  system: [
    "You are a senior brand partnership strategist.",
    "Rank candidate brands for a creator using audit snapshot signals (content themes, audience demographics, creator geo) and candidate enrichment (categories, geo, size, readiness).",
    "Return strictly valid JSON that conforms to the provided output schema.",
    "Scoring guidance:",
    "- 80–100: extremely strong fit (clear audience & content overlap, strong readiness).",
    "- 60–79: strong fit with some caveats.",
    "- 40–59: moderate fit or limited readiness.",
    "- < 40: weak fit; only include if few candidates.",
    "Local logic: If creator's top geo is near the candidate's geo, set isLocal=true and compute distanceKm (rough estimate from given coords if available; otherwise omit).",
    "'Why now' must be concrete and time-bound (e.g., seasonal campaigns, recent product launches, observed hiring, current ad activity).",
    "CompetitorsMentioned must list brands relevant in the same category or competing for the same audience.",
    "WhatToPitch should be a concise idea tailored to the creator's content and the brand's goals.",
  ].join("\n"),
  instructions: [
    "Use the audit snapshot for audience fit (interests, locations, age bands) & content themes.",
    "Use candidate categories and readiness signals (jobs/press/ads) when available.",
    "If readiness is missing, infer conservatively (score impacts BudgetReadiness dimension).",
    "Keep rationales ≤ 120 words, whyNow ≤ 30 words, whatToPitch ≤ 60 words.",
  ].join("\n"),
  inputSchema: {
    type: "object",
    required: ["auditSnapshot", "candidates", "limit"],
    properties: {
      auditSnapshot: {
        type: "object",
        description: "Latest normalized audit snapshot used for matching.",
        required: ["creator", "audience", "content"],
        properties: {
          creator: {
            type: "object",
            required: ["name", "geo"],
            properties: {
              name: { type: "string" },
              geo: {
                type: "object",
                required: ["country", "city"],
                properties: {
                  country: { type: "string" },
                  city: { type: "string" },
                  lat: { type: "number" },
                  lng: { type: "number" }
                }
              },
              niches: { type: "array", items: { type: "string" } }
            }
          },
          audience: {
            type: "object",
            properties: {
              topLocations: { type: "array", items: { type: "string" } },
              interests: { type: "array", items: { type: "string" } },
              ageBands: { type: "array", items: { type: "string" } },
              genders: { type: "array", items: { type: "string" } },
              totalFollowers: { type: "number" },
              avgEngagementRate: { type: "number" }
            }
          },
          content: {
            type: "object",
            properties: {
              themes: { type: "array", items: { type: "string" } },
              topFormats: { type: "array", items: { type: "string" } }
            }
          }
        }
      },
      candidates: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          required: ["id", "name"],
          properties: {
            id: { type: "string", description: "Stable identifier (domain or UUID)" },
            name: { type: "string" },
            domain: { type: "string" },
            categories: { type: "array", items: { type: "string" } },
            geo: {
              type: "object",
              properties: {
                country: { type: "string" },
                city: { type: "string" },
                lat: { type: "number" },
                lng: { type: "number" }
              }
            },
            size: { type: "string", description: "e.g., SMB, Mid, Enterprise" },
            socials: {
              type: "object",
              additionalProperties: { type: "string" }
            },
            readiness: {
              type: "object",
              properties: {
                score: { type: "number", minimum: 0, maximum: 100 },
                signals: {
                  type: "object",
                  properties: {
                    jobs: { type: "number", description: "Count of recent relevant job posts" },
                    press: { type: "boolean" },
                    ads: { type: "number", description: "Count or level of active ads" }
                  }
                }
              }
            }
          }
        }
      },
      limit: { type: "number", minimum: 1, maximum: 50 },
      nowIso: { type: "string", description: "Current ISO date; helps time-bound 'why now'." }
    }
  } as JSONSchema7,
  outputSchema: {
    type: "object",
    required: ["results"],
    properties: {
      results: {
        type: "array",
        items: {
          type: "object",
          required: ["id", "name", "score", "rationale", "whyNow", "competitorsMentioned", "whatToPitch", "fitDimensions"],
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            domain: { type: "string" },
            isLocal: { type: "boolean" },
            distanceKm: { type: "number" },
            score: { type: "number", minimum: 0, maximum: 100 },
            rationale: { type: "string", maxLength: 800 },
            whyNow: { type: "string", maxLength: 200 },
            competitorsMentioned: { type: "array", items: { type: "string" } },
            whatToPitch: { type: "string", maxLength: 400 },
            fitDimensions: {
              type: "object",
              required: ["audienceGeo", "audienceInterests", "productAffinity", "creatorPersona", "budgetReadiness"],
              properties: {
                audienceGeo: { type: "number", minimum: 0, maximum: 1 },
                audienceInterests: { type: "number", minimum: 0, maximum: 1 },
                productAffinity: { type: "number", minimum: 0, maximum: 1 },
                creatorPersona: { type: "number", minimum: 0, maximum: 1 },
                budgetReadiness: { type: "number", minimum: 0, maximum: 1 }
              }
            },
            readiness: {
              type: "object",
              properties: {
                score: { type: "number", minimum: 0, maximum: 100 },
                signals: {
                  type: "object",
                  properties: {
                    jobs: { type: "number" },
                    press: { type: "boolean" },
                    ads: { type: "number" }
                  }
                }
              }
            }
          }
        }
      }
    }
  } as JSONSchema7,
  fewshot: [
    {
      input: {
        auditSnapshot: {
          creator: { name: "Kai", geo: { country: "UK", city: "London", lat: 51.5072, lng: -0.1276 }, niches: ["streetwear","sneakers"] },
          audience: { topLocations: ["UK","London","Manchester"], interests: ["streetwear","sneakers","gaming"], ageBands: ["18-24","25-34"], genders: ["M","F"], totalFollowers: 180000, avgEngagementRate: 4.2 },
          content: { themes: ["on-feet reviews","city looks"], topFormats: ["shorts","reels"] }
        },
        candidates: [
          { id: "footpatrol.co.uk", name: "Footpatrol", domain: "footpatrol.co.uk", categories: ["Footwear","Streetwear"], geo: { country:"UK", city:"London" }, size: "Mid", readiness: { score: 74, signals: { jobs: 2, press: true, ads: 12 } } },
          { id: "local_sneaker_shop", name: "SneakLab Shoreditch", categories: ["Footwear","Streetwear"], geo: { country:"UK", city:"London" }, size: "SMB", readiness: { score: 58, signals: { jobs: 0, press: false, ads: 1 } } }
        ],
        limit: 2,
        nowIso: "2025-08-29T10:00:00Z"
      },
      output: {
        results: [
          {
            id: "footpatrol.co.uk",
            name: "Footpatrol",
            domain: "footpatrol.co.uk",
            isLocal: true,
            distanceKm: 4,
            score: 91,
            rationale: "Strong overlap with UK/London audience into streetwear & sneakers; creator's on-feet style aligns to launch cycles. Active ads & recent press indicate budget. Mid-size retailer fits paid collabs + affiliate.",
            whyNow: "Autumn drops + back-to-school sneaker demand.",
            competitorsMentioned: ["Size?", "END.", "Offspring"],
            whatToPitch: "3-video 'city looks' capsule around new releases + TikTok cutdowns, trackable affiliate.",
            fitDimensions: { audienceGeo: 0.95, audienceInterests: 0.95, productAffinity: 0.9, creatorPersona: 0.9, budgetReadiness: 0.8 },
            readiness: { score: 74, signals: { jobs: 2, press: true, ads: 12 } }
          },
          {
            id: "local_sneaker_shop",
            name: "SneakLab Shoreditch",
            isLocal: true,
            distanceKm: 2,
            score: 72,
            rationale: "Hyper-local fit; streetwear focus and creator's London base make in-store content easy. Lower ad activity suggests modest budget but high relevance for footfall campaigns.",
            whyNow: "Seasonal new-in & local events calendar.",
            competitorsMentioned: ["Footpatrol", "END."],
            whatToPitch: "In-store styling reels + IG Stories with geo-tag, discount code, and event cameo.",
            fitDimensions: { audienceGeo: 0.9, audienceInterests: 0.85, productAffinity: 0.85, creatorPersona: 0.85, budgetReadiness: 0.55 },
            readiness: { score: 58, signals: { jobs: 0, press: false, ads: 1 } }
          }
        ]
      }
    }
  ]
};

export type MatchBrandSearchInput = {
  auditSnapshot: any;
  candidates: any[];
  limit: number;
  nowIso?: string;
};

export type MatchBrandSearchOutput = {
  results: Array<{
    id: string;
    name: string;
    domain?: string;
    isLocal?: boolean;
    distanceKm?: number;
    score: number;
    rationale: string;
    whyNow: string;
    competitorsMentioned: string[];
    whatToPitch: string;
    fitDimensions: {
      audienceGeo: number;
      audienceInterests: number;
      productAffinity: number;
      creatorPersona: number;
      budgetReadiness: number;
    };
    readiness?: {
      score?: number;
      signals?: { jobs?: number; press?: boolean; ads?: number };
    };
  }>;
};

export default matchBrandSearchV1;
