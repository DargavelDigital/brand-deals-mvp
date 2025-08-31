import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_CRM_LIGHT_ENABLED: process.env.NEXT_PUBLIC_CRM_LIGHT_ENABLED ?? null,
    NODE_ENV: process.env.NODE_ENV,
  });
}
