import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    databaseUrl: !!process.env.DATABASE_URL,
    prismaClient: !!prisma,
    prismaVersion: process.env.PRISMA_VERSION || 'unknown',
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  };

  try {
    // Test basic Prisma connection
    if (process.env.DATABASE_URL) {
      await prisma.$connect();
      diagnostics.connectionTest = 'success';
      
      // Test a simple query
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      diagnostics.queryTest = 'success';
      diagnostics.queryResult = result;
      
      await prisma.$disconnect();
    } else {
      diagnostics.connectionTest = 'skipped - no DATABASE_URL';
      diagnostics.queryTest = 'skipped - no DATABASE_URL';
    }
  } catch (error: any) {
    diagnostics.connectionTest = 'failed';
    diagnostics.error = {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  }

  return NextResponse.json({
    ok: true,
    diagnostics,
  });
}
