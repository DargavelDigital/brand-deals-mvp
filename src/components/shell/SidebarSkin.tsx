'use client'

export default function SidebarSkin({ children }: { children: React.ReactNode }){
  return (
    <aside>
      <div>{children}</div>
    </aside>
  )
}
