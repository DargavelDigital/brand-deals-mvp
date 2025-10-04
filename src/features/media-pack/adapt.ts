import { MediaPackDataSchema, type MediaPackData } from './schema'

export function adaptPackData(input: any): MediaPackData {
  // Map raw keys → the canonical schema expected by preview/PDF
  const candidate = {
    creator: {
      displayName: input?.creator?.name ?? input?.creator?.displayName,
      handle: input?.creator?.handle,
      avatarUrl: input?.creator?.avatarUrl ?? input?.creator?.avatar ?? input?.creator?.headshotUrl,
      bio: input?.creator?.bio ?? input?.creator?.tagline,
      niche: input?.creator?.niche?.[0] ?? input?.creator?.niche,
      location: input?.creator?.location,
      metrics: {
        followers: input?.metrics?.followers ?? input?.creator?.metrics?.followers ?? input?.socials?.reduce((sum: number, s: any) => sum + (s.followers || 0), 0),
        avgViews: input?.metrics?.avgViews ?? input?.creator?.metrics?.avgViews ?? input?.socials?.reduce((sum: number, s: any) => sum + (s.avgViews || 0), 0) / (input?.socials?.length || 1),
        avgLikes: input?.metrics?.avgLikes ?? input?.creator?.metrics?.avgLikes,
        avgComments: input?.metrics?.avgComments ?? input?.creator?.metrics?.avgComments,
        engagementRate: input?.metrics?.engagementRate ?? input?.creator?.metrics?.engagementRate ?? input?.socials?.reduce((sum: number, s: any) => sum + (s.engagementRate || 0), 0) / (input?.socials?.length || 1),
      },
    },
    brand: {
      name: input?.brand?.name ?? input?.brandName ?? input?.brandContext?.name,
      logoUrl: input?.brand?.logoUrl ?? input?.brandLogo ?? input?.creator?.logoUrl,
      colors: {
        primary: input?.brand?.colors?.primary ?? input?.palette?.primary ?? input?.theme?.brandColor,
        secondary: input?.brand?.colors?.secondary ?? input?.palette?.secondary,
        accent: input?.brand?.colors?.accent ?? input?.palette?.accent,
      },
    },
    summary: input?.summary ?? input?.ai?.elevatorPitch,
    proposalIdeas: input?.proposalIdeas ?? input?.ideas ?? input?.contentPillars ?? [],
    topPosts: (input?.topPosts ?? input?.posts ?? []).map((p: any) => ({
      id: p?.id,
      platform: p?.platform,
      url: p?.url,
      thumbnailUrl: p?.thumbnailUrl ?? p?.thumb,
      title: p?.title,
      likes: p?.likes,
      views: p?.views,
      comments: p?.comments,
    })),
    palette: {
      primary: input?.palette?.primary ?? input?.theme?.brandColor,
      secondary: input?.palette?.secondary,
      accent: input?.palette?.accent,
    },
    statsCards: input?.statsCards ?? input?.metrics?.map((m: any) => ({
      label: m.label,
      value: m.value
    })) ?? [],
  }

  const parsed = MediaPackDataSchema.safeParse(candidate)
  if (!parsed.success) {
    console.error('[MediaPack] Data validation failed', parsed.error.flatten())
    // Still return best-effort to keep PDF generation running:
    return MediaPackDataSchema.parse({
      creator: { displayName: 'Creator Name', metrics: {} },
      brand: { name: 'Brand', colors: {} },
      summary: 'Your audience is primed for partnerships.',
      proposalIdeas: [],
      topPosts: [],
      palette: {},
      statsCards: [],
    })
  }
  return parsed.data
}
