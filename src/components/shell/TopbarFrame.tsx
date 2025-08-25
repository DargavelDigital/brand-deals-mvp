'use client'

export default function TopbarFrame({ children }: { children: React.ReactNode }){
  return (
    <div className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="container-max h-14 flex items-center gap-3">{children}</div>
    </div>
  )
}
