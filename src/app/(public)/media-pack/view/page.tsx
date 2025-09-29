import { verifyToken } from '@/lib/signing'
import { buildPackData } from '@/lib/mediaPack/buildPackData'
import { generateMediaPackCopy } from '@/ai/useMediaPackCopy'
import MPClassic from '@/components/media-pack/templates/MPClassic'
import MPBold from '@/components/media-pack/templates/MPBold'
import MPEditorial from '@/components/media-pack/templates/MPEditorial'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

export const dynamic = 'force-dynamic'

export default async function MediaPackView({ 
  searchParams 
}: { 
  searchParams: Promise<{ mp?: string; sig?: string }> 
}) {
  const resolvedSearchParams = await searchParams
  const mpId = resolvedSearchParams.mp
  const token = resolvedSearchParams.sig

  if (!mpId || !token) {
    notFound()
  }

  // Verify the signature
  const payload = verifyToken(token)
  if (!payload || payload.mp !== mpId) {
    notFound()
  }

  try {
    // Fetch media pack by ID
    const mediaPack = await prisma().mediaPack.findUnique({
      where: { id: mpId },
      select: {
        id: true,
        variant: true,
        theme: true,
        brandIds: true,
        workspaceId: true,
        workspace: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    if (!mediaPack) {
      notFound()
    }

    // Build pack data using the new system
    const packData = await buildPackData({ 
      workspaceId: mediaPack.workspaceId,
      brandId: mediaPack.brandIds?.[0] // Use first brand if available
    })

    // Generate AI copy
    const aiCopy = await generateMediaPackCopy(packData)

    // Merge AI copy and theme into final data
    const finalData = {
      ...packData,
      ai: {
        ...packData.ai,
        ...aiCopy
      },
      theme: {
        variant: mediaPack.variant as 'classic' | 'bold' | 'editorial',
        dark: (mediaPack.theme as any)?.dark || false,
        brandColor: (mediaPack.theme as any)?.brandColor || '#3b82f6'
      }
    }

    // Track the view
    await trackView(mediaPack, headers())

    // Render the appropriate template with tracking props
    const templateProps = { 
      data: finalData, 
      isPublic: true, 
      mpId: mpId 
    }

    switch (mediaPack.variant) {
      case 'classic':
        return <MPClassic {...templateProps} />
      case 'bold':
        return <MPBold {...templateProps} />
      case 'editorial':
        return <MPEditorial {...templateProps} />
      default:
        return <MPClassic {...templateProps} />
    }
  } catch (error) {
    console.error('Error loading media pack view:', error)
    notFound()
  }
}

async function trackView(mediaPack: any, headers: Headers) {
  try {
    const userAgent = headers.get('user-agent') || ''
    const referrer = headers.get('referer') || ''
    const xForwardedFor = headers.get('x-forwarded-for')
    const ip = xForwardedFor?.split(',')[0] || headers.get('x-real-ip') || 'unknown'
    
    // Create a simple IP hash for privacy
    const ipHash = Buffer.from(ip).toString('base64').slice(0, 16)

    await prisma().mediaPackView.create({
      data: {
        mediaPackId: mediaPack.id,
        variant: mediaPack.variant,
        workspaceId: mediaPack.workspaceId,
        visitorId: nanoid(), // Generate new visitor ID
        sessionId: nanoid(), // Generate new session ID
        referrer,
        ua: userAgent,
        ipHash,
        createdAt: new Date()
      }
    })
  } catch (error) {
    // Don't fail the page load if tracking fails
    console.error('Failed to track media pack view:', error)
  }
}