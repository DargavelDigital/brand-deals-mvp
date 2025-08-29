'use client'
import { useEventStream } from '@/hooks/useEventStream'
import { toast } from '@/hooks/useToast'

export default function NotificationsClient({ wsId }: { wsId: string }) {
  useEventStream(wsId, (e) => {
    if (e.kind === 'audit.progress') {
      toast.info(`${e.step}: ${e.status}${e.pct ? ` (${e.pct}%)` : ''}`)
    } else if (e.kind === 'outreach.reply') {
      toast.success(`Reply from ${e.contact.name || e.contact.email}`)
    } else if (e.kind === 'pack.progress') {
      toast.info(`Media Pack: ${e.status}`)
    } else if (e.kind === 'match.progress') {
      toast.info(`Brand Matching: ${e.status}`)
    }
  })
  
  return null
}
