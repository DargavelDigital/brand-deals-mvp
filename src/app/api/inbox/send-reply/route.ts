import { NextResponse, type NextRequest } from 'next/server';
import { requireSession } from '@/lib/auth/requireSession';
import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/http/envelope'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (session instanceof NextResponse) return session;

    const { threadId, plaintext, html } = await request.json()

    if (!threadId || !plaintext) {
      return NextResponse.json(fail('MISSING_REQUIRED_FIELDS', 400), { status: 400 })
    }

    // Get the inbox thread
    const thread = await prisma().inboxThread.findFirst({
      where: { 
        id: threadId,
        workspaceId: (session.user as any).workspaceId
      },
      include: {
        contact: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!thread) {
      return NextResponse.json(fail('THREAD_NOT_FOUND', 404), { status: 404 })
    }

    // Create a new outbound message
    const replyMessage = await prisma().inboxMessage.create({
      data: {
        threadId: threadId,
        role: 'outbound',
        fromEmail: 'you@yourcompany.com', // This should come from user settings
        toEmail: thread.contact.email,
        subject: `Re: ${thread.subject}`,
        text: plaintext,
        html: html || plaintext,
        externalId: `reply_${Date.now()}`,
        createdAt: new Date()
      }
    })

    // Update the thread's last activity
    await prisma().inboxThread.update({
      where: { id: threadId },
      data: {
        lastMessageAt: new Date(),
        status: 'OPEN' // Reopen the thread when we reply
      }
    })

    return NextResponse.json(ok(replyMessage))
  } catch (error) {
    console.error('Error sending reply:', error)
    return NextResponse.json(fail('INTERNAL_ERROR', 500), { status: 500 })
  }
}
