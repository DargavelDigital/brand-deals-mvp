import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/requireAuth'
import { prisma } from '@/lib/prisma'
import { ok, fail } from '@/lib/http/envelope'

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(['OWNER', 'MANAGER', 'MEMBER'])
    if (!authResult.ok) {
      return NextResponse.json(fail(authResult.error, authResult.status), { status: authResult.status })
    }

    const { threadId, plaintext, html } = await request.json()

    if (!threadId || !plaintext) {
      return NextResponse.json(fail('MISSING_REQUIRED_FIELDS', 400), { status: 400 })
    }

    // Get the thread and its last message to determine the provider
    const thread = await prisma.sequenceStep.findFirst({
      where: { 
        id: threadId,
        workspaceId: authResult.data.workspaceId
      },
      orderBy: { createdAt: 'desc' },
      include: {
        contact: true,
        sequence: true
      }
    })

    if (!thread) {
      return NextResponse.json(fail('THREAD_NOT_FOUND', 404), { status: 404 })
    }

    // Create a new sequence step for the reply
    const replyStep = await prisma.sequenceStep.create({
      data: {
        id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sequenceId: thread.sequenceId,
        contactId: thread.contactId,
        workspaceId: authResult.data.workspaceId,
        stepType: 'EMAIL',
        status: 'SENT',
        messageId: `reply_${Date.now()}`,
        provider: thread.provider || 'manual',
        content: plaintext,
        htmlContent: html || plaintext,
        metadata: {
          direction: 'outbound',
          threadId: threadId,
          sentAt: new Date().toISOString()
        }
      }
    })

    // Update the thread's last activity
    await prisma.sequenceStep.update({
      where: { id: threadId },
      data: {
        metadata: {
          ...thread.metadata,
          lastReplyAt: new Date().toISOString(),
          replyCount: (thread.metadata?.replyCount || 0) + 1
        }
      }
    })

    return NextResponse.json(ok(replyStep))
  } catch (error) {
    console.error('Error sending reply:', error)
    return NextResponse.json(fail('INTERNAL_ERROR', 500), { status: 500 })
  }
}
