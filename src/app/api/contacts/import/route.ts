import { NextResponse } from 'next/server'
import { withIdempotency } from '@/lib/idempotency';
import { prisma } from '@/lib/prisma'
import { currentWorkspaceId } from '@/lib/workspace'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(req:Request){
  const text = await req.text() // expect raw text/csv
  const lines = text.split(/\r?\n/).filter(Boolean)
  const [header, ...rows] = lines
  const idx = (name:string) => header.toLowerCase().split(',').findIndex(h => h.trim() === name)
  const iName = idx('name'), iEmail = idx('email'), iCompany = idx('company'), iTitle = idx('title'), iPhone = idx('phone')

  const workspaceId = await currentWorkspaceId()
  let created = 0, skipped = 0

  for (const row of rows) {
    const cols = row.split(',')
    const name = cols[iName]?.replace(/^"|"$/g,'').trim()
    const email = cols[iEmail]?.replace(/^"|"$/g,'').trim()
    if(!name || !email){ skipped++; continue }
    try {
      await prisma.contact.upsert({
        where: { workspaceId_email: { workspaceId, email } },
        update: { name, company: cols[iCompany]?.replace(/^"|"$/g,'').trim() ?? null, title: cols[iTitle]?.replace(/^"|"$/g,'').trim() ?? null, phone: cols[iPhone]?.replace(/^"|"$/g,'').trim() ?? null },
        create: { workspaceId, name, email, company: cols[iCompany]?.replace(/^"|"$/g,'').trim() ?? null, title: cols[iTitle]?.replace(/^"|"$/g,'').trim() ?? null, phone: cols[iPhone]?.replace(/^"|"$/g,'').trim() ?? null },
      })
      created++
    } catch { skipped++ }
  }
  return NextResponse.json({ created, skipped })
}
