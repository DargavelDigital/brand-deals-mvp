'use client'

export default function TopbarFrame({ children }: { children: React.ReactNode }){
  return (
    <div className="h-14 w-full bg-[color:var(--surface)] border-b border-[var(--border)] shadow-[0_1px_0_0_rgba(0,0,0,0.06)]">
      <div className="container-page">
        <div className="flex h-14 items-center gap-3 lg:gap-4 min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}
