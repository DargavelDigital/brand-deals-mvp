export const mockAIService = {
  async analyzeProfile(profileSummary: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('🤖 Mock AI Analysis:', {
      profileLength: profileSummary.length,
      timestamp: new Date().toISOString()
    });
    
    return {
      niche: 'Technology & Business',
      tone: 'Professional & Engaging',
      audience: ['Tech professionals', 'Business leaders', 'Entrepreneurs'],
      strengths: [
        'Strong technical expertise',
        'Professional presentation',
        'Consistent content quality'
      ],
      risks: [
        'Limited personal touch',
        'Could diversify content types'
      ]
    };
  },

  async generateBrandMatches(auditData: any, brandHints?: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('🤖 Mock AI Brand Matches:', {
      auditDataKeys: Object.keys(auditData),
      brandHints,
      timestamp: new Date().toISOString()
    });
    
    return [
      {
        brand: 'TechFlow Pro',
        score: 92,
        why: 'High affinity with your tech-savvy audience and professional content style'
      },
      {
        brand: 'InnovateCorp',
        score: 88,
        why: 'Perfect match for your innovation-focused content and business audience'
      },
      {
        brand: 'Digital Solutions Inc',
        score: 85,
        why: 'Aligned with your digital transformation content and professional tone'
      }
    ];
  },

  async generateEmailDraft(creator: string, brand: string, angle: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('🤖 Mock AI Email Draft:', {
      creator,
      brand,
      angle,
      timestamp: new Date().toISOString()
    });
    
    return {
      subject: `Partnership Opportunity: ${brand} x ${creator}`,
      body: `Hi there! I'm ${creator} and I believe there's a great opportunity for collaboration between us. Your brand ${brand} aligns perfectly with my audience and content focus. I'd love to discuss how we could work together to create value for both our audiences. Would you be interested in a quick call to explore this further?`
    };
  }
};
