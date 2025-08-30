'use client'
import * as React from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import AiFeedbackButtons from '@/components/feedback/AiFeedbackButtons'
import AdaptiveBadge from '@/components/ui/AdaptiveBadge'

export type UIMatchBrand = {
  id: string
  name: string
  logo?: string
  description?: string
  relevance?: string
  tags?: string[]
  matchScore: number
  industry?: string
  website?: string
}

export default function BrandCard({
  brand, selected, onSelect, onDetails,
}: {
  brand: UIMatchBrand
  selected: boolean
  onSelect: (id:string)=>void
  onDetails: (id:string)=>void
}){
  const initial = brand.name?.[0]?.toUpperCase() ?? 'B'
  return (
    <div className={`card p-5 transition-all ${selected ? 'ring-2 ring-[var(--brand-600)] bg-[var(--tint-accent)]' : ''}`}>
      <div className="flex items-start gap-4">
        {brand.logo ? (
          <img src={brand.logo} alt="" className="w-16 h-16 rounded-lg object-cover"/>
        ) : (
          <div className="w-16 h-16 rounded-lg bg-[var(--muted)] grid place-items-center text-white text-xl font-bold">
            {initial}
          </div>
        )}
        <div className="min-w-0 flex-grow-1">
          <div className="flex items-center justify-between gap-3">
            <div className="truncate">
              <div className="text-lg font-semibold truncate">{brand.name}</div>
              {brand.industry && <div className="text-xs text-[var(--muted-fg)]">{brand.industry}</div>}
            </div>
            <Badge className="bg-[var(--success)] text-white border-[var(--success)]">
              {brand.matchScore}% Match
            </Badge>
          </div>

          {brand.description && <p className="mt-2 text-sm text-[var(--muted-fg)] line-clamp-2">{brand.description}</p>}

          {brand.tags?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {brand.tags.slice(0,5).map((t,i)=>(
                <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>
              ))}
            </div>
          ) : null}

          {brand.relevance && <p className="mt-2 text-sm text-[var(--muted-fg)]">{brand.relevance}</p>}

          <div className="mt-3 flex gap-2">
            <Button size="sm" variant={selected ? 'secondary' : 'primary'} onClick={()=>onSelect(brand.id)}>
              {selected ? 'Selected' : 'Select Brand'}
            </Button>
            <Button size="sm" variant="ghost" onClick={()=>onDetails(brand.id)}>View Details</Button>
          </div>
          
          {/* AI Feedback Integration */}
          <div className="mt-3 pt-3 border-t border-[var(--border)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--muted-fg)]">How was this match?</span>
              <AdaptiveBadge />
            </div>
            <AiFeedbackButtons 
              type="MATCH" 
              targetId={brand.id}
              className="justify-start"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
