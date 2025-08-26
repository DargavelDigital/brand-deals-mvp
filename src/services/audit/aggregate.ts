import { NormalizedAuditData } from './types';
import { YouTubeProvider } from './providers/youtube';
import { TikTokProvider } from './providers/tiktok';
import { XProvider } from './providers/x';
import { FacebookProvider } from './providers/facebook';
import { LinkedInProvider } from './providers/linkedin';

export interface NormalizedAuditData {
  audience: {
    totalFollowers: number;
    avgEngagement: number;
    reachRate: number;
    avgLikes: number;
    avgComments: number;
    avgShares: number;
  };
  contentSignals: string[];
  sources: string[];
}

export async function aggregateAuditData(workspaceId: string): Promise<NormalizedAuditData> {
  const sources: string[] = [];
  const audienceData: any[] = [];
  const performanceData: any[] = [];
  const contentSignals: string[] = [];

  try {
    // YouTube
    if (process.env.YOUTUBE_API_KEY) {
      try {
        const youtubeData = await YouTubeProvider.fetchChannelMetrics(workspaceId);
        if (youtubeData) {
          sources.push('YOUTUBE');
          audienceData.push(youtubeData.audience);
          performanceData.push(youtubeData.performance);
          contentSignals.push(...youtubeData.contentSignals);
        }
      } catch (error) {
        console.warn('YouTube audit failed:', error);
      }
    }

    // TikTok (try real provider first, fallback to stub)
    try {
      const { TikTokProvider } = await import('@/services/audit/providers/tiktok');
      const tiktokData = await TikTokProvider.fetchAccountMetrics(workspaceId);
      
      if (tiktokData) {
        // Real TikTok data available
        sources.push('TIKTOK');
        audienceData.push({
          totalFollowers: tiktokData.audience.size,
          avgEngagement: tiktokData.audience.engagementRate * 100, // Convert to percentage
          reachRate: 10.2 // Keep existing logic for now
        });
        performanceData.push({
          avgLikes: tiktokData.performance.avgLikes,
          avgComments: tiktokData.performance.avgComments,
          avgShares: tiktokData.performance.avgShares
        });
        contentSignals.push(...tiktokData.contentSignals);
      } else {
        // Fallback to stub when not connected
        sources.push('TIKTOK_STUB');
        audienceData.push({
          totalFollowers: 89000,
          avgEngagement: 6.7,
          reachRate: 10.2
        });
        performanceData.push({
          avgLikes: 8500,
          avgComments: 1200,
          avgShares: 3200
        });
        contentSignals.push(
          'Lifestyle Tips',
          'Fashion Trends',
          'Dance Challenges',
          'Comedy Skits'
        );
      }
    } catch (error) {
      console.warn('TikTok audit failed:', error);
      // Fallback to stub on error
      sources.push('TIKTOK_STUB');
      audienceData.push({
        totalFollowers: 89000,
        avgEngagement: 6.7,
        reachRate: 10.2
      });
      performanceData.push({
        avgLikes: 8500,
        avgComments: 1200,
        avgShares: 3200
      });
      contentSignals.push(
        'Lifestyle Tips',
        'Fashion Trends',
        'Dance Challenges',
        'Comedy Skits'
      );
    }

    // X (Twitter) (try real provider first, fallback to stub)
    try {
      const { XRealProvider } = await import('@/services/audit/providers/xReal');
      const xData = await XRealProvider.fetchAccountMetrics(workspaceId);
      
      if (xData) {
        // Real X data available
        sources.push('X');
        audienceData.push({
          totalFollowers: xData.audience.size,
          avgEngagement: xData.audience.engagementRate * 100, // Convert to percentage
          reachRate: 8.2 // Keep existing logic for now
        });
        performanceData.push({
          avgLikes: xData.performance.avgLikes,
          avgComments: xData.performance.avgComments,
          avgShares: xData.performance.avgShares
        });
        contentSignals.push(...xData.contentSignals);
      } else {
        // Fallback to stub when not connected
        sources.push('X_STUB');
        audienceData.push({
          totalFollowers: 67000,
          avgEngagement: 3.8,
          reachRate: 8.2
        });
        performanceData.push({
          avgLikes: 1800,
          avgComments: 320,
          avgShares: 450
        });
        contentSignals.push(
          'Business Insights',
          'Industry News',
          'Professional Tips',
          'Networking'
        );
      }
    } catch (error) {
      console.warn('X audit failed:', error);
      // Fallback to stub on error
      sources.push('X_STUB');
      audienceData.push({
        totalFollowers: 67000,
        avgEngagement: 3.8,
        reachRate: 8.2
      });
      performanceData.push({
        avgLikes: 1800,
        avgComments: 320,
        avgShares: 450
      });
      contentSignals.push(
        'Business Insights',
        'Industry News',
        'Professional Tips',
        'Networking'
      );
    }

    // Facebook
    if (process.env.FACEBOOK_API_KEY) {
      try {
        const facebookData = await FacebookProvider.fetchAccountMetrics(workspaceId);
        if (facebookData) {
          sources.push('FACEBOOK');
          audienceData.push(facebookData.audience);
          performanceData.push(facebookData.performance);
          contentSignals.push(...facebookData.contentSignals);
        }
      } catch (error) {
        console.warn('Facebook audit failed:', error);
      }
    }

    // LinkedIn (try real provider first, fallback to stub)
    try {
      const { LinkedInRealProvider } = await import('@/services/audit/providers/linkedinReal');
      const linkedinData = await LinkedInRealProvider.fetchAccountMetrics(workspaceId);
      
      if (linkedinData) {
        // Real LinkedIn data available
        sources.push('LINKEDIN');
        audienceData.push({
          totalFollowers: linkedinData.audience.size,
          avgEngagement: linkedinData.audience.engagementRate * 100, // Convert to percentage
          reachRate: 8.5 // Keep existing logic for now
        });
        performanceData.push({
          avgLikes: linkedinData.performance.avgLikes,
          avgComments: linkedinData.performance.avgComments,
          avgShares: linkedinData.performance.avgShares
        });
        contentSignals.push(...linkedinData.contentSignals);
      } else {
        // Fallback to stub when not connected
        sources.push('LINKEDIN_STUB');
        audienceData.push({
          totalFollowers: 8900,
          avgEngagement: 2.8,
          reachRate: 8.5
        });
        performanceData.push({
          avgLikes: 180,
          avgComments: 25,
          avgShares: 35
        });
        contentSignals.push(
          'Professional insights posts get 3x more engagement',
          'Industry-specific content performs 60% better',
          'Posts with data/statistics get 2.5x more shares',
          'Best posting times: 8-10 AM and 5-6 PM on weekdays',
          'Long-form content (1000+ words) has higher engagement'
        );
      }
    } catch (error) {
      console.warn('LinkedIn audit failed:', error);
      // Fallback to stub on error
      sources.push('LINKEDIN_STUB');
      audienceData.push({
        totalFollowers: 8900,
        avgEngagement: 2.8,
        reachRate: 8.5
      });
      performanceData.push({
        avgLikes: 180,
        avgComments: 25,
        avgShares: 35
      });
      contentSignals.push(
        'Professional insights posts get 3x more engagement',
        'Industry-specific content performs 60% better',
        'Posts with data/statistics get 2.5x more shares',
        'Best posting times: 8-10 AM and 5-6 PM on weekdays',
        'Long-form content (1000+ words) has higher engagement'
      );
    }

    // OnlyFans (try real provider first, fallback to stub)
    try {
      const { OnlyFansProvider } = await import('@/services/audit/providers/onlyfans');
      const onlyfansData = await OnlyFansProvider.fetchAccountMetrics(workspaceId);
      
      if (onlyfansData) {
        // Real OnlyFans data available
        sources.push('ONLYFANS');
        audienceData.push({
          totalFollowers: onlyfansData.audience.size,
          avgEngagement: onlyfansData.audience.engagementRate * 100, // Convert to percentage
          reachRate: 12.5 // Keep existing logic for now
        });
        performanceData.push({
          avgLikes: onlyfansData.performance.avgLikes,
          avgComments: onlyfansData.performance.avgComments,
          avgShares: onlyfansData.performance.avgShares
        });
        contentSignals.push(...onlyfansData.contentSignals);
      } else {
        // Fallback to stub when not connected
        sources.push('ONLYFANS_STUB');
        audienceData.push({
          totalFollowers: 15000,
          avgEngagement: 8.2,
          reachRate: 12.5
        });
        performanceData.push({
          avgLikes: 1200,
          avgComments: 180,
          avgShares: 320
        });
        contentSignals.push(
          'Exclusive Content',
          'Premium Subscriptions',
          'Direct Messaging',
          'Custom Requests'
        );
      }
    } catch (error) {
      console.warn('OnlyFans audit failed:', error);
      // Fallback to stub on error
      sources.push('ONLYFANS_STUB');
      audienceData.push({
        totalFollowers: 15000,
        avgEngagement: 8.2,
        reachRate: 12.5
      });
      performanceData.push({
        avgLikes: 1200,
        avgComments: 180,
        avgShares: 320
      });
      contentSignals.push(
        'Exclusive Content',
        'Premium Subscriptions',
        'Direct Messaging',
        'Custom Requests'
      );
    }

    // Instagram (try real provider first, fallback to stub)
    try {
      const { InstagramProvider } = await import('@/services/audit/providers/instagram');
      const instagramData = await InstagramProvider.fetchAccountMetrics(workspaceId);
      
      if (instagramData) {
        // Real Instagram data available
        sources.push('INSTAGRAM');
        audienceData.push({
          totalFollowers: instagramData.audience.size,
          avgEngagement: instagramData.audience.engagementRate * 100, // Convert to percentage
          reachRate: 10.2 // Keep existing logic for now
        });
        performanceData.push({
          avgLikes: instagramData.performance.avgLikes,
          avgComments: instagramData.performance.avgComments,
          avgShares: instagramData.performance.avgShares
        });
        contentSignals.push(...instagramData.contentSignals);
      } else {
        // Fallback to stub when not connected
        sources.push('INSTAGRAM_STUB');
        audienceData.push({
          totalFollowers: 15000,
          avgEngagement: 3.8,
          reachRate: 10.2
        });
        performanceData.push({
          avgLikes: 280,
          avgComments: 35,
          avgShares: 15
        });
        contentSignals.push(
          'Stories have 2x higher engagement than feed posts',
          'Reels get 3x more reach than regular videos',
          'Best posting times: 11 AM - 1 PM and 7-9 PM'
        );
      }
    } catch (error) {
      console.warn('Instagram audit failed:', error);
      // Fallback to stub on error
      sources.push('INSTAGRAM_STUB');
      audienceData.push({
        totalFollowers: 15000,
        avgEngagement: 3.8,
        reachRate: 10.2
      });
      performanceData.push({
        avgLikes: 280,
        avgComments: 35,
        avgShares: 15
      });
      contentSignals.push(
        'Stories have 2x higher engagement than feed posts',
        'Reels get 3x more reach than regular videos',
        'Best posting times: 11 AM - 1 PM and 7-9 PM'
      );
    }

    // Aggregate the data
    if (audienceData.length === 0) {
      throw new Error('No social media data available');
    }

    const totalFollowers = audienceData.reduce((sum, data) => sum + (data.totalFollowers || 0), 0);
    const avgEngagement = audienceData.reduce((sum, data) => sum + (data.avgEngagement || 0), 0) / audienceData.length;
    const reachRate = audienceData.reduce((sum, data) => sum + (data.reachRate || 0), 0) / audienceData.length;

    const avgLikes = performanceData.reduce((sum, data) => sum + (data.avgLikes || 0), 0) / performanceData.length;
    const avgComments = performanceData.reduce((sum, data) => sum + (data.avgComments || 0), 0) / performanceData.length;
    const avgShares = performanceData.reduce((sum, data) => sum + (data.avgShares || 0), 0) / performanceData.length;

    return {
      audience: {
        totalFollowers,
        avgEngagement,
        reachRate,
        avgLikes,
        avgComments,
        avgShares
      },
      contentSignals: [...new Set(contentSignals)], // Remove duplicates
      sources
    };
  } catch (error) {
    console.error('Failed to aggregate audit data:', error);
    throw error;
  }
}
