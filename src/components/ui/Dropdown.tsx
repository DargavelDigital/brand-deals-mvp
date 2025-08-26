'use client'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  anchorRef: React.RefObject<HTMLElement | HTMLButtonElement>
  open: boolean
  onClose: ()=>void
  children: React.ReactNode
  align?: 'start'|'end'
  offset?: number
}

export default function Dropdown({ anchorRef, open, onClose, children, align='end', offset=8 }: Props){
  const panelRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [style, setStyle] = useState<React.CSSProperties>({})

  useEffect(()=> setMounted(true), [])

  // Position near the anchor (avoids clipping by ancestor overflow)
  useLayoutEffect(()=>{
    if (!open || !anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    const left = align==='end'
      ? rect.right - 240       // default width guess; panel will auto-fit via maxWidth
      : rect.left
    setStyle({
      position:'fixed',
      top: rect.bottom + offset,
      left: Math.max(8, Math.min(left, window.innerWidth-248)),
      maxWidth: 280,
    })
  }, [open, anchorRef, align, offset])

  useEffect(()=>{
    if (!open) return
    function onDocClick(e: MouseEvent){
      if (panelRef.current && !panelRef.current.contains(e.target as Node) &&
          anchorRef.current && !anchorRef.current.contains(e.target as Node)){
        onClose()
      }
    }
    function onEsc(e: KeyboardEvent){ if (e.key==='Escape') onClose() }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onEsc)
    return ()=>{
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open, onClose])

  if (!mounted || !open) return null
  return createPortal(
    <div ref={panelRef} className="ui-dropdown-panel ui-popover-z" style={style} role="menu" aria-label="Menu">
      {children}
    </div>,
    document.body
  )
}
