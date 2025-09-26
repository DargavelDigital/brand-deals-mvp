import { NextRequest, NextResponse } from 'next/server';
import { withIdempotency } from '@/lib/idempotency';
import { getProviders } from '@/services/providers';
import { log } from '@/lib/log';

export const POST = withIdempotency(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { sequenceId, contacts, template, workspaceId } = body;

    if (!sequenceId || !contacts || !template || !workspaceId) {
      return NextResponse.json(
        { error: 'sequenceId, contacts, template, and workspaceId are required' },
        { status: 400 }
      );
    }

    const providers = getProviders();
    const results = [];

    // Send emails to all contacts
    for (const contact of contacts) {
      try {
        const emailResult = await providers.email({
          to: contact.email,
          subject: template.subject,
          html: template.html
        });
        
        results.push({
          contact: contact.email,
          success: true,
          messageId: emailResult.messageId
        });
      } catch (error) {
        results.push({
          contact: contact.email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      sequenceId,
      results 
    });
  } catch (error: any) {
    log.error('Error dispatching sequence:', error);
    return NextResponse.json(
      { error: 'Failed to dispatch sequence' },
      { status: 500 }
    );
  }
});
