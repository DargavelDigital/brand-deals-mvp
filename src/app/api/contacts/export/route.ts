import { prisma } from '@/lib/prisma'
import { currentWorkspaceId } from '@/lib/workspace'

export async function GET() {
  const workspaceId = await currentWorkspaceId()
  const rows = await prisma.contact.findMany({ where:{workspaceId}, orderBy:{name:'asc'} })
  const header = ['Name','Title','Email','Company','Phone','Status','Verified','Tags'].join(',')
  const body = rows.map(r =>
    [r.name, r.title ?? '', r.email, r.company ?? '', r.phone ?? '', r.status, r.verifiedStatus, (r.tags||[]).join('|')]
      .map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')
  ).join('\n')
  const csv = `${header}\n${body}\n`
  return new Response(csv, {
    headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="contacts.csv"' }
  })
}
