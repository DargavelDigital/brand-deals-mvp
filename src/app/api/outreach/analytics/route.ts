import { NextResponse, type NextRequest } from 'next/server';
import { requireSession } from '@/lib/auth/requireSession';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/http/envelope'
import { log } from '@/lib/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(request.url)
    const sequenceId = searchParams.get('sequenceId')
    const days = parseInt(searchParams.get('days') || '30')

    const whereClause: any = {
      workspaceId: (session.user as any).workspaceId
    }

    if (sequenceId) {
      whereClause.sequenceId = sequenceId
    }

    // Get date range
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Aggregate SequenceStep data by status
    const stepStats = await prisma.sequenceStep.groupBy({
      by: ['status'],
      where: {
        ...whereClause,
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        status: true
      }
    })

    // Get funnel data
    const funnelData = {
      sent: stepStats.find(s => s.status === 'SENT')?._count.status || 0,
      opened: stepStats.find(s => s.status === 'OPENED')?._count.status || 0,
      clicked: stepStats.find(s => s.status === 'CLICKED')?._count.status || 0,
      replied: stepStats.find(s => s.status === 'REPLIED')?._count.status || 0,
      bounced: stepStats.find(s => s.status === 'BOUNCED')?._count.status || 0
    }

    // Calculate rates
    const rates = {
      openRate: funnelData.sent > 0 ? (funnelData.opened / funnelData.sent) * 100 : 0,
      clickRate: funnelData.opened > 0 ? (funnelData.clicked / funnelData.opened) * 100 : 0,
      replyRate: funnelData.sent > 0 ? (funnelData.replied / funnelData.sent) * 100 : 0
    }

    // Calculate time to first reply
    const replyTimes = await prisma.sequenceStep.findMany({
      where: {
        ...whereClause,
        status: 'REPLIED',
        repliedAt: { not: null },
        sentAt: { not: null }
      },
      select: {
        sentAt: true,
        repliedAt: true
      }
    })

    const timeToReplyHours = replyTimes.map(step => {
      if (step.sentAt && step.repliedAt) {
        return (step.repliedAt.getTime() - step.sentAt.getTime()) / (1000 * 60 * 60)
      }
      return 0
    }).filter(hours => hours > 0)

    const medianTimeToReply = timeToReplyHours.length > 0 
      ? timeToReplyHours.sort((a, b) => a - b)[Math.floor(timeToReplyHours.length / 2)]
      : 0

    // Get top performing subjects with actual open/reply counts
    const subjectStats = await prisma.sequenceStep.groupBy({
      by: ['subject'],
      where: {
        ...whereClause,
        subject: { not: null },
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      }
    })

    // Get separate counts for opened and replied steps
    const openedSteps = await prisma.sequenceStep.groupBy({
      by: ['subject'],
      where: {
        ...whereClause,
        subject: { not: null },
        status: 'OPENED',
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      }
    })

    const repliedSteps = await prisma.sequenceStep.groupBy({
      by: ['subject'],
      where: {
        ...whereClause,
        subject: { not: null },
        status: 'REPLIED',
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      }
    })

    const subjectPerformance = subjectStats
      .map(subject => {
        const openedCount = openedSteps.find(s => s.subject === subject.subject)?._count.id || 0
        const repliedCount = repliedSteps.find(s => s.subject === subject.subject)?._count.id || 0
        
        return {
          subject: subject.subject || 'No Subject',
          totalSent: subject._count.id,
          totalOpened: openedCount,
          totalReplied: repliedCount,
          openRate: subject._count.id > 0 ? (openedCount / subject._count.id) * 100 : 0,
          replyRate: subject._count.id > 0 ? (repliedCount / subject._count.id) * 100 : 0
        }
      })
      .sort((a, b) => b.totalSent - a.totalSent)
      .slice(0, 10)

    // Chart data for funnel
    const chartData = [
      { name: 'Sent', value: funnelData.sent, color: 'var(--accent)' },
      { name: 'Opened', value: funnelData.opened, color: 'var(--success)' },
      { name: 'Clicked', value: funnelData.clicked, color: 'var(--warn)' },
      { name: 'Replied', value: funnelData.replied, color: 'var(--brand-600)' }
    ]

    return NextResponse.json(ok({
      funnel: funnelData,
      rates,
      medianTimeToReply,
      chartData,
      topSubjects: subjectPerformance,
      period: `${days} days`
    }))
  } catch (error) {
    log.error('Error fetching outreach analytics:', error)
    return NextResponse.json(fail('INTERNAL_ERROR', 500), { status: 500 })
  }
}
