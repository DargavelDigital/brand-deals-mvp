export default function ActivityItem({ dot='var(--success)', title, meta }:{ 
  dot?:string; 
  title:React.ReactNode; 
  meta:React.ReactNode 
}){
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 size-2 rounded-full" style={{ background: dot }} />
      <div>
        <div className="text-sm">{title}</div>
        <div className="text-xs text-[var(--muted-fg)]">{meta}</div>
      </div>
    </div>
  )
}
