import { NextRequest, NextResponse } from 'next/server';
import { withIdempotency } from '@/lib/idempotency';
import { requireSessionWithWorkspace } from '@/lib/auth/requireSession';
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
      // Get authenticated user context with workspace
      const sessionResult = await requireSessionWithWorkspace();
      if (!sessionResult.ok) {
        return NextResponse.json({ 
          ok: false, 
          code: sessionResult.error 
        }, { status: sessionResult.status });
      }
      
      const { session } = sessionResult;
      const workspaceId = session.user.workspaceId!;
      
      const body = await req.json().catch(() => ({} as any));
      let runId = String(body?.runId ?? "").trim();
      const { criteria } = body;

      // If client didn't pass runId, infer latest BrandRun for this workspace
      if (!runId) {
        const latest = await prisma.brandRun.findFirst({
          where: { workspaceId },
          orderBy: { createdAt: "desc" },
          select: { id: true },
        });
        if (!latest) {
          return NextResponse.json(
            { ok: false, code: "NO_BRAND_RUN", message: "Start a Brand Run first." },
            { status: 400 }
          );
        }
        runId = latest.id;
      }

      // Launch mode: Instagram-only — avoid touching other providers
      if (!socials.enabled("instagram")) {
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
