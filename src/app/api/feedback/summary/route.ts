import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo' // <- adapted to existing helper
import { z } from 'zod'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

/**
 * Allowed feedback types – keep in sync with your DB enum/values.
 */
const TypeSchema = z.enum(['OUTREACH', 'AUDIT', 'MATCH'])

/**
 * Uniform error helper: never leak internal errors, never 500 for user mistakes.
 */
function json(code: number, body: any) {
  return NextResponse.json(body, { status: code })
}

/**
 * Maps Prisma engine / URL errors to a readable JSON without crashing the page.
 * We do NOT alter Prisma configuration here.
 */
function mapPrismaError(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e)
  // The historical pain point: "URL must start with prisma:// or prisma+postgres://"
  if (msg.includes('URL must start with the protocol `prisma://`') || msg.includes('prisma+postgres://')) {
    return json(500, { ok: false, error: 'PRISMA_ENGINE_URL_PROTOCOL', detail: 'Prisma engine URL protocol mismatch detected.' })
  }
  // Known request / validation issues should not crash the app.
  if (msg.includes('Invalid `prisma().') || msg.includes('Argument') || msg.includes('Unknown')) {
    return json(400, { ok: false, error: 'BAD_REQUEST', detail: msg })
  }
  return json(500, { ok: false, error: 'INTERNAL_ERROR' })
}

/**
 * Optional read-only diagnostics: /api/feedback/summary?diag=1&type=OUTREACH
 * Never returns secrets. Helps confirm session + workspace + query.
 */
async function diagnostics(type: string | null, userEmail: string | null, workspaceId: string | null) {
  return json(200, {
    ok: true,
    diag: true,
    type,
    user: userEmail,
    workspaceId,
    prismaClientVersion: (prisma as any)?._clientVersion ?? 'unknown',
    // We intentionally do not touch process.env here.
  })
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const diag = searchParams.get('diag') === '1'
    const typeParam = searchParams.get('type')

    // Validate type
    const parsed = TypeSchema.safeParse(typeParam)
    if (!parsed.success) {
      // If diag, show what's wrong; else just 400
      return diag
        ? json(400, { ok: false, error: 'INVALID_TYPE', got: typeParam, allowed: TypeSchema.options })
        : json(400, { ok: false, error: 'INVALID_TYPE' })
    }
    const type = parsed.data

    // Resolve session + workspace (no redirects; do not throw)
    const session = await requireSessionOrDemo({ redirect: false })
    const userEmail = session?.user?.email ?? null
    const workspaceId = session?.workspace?.id ?? null

    if (diag) {
      return diagnostics(type, userEmail, workspaceId)
    }

    // If we don't have a workspace, return an empty, safe payload instead of 500
    if (!workspaceId) {
      return json(200, {
        ok: true,
        workspaceId: null,
        type,
        totals: { count: 0, positive: 0, negative: 0, neutral: 0 },
        recent: [],
      })
    }

    // Minimal, safe Prisma read. Keep it simple to avoid accidental joins throwing.
    // Note: Table is AiFeedback, fields are: decision (UP/DOWN), comment (not note)
    const feedback = await prisma().aiFeedback.findMany({
      where: { workspaceId, type },
      orderBy: { createdAt: 'desc' },
      take: 100, // Get more for accurate stats
      select: {
        id: true,
        type: true,
        decision: true,
        comment: true,
        createdAt: true,
      },
    })
    
    const count = feedback.length
    const upCount = feedback.filter(f => f.decision === 'UP').length
    const downCount = feedback.filter(f => f.decision === 'DOWN').length

    // Return data in expected format for FeedbackSummaryWidget
    const ratio = count > 0 ? upCount / count : 0
    
    return json(200, {
      ok: true,
      data: {
        type,
        upCount,
        downCount,
        totalCount: count,
        ratio,
      }
    })
  } catch (e) {
    return mapPrismaError(e)
  }
}
