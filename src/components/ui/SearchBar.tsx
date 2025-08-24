'use client'
import { useId } from 'react'
import { Search } from 'lucide-react'
export default function SearchBar({ placeholder='Search brands, contacts, deals...', defaultValue='', onChange }:{ placeholder?:string; defaultValue?:string; onChange?:(v:string)=>void }){
  const id = useId()
  return (
    <label htmlFor={id} className="block">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-fg" aria-hidden />
        <input id={id} type="search" defaultValue={defaultValue} placeholder={placeholder}
          onChange={(e)=>onChange?.(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-card text-[var(--fg)]
                     placeholder:text-[color-mix(in oklch,var(--fg) 45%,white)]
                     focus:border-[var(--ring)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in oklch,var(--ring) 40%,transparent)]" />
      </div>
    </label>
  )
}
