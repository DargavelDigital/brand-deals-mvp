'use client'
import useSWR from 'swr'
import Link from 'next/link'

const fetcher = (u:string)=>fetch(u).then(r=>r.json())

export default function InboxPage() {
  const { data } = useSWR('/api/outreach/conversations', fetcher, { refreshInterval: 5000 })
  const items = data?.items || []
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Outreach Inbox</h1>
      <div className="grid gap-3">
        {items.map((c:any) => (
          <Link key={c.id} href={`/outreach/inbox/${c.id}`} className="p-4 border rounded-lg hover:bg-[var(--tint-accent)]">
            <div className="flex items-center justify-between">
              <div className="font-medium">{c.subject ?? '(no subject)'}</div>
              <div className="text-sm text-[var(--muted-fg)]">{new Date(c.lastAt).toLocaleString()}</div>
            </div>
            <div className="text-sm text-[var(--muted-fg)]">Thread: {c.threadKey}</div>
          </Link>
        ))}
        {items.length === 0 && <div className="text-[var(--muted-fg)]">No conversations yet.</div>}
      </div>
    </div>
  )
}
