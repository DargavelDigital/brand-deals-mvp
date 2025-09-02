export type SocialMetric = {
  platform: 'instagram' | 'tiktok' | 'youtube';
  followers: number;
  avgViews?: number;
  engagementRate?: number; // 0..1
  growth30d?: number;      // % e.g. 0.12 = +12%
};

export type AudienceSlice = {
  label: string; // '18–24', 'US', 'F'
  value: number; // 0..1
};

export type CaseStudy = {
  brand: { name: string; domain?: string };
  goal: string;
  work: string;       // what we did
  result: string;     // outcome metrics
  proof?: string[];   // bullet quick facts
};

export type ServicesRate = {
  label: string;      // 'IG Reel + Story'
  price: number;      // numeric, in workspace currency
  notes?: string;
  sku?: string;
};

export type MediaPackData = {
  packId: string;
  workspaceId: string;
  brandContext?: { name?: string; domain?: string }; // optional when targeted per-brand
  creator: {
    name: string;
    tagline?: string;
    headshotUrl?: string;
    logoUrl?: string;   // your own logo
    niche?: string[];
  };
  socials: SocialMetric[];
  audience: {
    age?: AudienceSlice[];
    gender?: AudienceSlice[];
    geo?: AudienceSlice[];
    interests?: string[];
  };
  contentPillars?: string[];
  caseStudies?: CaseStudy[];
  services?: ServicesRate[];
  rateCardNote?: string;
  contact: {
    email: string;
    phone?: string;
    website?: string;
    socials?: { platform: string; url: string }[];
  };
  ai: {
    elevatorPitch?: string;    // short intro written by AI
    whyThisBrand?: string;     // targeted paragraph when brandContext present
    highlights?: string[];     // 3–5 bullets
  };
  theme?: {
    variant: 'classic' | 'bold' | 'editorial';
    dark?: boolean;
    brandColor?: string; // fallback to var(--brand-600) if not provided
  };
  cta?: {
    meetingUrl?: string;       // Calendly, SavvyCal, etc.
    proposalUrl?: string;
  };
};
