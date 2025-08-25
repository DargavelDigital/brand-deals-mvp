'use client'

import SearchBar from '@/components/ui/SearchBar'
import Button from '@/components/ui/Button'

export default function Topbar() {
  return (
    <div className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="container-max h-14 flex items-center gap-3">
        <div className="font-semibold tracking-tight mr-2">Creator OS</div>
        <div className="flex-1 max-w-[720px]">
          <SearchBar size="sm" placeholder="Search…" />
        </div>
        <Button size="sm">Quick Action</Button>
      </div>
    </div>
  )
}
