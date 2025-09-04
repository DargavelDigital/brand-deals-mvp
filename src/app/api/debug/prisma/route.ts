import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import fs from 'node:fs'
import path from 'node:path'

export async function GET() {
  // try to read datasource line for visibility (best-effort)
  let schemaUrlLine = null
  try {
    const schema = fs.readFileSync(path.join(process.cwd(), 'prisma/schema.prisma'), 'utf8')
    const m = schema.match(/datasource\s+db\s*\{[\s\S]*?url\s*=\s*env\(["']DATABASE_URL["']\)[\s\S]*?\}/)
    schemaUrlLine = m ? m[0] : null
  } catch {}

  return NextResponse.json({
    ok: true,
    prismaVersion: Prisma?.prismaVersion,
    engineInfo: {
      PRISMA_QUERY_ENGINE_TYPE: process.env.PRISMA_QUERY_ENGINE_TYPE || null,
      PRISMA_GENERATE_DATAPROXY: process.env.PRISMA_GENERATE_DATAPROXY || null,
    },
    databaseUrlPrefix: (process.env.DATABASE_URL || '').split(':')[0], // e.g. 'postgresql'
    envHas: { DATABASE_URL: !!process.env.DATABASE_URL },
    nodeEnv: process.env.NODE_ENV,
    schemaDatasourceSnippet: schemaUrlLine,
  })
}
