import { NextResponse } from 'next/server'
import { allFlags, flags } from '@/lib/flags'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // load any demo workspace
    const ws = await prisma.workspace.findFirst()
    
    return NextResponse.json({
      env: allFlags(),
      workspace: ws?.featureFlags ?? null,
      resolved: allFlags(ws?.featureFlags ?? null),
      flags: flags,
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to load flags',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
