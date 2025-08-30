import { NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/getAuth';

export async function POST() {
  if (!(process.env.DEV_DEMO_AUTH === '1' || 
        process.env.NEXT_PUBLIC_DEV_DEMO_AUTH === '1' || 
        process.env.ENABLE_DEMO_AUTH === '1')) {
    return NextResponse.json({ ok: false, error: 'DISABLED' }, { status: 403 });
  }
  const ctx = await getAuth(false);
  if (!ctx) {
    // getAuth(false) may still create demo user if DEV_DEMO_AUTH set; call again with required
    const ctx2 = await getAuth(true);
    if (!ctx2) {
      return NextResponse.json({ ok: false, error: 'LOGIN_FAILED' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, workspaceId: ctx2.workspaceId, userId: ctx2.user.id, role: ctx2.role });
  }
  return NextResponse.json({ ok: true, workspaceId: ctx.workspaceId, userId: ctx.user.id, role: ctx.role });
}
