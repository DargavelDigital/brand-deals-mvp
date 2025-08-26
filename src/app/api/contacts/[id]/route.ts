import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { currentWorkspaceId } from '@/lib/workspace'

export async function GET(_:Request,{params}:{params:{id:string}}){
  const workspaceId = await currentWorkspaceId()
  const c = await prisma.contact.findFirst({ where:{ id: params.id, workspaceId }})
  if(!c) return NextResponse.json({error:'Not found'},{status:404})
  return NextResponse.json(c)
}

export async function PUT(req:Request,{params}:{params:{id:string}}){
  const workspaceId = await currentWorkspaceId()
  const body = await req.json()
  const updated = await prisma.contact.update({
    where: { id: params.id },
    data: {
      name: body.name, email: body.email, title: body.title,
      company: body.company, phone: body.phone,
      status: body.status, verifiedStatus: body.verifiedStatus,
      tags: body.tags ?? [],
      notes: body.notes, source: body.source,
      lastContacted: body.lastContacted ? new Date(body.lastContacted) : undefined,
    },
  })
  if(updated.workspaceId !== workspaceId){
    return NextResponse.json({error:'Forbidden'},{status:403})
  }
  return NextResponse.json(updated)
}

export async function DELETE(_:Request,{params}:{params:{id:string}}){
  await prisma.contact.delete({ where:{ id: params.id }})
  return NextResponse.json({ ok:true })
}
