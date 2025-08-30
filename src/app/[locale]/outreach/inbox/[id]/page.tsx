'use client'
import useSWR from 'swr'
import { useState } from 'react'

const fetcher = (u:string)=>fetch(u).then(r=>r.json())

export default function ThreadPage({ params }: any) {
  const { id } = params
  const { data, mutate } = useSWR(`/api/outreach/conversations/${id}`, fetcher, { refreshInterval: 4000 })
  const conv = data?.conversation
  const msgs = data?.messages || []
  const [body, setBody] = useState('')

  const send = async () => {
    await fetch(`/api/outreach/conversations/${id}/reply`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ body }),
    })
    setBody('')
    mutate()
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Conversation</h1>
        <p className="text-[var(--muted-fg)]">
          View and respond to outreach conversations with your contacts.
        </p>
      </div>
      
      {conv ? (
        <>
          <div className="p-4 border rounded-lg">
            <div className="font-medium mb-1">{conv.subject ?? '(no subject)'}</div>
            <div className="text-sm text-[var(--muted-fg)]">Thread: {conv.threadKey}</div>
          </div>
          <div className="space-y-3">
            {msgs.map((m:any)=>(
              <div key={m.id} className={`p-3 border rounded-lg ${m.direction==='in'?'bg-white':'bg-[var(--tint-accent)]'}`}>
                <div className="text-xs text-[var(--muted-fg)] mb-1">
                  {m.direction==='in'?'From':'To'} {m.direction==='in'?m.fromAddr:m.toAddr} • {new Date(m.createdAt).toLocaleString()}
                </div>
                <div dangerouslySetInnerHTML={{ __html: m.html || `<pre>${m.text||''}</pre>` }} />
              </div>
            ))}
          </div>
          <div className="p-4 border rounded-lg">
            <textarea value={body} onChange={e=>setBody(e.target.value)} rows={5} className="w-full border rounded-md p-2" placeholder="Write a reply…" />
            <div className="mt-2 text-right">
              <button onClick={send} className="px-4 py-2 rounded-md bg-[var(--brand-600)] text-white">Send Reply</button>
            </div>
          </div>
        </>
      ) : <div>Loading…</div>}
    </div>
  )
}
