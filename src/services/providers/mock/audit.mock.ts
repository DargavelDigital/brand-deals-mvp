export const mockAuditService = {
  async runAudit(workspaceId: string, socialAccounts: string[] = []) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      auditId: `audit-${Date.now()}`,
      sources: socialAccounts.length > 0 ? socialAccounts : ['instagram', 'tiktok', 'linkedin'],
      audience: {
        totalFollowers: 45000,
        avgEngagement: 0.038, // Convert to decimal for percentage display
        reachRate: 0.125,     // Convert to decimal for percentage display
        avgLikes: 280,
        avgComments: 35,
        avgShares: 22
      },
      insights: [
        'Video content performs 3x better than images across all platforms',
        'Best posting times: 9-11 AM and 7-9 PM local time',
        'Stories and Reels have 2.5x higher engagement than feed posts',
        'Professional content performs 40% better on LinkedIn',
        'Facebook posts with questions get 2.3x more engagement',
        'LinkedIn industry-specific content has 60% higher reach'
      ],
      similarCreators: [
        { 
          name: 'TechCreator Pro', 
          platform: 'LinkedIn', 
          reason: 'Similar industry focus and audience demographics',
          audienceSize: '125K followers'
        },
        { 
          name: 'Business Insights', 
          platform: 'Instagram', 
          reason: 'Matching content style and engagement patterns',
          audienceSize: '89K followers'
        },
        { 
          name: 'Digital Marketing Expert', 
          platform: 'TikTok', 
          reason: 'Aligned with your content themes and audience',
          audienceSize: '156K followers'
        }
      ]
    };
  }
};
