'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

export default function UserDropdown(){
  // Mock user data for now - can be replaced with NextAuth later
  const user = { name: 'John Doe' }
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(()=>{
    function onClick(e: MouseEvent){
      if(!ref.current) return
      if(!ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onClick)
    return ()=> document.removeEventListener('click', onClick)
  },[])
  
  const initials = (user?.name||'User').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()
  
  const handleSignOut = () => {
    // Mock sign out for now
    console.log('Sign out clicked')
    setOpen(false)
    // In a real app, this would clear session and redirect
  }
  
  return (
    <div className="relative" ref={ref}>
      <button onClick={()=>setOpen(v=>!v)} className="h-9 px-3 rounded-md border border-[var(--border)] bg-[var(--card)] text-sm flex items-center gap-2">
        <span className="inline-grid place-items-center size-6 rounded-full bg-[var(--muted)]">{initials}</span>
        <span className="max-w-[150px] truncate">{user?.name || 'John Doe'}</span>
        <span aria-hidden>▾</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-md border border-[var(--border)] bg-[var(--card)] shadow-md p-1 text-sm z-50">
          <Link className="block px-3 py-2 hover:bg-[var(--muted)] rounded" href="/profile">Profile</Link>
          <Link className="block px-3 py-2 hover:bg-[var(--muted)] rounded" href="/settings">Settings</Link>
          <Link className="block px-3 py-2 hover:bg-[var(--muted)] rounded" href="/billing">Billing</Link>
          <Link className="block px-3 py-2 hover:bg-[var(--muted)] rounded" href="/tools/connect">Connected Accounts</Link>
          <button className="w-full text-left px-3 py-2 hover:bg-[var(--muted)] rounded" onClick={handleSignOut}>Sign out</button>
        </div>
      )}
    </div>
  )
}
