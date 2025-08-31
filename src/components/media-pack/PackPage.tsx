'use client'
import useMediaPack from './useMediaPack'
import Builder from './Builder'
import Preview from './Preview'
import History from './History'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Sparkles } from 'lucide-react'

export default function PackPage(){
  const { loading, error, approvedBrands, isGenerating, current, history, generate } = useMediaPack()

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Tools', href: '/tools' },
        { label: 'Media Pack' }
      ]} />
      
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Media Pack</h1>
          <p className="text-[var(--muted-fg)]">Turn your audit results and approved brands into a beautiful, share-ready deck.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-[var(--muted-fg)]">
          <Sparkles className="w-4 h-4"/> AI-enhanced content
        </div>
      </div>

      {error && <div className="card p-4 border-[var(--error)] bg-[var(--tint-error)] text-[var(--error)] text-sm">{error}</div>}
      {loading ? (
        <div className="card p-8 text-center text-[var(--muted-fg)]">
          <div className="w-8 h-8 mx-auto mb-3 border-4 border-[var(--brand-600)] border-t-transparent rounded-full animate-spin"/>
          Loading your approved brands…
        </div>
      ) : (
        <>
          <Builder brands={approvedBrands} onGenerate={generate} isGenerating={isGenerating}/>
          <Preview current={current}/>
          <History items={history}/>
        </>
      )}
    </div>
  )
}
