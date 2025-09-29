import { prisma } from '@/lib/prisma';
import { sendEmail } from '../email/sender';
import { renderTemplate } from '../email/templates';
import { env } from '@/lib/env';

export interface SequenceStepData {
  id: string;
  contactId: string;
  sequenceId: string;
  stepNumber: number;
  status: string;
  scheduledAt: Date;
  emailData: {
    subject: string;
    templateKey: string;
    variables: Record<string, any>;
  };
}

export async function dispatchDueSteps(): Promise<void> {
  try {
    // Find all due sequence steps
    const dueSteps = await prisma().sequenceStep.findMany({
      where: {
        status: 'pending',
        scheduledAt: {
          lte: new Date()
        }
      },
      include: {
        contact: true,
        sequence: {
          include: {
            brand: true,
            mediaPack: true
          }
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    });

    console.log(`Found ${dueSteps.length} due sequence steps`);

    for (const step of dueSteps) {
      try {
        // Mark as processing
        await prisma().sequenceStep.update({
          where: { id: step.id },
          data: { status: 'pending' }
        });

        // Prepare email data
        const emailVariables = {
          contactName: step.contact.name,
          brandName: step.sequence.brand.name,
          stepNumber: step.stepNumber,
          // Add more variables as needed
        };

        // Render email template
        const html = renderTemplate(step.emailData.templateKey, emailVariables);
        
        // Send email with telemetry context
        const emailResult = await sendEmail({
          to: step.contact.email,
          subject: step.emailData.subject,
          html,
          from: env.FROM_EMAIL || 'noreply@yourdomain.com',
          // Telemetry context
          workspaceId: step.sequence.workspaceId,
          brand: {
            industry: step.sequence.brand.industry || undefined,
            size: undefined, // Brand doesn't have size field
            region: undefined, // Brand doesn't have region field
            domain: step.sequence.brand.website || null
          },
          templateKey: step.emailData.templateKey,
          tone: 'professional', // Default tone
          stepsPlanned: step.sequence.totalSteps || 3
        });

        // Update step status
        await prisma().sequenceStep.update({
          where: { id: step.id },
          data: {
            status: 'sent',
            sentAt: new Date(),
            messageId: emailResult.messageId,
            provider: emailResult.provider
          }
        });

        console.log(`Sent sequence step ${step.id} to ${step.contact.email}`);

        // Update deal status if this is the first step
        if (step.stepNumber === 1) {
          await prisma().deal.updateMany({
            where: {
              brandId: step.sequence.brandId,
              workspaceId: step.sequence.workspaceId
            },
            data: {
              status: 'CONTACTED'
            }
          });
        }

      } catch (error) {
        console.error(`Failed to dispatch step ${step.id}:`, error);
        
        // Mark as failed
        await prisma().sequenceStep.update({
          where: { id: step.id },
          data: {
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    }
  } catch (error) {
    console.error('Failed to dispatch due steps:', error);
    throw error;
  }
}

// Development helper: manually trigger dispatch
export async function manualDispatch(): Promise<void> {
  console.log('Manual dispatch triggered');
  await dispatchDueSteps();
}

// Start the scheduler (for development)
export function startScheduler(intervalMs: number = 60000): NodeJS.Timeout {
  console.log(`Starting sequence scheduler with ${intervalMs}ms interval`);
  
  return setInterval(async () => {
    try {
      await dispatchDueSteps();
    } catch (error) {
      console.error('Scheduler error:', error);
    }
  }, intervalMs);
}

// Stop the scheduler
export function stopScheduler(intervalId: NodeJS.Timeout): void {
  clearInterval(intervalId);
  console.log('Sequence scheduler stopped');
}
