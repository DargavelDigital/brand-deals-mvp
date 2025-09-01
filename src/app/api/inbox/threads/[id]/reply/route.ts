export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo'
import { emitEvent } from '@/server/events/bus'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { workspaceId } = await requireSessionOrDemo(req)
    const threadId = params.id
    const { message, subject } = await req.json()
    
    // Verify thread exists and belongs to workspace
    const thread = await prisma.inboxThread.findFirst({
      where: { id: threadId, workspaceId },
      include: { messages: { take: 1, orderBy: { createdAt: 'desc' } } },
    })
    
    if (!thread) {
      return NextResponse.json(
        { ok: false, error: 'Thread not found' },
        { status: 404 }
      )
    }
    
    // Get the latest message to determine recipient
    const latestMessage = thread.messages[0]
    if (!latestMessage) {
      return NextResponse.json(
        { ok: false, error: 'No messages in thread' },
        { status: 400 }
      )
    }
    
    // Create the outbound message
    const outboundMessage = await prisma.inboxMessage.create({
      data: {
        threadId,
        role: 'outbound',
        fromEmail: 'me@workspace.example', // TODO: get from workspace settings
        toEmail: latestMessage.fromEmail,
        subject: subject || `Re: ${latestMessage.subject || 'No subject'}`,
        text: message,
      },
    })
    
    // Update thread status and timestamp
    await prisma.inboxThread.update({
      where: { id: threadId },
      data: {
        status: 'WAITING',
        lastMessageAt: new Date(),
      },
    })
    
    // TODO: Actually send the email via your email provider
    // await sendEmail({
    //   to: latestMessage.fromEmail,
    //   subject: outboundMessage.subject,
    //   text: outboundMessage.text,
    //   workspaceId,
    // })
    
    // Emit event for real-time updates
    emitEvent({
      kind: 'generic',
      workspaceId,
      title: 'Reply Sent',
      message: `Reply sent to ${latestMessage.fromEmail}`,
    })
    
    return NextResponse.json({
      ok: true,
      message: outboundMessage,
    })
  } catch (error: any) {
    console.error('Failed to send reply:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to send reply' },
      { status: 500 }
    )
  }
}
