// src/app/api/x/status/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    ok: true, 
    enabled: false, 
    reason: "COMING_SOON" 
  }, { status: 200 })
}

// Return 405 for non-GET methods
export async function POST() {
  return NextResponse.json({ ok: false, error: 'METHOD_NOT_ALLOWED' }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ ok: false, error: 'METHOD_NOT_ALLOWED' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ ok: false, error: 'METHOD_NOT_ALLOWED' }, { status: 405 })
}
