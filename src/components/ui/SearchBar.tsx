'use client'

import { useId } from 'react'
import { Search } from 'lucide-react'

export default function SearchBar({ 
  placeholder = 'Search…', 
  defaultValue = '', 
  onChange, 
  size = 'md' 
}: {
  placeholder?: string
  defaultValue?: string
  onChange?: (v: string) => void
  size?: 'sm' | 'md'
}) {
  const id = useId()
  const pad = size === 'sm' ? 'py-2' : 'py-3'
  
  return (
    <label htmlFor={id} className="block">
      <div className="relative">
        <Search 
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--muted-fg)]" 
          aria-hidden 
        />
        <input
          id={id}
          type="search"
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full pl-10 pr-3 ${pad} rounded-full border border-[var(--border)] bg-[var(--bg)] shadow-sm focus:border-[var(--ring)] focus:outline-none`}
        />
      </div>
    </label>
  )
}
