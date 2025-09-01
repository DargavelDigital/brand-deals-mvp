'use client'
import * as React from 'react'
import { Wand2, Palette, Brush, Check } from 'lucide-react'
import { BrandAvatar } from '@/components/BrandAvatar'

const TEMPLATES = [
  { id:'default', name:'Default', blurb:'Clean, modern layout that looks great on any device.' },
  { id:'brand',   name:'Brand Accent', blurb:'Inject brand colors and logo accents for a tailored feel.' },
] as const

export default function Builder({
  brands,
  onGenerate,
  isGenerating
}: {
  brands: Array<{id:string; name:string; logo?:string; primaryColor?:string}>;
  onGenerate: (args: {template:'default'|'brand', customizations:any, brands:any[]}) => Promise<any>;
  isGenerating: boolean;
}){
  const [template, setTemplate] = React.useState<'default'|'brand'>('default')
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>(brands.map(b=>b.id))
  const [primaryColor, setPrimaryColor] = React.useState('#3b82f6')
  const [accentColor, setAccentColor] = React.useState('#111827')
  const [headline, setHeadline] = React.useState('Let\'s build something your audience will love')
  const [notes, setNotes] = React.useState('Open to sponsored posts, integrated videos, and affiliate partnerships.')

  const toggleBrand = (id:string) => setSelectedBrands(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id])

  const selected = brands.filter(b=>selectedBrands.includes(b.id))

  const handleGenerate = () => onGenerate({
    template,
    customizations: { primaryColor, accentColor, headline, notes },
    brands: selected
  })

  return (
    <div className="card p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-lg font-semibold">Media Pack Builder</div>
          <div className="text-sm text-[var(--muted-fg)]">Choose a template, tweak details, and generate a share-ready deck.</div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm">
          <Wand2 className="w-4 h-4"/> Smart defaults applied
        </div>
      </div>

      {/* Template chooser */}
      <div className="grid gap-4 md:grid-cols-2">
        {TEMPLATES.map(t => {
          const active = t.id === template
          return (
            <button
              type="button"
              key={t.id}
              onClick={()=>setTemplate(t.id)}
              className={`text-left rounded-[14px] border p-4 transition-all ${active ? 'border-[var(--brand-600)] bg-[var(--tint-accent)] ring-2 ring-[var(--brand-600)]' : 'border-[var(--border)] bg-[var(--card)]'}`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[var(--surface)]"><Brush className="w-4 h-4"/></div>
                <div className="min-w-0">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-sm text-[var(--muted-fg)]">{t.blurb}</div>
                </div>
                {active && <Check className="ml-auto text-[var(--brand-600)] w-5 h-5"/>}
              </div>
            </button>
          )
        })}
      </div>

      {/* Customizations */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3"><Palette className="w-4 h-4"/><div className="font-medium">Branding</div></div>
          <label className="text-sm">Primary color</label>
          <input type="color" value={primaryColor} onChange={e=>setPrimaryColor(e.target.value)} className="w-10 h-10 rounded mt-1"/>
          <label className="text-sm mt-4 block">Accent color</label>
          <input type="color" value={accentColor} onChange={e=>setAccentColor(e.target.value)} className="w-10 h-10 rounded mt-1"/>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3"><Wand2 className="w-4 h-4"/><div className="font-medium">Story</div></div>
          <label className="text-sm">Headline</label>
          <input value={headline} onChange={e=>setHeadline(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3"/>
          <label className="text-sm mt-3">Notes</label>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 min-h-[84px]"/>
        </div>
      </div>

      {/* Brand selection */}
      <div className="mt-6">
        <div className="text-sm font-medium mb-2">Brands in this deck</div>
        {brands.length === 0 ? (
          <div className="text-sm text-[var(--muted-fg)]">No approved brands yet. Approve some brands first.</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {brands.map(b => {
              const active = selectedBrands.includes(b.id)
              return (
                <button key={b.id} type="button" onClick={()=>toggleBrand(b.id)}
                        className={`flex items-center gap-3 rounded-[12px] border p-3 text-left ${active ? 'border-[var(--brand-600)] bg-[var(--tint-accent)]' : 'border-[var(--border)] bg-[var(--card)]'}`}>
                  <BrandAvatar 
                    name={b.name}
                    logoUrl={b.logo}
                    size={40}
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{b.name}</div>
                    <div className="truncate text-xs text-[var(--muted-fg)]">{b.primaryColor ? 'Brand color active' : '—'}</div>
                  </div>
                  {active && <Check className="ml-auto w-4 h-4 text-[var(--brand-600)]"/>}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="mt-6 flex justify-end">
        <button
          disabled={isGenerating || !selected.length}
          onClick={handleGenerate}
          className="inline-flex h-10 items-center rounded-[10px] px-4 bg-[var(--brand-600)] text-white disabled:opacity-60"
        >
          {isGenerating ? 'Generating…' : 'Generate Media Pack'}
        </button>
      </div>
    </div>
  )
}
