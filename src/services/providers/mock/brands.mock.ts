export const mockBrandsService = {
  async getBrandSuggestions(workspaceId: string, criteria: any) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('🏢 Mock Brand Suggestions:', {
      workspaceId,
      criteria,
      timestamp: new Date().toISOString()
    });
    
    return [
      {
        id: 'brand-1',
        name: 'TechFlow Pro',
        description: 'Leading technology solutions for modern businesses',
        industry: 'Technology',
        logo: 'https://via.placeholder.com/100x100/6366f1/ffffff?text=TF',
        website: 'https://techflowpro.com',
        matchScore: 92,
        reasons: ['High audience overlap', 'Content alignment', 'Industry fit']
      },
      {
        id: 'brand-2',
        name: 'InnovateCorp',
        description: 'Innovation consulting and digital transformation',
        industry: 'Consulting',
        logo: 'https://via.placeholder.com/100x100/10b981/ffffff?text=IC',
        website: 'https://innovatecorp.com',
        matchScore: 88,
        reasons: ['Professional audience match', 'Innovation focus', 'B2B alignment']
      },
      {
        id: 'brand-3',
        name: 'Digital Solutions Inc',
        description: 'Digital marketing and business solutions',
        industry: 'Marketing',
        logo: 'https://via.placeholder.com/100x100/f59e0b/ffffff?text=DS',
        website: 'https://digitalsolutions.com',
        matchScore: 85,
        reasons: ['Marketing expertise', 'Digital focus', 'Business solutions']
      }
    ];
  },

  async getBrandDetails(brandId: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('🏢 Mock Brand Details:', {
      brandId,
      timestamp: new Date().toISOString()
    });
    
    return {
      id: brandId,
      name: 'TechFlow Pro',
      description: 'Leading technology solutions for modern businesses',
      industry: 'Technology',
      logo: 'https://via.placeholder.com/100x100/6366f1/ffffff?text=TF',
      website: 'https://techflowpro.com',
      founded: '2018',
      employees: '150-200',
      headquarters: 'San Francisco, CA',
      socialMedia: {
        linkedin: 'https://linkedin.com/company/techflowpro',
        twitter: 'https://twitter.com/techflowpro',
        instagram: 'https://instagram.com/techflowpro'
      },
      contactInfo: {
        email: 'partnerships@techflowpro.com',
        phone: '+1-555-0123'
      }
    };
  },

  async searchBrands(query: string, filters: any = {}) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    console.log('🏢 Mock Brand Search:', {
      query,
      filters,
      timestamp: new Date().toISOString()
    });
    
    return {
      brands: [
        {
          id: 'brand-1',
          name: 'TechFlow Pro',
          description: 'Leading technology solutions for modern businesses',
          industry: 'Technology',
          matchScore: 92
        }
      ],
      totalResults: 1,
      query,
      filters
    };
  }
};
