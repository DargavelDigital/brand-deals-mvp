'use client'

export default function SidebarSkin({ children }: { children: React.ReactNode }){
  return (
    <aside className="h-full bg-surface border-r border-[var(--border)]">
      <div className="py-4 px-3 space-y-4">{children}</div>
    </aside>
  )
}
