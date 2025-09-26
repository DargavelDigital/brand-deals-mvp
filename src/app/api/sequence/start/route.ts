import { NextRequest, NextResponse } from 'next/server';
import { withIdempotency } from '@/lib/idempotency';
import { getProviders } from '@/services/providers';
import { log } from '@/lib/log';

export const POST = withIdempotency(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { to, subject, html, workspaceId } = body;

    if (!to || !subject || !html || !workspaceId) {
      return NextResponse.json(
        { error: 'to, subject, html, and workspaceId are required' },
        { status: 400 }
      );
    }

    const providers = getProviders();
    const emailResult = await providers.email({
      to,
      subject,
      html
    });
    
    return NextResponse.json({ 
      success: true, 
      messageId: emailResult.messageId,
      sentAt: emailResult.sentAt 
    });
  } catch (error: any) {
    log.error('Error starting sequence:', error);
    return NextResponse.json(
      { error: 'Failed to start sequence' },
      { status: 500 }
    );
  }
});
