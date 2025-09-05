'use client'
import useSWR from 'swr'

const fetcher = (u:string)=> fetch(u).then(r=>r.json())

export default function ActivityList(){
  const { data, isLoading, error } = useSWR('/api/activity/recent', fetcher, { revalidateOnFocus:false })
  
  // Defensive defaults to prevent UI crashes
  const totalCount = data?.totalCount ?? 0
  const items = Array.isArray(data?.items) ? data.items : []
  
  if (isLoading) {
    return (
      <div className="card">
        <div className="p-4 text-center text-[var(--muted)]">Loading recent activity...</div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="card">
        <div className="p-4 text-center text-[var(--error)]">Failed to load activity</div>
      </div>
    )
  }
  
  if (items.length === 0) {
    return (
      <div className="card">
        <div className="p-4 text-center text-[var(--muted)]">No recent activity</div>
      </div>
    )
  }
  
  return (
    <div className="card">
      <ul className="divide-y divide-[var(--border)]">
        {items.map((it:any)=>(
          <li key={it.id} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="size-2 rounded-full bg-[var(--success)]" />
              <span>{it.title || 'Unknown Activity'}</span>
            </div>
            <time className="text-xs text-[var(--muted)]">
              {it.at ? new Date(it.at).toLocaleTimeString() : 'Unknown time'}
            </time>
          </li>
        ))}
      </ul>
    </div>
  )
}
