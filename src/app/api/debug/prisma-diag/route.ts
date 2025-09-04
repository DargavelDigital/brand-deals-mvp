import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const prefix = process.env.DATABASE_URL?.split(':')[0] ?? 'missing';
    const engine = process.env.PRISMA_QUERY_ENGINE_TYPE ?? 'unset';
    
    // Test Prisma import
    let prismaStatus = 'not_imported';
    try {
      const prisma = await import('@/lib/prisma');
      prismaStatus = 'imported_successfully';
    } catch (error) {
      prismaStatus = `import_error: ${error instanceof Error ? error.message : 'unknown'}`;
    }
    
    return NextResponse.json({
      ok: true,
      prefix,
      engine,
      expects: 'postgresql',
      prismaStatus,
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'unknown error',
    }, { status: 500 });
  }
}
