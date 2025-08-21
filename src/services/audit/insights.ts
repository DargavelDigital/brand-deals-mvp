import { NormalizedAuditData } from './aggregate';

export interface AuditInsights {
  insights: string[];
  similarCreators: Array<{
    name: string;
    platform: string;
    reason: string;
    audienceSize: string;
  }>;
}

export function generateInsights(auditData: NormalizedAuditData): AuditInsights {
  const insights: string[] = [];
  const similarCreators: AuditInsights['similarCreators'] = [];

  // Audience insights
  if (auditData.audience.size > 0) {
    if (auditData.audience.size > 100000) {
      insights.push(`Large audience of ${formatNumber(auditData.audience.size)} followers across ${auditData.sources.length} platforms`);
    } else if (auditData.audience.size > 10000) {
      insights.push(`Growing audience of ${formatNumber(auditData.audience.size)} followers with strong potential`);
    } else {
      insights.push(`Emerging creator with ${formatNumber(auditData.audience.size)} followers - great time to build brand partnerships`);
    }

    if (auditData.audience.topGeo.length > 0) {
      insights.push(`Strong presence in ${auditData.audience.topGeo.slice(0, 2).join(', ')} - target local brands`);
    }

    if (auditData.audience.topAge.length > 0) {
      insights.push(`Primary audience is ${auditData.audience.topAge[0]} - ideal for age-specific brand campaigns`);
    }
  }

  // Engagement insights
  if (auditData.audience.engagementRate > 0) {
    if (auditData.audience.engagementRate > 0.05) {
      insights.push(`Exceptional engagement rate of ${(auditData.audience.engagementRate * 100).toFixed(1)}% - highly attractive to brands`);
    } else if (auditData.audience.engagementRate > 0.02) {
      insights.push(`Good engagement rate of ${(auditData.audience.engagementRate * 100).toFixed(1)}% - shows active community`);
    } else {
      insights.push(`Engagement rate of ${(auditData.audience.engagementRate * 100).toFixed(1)}% - focus on community building`);
    }
  }

  // Performance insights
  if (auditData.performance.avgViews > 0) {
    if (auditData.performance.avgViews > auditData.audience.size * 0.3) {
      insights.push(`High view-to-follower ratio - content resonates beyond your audience`);
    } else if (auditData.performance.avgViews > auditData.audience.size * 0.1) {
      insights.push(`Solid content performance with consistent viewership`);
    }
  }

  // Content signals insights
  if (auditData.contentSignals.length > 0) {
    const topSignals = auditData.contentSignals.slice(0, 3);
    insights.push(`Content themes: ${topSignals.join(', ')} - leverage for brand partnerships`);
  }

  // Platform-specific insights
  if (auditData.sources.includes('YOUTUBE')) {
    insights.push(`YouTube presence - great for long-form brand integrations and tutorials`);
  }
  if (auditData.sources.includes('TIKTOK')) {
    insights.push(`TikTok presence - ideal for viral brand challenges and short-form content`);
  }
  if (auditData.sources.includes('X')) {
    insights.push(`X (Twitter) presence - perfect for brand announcements and community engagement`);
  }

  // Similar creators (stub data for now)
  if (auditData.audience.size > 0) {
    similarCreators.push({
      name: 'TechReviewer_Pro',
      platform: 'YouTube',
      reason: 'Similar tech content and audience size',
      audienceSize: '125K'
    });
    similarCreators.push({
      name: 'LifestyleCreator',
      platform: 'TikTok',
      reason: 'Matching demographic and engagement patterns',
      audienceSize: '89K'
    });
    similarCreators.push({
      name: 'BusinessInsights',
      platform: 'X',
      reason: 'Comparable professional audience',
      audienceSize: '67K'
    });
  }

  // Ensure we have at least 3 insights
  while (insights.length < 3) {
    insights.push('Continue building authentic content to attract brand partnerships');
  }

  // Cap at 6 insights
  if (insights.length > 6) {
    insights.splice(6);
  }

  return {
    insights,
    similarCreators
  };
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}
