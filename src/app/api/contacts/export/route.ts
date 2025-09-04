import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { currentWorkspaceId } from '@/lib/workspace'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  const workspaceId = await currentWorkspaceId()
  
  // Check if specific IDs are requested
  const { searchParams } = new URL(request.url)
  const idsParam = searchParams.get('ids')
  
  let whereClause: any = { workspaceId }
  
  if (idsParam) {
    try {
      const ids = JSON.parse(idsParam)
      if (Array.isArray(ids) && ids.length > 0) {
        whereClause.id = { in: ids }
      }
    } catch (error) {
      console.warn('Invalid IDs parameter:', error)
    }
  }
  
  const rows = await prisma.contact.findMany({ 
    where: whereClause, 
    orderBy: { name: 'asc' } 
  })
  
  const header = ['Name','Title','Email','Company','Phone','Status','Verified','Tags'].join(',')
  const body = rows.map(r =>
    [r.name, r.title ?? '', r.email, r.company ?? '', r.phone ?? '', r.status, r.verifiedStatus, (r.tags||[]).join('|')]
      .map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')
  ).join('\n')
  const csv = `${header}\n${body}\n`
  
  const filename = idsParam ? `contacts-selected-${new Date().toISOString().split('T')[0]}.csv` : 'contacts.csv'
  
  return new Response(csv, {
    headers: { 
      'Content-Type': 'text/csv', 
      'Content-Disposition': `attachment; filename="${filename}"` 
    }
  })
}

export async function POST(request: NextRequest) {
  const workspaceId = await currentWorkspaceId()
  
  try {
    const requestBody = await request.json()
    const { ids } = requestBody
    
    let whereClause: any = { workspaceId }
    
    if (ids && Array.isArray(ids) && ids.length > 0) {
      whereClause.id = { in: ids }
    }
    
    const rows = await prisma.contact.findMany({ 
      where: whereClause, 
      orderBy: { name: 'asc' } 
    })
    
    const header = ['Name','Title','Email','Company','Phone','Status','Verified','Tags'].join(',')
    const csvBody = rows.map(r =>
      [r.name, r.title ?? '', r.email, r.company ?? '', r.phone ?? '', r.status, r.verifiedStatus, (r.tags||[]).join('|')]
        .map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')
    ).join('\n')
    const csv = `${header}\n${csvBody}\n`
    
    const filename = ids && ids.length > 0 ? `contacts-selected-${new Date().toISOString().split('T')[0]}.csv` : 'contacts.csv'
    
    return new Response(csv, {
      headers: { 
        'Content-Type': 'text/csv', 
        'Content-Disposition': `attachment; filename="${filename}"` 
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return new Response('Export failed', { status: 500 })
  }
}
