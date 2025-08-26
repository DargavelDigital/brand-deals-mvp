'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import Dropdown from '@/components/ui/Dropdown'

export default function UserDropdown(){
  // Mock user data for now - can be replaced with NextAuth later
  const user = { name: 'John Doe' }
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  
  const initials = (user?.name||'User').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()
  
  const handleSignOut = () => {
    // Mock sign out for now
    console.log('Sign out clicked')
    setOpen(false)
    // In a real app, this would clear session and redirect
  }
  
  return (
    <div className="relative">
      <button
        ref={btnRef}
        aria-expanded={open}
        onClick={()=>setOpen(v=>!v)}
        className="h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--card)] text-sm flex items-center gap-2">
        <span className="inline-grid place-items-center size-6 rounded-full bg-[var(--muted)]">{initials}</span>
        <span className="max-w-[150px] truncate">{user?.name || 'John Doe'}</span>
        <span aria-hidden>▾</span>
      </button>

      <Dropdown anchorRef={btnRef} open={open} onClose={()=>setOpen(false)} align="end" offset={8}>
        <div className="p-1 w-[240px]">
          <Link className="ui-dropdown-item" href="/profile">Profile</Link>
          <Link className="ui-dropdown-item" href="/settings">Settings</Link>
          <Link className="ui-dropdown-item" href="/billing">Billing</Link>
          <Link className="ui-dropdown-item" href="/tools/connect">Connected Accounts</Link>
          <button className="ui-dropdown-item w-full text-left" onClick={handleSignOut}>Sign out</button>
        </div>
      </Dropdown>
    </div>
  )
}
