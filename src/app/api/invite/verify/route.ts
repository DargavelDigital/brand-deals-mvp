import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { log } from '@/lib/log';

function bool(v?: string) {
  return (v ?? "").toLowerCase() === "true" || v === "1";
}

export async function POST(request: NextRequest) {
  const isDev = process.env.NODE_ENV !== "production";
  try {
    // Parse request body
    const body = await request.json();

    const code = (body?.code ?? body?.invite ?? body?.inviteCode ?? "").toString().trim();

    const required = (process.env.INVITE_CODE ?? "").trim();
    const demoOk = bool(process.env.ENABLE_DEMO_AUTH) || bool(process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH);

    // Dev convenience: if no INVITE_CODE is set and demo is enabled, accept any non-empty code
    if (!required && demoOk && code) {
      return NextResponse.json({ ok: true, accepted: true, mode: "demo-no-invite-set" });
    }

    if (!code) {
      return NextResponse.json(
        { ok: false, error: "MISSING_CODE", hint: isDev ? "Send { code } in JSON body" : undefined },
        { status: 400 }
      );
    }

    if (!required) {
      return NextResponse.json(
        { ok: false, error: "INVITE_NOT_CONFIGURED", hint: isDev ? "Set INVITE_CODE in Netlify env" : undefined },
        { status: 400 }
      );
    }

    if (code !== required) {
      return NextResponse.json(
        { ok: false, error: "INVALID_CODE", hint: isDev ? `Expected ${required.length} chars` : undefined },
        { status: 400 }
      );
    }

    // Set the invite verification cookie
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === 'production';
    
    await cookieStore.set('invite_ok', '1', {
      path: '/',
      maxAge: 604800, // 7 days
      secure: isProduction,
      sameSite: 'lax',
      httpOnly: true,
    });

    return NextResponse.json({ ok: true, accepted: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", hint: process.env.NODE_ENV !== "production" ? String(e?.message || e) : undefined },
      { status: 500 }
    );
  }
}

