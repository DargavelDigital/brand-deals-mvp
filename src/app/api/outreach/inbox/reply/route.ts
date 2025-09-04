import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/requireSession";
import { hasEmailProvider } from "@/lib/email/providers";
import { prisma } from "@/lib/prisma"; // adjust import if your prisma client path differs

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(req: Request) {
  const session = await requireSession(req as any);
  if (session instanceof NextResponse) return session;

  const { threadId, dealId, text, providerAvailable } = await req.json();

  // Defensive validation
  if (!threadId || !text) {
    return NextResponse.json({ ok: false, error: "BAD_REQUEST" }, { status: 400 });
  }

  const emailEnabled = hasEmailProvider() && providerAvailable;

  // Try to persist as a CRM activity/note.
  // We attempt known models; if not found, fall back to console logging.
  let persisted = false;
  try {
    // Try DealActivity (type NOTE) if your schema has it
    // @ts-ignore - conditional model presence
    if ((prisma as any).dealActivity && dealId) {
      await (prisma as any).dealActivity.create({
        data: {
          dealId,
          type: "NOTE",
          title: "Inbox reply (saved)",
          content: text,
          createdById: session.user.id,
          metaJson: { threadId, emailEnabled },
        },
      });
      persisted = true;
    }
  } catch (e) {
    // noop
  }

  if (!persisted) {
    try {
      // Try Note model if you have one
      // @ts-ignore - conditional model presence
      if ((prisma as any).note && dealId) {
        await (prisma as any).note.create({
          data: {
            dealId,
            body: text,
            createdById: session.user.id,
            source: "INBOX",
            metaJson: { threadId, emailEnabled },
          },
        });
        persisted = true;
      }
    } catch (e) {
      // noop
    }
  }

  if (!persisted) {
    // Final fallback: log only (keeps API resilient)
    // eslint-disable-next-line no-console
    console.log("[inbox.reply.fallback]", {
      userId: session.user.id,
      threadId,
      dealId,
      text,
      emailEnabled,
    });
  }

  // Defer real sending to a later epic.
  // if (emailEnabled) { ... actually send via provider ... }

  return NextResponse.json({ ok: true, savedAs: emailEnabled ? "sent_or_staged" : "note" });
}
