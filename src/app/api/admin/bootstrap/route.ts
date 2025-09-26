import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runMigrations, seedIfNeeded, validateAdminToken, BootstrapResult } from '@/lib/admin/bootstrap';
import { randomUUID } from 'crypto';
import { log } from '@/lib/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(request: Request) {
  const traceId = randomUUID();
  
  try {
    // Validate admin token
    if (!validateAdminToken(request)) {
      return NextResponse.json(
        { ok: false, error: 'UNAUTHORIZED', traceId },
        { status: 403 }
      );
    }

    log.info(`[${traceId}] Admin bootstrap request started`);

    // Test database connection
    try {
      await prisma.$executeRawUnsafe('SELECT 1');
      log.info(`[${traceId}] Database connection test successful`);
    } catch (dbError) {
      log.error(`[${traceId}] Database connection test failed:`, dbError);
      return NextResponse.json(
        { 
          ok: false, 
          error: 'DATABASE_CONNECTION_FAILED', 
          traceId,
          details: dbError instanceof Error ? dbError.message : 'Unknown database error'
        },
        { status: 500 }
      );
    }

    // Run migrations
    log.info(`[${traceId}] Starting migrations...`);
    const migrationResult = await runMigrations();
    
    if (!migrationResult.success) {
      log.error(`[${traceId}] Migration failed:`, migrationResult.error);
      return NextResponse.json(
        { 
          ok: false, 
          error: 'MIGRATION_FAILED', 
          traceId,
          details: migrationResult.error,
          logs: migrationResult.logs
        },
        { status: 500 }
      );
    }

    log.info(`[${traceId}] Migrations completed successfully`);

    // Seed database if needed
    log.info(`[${traceId}] Checking if seeding is needed...`);
    const seedResult = await seedIfNeeded(prisma);
    
    if (!seedResult.success) {
      log.error(`[${traceId}] Seeding failed:`, seedResult.error);
      return NextResponse.json(
        { 
          ok: false, 
          error: 'SEEDING_FAILED', 
          traceId,
          details: seedResult.error
        },
        { status: 500 }
      );
    }

    const result: BootstrapResult = {
      ok: true,
      migrated: true,
      seeded: true,
      workspaceId: seedResult.workspaceId,
      traceId
    };

    log.info(`[${traceId}] Bootstrap completed successfully`, result);
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    log.error(`[${traceId}] Bootstrap failed with unexpected error:`, error);
    
    return NextResponse.json(
      { 
        ok: false, 
        error: 'INTERNAL_ERROR', 
        traceId,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Also support GET for health check
export async function GET(request: Request) {
  const traceId = randomUUID();
  
  try {
    // Validate admin token
    if (!validateAdminToken(request)) {
      return NextResponse.json(
        { ok: false, error: 'UNAUTHORIZED', traceId },
        { status: 403 }
      );
    }

    // Test database connection
    try {
      await prisma.$executeRawUnsafe('SELECT 1');
      
      // Check if workspace exists
      const workspace = await prisma.workspace.findFirst({
        select: { id: true, slug: true, name: true }
      });

      return NextResponse.json({
        ok: true,
        database: 'connected',
        workspace: workspace ? {
          id: workspace.id,
          slug: workspace.slug,
          name: workspace.name
        } : null,
        traceId
      }, { status: 200 });

    } catch (dbError) {
      log.error(`[${traceId}] Database health check failed:`, dbError);
      return NextResponse.json(
        { 
          ok: false, 
          error: 'DATABASE_CONNECTION_FAILED', 
          traceId,
          details: dbError instanceof Error ? dbError.message : 'Unknown database error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    log.error(`[${traceId}] Health check failed:`, error);
    
    return NextResponse.json(
      { 
        ok: false, 
        error: 'INTERNAL_ERROR', 
        traceId,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
