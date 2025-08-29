import { startOfDay } from 'date-fns'
import { getPrisma } from '@/lib/db'

export async function mpDailyRollup(date = new Date()) {
  const prisma = getPrisma()
  if (!prisma) return
  const day = startOfDay(date)

  const views = await prisma.mediaPackView.groupBy({
    by: ['mediaPackId','variant'],
    where: { createdAt: { gte: day, lt: new Date(day.getTime()+86400000) }},
    _count: { _all: true }
  })
  const clicks = await prisma.mediaPackClick.groupBy({
    by: ['mediaPackId','variant'],
    where: { createdAt: { gte: day, lt: new Date(day.getTime()+86400000) }},
    _count: { _all: true }
  })
  const convs = await prisma.mediaPackConversion.groupBy({
    by: ['mediaPackId','variant'],
    where: { createdAt: { gte: day, lt: new Date(day.getTime()+86400000) }},
    _count: { _all: true }
  })

  const key = (m:string,v:string)=>`${m}|${v}`
  const map: Record<string, {views:number,clicks:number,conversions:number, mediaPackId:string, variant:string}> = {}

  views.forEach(r => map[key(r.mediaPackId,r.variant)] = { mediaPackId:r.mediaPackId, variant:r.variant, views:r._count._all, clicks:0, conversions:0 })
  clicks.forEach(r => { const k=key(r.mediaPackId,r.variant); map[k]??={mediaPackId:r.mediaPackId,variant:r.variant,views:0,clicks:0,conversions:0}; map[k].clicks=r._count._all })
  convs.forEach(r => { const k=key(r.mediaPackId,r.variant); map[k]??={mediaPackId:r.mediaPackId,variant:r.variant,views:0,clicks:0,conversions:0}; map[k].conversions=r._count._all })

  for (const k of Object.keys(map)) {
    const m = map[k]
    const ctr = m.views ? m.clicks / m.views : 0
    const cvr = m.views ? m.conversions / m.views : 0
    await prisma.mediaPackDaily.upsert({
      where: { mediaPackId_date_variant: { mediaPackId: m.mediaPackId, date: day, variant: m.variant }},
      update: { views:m.views, clicks:m.clicks, conversions:m.conversions, ctr, cvr },
      create: { mediaPackId:m.mediaPackId, date: day, variant: m.variant, views:m.views, clicks:m.clicks, conversions:m.conversions, ctr, cvr }
    })
  }
}
