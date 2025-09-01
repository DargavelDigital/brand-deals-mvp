import { NextResponse } from 'next/server';
import { get } from '@/lib/clientEnv';

export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_CRM_LIGHT_ENABLED: get('NEXT_PUBLIC_CRM_LIGHT_ENABLED'),
    NODE_ENV: process.env.NODE_ENV,
  });
}
