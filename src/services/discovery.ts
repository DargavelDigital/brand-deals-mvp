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
    // TODO: Implement real discovery service (Apollo, Hunter, Exa)
    // No mock data - return empty array
    return [];
  }
};
