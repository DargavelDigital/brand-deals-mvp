'use client'
export default function History({ items }:{ items:any[] }){
  if (!items?.length) return null
  return (
    <div className="card p-5 md:p-6">
      <div className="text-lg font-semibold mb-3">Recent Media Packs</div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((m, i)=>(
          <div key={i} className="rounded-[12px] border border-[var(--border)] p-3 bg-[var(--card)]">
            <div className="text-sm font-medium truncate">#{m.id?.slice?.(0,6) || 'draft'} • {m.variant || 'default'}</div>
            <div className="text-xs text-[var(--muted-fg)]">{new Date(m.createdAt ?? Date.now()).toLocaleString()}</div>
            <div className="mt-2 flex gap-2">
              {m.pdfUrl && <a className="text-sm underline" href={m.pdfUrl} target="_blank" rel="noreferrer">PDF</a>}
              {m.htmlUrl && <a className="text-sm underline" href={m.htmlUrl} target="_blank" rel="noreferrer">Web</a>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
