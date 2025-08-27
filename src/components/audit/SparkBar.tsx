'use client'
import * as React from 'react'

export default function SparkBar({ values }:{ values:number[] }){
  const max = Math.max(...values, 1)
  return (
    <div className="flex items-end gap-1 h-16">
      {values.map((v,i)=>(
        <div key={i} className="w-2 rounded-sm bg-[var(--brand-600)]/35" style={{ height: `${(v/max)*100}%` }} />
      ))}
    </div>
  )
}
