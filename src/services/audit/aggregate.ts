import { YouTubeProvider } from './providers/youtube';
import { TikTokProvider } from './providers/tiktok';
import { XProvider } from './providers/x';
import { InstagramStubProvider } from './providers/instagramStub';

export interface NormalizedAuditData {
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

    // TikTok
    if (process.env.TIKTOK_API_KEY) {
      try {
        const tiktokData = await TikTokProvider.fetchAccountMetrics(workspaceId);
        if (tiktokData) {
          sources.push('TIKTOK');
          audienceData.push(tiktokData.audience);
          performanceData.push(tiktokData.performance);
          contentSignals.push(...tiktokData.contentSignals);
        }
      } catch (error) {
        console.warn('TikTok audit failed:', error);
      }
    }

    // X (Twitter)
    if (process.env.X_API_KEY) {
      try {
        const xData = await XProvider.fetchAccountMetrics(workspaceId);
        if (xData) {
          sources.push('X');
          audienceData.push(xData.audience);
          performanceData.push(xData.performance);
          contentSignals.push(...xData.contentSignals);
        }
      } catch (error) {
        console.warn('X audit failed:', error);
      }
    }

    // Instagram (stub until Graph API approval)
    try {
      const instagramData = await InstagramStubProvider.fetchAccountMetrics(workspaceId);
      if (instagramData) {
        sources.push('INSTAGRAM_STUB');
        audienceData.push(instagramData.audience);
        performanceData.push(instagramData.performance);
        contentSignals.push(...instagramData.contentSignals);
      }
    } catch (error) {
      console.warn('Instagram audit failed:', error);
    }

    // Aggregate data
    const aggregatedAudience = aggregateAudienceData(audienceData);
    const aggregatedPerformance = aggregatePerformanceData(performanceData);

    return {
      audience: aggregatedAudience,
      performance: aggregatedPerformance,
      contentSignals: [...new Set(contentSignals)], // Remove duplicates
      sources
    };
  } catch (error) {
    console.error('Audit aggregation failed:', error);
    throw new Error('Failed to aggregate audit data');
  }
}

function aggregateAudienceData(audienceData: any[]): NormalizedAuditData['audience'] {
  if (audienceData.length === 0) {
    return {
      size: 0,
      topGeo: [],
      topAge: [],
      engagementRate: 0
    };
  }

  const totalSize = audienceData.reduce((sum, data) => sum + (data.size || 0), 0);
  const avgEngagementRate = audienceData.reduce((sum, data) => sum + (data.engagementRate || 0), 0) / audienceData.length;
  
  // Collect all geo and age data
  const allGeo = audienceData.flatMap(data => data.topGeo || []);
  const allAge = audienceData.flatMap(data => data.topAge || []);
  
  // Get most common geo and age
  const geoCounts = allGeo.reduce((acc: any, geo: string) => {
    acc[geo] = (acc[geo] || 0) + 1;
    return acc;
  }, {});
  
  const ageCounts = allAge.reduce((acc: any, age: string) => {
    acc[age] = (acc[age] || 0) + 1;
    return acc;
  }, {});

  const topGeo = Object.entries(geoCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([geo]) => geo);

  const topAge = Object.entries(ageCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([age]) => age);

  return {
    size: totalSize,
    topGeo,
    topAge,
    engagementRate: avgEngagementRate
  };
}

function aggregatePerformanceData(performanceData: any[]): NormalizedAuditData['performance'] {
  if (performanceData.length === 0) {
    return {
      avgViews: 0,
      avgLikes: 0,
      avgComments: 0,
      avgShares: 0
    };
  }

  const avgViews = performanceData.reduce((sum, data) => sum + (data.avgViews || 0), 0) / performanceData.length;
  const avgLikes = performanceData.reduce((sum, data) => sum + (data.avgLikes || 0), 0) / performanceData.length;
  const avgComments = performanceData.reduce((sum, data) => sum + (data.avgComments || 0), 0) / performanceData.length;
  const avgShares = performanceData.reduce((sum, data) => sum + (data.avgShares || 0), 0) / performanceData.length;

  return {
    avgViews: Math.round(avgViews),
    avgLikes: Math.round(avgLikes),
    avgComments: Math.round(avgComments),
    avgShares: Math.round(avgShares)
  };
}
