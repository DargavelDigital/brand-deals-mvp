import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth/requireSession';
import { prisma } from '@/lib/prisma'

function toCsv(rows: any[]) {
  if (!rows.length) return ''
  const cols = Object.keys(rows[0])
  const head = cols.join(',')
  const body = rows.map(r => cols.map(c => JSON.stringify(r[c] ?? '')).join(',')).join('\n')
  return head + '\n' + body
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req);
    if (session instanceof NextResponse) return session;

    const ws = (session.user as any).workspaceId!

    const [contacts, brands, sequences] = await Promise.all([
      prisma.contact.findMany({ where: { workspaceId: ws } }),
      prisma.brand.findMany({ where: { workspaceId: ws } }),
      prisma.outreachSequence?.findMany?.({ where: { workspaceId: ws } }).catch(() => []),
    ])

    const payload = {
      contacts, brands, sequences,
      exportedAt: new Date().toISOString(),
    }

    // default: JSON response; use ?format=csv to export contacts.csv
    const url = new URL(req.url)
    if (url.searchParams.get('format') === 'csv') {
      const csv = toCsv(contacts)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="contacts-${ws}.csv"`,
        }
      })
    }

    return NextResponse.json(payload)
  } catch (e) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req);
    if (session instanceof NextResponse) return session;

    // TODO: Implement workspace export logic
    return NextResponse.json({ message: 'Export started' });
  } catch (e) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
}
