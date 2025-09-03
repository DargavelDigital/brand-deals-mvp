import { NextResponse } from 'next/server';

export async function GET() {
  const prismaEnvVars = {
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
    DATABASE_URL_PROTOCOL: process.env.DATABASE_URL?.substring(0, 20) + '...',
    PRISMA_ACCELERATE: process.env.PRISMA_ACCELERATE || 'NOT_SET',
    PRISMA_DATA_PROXY: process.env.PRISMA_DATA_PROXY || 'NOT_SET',
    PRISMA_QUERY_ENGINE_TYPE: process.env.PRISMA_QUERY_ENGINE_TYPE || 'NOT_SET',
    PRISMA_FORCE_DOWNLOAD: process.env.PRISMA_FORCE_DOWNLOAD || 'NOT_SET',
    PRISMA_GENERATE_DATAPROXY: process.env.PRISMA_GENERATE_DATAPROXY || 'NOT_SET',
    PRISMA_GENERATE_SKIP_AUTOINSTALL: process.env.PRISMA_GENERATE_SKIP_AUTOINSTALL || 'NOT_SET',
    PRISMA_CLI_QUERY_ENGINE_TYPE: process.env.PRISMA_CLI_QUERY_ENGINE_TYPE || 'NOT_SET',
  };

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    prismaEnvVars,
    allEnvVars: Object.keys(process.env).filter(key => key.includes('PRISMA') || key.includes('DATABASE')),
  });
}
