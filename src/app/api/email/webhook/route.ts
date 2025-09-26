import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { recordReply, recordDealWon } from '@/services/outreach/telemetry';
import { isOn } from '@/config/flags';
import { log } from '@/lib/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the webhook data
    log.info('Email webhook received:', body);
    
    // Only process if network effects are enabled
    if (!isOn('netfx.enabled')) {
      return NextResponse.json({ 
        success: true, 
        message: 'Webhook received (telemetry disabled)' 
      });
    }
    
    // Handle different webhook types
    if (body.event === 'delivered' || body.event === 'open' || body.event === 'click') {
      // Track engagement but don't record as reply yet
      log.info(`Email ${body.event}: ${body.email}`);
      
    } else if (body.event === 'reply') {
      // Someone replied to an email
      await handleReply(body);
      
    } else if (body.event === 'bounce' || body.event === 'spamreport') {
      // Handle negative events
      log.info(`Email ${body.event}: ${body.email}`);
      
    } else if (body.event === 'deal_won' || body.event === 'deal_closed') {
      // Deal was won - record the outcome
      await handleDealWon(body);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed' 
    });
    
  } catch (error: any) {
    log.error('Error processing email webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

async function handleReply(webhookData: any) {
  try {
    const { email, messageId, threadKey, workspaceId } = webhookData;
    
    if (!email || !workspaceId) {
      log.warn('Missing required fields for reply tracking:', webhookData);
      return;
    }
    
    // Find the sequence step that was replied to
    const step = await prisma.sequenceStep.findFirst({
      where: {
        providerMsgId: messageId,
        status: 'sent'
      },
      include: {
        sequence: {
          include: {
            workspace: true
          }
        }
      }
    });
    
    if (step && step.sequence.workspaceId === workspaceId) {
      // Update the step status
      await prisma.sequenceStep.update({
        where: { id: step.id },
        data: {
          status: 'replied',
          repliedAt: new Date()
        }
      });
      
      // Record telemetry
      await recordReply({
        workspaceId: step.sequence.workspaceId,
        contactEmail: email,
        repliedAt: new Date()
      });
      
      log.info(`Reply recorded for step ${step.id} from ${email}`);
    }
    
  } catch (error) {
    log.error('Failed to handle reply:', error);
  }
}

async function handleDealWon(webhookData: any) {
  try {
    const { email, workspaceId, dealValue, dealId } = webhookData;
    
    if (!email || !workspaceId || !dealValue) {
      log.warn('Missing required fields for deal won tracking:', webhookData);
      return;
    }
    
    // Record telemetry for deal won
    await recordDealWon({
      workspaceId,
      contactEmail: email,
      valueUsd: parseFloat(dealValue),
      wonAt: new Date()
    });
    
    log.info(`Deal won recorded for ${email} with value $${dealValue}`);
    
  } catch (error) {
    log.error('Failed to handle deal won:', error);
  }
}
