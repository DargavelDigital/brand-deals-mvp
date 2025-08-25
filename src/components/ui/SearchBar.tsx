'use client'

import { useId } from 'react'
import { Input } from '@/components/ui/Input'

export default function SearchBar({ placeholder, defaultValue, onChange, size='md' }:{
  placeholder?:string; defaultValue?:string; onChange?:(v:string)=>void; size?:'sm'|'md'
}){
  const id = useId()
  return (
    <div className="relative">
      <Input
        id={id}
        type="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={(e)=>onChange?.(e.target.value)}
        className={size === 'sm' ? 'h-8 text-sm' : 'h-10'}
      />
    </div>
  )
}
