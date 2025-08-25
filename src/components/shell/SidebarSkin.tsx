'use client'

export default function SidebarSkin({ children }: { children: React.ReactNode }){
  return (
    <aside className="shrink-0 border-r border-[var(--border)] bg-[var(--card)]">
      <div className="p-3 space-y-2">{children}</div>
    </aside>
  )
}
