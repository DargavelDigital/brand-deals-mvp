'use client'

import { useId } from 'react'

export default function SearchBar({ placeholder, defaultValue, onChange, size='md', className='' }:{
  placeholder?:string; defaultValue?:string; onChange?:(v:string)=>void; size?:'sm'|'md'; className?:string
}){
  const id = useId()
  return (
    <label htmlFor={id}>
      <div>
        <input
          id={id}
          type="search"
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={(e)=>onChange?.(e.target.value)}
        />
      </div>
    </label>
  )
}
