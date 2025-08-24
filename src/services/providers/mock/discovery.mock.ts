export const mockDiscoveryService = {
  async discoverBrands(workspaceId: string, criteria: any) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      brands: [
        {
          id: 'brand-1',
          name: 'TechFlow Pro',
          logo: 'https://via.placeholder.com/100x100/6366f1/ffffff?text=TF',
          description: 'Leading technology solutions for modern businesses',
          relevance: 'High match with your tech-savvy audience',
          tags: ['Technology', 'B2B', 'Innovation'],
          matchScore: 92
        },
        {
          id: 'brand-2',
          name: 'FitLife Wellness',
          logo: 'https://via.placeholder.com/100x100/10b981/ffffff?text=FL',
          description: 'Premium fitness and wellness products',
          relevance: 'Perfect for your health-conscious followers',
          tags: ['Fitness', 'Wellness', 'Lifestyle'],
          matchScore: 88
        },
        {
          id: 'brand-3',
          name: 'Creative Studio Co',
          logo: 'https://via.placeholder.com/100x100/f59e0b/ffffff?text=CS',
          description: 'Creative tools and resources for creators',
          relevance: 'Ideal for your creative content focus',
          tags: ['Creativity', 'Tools', 'Design'],
          matchScore: 85
        }
      ],
      totalResults: 3,
      searchCriteria: criteria
    };
  }
};
