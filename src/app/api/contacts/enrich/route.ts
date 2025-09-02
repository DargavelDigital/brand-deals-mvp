import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-options';
import { enrichContacts } from '@/services/contacts/enrich';
import type { ContactCandidate } from '@/services/contacts/types';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });

  try {
    const { candidates } = (await req.json()) as { candidates: ContactCandidate[] };
    if (!Array.isArray(candidates)) {
      return NextResponse.json({ ok: false, error: 'INVALID_INPUT' }, { status: 400 });
    }
    const enriched = await enrichContacts(candidates);
    return NextResponse.json({ ok: true, items: enriched });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: 'ENRICH_FAILED', detail: err?.message }, { status: 200 });
  }
}
