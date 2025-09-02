'use client'
import * as React from 'react'
import type { UIMatchBrand } from './BrandCard'
import BrandLogo from '@/components/media/BrandLogo'

export default function BrandDetailsDrawer({
  open, onClose, brand,
}: {
  open: boolean
  onClose: ()=>void
  brand?: UIMatchBrand & { reasons?: string[] }
}){
  if(!open || !brand) return null
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}/>
                    <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-[var(--bg)] shadow-lg p-6 overflow-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">{brand.name}</h3>
          <button onClick={onClose} className="text-[var(--muted-fg)] hover:text-[var(--fg)]">Close</button>
        </div>

        <div className="mt-4 flex items-start gap-4">
          <BrandLogo 
            name={brand.name}
            domain={brand.website ? new URL(brand.website).hostname : brand.logo}
            size={32}
          />
          <div className="text-sm text-[var(--muted-fg)]">
            {brand.industry && <div>Industry: {brand.industry}</div>}
            {brand.website && <div>Website: <a href={brand.website} target="_blank" className="underline">{brand.website}</a></div>}
            <div>Match Score: <span className="font-medium text-[var(--fg)]">{brand.matchScore}%</span></div>
          </div>
        </div>

        {brand.description && <p className="mt-4 text-[var(--fg)]">{brand.description}</p>}

        {!!brand.reasons?.length && (
          <div className="mt-6">
            <div className="text-sm font-medium">Why you match</div>
            <ul className="mt-2 grid gap-2">
              {brand.reasons!.map((r,i)=>(
                <li key={i} className="rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-3 text-sm">{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
