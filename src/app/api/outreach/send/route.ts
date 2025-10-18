import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-options';
import { prisma } from '@/lib/prisma';
import { sendEmailResend } from '@/services/email/provider.resend';
import { env } from '@/lib/env';
import { nanoid } from 'nanoid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !(session.user as any).workspaceId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = (session.user as any).workspaceId;
    const body = await req.json();
    const { 
      contactId, 
      brandId, 
      mediaPackId,
      subject,
      body: emailBody 
    } = body;

    console.log('📤 Send outreach request:', { contactId, brandId, mediaPackId });

    // Validate required fields
    if (!contactId || !subject || !emailBody) {
      return NextResponse.json({ 
        error: 'Missing required fields: contactId, subject, body' 
      }, { status: 400 });
    }

    // Get contact
    const contact = await prisma().contact.findUnique({
      where: { id: contactId }
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Check if contact has unsubscribed
    if ((contact as any).unsubscribed) {
      return NextResponse.json({ 
        error: 'Contact has unsubscribed from emails' 
      }, { status: 400 });
    }

    // Get brand (optional)
    let brand = null;
    if (brandId) {
      brand = await prisma().brand.findUnique({
        where: { id: brandId }
      });
    }

    // Get media pack (optional)
    let mediaPack = null;
    if (mediaPackId) {
      mediaPack = await prisma().mediaPack.findUnique({
        where: { id: mediaPackId }
      });
    }

    // Create thread key for conversation tracking
    const threadKey = `quick_${nanoid(12)}`;
    
    // Get or create conversation
    let conversation = await prisma().conversation.findUnique({
      where: { threadKey }
    });

    if (!conversation) {
      conversation = await prisma().conversation.create({
        data: {
          id: nanoid(),
          workspaceId,
          contactId,
          brandId: brandId || null,
          sequenceId: null,
          subject,
          threadKey,
          lastAt: new Date()
        }
      });
    }

    // Generate unsubscribe token
    const unsubscribeToken = nanoid(32);
    const unsubscribeUrl = `${env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/unsubscribe/${unsubscribeToken}`;

    // Add unsubscribe footer to HTML
    const htmlWithFooter = emailBody + `
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 11px; color: #999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <p style="margin: 0;">If you'd prefer not to receive emails like this, you can 
        <a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">unsubscribe here</a>.</p>
      </div>
    `;

    // Strip HTML for text version
    const textContent = emailBody.replace(/<[^>]*>/g, '') + `\n\n---\nUnsubscribe: ${unsubscribeUrl}`;

    // Determine sender email
    const fromEmail = env.MAIL_FROM || 'noreply@yourdomain.com';
    const replyToEmail = session.user.email;

    // Send email via Resend
    const result = await sendEmailResend({
      to: contact.email,
      from: fromEmail,
      replyTo: replyToEmail,
      subject,
      html: htmlWithFooter,
      text: textContent,
      headers: {
        'X-Hyper-Workspace': workspaceId,
        'X-Hyper-Contact': contactId,
        'X-Hyper-Thread': threadKey,
      }
    });

    console.log('✅ Email sent via Resend:', result.id);

    // Store message in database
    await prisma().message.create({
      data: {
        id: nanoid(),
        conversationId: conversation.id,
        direction: 'out',
        provider: 'resend',
        providerMsgId: result.id,
        fromAddr: fromEmail,
        toAddr: contact.email,
        subject,
        html: htmlWithFooter,
        text: textContent,
        status: 'sent',
        createdAt: new Date()
      }
    });

    // Store unsubscribe token (we'll add this model to schema next)
    try {
      await prisma().$executeRaw`
        INSERT INTO "UnsubscribeToken" (id, token, "workspaceId", email, "expiresAt", "createdAt")
        VALUES (${nanoid()}, ${unsubscribeToken}, ${workspaceId}, ${contact.email}, 
                ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}, ${new Date()})
      `;
    } catch (e) {
      // Silently fail if table doesn't exist yet (migration pending)
      console.warn('UnsubscribeToken table not yet created:', e);
    }

    // Update contact lastContacted
    await prisma().contact.update({
      where: { id: contactId },
      data: {
        lastContacted: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      messageId: result.id,
      conversationId: conversation.id,
      mode: 'quick'
    });

  } catch (error: any) {
    console.error('❌ Send outreach error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to send email'
    }, { status: 500 });
  }
}

