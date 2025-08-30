'use client'

export default function SidebarSkin({ children }: { children: React.ReactNode }){
  return (
    <aside className="h-full bg-surface border-r border-[var(--border)]">
      <div className="py-4 px-4 md:px-5 space-y-3">{children}</div>
    </aside>
  )
}
