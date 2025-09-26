import { log } from '@/lib/log';
export interface InstagramMetrics {
  audience: {
    size: number;
    topGeo: string[];
    topAge: string[];
    engagementRate: number;
  };
  performance: {
    avgViews: number;
    avgLikes: number;
    avgComments: number;
    avgShares: number;
  };
  contentSignals: string[];
}

export class InstagramStubProvider {
  static async fetchAccountMetrics(workspaceId: string): Promise<InstagramMetrics | null> {
    // TODO: Replace with real Instagram Graph API integration once approved
    // For now, return stub data that simulates what real API would provide
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Stub data - replace with real Graph API calls
      return {
        audience: {
          size: 156000,
          topGeo: ['United States', 'Australia', 'Canada'],
          topAge: ['18-24', '25-34', '35-44'],
          engagementRate: 0.051
        },
        performance: {
          avgViews: 89000,
          avgLikes: 5200,
          avgComments: 780,
          avgShares: 1200
        },
        contentSignals: ['Visual Storytelling', 'Behind-the-Scenes', 'Product Showcases', 'Lifestyle Content']
      };
    } catch (error) {
      log.error('Instagram metrics fetch failed:', error);
      return null;
    }
  }
}
