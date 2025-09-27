import { NextRequest, NextResponse } from 'next/server';
import { withIdempotency } from '@/lib/idempotency';
import { requireSession } from '@/lib/auth/requireSession';
import { prisma } from '@/lib/prisma';
import { withApiLogging } from '@/lib/api-wrapper';
import { log } from '@/lib/log';
import { socials } from '@/config/socials';
import { suggestBrands } from '@/services/match/brandSearch';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  return NextResponse.json({ message: 'Match top endpoint' });
}

export const POST = withIdempotency(async (request: NextRequest) => {
  return withApiLogging(async (req: NextRequest) => {
    try {
      // Get authenticated user context
      const session = await requireSession(req);
      if (session instanceof NextResponse) return session;
      
      const body = await req.json().catch(() => ({} as any));
      const runId = String(body?.runId || "").trim();
      const { workspaceId, criteria } = body;

      // Input validation
      if (!runId) {
        return NextResponse.json({ 
          ok: false, 
          code: "MISSING_RUN_ID" 
        }, { status: 400 });
      }

      if (!workspaceId) {
        return NextResponse.json({ 
          ok: false, 
          code: "MISSING_WORKSPACE_ID" 
        }, { status: 400 });
      }

      // Launch mode: Instagram-only — avoid touching other providers
      if (!socials.enabled("instagram")) {
        // In the impossible case IG is disabled, return graceful empty set
        return NextResponse.json({ 
          ok: true, 
          matches: [], 
          reason: "INSTAGRAM_DISABLED" 
        });
      }

      // Get workspace flags for feature detection
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { flags: true }
      });

      if (!workspace) {
        return NextResponse.json({ 
          ok: false, 
          code: "WORKSPACE_NOT_FOUND" 
        }, { status: 404 });
      }

      // Use Instagram-only data for matching
      const brandSearchInput = {
        brands: criteria?.brands || [],
        platforms: ["instagram"], // Only Instagram for launch
        criteria: criteria || {}
      };

      // Get brand matches using existing service
      const matches = await suggestBrands(
        workspace.flags,
        brandSearchInput,
        {
          tone: 'professional',
          brevity: 'concise'
        }
      );

      return NextResponse.json({ 
        ok: true, 
        matches: matches.brands || [],
        runId,
        platforms: ["instagram"]
      });

    } catch (error: any) {
      log.error('match_top_failed', { 
        msg: error?.message, 
        stack: error?.stack,
        workspaceId: body?.workspaceId,
        runId: body?.runId
      });
      return NextResponse.json(
        { 
          ok: false, 
          code: "MATCH_TOP_FAILED", 
          message: error?.message ?? "Unknown error" 
        },
        { status: 500 }
      );
    }
  })(request);
});
