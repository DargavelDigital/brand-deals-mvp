export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env'

async function resolveWorkspaceOwnerEmail(workspaceId: string): Promise<string> {
  // For now, return a default email. In production, get from workspace settings
  return 'owner@workspace.example'
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (token !== env.CRON_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  try {
    const prefs = await prisma().digestPreference.findMany({ 
      where: { cadence: { in: ['daily', 'weekly'] } } 
    })

    for (const p of prefs) {
      const now = new Date()
      if (p.cadence === 'daily' && now.getUTCHours() !== p.hourOfDay) continue
      
      // Collect summary
      const since = new Date(now)
      if (p.cadence === 'daily') {
        since.setDate(now.getDate() - 1)
      } else {
        since.setDate(now.getDate() - 7)
      }

      const replies = await prisma().inboxMessage.count({
        where: {
          createdAt: { gte: since },
          thread: { workspaceId: p.workspaceId },
          role: 'inbound'
        }
      })
      
      const matches = await prisma().brandMatch.count({
        where: { workspaceId: p.workspaceId, createdAt: { gte: since } }
      })

      const openThreads = await prisma().inboxThread.count({ 
        where: { workspaceId: p.workspaceId, status: 'OPEN' } 
      })

      const html = `
        <h2>HYPER Digest (${p.cadence})</h2>
        <p>New replies: <b>${replies}</b></p>
        <p>New matches: <b>${matches}</b></p>
        <p>Open threads: <b>${openThreads}</b></p>
        <p><a href="${env.APP_URL}/outreach/inbox">Go to Inbox</a></p>
      `
      
      // TODO: Actually send the email via your email provider
      // await sendEmail({
      //   workspaceId: p.workspaceId,
      //   to: await resolveWorkspaceOwnerEmail(p.workspaceId),
      //   subject: `Your ${p.cadence} HYPER Digest`,
      //   html
      // })
      
      console.log(`Digest sent for workspace ${p.workspaceId}: ${p.cadence}`)
    }

    return NextResponse.json({ ok: true, processed: prefs.length })
  } catch (error: any) {
    console.error('Digest cron failed:', error)
    return NextResponse.json(
      { ok: false, error: 'Digest processing failed' },
      { status: 500 }
    )
  }
}
