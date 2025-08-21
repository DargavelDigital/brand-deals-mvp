export interface Contact {
  name: string;
  title: string;
  email: string;
  seniority: string;
  verifiedStatus: 'VALID' | 'RISKY' | 'INVALID';
  score: number;
  source: string;
}

export interface DiscoveryParams {
  domain: string;
  name: string;
}

export const discovery = {
  run: async (params: DiscoveryParams): Promise<Contact[]> => {
    // TODO: Implement real discovery service
    // For now, return mock data
    return [
      {
        name: "Alex Patel",
        title: "Head of Influencer Marketing",
        email: `alex@${params.domain}`,
        seniority: "Head",
        verifiedStatus: "VALID",
        score: 98,
        source: "mock"
      },
      {
        name: "Morgan Lee",
        title: "Brand Partnerships Manager",
        email: `morgan@${params.domain}`,
        seniority: "Manager",
        verifiedStatus: "VALID",
        score: 92,
        source: "mock"
      },
      {
        name: "Jamie Chen",
        title: "Social Media Lead",
        email: `jamie@${params.domain}`,
        seniority: "Lead",
        verifiedStatus: "RISKY",
        score: 80,
        source: "mock"
      }
    ];
  }
};
