import { prisma } from '@/lib/prisma'

export async function logView(mediaPackId: string, variant: string, event: string, value?: number) {
  
  // Get the media pack to get workspaceId
  const mediaPack = await prisma().mediaPack.findUnique({
    where: { id: mediaPackId },
    select: { workspaceId: true }
  })
  
  if (!mediaPack) {
    console.warn('Media pack not found, skipping view log')
    return null
  }
  
  return prisma().mediaPackView.create({
    data: { 
      mediaPackId, 
      variant, 
      workspaceId: mediaPack.workspaceId,
      visitorId: 'temp-' + Date.now(),
      sessionId: 'temp-' + Date.now()
    },
  })
}

export async function logConversion(mediaPackId: string, type: string, status: string, brandId?: string) {
  
  // Get the media pack to get workspaceId and variant
  const mediaPack = await prisma().mediaPack.findUnique({
    where: { id: mediaPackId },
    select: { workspaceId: true, variant: true }
  })
  
  if (!mediaPack) {
    console.warn('Media pack not found, skipping conversion log')
    return null
  }
  
  return prisma().mediaPackConversion.create({
          data: { 
        mediaPackId, 
        type, 
        status, 
        brandId, 
        variant: mediaPack.variant,
        workspaceId: mediaPack.workspaceId,
        visitorId: 'temp-' + Date.now(),
        sessionId: 'temp-' + Date.now()
      },
  })
}

export async function getMediaPackAnalytics(mediaPackId: string) {

  const [views, conversions] = await Promise.all([
    prisma().mediaPackView.groupBy({
      by: ['variant'],
      where: { mediaPackId },
      _count: { id: true },
    }),
    prisma().mediaPackConversion.groupBy({
      by: ['type', 'status'],
      where: { mediaPackId },
      _count: { id: true },
    }),
  ])

  return { views, conversions }
}

export async function getVariantPerformance(mediaPackId: string) {

  const variants = await prisma().mediaPackView.groupBy({
    by: ['variant'],
    where: { mediaPackId },
    _count: { id: true },
  })

  return variants.map(v => ({
    variant: v.variant,
    views: v._count.id,
    avgScrollDepth: 0, // scrollDepth is now in MediaPackView.scrollDepth
  }))
}
