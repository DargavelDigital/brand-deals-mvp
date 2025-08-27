export type GeoPoint = { lat: number; lng: number };

export type BrandCandidate = {
  id: string;                 // stable if possible (domain or source:id)
  source: 'google'|'yelp'|'serp'|'seed'|'csv'|'mock';
  name: string;
  domain?: string;
  categories: string[];
  geo?: { location?: GeoPoint; distanceKm?: number; city?: string; country?: string };
  size?: 'solo'|'1-10'|'11-50'|'51-200'|'201-1000'|'1000+';
  socials?: { website?: string; instagram?: string; tiktok?: string; youtube?: string; x?: string; linkedin?: string };
  rating?: number;            // optional from Yelp/Places
  reviewCount?: number;
  hoursOpenNow?: boolean;
};

export type RankedBrand = BrandCandidate & {
  score: number;              // 0..100
  rationale: string;          // why it fits the creator & audience
  pitchIdea: string;          // "what to pitch"
  factors: string[];          // bullets used by AI
};

export type BrandSearchInput = {
  workspaceId: string;
  auditId?: string;           // use latest if missing
  geo?: GeoPoint;
  radiusKm?: number;          // default 20
  categories?: string[];      // e.g. ["cafes","gyms","salons"]
  keywords?: string[];        // for Known search
  limit?: number;             // AI top-N, default 24
  includeLocal?: boolean;     // governs Local filter
};
