import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle SendGrid webhook events
    if (Array.isArray(body)) {
      for (const event of body) {
        await processSendGridEvent(event);
      }
    } else {
      // Single event
      await processSendGridEvent(body);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email webhook error:', error);
    
    // Always return 200 to SendGrid to prevent retries
    return NextResponse.json({ success: false, error: 'Processing failed' }, { status: 200 });
  }
}

async function processSendGridEvent(event: any) {
  try {
    const { event: eventType, message_id, email, timestamp } = event;
    
    console.log(`Processing SendGrid event: ${eventType} for ${email}`);
    
    // Find the sequence step by message ID
    const step = await prisma.sequenceStep.findFirst({
      where: {
        messageId: message_id
      },
      include: {
        sequence: {
          include: {
            deal: true
          }
        }
      }
    });
    
    if (!step) {
      console.log(`No sequence step found for message ID: ${message_id}`);
      return;
    }
    
    // Update step status based on event type
    let newStatus = step.status;
    let additionalData: any = {};
    
    switch (eventType) {
      case 'delivered':
        newStatus = 'sent';
        additionalData.sentAt = new Date(timestamp * 1000);
        break;
        
      case 'open':
        newStatus = 'opened';
        additionalData.openedAt = new Date(timestamp * 1000);
        break;
        
      case 'click':
        newStatus = 'clicked';
        additionalData.clickedAt = new Date(timestamp * 1000);
        break;
        
      case 'bounce':
        newStatus = 'bounced';
        additionalData.bouncedAt = new Date(timestamp * 1000);
        break;
        
      case 'dropped':
        newStatus = 'bounced';
        additionalData.bouncedAt = new Date(timestamp * 1000);
        break;
        
      case 'spamreport':
        newStatus = 'bounced';
        additionalData.bouncedAt = new Date(timestamp * 1000);
        break;
        
      case 'unsubscribe':
        // Handle unsubscribe logic
        break;
        
      default:
        console.log(`Unhandled event type: ${eventType}`);
        return;
    }
    
    // Update the sequence step
    await prisma.sequenceStep.update({
      where: { id: step.id },
      data: {
        status: newStatus,
        ...additionalData
      }
    });
    
    // Handle reply events (move deal to NEGOTIATING)
    if (eventType === 'reply' && step.sequence?.deal) {
      await prisma.deal.update({
        where: { id: step.sequence.deal.id },
        data: { status: 'NEGOTIATING' }
      });
      
      console.log(`Deal ${step.sequence.deal.id} moved to NEGOTIATING due to reply`);
    }
    
    console.log(`Updated step ${step.id} status to ${newStatus}`);
    
  } catch (error) {
    console.error('Failed to process SendGrid event:', error);
  }
}
