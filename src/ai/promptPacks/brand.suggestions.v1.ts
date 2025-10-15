/* Prompt pack: AI Brand Suggestions v1
 * Generates real brand suggestions (international, national, local) based on creator's audit data
 * Uses structured JSON output; compatible with aiInvoke()
 */
import type { JSONSchema7 } from "json-schema";
import { AI_MODEL } from "@/config/ai";

const brandSuggestionsV1 = {
  key: "brand.suggestions",
  version: "v1",
  model: AI_MODEL,
  system: [
    "You are an expert brand partnership strategist with deep knowledge of global, national, and local brands across all industries.",
    "Your task is to suggest REAL brands that actually exist and would be a good partnership fit for the creator.",
    "Suggest brands in 3 tiers:",
    "1. International: Global brands with worldwide presence (Nike, Apple, Coca-Cola, etc.)",
    "2. National: Major brands in the creator's country (market leaders, national chains)",
    "3. Local: Local businesses in the creator's city/region (restaurants, gyms, boutiques, local services)",
    "",
    "CRITICAL: Only suggest brands that ACTUALLY EXIST. Do not invent fake brands.",
    "Use the creator's niche, audience demographics, content themes, and location to find relevant brands.",
    "Estimated budgets should be realistic based on brand size and creator's follower count.",
    "",
    "Budget ranges:",
    "- International: $5,000-$50,000+ (depending on creator size)",
    "- National: $1,000-$15,000",
    "- Local: $200-$2,000",
  ].join("\n"),
  instructions: [
    "Analyze the creator's audit data: niche, content themes, audience demographics, location.",
    "Suggest brands that align with the creator's content and audience interests.",
    "For international brands: Focus on global companies relevant to the creator's niche.",
    "For national brands: Focus on major brands/chains in the creator's country.",
    "For local brands: Focus on businesses in the creator's city or region.",
    "Include the brand's website (actual URL, not made up).",
    "Explain why each brand is a good fit (audience overlap, content alignment, partnership potential).",
    "Provide realistic estimated budgets based on brand tier and creator's follower count.",
    "Ensure all brands are REAL and verifiable.",
  ].join("\n"),
  inputSchema: {
    type: "object",
    required: ["creatorProfile", "auditData"],
    properties: {
      creatorProfile: {
        type: "object",
        required: ["name", "niche", "location"],
        properties: {
          name: { type: "string", description: "Creator's name" },
          niche: { type: "string", description: "Primary niche (e.g., fitness, beauty, tech)" },
          location: {
            type: "object",
            required: ["country", "city"],
            properties: {
              country: { type: "string", description: "Creator's country" },
              city: { type: "string", description: "Creator's city" },
              region: { type: "string", description: "State/province/region" }
            }
          },
          followers: { type: "number", description: "Total follower count" }
        }
      },
      auditData: {
        type: "object",
        required: ["contentThemes", "audienceInterests"],
        properties: {
          contentThemes: { 
            type: "array", 
            items: { type: "string" },
            description: "Main content themes (e.g., 'workout tutorials', 'product reviews')"
          },
          audienceInterests: { 
            type: "array", 
            items: { type: "string" },
            description: "Audience interests (e.g., 'fitness', 'wellness', 'fashion')"
          },
          topLocations: { 
            type: "array", 
            items: { type: "string" },
            description: "Top audience locations (countries/cities)"
          },
          ageDemographics: { 
            type: "array", 
            items: { type: "string" },
            description: "Primary age ranges (e.g., '18-24', '25-34')"
          }
        }
      }
    }
  } as JSONSchema7,
  outputSchema: {
    type: "object",
    required: ["international", "national", "local"],
    properties: {
      international: {
        type: "array",
        minItems: 5,
        maxItems: 8,
        items: {
          type: "object",
          required: ["name", "industry", "website", "why_good_fit", "estimated_budget"],
          properties: {
            name: { type: "string", description: "Brand name" },
            industry: { type: "string", description: "Industry/category" },
            website: { type: "string", description: "Brand's actual website URL" },
            why_good_fit: { type: "string", maxLength: 200, description: "Why this brand is a good fit" },
            estimated_budget: { type: "string", description: "Budget range (e.g., '$10,000-$25,000')" }
          },
          additionalProperties: false
        }
      },
      national: {
        type: "array",
        minItems: 5,
        maxItems: 8,
        items: {
          type: "object",
          required: ["name", "industry", "website", "why_good_fit", "estimated_budget"],
          properties: {
            name: { type: "string", description: "Brand name" },
            industry: { type: "string", description: "Industry/category" },
            website: { type: "string", description: "Brand's actual website URL" },
            why_good_fit: { type: "string", maxLength: 200, description: "Why this brand is a good fit" },
            estimated_budget: { type: "string", description: "Budget range (e.g., '$2,000-$8,000')" }
          },
          additionalProperties: false
        }
      },
      local: {
        type: "array",
        minItems: 10,
        maxItems: 15,
        items: {
          type: "object",
          required: ["name", "industry", "website", "why_good_fit", "estimated_budget"],
          properties: {
            name: { type: "string", description: "Business name" },
            industry: { type: "string", description: "Industry/category" },
            website: { type: "string", description: "Business website or Google Maps link" },
            why_good_fit: { type: "string", maxLength: 200, description: "Why this business is a good fit" },
            estimated_budget: { type: "string", description: "Budget range (e.g., '$300-$1,000')" }
          },
          additionalProperties: false
        }
      }
    },
    additionalProperties: false
  } as JSONSchema7,
  fewshot: [
    {
      input: {
        creatorProfile: {
          name: "Sarah",
          niche: "Fitness & Wellness",
          location: {
            country: "United Kingdom",
            city: "London",
            region: "Greater London"
          },
          followers: 85000
        },
        auditData: {
          contentThemes: ["Workout tutorials", "Healthy recipes", "Fitness motivation", "Product reviews"],
          audienceInterests: ["Fitness", "Wellness", "Healthy eating", "Yoga", "Running"],
          topLocations: ["United Kingdom", "London", "Manchester", "United States"],
          ageDemographics: ["25-34", "18-24"]
        }
      },
      output: {
        international: [
          {
            name: "Nike",
            industry: "Sportswear & Athletic Apparel",
            website: "https://www.nike.com",
            why_good_fit: "Global athletic brand aligning with fitness content. Strong presence in workout apparel and running gear. Appeals to 18-34 demographic with active lifestyle focus.",
            estimated_budget: "$15,000-$35,000"
          },
          {
            name: "MyProtein",
            industry: "Sports Nutrition & Supplements",
            website: "https://www.myprotein.com",
            why_good_fit: "UK-based global nutrition brand. Perfect for fitness creators promoting healthy lifestyle and workout recovery. Strong affiliate program.",
            estimated_budget: "$8,000-$20,000"
          },
          {
            name: "Lululemon",
            industry: "Athletic Apparel & Yoga Wear",
            website: "https://www.lululemon.com",
            why_good_fit: "Premium athletic wear brand aligned with wellness and yoga content. Appeals to health-conscious 25-34 audience seeking quality activewear.",
            estimated_budget: "$12,000-$28,000"
          },
          {
            name: "Fitbit",
            industry: "Fitness Technology & Wearables",
            website: "https://www.fitbit.com",
            why_good_fit: "Fitness tracking technology perfect for workout tutorials and progress content. Strong brand recognition in wellness space.",
            estimated_budget: "$10,000-$25,000"
          },
          {
            name: "Whole Foods Market",
            industry: "Organic & Health Food Retail",
            website: "https://www.wholefoodsmarket.com",
            why_good_fit: "Organic food retailer aligning with healthy eating and recipe content. Appeals to health-conscious audience interested in nutrition.",
            estimated_budget: "$8,000-$18,000"
          }
        ],
        national: [
          {
            name: "PureGym",
            industry: "Fitness & Gym Chain",
            website: "https://www.puregym.com",
            why_good_fit: "UK's leading gym chain with London locations. Perfect fit for workout content and gym culture. Appeals to budget-conscious fitness enthusiasts.",
            estimated_budget: "$3,000-$10,000"
          },
          {
            name: "Holland & Barrett",
            industry: "Health Food & Supplements",
            website: "https://www.hollandandbarrett.com",
            why_good_fit: "UK's largest health food retailer. Strong alignment with wellness content and supplement recommendations. Nationwide presence.",
            estimated_budget: "$4,000-$12,000"
          },
          {
            name: "Sweaty Betty",
            industry: "Women's Activewear",
            website: "https://www.sweatybetty.com",
            why_good_fit: "UK-based premium women's activewear brand. Perfect for female fitness audience interested in stylish workout gear.",
            estimated_budget: "$5,000-$15,000"
          },
          {
            name: "Gymshark",
            industry: "Fitness Apparel & Accessories",
            website: "https://www.gymshark.com",
            why_good_fit: "UK fitness brand with massive social media presence. Appeals to young fitness enthusiasts (18-34). Strong influencer program.",
            estimated_budget: "$6,000-$18,000"
          },
          {
            name: "Pret A Manger",
            industry: "Healthy Food & Coffee",
            website: "https://www.pret.co.uk",
            why_good_fit: "UK healthy food chain perfect for on-the-go nutrition content. Appeals to busy fitness enthusiasts seeking convenient healthy meals.",
            estimated_budget: "$2,500-$8,000"
          }
        ],
        local: [
          {
            name: "1Rebel",
            industry: "Boutique Fitness Studio",
            website: "https://www.1rebel.co.uk",
            why_good_fit: "Premium London fitness studio offering immersive workout experiences. Perfect for high-energy fitness content and studio features.",
            estimated_budget: "$800-$2,500"
          },
          {
            name: "Frame",
            industry: "Boutique Fitness & Wellness",
            website: "https://www.moveyourframe.com",
            why_good_fit: "London-based boutique fitness studio with multiple locations. Appeals to wellness-focused audience seeking varied workout classes.",
            estimated_budget: "$600-$2,000"
          },
          {
            name: "The Good Life Eatery",
            industry: "Healthy Restaurant Chain (London)",
            website: "https://www.thegoodlifeeatery.com",
            why_good_fit: "London healthy eating chain perfect for nutrition and meal prep content. Appeals to health-conscious foodies.",
            estimated_budget: "$500-$1,500"
          },
          {
            name: "Psycle",
            industry: "Boutique Cycling Studio",
            website: "https://www.psyclelondon.com",
            why_good_fit: "London boutique cycling studio offering high-energy spin classes. Great for cardio workout content and studio collaborations.",
            estimated_budget: "$700-$2,000"
          },
          {
            name: "Planet Organic",
            industry: "Organic Supermarket (London)",
            website: "https://www.planetorganic.com",
            why_good_fit: "London organic supermarket chain perfect for healthy shopping hauls and nutrition content. Appeals to wellness-focused audience.",
            estimated_budget: "$400-$1,200"
          },
          {
            name: "Equinox",
            industry: "Luxury Fitness Club",
            website: "https://www.equinox.com/en-GB",
            why_good_fit: "Premium London gym with luxury facilities. Perfect for high-end fitness content showcasing premium workout experiences.",
            estimated_budget: "$1,000-$3,000"
          },
          {
            name: "Lomax",
            industry: "Coffee & Wellness Cafe (London)",
            website: "https://www.lomaxcoffee.co.uk",
            why_good_fit: "London coffee shop focusing on health-conscious menu. Great for lifestyle content combining fitness and nutrition.",
            estimated_budget: "$300-$800"
          },
          {
            name: "Barry's Bootcamp",
            industry: "HIIT Fitness Studio",
            website: "https://www.barrys.com/location/london",
            why_good_fit: "London location of popular HIIT studio chain. Perfect for intense workout content and fitness challenges.",
            estimated_budget: "$800-$2,500"
          },
          {
            name: "Core Collective",
            industry: "Multi-Studio Fitness Hub",
            website: "https://www.corecollective.co.uk",
            why_good_fit: "London fitness hub housing multiple boutique studios. Great for showcasing variety of workout styles and fitness diversity.",
            estimated_budget: "$600-$1,800"
          },
          {
            name: "Mindful Chef",
            industry: "Healthy Meal Delivery (London)",
            website: "https://www.mindfulchef.com",
            why_good_fit: "London-based healthy meal kit delivery. Perfect for nutrition content, meal prep tutorials, and busy fitness lifestyle.",
            estimated_budget: "$500-$1,500"
          }
        ]
      }
    }
  ]
};

export type BrandSuggestionsInput = {
  creatorProfile: {
    name: string;
    niche: string;
    location: {
      country: string;
      city: string;
      region?: string;
    };
    followers?: number;
  };
  auditData: {
    contentThemes: string[];
    audienceInterests: string[];
    topLocations?: string[];
    ageDemographics?: string[];
  };
};

export type BrandSuggestionsOutput = {
  international: Array<{
    name: string;
    industry: string;
    website: string;
    why_good_fit: string;
    estimated_budget: string;
  }>;
  national: Array<{
    name: string;
    industry: string;
    website: string;
    why_good_fit: string;
    estimated_budget: string;
  }>;
  local: Array<{
    name: string;
    industry: string;
    website: string;
    why_good_fit: string;
    estimated_budget: string;
  }>;
};

export default brandSuggestionsV1;

