'use client'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'

export default function UserDropdown(){
  // Mock user data for now - can be replaced with NextAuth later
  const user = { name: 'John Doe' }
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const initials = (user?.name||'User').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()

  useEffect(()=> setMounted(true), [])

  // Close on outside / ESC
  useEffect(()=>{
    if (!open) return
    const onClick = (e: MouseEvent)=>{
      if (panelRef.current?.contains(e.target as Node)) return
      if (btnRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    const onEsc = (e: KeyboardEvent)=>{ if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onEsc)
    return ()=>{
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  // Position panel near the button (uses fixed coords; avoids parent overflow/blur)
  const [style, setStyle] = useState<React.CSSProperties>({})
  useLayoutEffect(()=>{
    if (!open || !btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    const width = 260
    const left = Math.min(Math.max(8, r.right - width), window.innerWidth - width - 8)
    setStyle({ top: r.bottom + 8, left, width })
  }, [open])

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

      {mounted && open && createPortal(
        <div ref={panelRef} className="ui-dropdown-panel p-1" style={style} role="menu" aria-label="User menu">
          <Link className="ui-dropdown-item" href="/profile">Profile</Link>
          <Link className="ui-dropdown-item" href="/settings">Settings</Link>
          <Link className="ui-dropdown-item" href="/billing">Billing</Link>
          <Link className="ui-dropdown-item" href="/tools/connect">Connected Accounts</Link>
          <button className="ui-dropdown-item w-full text-left" onClick={handleSignOut}>Sign out</button>
        </div>,
        document.body
      )}
    </div>
  )
}
