import { prisma } from '@/lib/prisma';
import { requireCredits } from '../credits';
import { sendEmail } from '../email/sender';
import { renderTemplate } from '../email/templates';
import { env } from '@/lib/env';

export interface SequenceStartParams {
  workspaceId: string;
  brandId: string;
  mediaPackId: string;
  contactIds: string[];
  pauseFirstSend: boolean;
}

export interface SequenceStartResult {
  sequenceId: string;
  stepsCreated: number;
  firstEmailSent: boolean;
  dealStatus: string;
}

export async function startSequence(params: SequenceStartParams): Promise<SequenceStartResult> {
  const { workspaceId, brandId, mediaPackId, contactIds, pauseFirstSend } = params;
  
  // Check credits (1 per contact)
  await requireCredits('OUTREACH', contactIds.length, workspaceId);
  
  try {
    // Load brand and media pack for context
    const brand = await prisma().brand.findUnique({
      where: { id: brandId },
      include: { profile: true }
    });
    
    if (!brand) {
      throw new Error('Brand not found');
    }
    
    const mediaPack = await prisma().mediaPack.findUnique({
      where: { id: mediaPackId }
    });
    
    if (!mediaPack) {
      throw new Error('Media pack not found');
    }
    
    // Load contacts
    const contacts = await prisma().contact.findMany({
      where: {
        id: { in: contactIds },
        workspaceId
      }
    });
    
    if (contacts.length === 0) {
      throw new Error('No valid contacts found');
    }
    
    // Create or update deal
    let deal = await prisma().deal.findFirst({
      where: {
        brandId,
        workspaceId
      }
    });
    
    if (!deal) {
      deal = await prisma().deal.create({
        data: {
          title: `Partnership with ${brand.name}`,
          description: `Outreach sequence initiated for ${brand.name}`,
          brandId,
          workspaceId,
          status: 'CONTACTED'
        }
      });
    } else {
      await prisma().deal.update({
        where: { id: deal.id },
        data: { status: 'CONTACTED' }
      });
    }
    
    // Create outreach sequence
    const sequence = await prisma().outreachSequence.create({
      data: {
        workspaceId,
        brandId,
        mediaPackId,
        dealId: deal.id,
        status: 'ACTIVE',
        totalSteps: 3,
        currentStep: 1
      }
    });
    
    // Create sequence steps
    const now = new Date();
    const step3 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // +3 days
    const step7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
    
    const steps = [];
    let firstEmailSent = false;
    
    for (const contact of contacts) {
      // Step 1: Intro (D0)
      const step1 = await prisma().sequenceStep.create({
        data: {
          sequenceId: sequence.id,
          contactId: contact.id,
          stepNumber: 1,
          scheduledAt: now,
          status: 'pending',
          emailData: {
            subject: `Partnership opportunity with ${brand.name}`,
            templateKey: 'outreach-intro',
            variables: {
              contactName: contact.name,
              brandName: brand.name,
              brandDescription: brand.description || '',
              mediaPackUrl: mediaPack.htmlUrl
            }
          }
        }
      });
      
      // Step 2: Proof (D+3)
      const step2 = await prisma().sequenceStep.create({
        data: {
          sequenceId: sequence.id,
          contactId: contact.id,
          stepNumber: 2,
          scheduledAt: step3,
          status: 'pending',
          emailData: {
            subject: `Following up - ${brand.name} partnership`,
            templateKey: 'outreach-proof',
            variables: {
              contactName: contact.name,
              brandName: brand.name,
              daysSinceFirst: 3
            }
          }
        }
      });
      
      // Step 3: Nudge (D+7)
      const step3 = await prisma().sequenceStep.create({
        data: {
          sequenceId: sequence.id,
          contactId: contact.id,
          stepNumber: 3,
          scheduledAt: step7,
          status: 'pending',
          emailData: {
            subject: `Final follow-up - ${brand.name} opportunity`,
            templateKey: 'outreach-nudge',
            variables: {
              contactName: contact.name,
              brandName: brand.name,
              daysSinceFirst: 7
            }
          }
        }
      });
      
      steps.push(step1, step2, step3);
      
      // Send first email immediately if not paused
      if (!pauseFirstSend) {
        try {
          const emailVariables = {
            contactName: contact.name,
            brandName: brand.name,
            brandDescription: brand.description || '',
            mediaPackUrl: mediaPack.htmlUrl
          };
          
          const html = renderTemplate('outreach-intro', emailVariables);
          
          const emailResult = await sendEmail({
            to: contact.email,
            subject: `Partnership opportunity with ${brand.name}`,
            html,
            from: env.FROM_EMAIL || 'noreply@yourdomain.com',
            // Telemetry context
            workspaceId,
            brand: {
              industry: brand.industry || undefined,
              size: undefined, // Brand doesn't have size field
              region: undefined, // Brand doesn't have region field
              domain: brand.website || null
            },
            templateKey: 'outreach-intro',
            tone: 'professional', // Default tone
            stepsPlanned: 3
          });
          
          // Update step status
          await prisma().sequenceStep.update({
            where: { id: step1.id },
            data: {
              status: 'sent',
              sentAt: new Date(),
              messageId: emailResult.messageId,
              provider: emailResult.provider
            }
          });
          
          firstEmailSent = true;
          
        } catch (error) {
          console.error(`Failed to send first email to ${contact.email}:`, error);
          
          // Mark step as failed but continue
          await prisma().sequenceStep.update({
            where: { id: step1.id },
            data: {
              status: 'failed',
              errorMessage: error instanceof Error ? error.message : 'Unknown error'
            }
          });
        }
      }
    }
    
    return {
      sequenceId: sequence.id,
      stepsCreated: steps.length,
      firstEmailSent,
      dealStatus: deal.status
    };
    
  } catch (error) {
    console.error('Failed to start sequence:', error);
    throw error;
  }
}
