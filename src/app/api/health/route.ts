import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    ok: true, 
    auth: 'enabled',
    timestamp: new Date().toISOString()
  });
}
