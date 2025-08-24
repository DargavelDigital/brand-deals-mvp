export const mockAuditService = {
  async runAudit(workspaceId: string, socialAccounts: string[]) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      auditId: `audit-${Date.now()}`,
      sources: socialAccounts,
      snapshotJson: {
        audience: {
          totalFollowers: 45000,
          avgEngagement: 3.8,
          reachRate: 12.5,
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
          { name: 'TechCreator Pro', followers: 125000, engagement: 4.2 },
          { name: 'Business Insights', followers: 89000, engagement: 3.8 },
          { name: 'Digital Marketing Expert', followers: 156000, engagement: 4.5 }
        ]
      }
    };
  }
};
