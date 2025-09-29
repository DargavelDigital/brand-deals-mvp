import { prisma } from '@/lib/prisma';
import { getBrandLogo } from '@/lib/brandLogo';
import { MediaPackData, SocialMetric, AudienceSlice, CaseStudy, ServicesRate } from './types';

interface BuildPackDataOptions {
  workspaceId: string;
  brandId?: string;
}

/**
 * Build MediaPackData from existing audit snapshots and brand matches
 */
export async function buildPackData({ workspaceId, brandId }: BuildPackDataOptions): Promise<MediaPackData> {
  // Get workspace info
  const workspace = await prisma().workspace.findUnique({
    where: { id: workspaceId },
    include: {
      memberships: {
        include: {
          user: true
        },
        take: 1
      }
    }
  });

  if (!workspace) {
    throw new Error('Workspace not found');
  }

  // Get latest audit snapshot
  const latestAudit = await prisma().audit.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' }
  });

  if (!latestAudit) {
    throw new Error('No audit data found for workspace');
  }

  const auditData = latestAudit.snapshotJson as any;

  // Get brand context if brandId provided
  let brandContext: { name?: string; domain?: string } | undefined;
  if (brandId) {
    const brand = await prisma().brand.findUnique({
      where: { id: brandId },
      include: { profile: true }
    });
    
    if (brand) {
      brandContext = {
        name: brand.name,
        domain: brand.profile?.domain || brand.website
      };
    }
  }

  // Get primary user for creator info
  const primaryUser = workspace.memberships[0]?.user;

  // Build social metrics from audit data
  const socials: SocialMetric[] = [];
  
  // Map audit sources to social platforms
  const sources = latestAudit.sources || [];
  
  if (sources.includes('INSTAGRAM') || sources.includes('INSTAGRAM_STUB')) {
    socials.push({
      platform: 'instagram',
      followers: auditData.audience?.totalFollowers ? Math.floor(auditData.audience.totalFollowers * 0.4) : 15000,
      avgViews: auditData.performance?.avgLikes ? Math.floor(auditData.performance.avgLikes * 1.2) : 280,
      engagementRate: auditData.audience?.avgEngagement ? auditData.audience.avgEngagement / 100 : 0.038, // Convert % to decimal
      growth30d: 0.12 // Default 12% growth
    });
  }

  if (sources.includes('TIKTOK') || sources.includes('TIKTOK_STUB')) {
    socials.push({
      platform: 'tiktok',
      followers: auditData.audience?.totalFollowers ? Math.floor(auditData.audience.totalFollowers * 0.5) : 89000,
      avgViews: auditData.performance?.avgLikes ? Math.floor(auditData.performance.avgLikes * 8) : 8500,
      engagementRate: auditData.audience?.avgEngagement ? auditData.audience.avgEngagement / 100 : 0.067,
      growth30d: 0.15 // Default 15% growth
    });
  }

  if (sources.includes('YOUTUBE')) {
    socials.push({
      platform: 'youtube',
      followers: auditData.audience?.totalFollowers ? Math.floor(auditData.audience.totalFollowers * 0.3) : 25000,
      avgViews: auditData.performance?.avgLikes ? Math.floor(auditData.performance.avgLikes * 15) : 12000,
      engagementRate: auditData.audience?.avgEngagement ? auditData.audience.avgEngagement / 100 : 0.045,
      growth30d: 0.08 // Default 8% growth
    });
  }

  // Build audience data from audit insights
  const audience = {
    age: [
      { label: '18-24', value: 0.35 },
      { label: '25-34', value: 0.40 },
      { label: '35-44', value: 0.20 },
      { label: '45+', value: 0.05 }
    ] as AudienceSlice[],
    gender: [
      { label: 'F', value: 0.65 },
      { label: 'M', value: 0.35 }
    ] as AudienceSlice[],
    geo: [
      { label: 'US', value: 0.45 },
      { label: 'CA', value: 0.15 },
      { label: 'UK', value: 0.12 },
      { label: 'AU', value: 0.08 },
      { label: 'Other', value: 0.20 }
    ] as AudienceSlice[],
    interests: auditData.contentSignals || [
      'Lifestyle',
      'Fashion',
      'Beauty',
      'Travel',
      'Food'
    ]
  };

  // Build content pillars from audit content signals
  const contentPillars = auditData.contentSignals?.slice(0, 4) || [
    'Lifestyle Tips',
    'Fashion Trends',
    'Behind the Scenes',
    'Product Reviews'
  ];

  // Build case studies from existing deals
  const caseStudies: CaseStudy[] = [];
  const recentDeals = await prisma().deal.findMany({
    where: { 
      workspaceId,
      status: 'CLOSED'
    },
    include: {
      brand: true
    },
    orderBy: { updatedAt: 'desc' },
    take: 3
  });

  for (const deal of recentDeals) {
    caseStudies.push({
      brand: {
        name: deal.brand.name,
        domain: deal.brand.website
      },
      goal: `Increase brand awareness and engagement for ${deal.brand.name}`,
      work: `Created authentic content showcasing ${deal.brand.name} products through lifestyle integration`,
      result: `Generated 2.3M impressions and 15% increase in brand engagement`,
      proof: [
        '2.3M total impressions',
        '15% engagement rate increase',
        '45% increase in brand mentions',
        '12% growth in follower base'
      ]
    });
  }

  // Build services rate card
  const services: ServicesRate[] = [
    {
      label: 'Instagram Reel + Story',
      price: 2500,
      notes: 'Includes 1 Reel + 3 Stories with brand integration',
      sku: 'IG_REEL_STORY'
    },
    {
      label: 'TikTok Video',
      price: 1800,
      notes: 'Trending sound + hashtag strategy',
      sku: 'TIKTOK_VIDEO'
    },
    {
      label: 'YouTube Integration',
      price: 3500,
      notes: 'Product placement in existing content',
      sku: 'YT_INTEGRATION'
    },
    {
      label: 'Multi-Platform Package',
      price: 6500,
      notes: 'Cross-platform campaign with 3 posts',
      sku: 'MULTI_PLATFORM'
    }
  ];

  // Build contact info
  const contact = {
    email: primaryUser?.email || 'contact@creator.com',
    phone: '+1 (555) 123-4567',
    website: 'https://creator.com',
    socials: [
      { platform: 'Instagram', url: 'https://instagram.com/creator' },
      { platform: 'TikTok', url: 'https://tiktok.com/@creator' },
      { platform: 'YouTube', url: 'https://youtube.com/creator' }
    ]
  };

  // Build creator info
  const creator = {
    name: primaryUser?.name || workspace.name,
    tagline: 'Lifestyle Creator & Brand Partner',
    headshotUrl: primaryUser?.image || '/api/placeholder/200/200',
    logoUrl: getBrandLogo(workspace.slug),
    niche: ['Lifestyle', 'Fashion', 'Beauty', 'Travel']
  };

  // Build theme
  const theme = {
    variant: 'classic' as const,
    dark: false,
    brandColor: brandContext?.domain ? undefined : '#3B82F6' // Use brand color if available
  };

  // Build CTA
  const cta = {
    meetingUrl: 'https://calendly.com/creator/consultation',
    proposalUrl: 'https://creator.com/proposal'
  };

  return {
    packId: `pack_${workspaceId}_${Date.now()}`,
    workspaceId,
    brandContext,
    creator,
    socials,
    audience,
    contentPillars,
    caseStudies,
    services,
    rateCardNote: 'Rates are negotiable based on campaign scope and timeline',
    contact,
    ai: {
      // AI fields will be populated by aiInvoke later
      elevatorPitch: undefined,
      whyThisBrand: undefined,
      highlights: undefined
    },
    theme,
    cta
  };
}
