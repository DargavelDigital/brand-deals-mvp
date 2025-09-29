import { prisma } from '@/lib/prisma';
import { deriveSegment } from '@/services/netfx/segment';
import { isOn } from '@/config/flags';

export async function recordSend(params: {
  workspaceId: string;
  brand?: { industry?: string; size?: number; region?: string; domain?: string | null };
  templateKey?: string;
  tone?: 'professional'|'relaxed'|'fun';
  stepsPlanned?: number;
  sentAt?: Date;
  contactEmail?: string;
  sequenceId?: string;
  stepNumber?: number;
}) {
  if (!isOn('netfx.enabled')) return;

  try {
    const seg = deriveSegment(params);
    await prisma().signalEvent.create({
      data: {
        workspaceId: params.workspaceId,
        domainHash: seg.domainHash,
        industry: seg.industry,
        sizeBand: seg.sizeBand,
        region: seg.region,
        season: seg.season,
        channel: 'email',
        templateFamily: seg.templateFamily ?? null,
        tone: seg.tone ?? null,
        stepsPlanned: seg.stepsPlanned ?? null,
        sendDow: seg.sendDow ?? null,
        sendHour: seg.sendHour ?? null,
        sentAt: params.sentAt || new Date(),
        createdAt: new Date()
      }
    });
  } catch (error) {
    // Don't fail email sending if telemetry fails
    console.warn('Failed to record send telemetry:', error);
  }
}

export async function recordOutcome(params: {
  workspaceId: string;
  contactEmail: string;
  replied?: boolean;
  won?: boolean;
  valueUsd?: number;
  outcomeAt?: Date;
}) {
  if (!isOn('netfx.enabled')) return;

  try {
    // Find the most recent signal event for this contact
    const event = await prisma().signalEvent.findFirst({
      where: {
        workspaceId: params.workspaceId,
        // We can't directly match on email, but we can find recent events
        // and update them if they match the pattern
      },
      orderBy: { createdAt: 'desc' }
    });

    if (event) {
      await prisma().signalEvent.update({
        where: { id: event.id },
        data: {
          replied: params.replied ?? false,
          won: params.won ?? false,
          valueUsd: params.valueUsd ?? null,
          outcomeAt: params.outcomeAt || new Date()
        }
      });
    }
  } catch (error) {
    // Don't fail the main flow if telemetry fails
    console.warn('Failed to record outcome telemetry:', error);
  }
}

export async function recordReply(params: {
  workspaceId: string;
  contactEmail: string;
  repliedAt?: Date;
}) {
  await recordOutcome({
    workspaceId: params.workspaceId,
    contactEmail: params.contactEmail,
    replied: true,
    outcomeAt: params.repliedAt || new Date()
  });
}

export async function recordDealWon(params: {
  workspaceId: string;
  contactEmail: string;
  valueUsd: number;
  wonAt?: Date;
}) {
  await recordOutcome({
    workspaceId: params.workspaceId,
    contactEmail: params.contactEmail,
    replied: true,
    won: true,
    valueUsd: params.valueUsd,
    outcomeAt: params.wonAt || new Date()
  });
}
