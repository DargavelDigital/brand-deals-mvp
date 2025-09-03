'use client'
import React, { useState, useEffect } from 'react'
import { FileText, Download, Clock, Eye, Wand2, Palette, Brush, Check, X, Moon, Sun, FileText as OnePage } from 'lucide-react'
import BrandLogo from '@/components/media/BrandLogo'
import MPClassic from '@/components/media-pack/templates/MPClassic'
import MPBold from '@/components/media-pack/templates/MPBold'
import MPEditorial from '@/components/media-pack/templates/MPEditorial'
import { MediaPackData } from '@/lib/mediaPack/types'
import { createDemoMediaPackData } from '@/lib/mediaPack/demoData'

interface StepPackEmbedProps {
  workspaceId: string
  onDirtyChange: (dirty: boolean) => void
  data: any
  setData: (data: any) => void
  goNext: () => void
}

const TEMPLATES = [
  { id:'default', name:'Default', blurb:'Clean, modern layout that looks great on any device.' },
  { id:'brand',   name:'Brand Accent', blurb:'Inject brand colors and logo accents for a tailored feel.' },
] as const

export default function StepPackEmbed({ 
  workspaceId, 
  onDirtyChange, 
  data, 
  setData, 
  goNext 
}: StepPackEmbedProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)
  const [approvedBrands, setApprovedBrands] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [current, setCurrent] = useState<any>(data?.mediaPack || null)
  const [hasGenerated, setHasGenerated] = useState(!!data?.hasGenerated)
  
  // Builder state
  const [template, setTemplate] = useState<'default'|'brand'>('default')
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [primaryColor, setPrimaryColor] = useState('#3b82f6')
  const [accentColor, setAccentColor] = useState('#111827')
  const [headline, setHeadline] = useState('Let\'s build something your audience will love')
  const [notes, setNotes] = useState('Open to sponsored posts, integrated videos, and affiliate partnerships.')
  
  // Preview state
  const [previewVariant, setPreviewVariant] = useState<'classic'|'bold'|'editorial'>('classic')
  const [showPreview, setShowPreview] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [onePager, setOnePager] = useState(false)

  // Load approved brands from wizard data
  useEffect(() => {
    const loadBrands = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get approved brands from wizard data
        const approvedIds = data?.approvedBrandIds || data?.['wizard.brands.selected'] || []
        
        if (!approvedIds.length) {
          // Mock brands for demo
          const mockBrands = [
            { id: 'demo-1', name: 'Nike', description: 'Global sportswear leader', industry: 'Sports & Fitness', primaryColor: '#000000', logo: 'nike.com' },
            { id: 'demo-2', name: 'Coca-Cola', description: 'World\'s most recognized beverage brand', industry: 'Food & Beverage', primaryColor: '#DC143C', logo: 'coca-cola.com' },
            { id: 'demo-3', name: 'Apple', description: 'Innovative technology company', industry: 'Technology', primaryColor: '#007AFF', logo: 'apple.com' }
          ]
          setApprovedBrands(mockBrands)
          setSelectedBrands(mockBrands.map(b => b.id))
        } else {
          // Try to get brand details from API
          try {
            const r = await fetch('/api/match/byIds', {
              method: 'POST', 
              headers: {'Content-Type': 'application/json'}, 
              body: JSON.stringify({ids: approvedIds})
            })
            if (r.ok) {
              const details = (await r.json())?.brands ?? []
              setApprovedBrands(details)
              setSelectedBrands(details.map((b: any) => b.id))
            }
          } catch (e) {
            // Fallback to mock data
            const mockBrands = approvedIds.map((id: string, i: number) => ({
              id, 
              name: `Brand ${i+1}`, 
              description: 'Brand description',
              logo: 'example.com'
            }))
            setApprovedBrands(mockBrands)
            setSelectedBrands(mockBrands.map(b => b.id))
          }
        }
      } catch (e: any) {
        setError(e.message ?? 'Failed to load brands')
      } finally {
        setLoading(false)
      }
    }
    
    loadBrands()
  }, [data])

  React.useEffect(() => {
    onDirtyChange(hasGenerated)
  }, [hasGenerated, onDirtyChange])

  const toggleBrand = (id: string) => setSelectedBrands(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id])

  const selected = approvedBrands.filter(b=>selectedBrands.includes(b.id))

  const generateMediaPack = async () => {
    setIsGenerating(true)
    setError(null)
    
    try {
      // Map the client format to the API format
      const variant = template === 'default' ? 'classic' : 'bold'
      const brandIds = selected.map(b => b.id)
      
      const res = await fetch('/api/media-pack/generate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          workspaceId: workspaceId || 'demo-workspace',
          variant,
          brandIds,
          theme: { primaryColor, accentColor, headline, notes } // Pass customizations as theme
        })
      })
      
      if (!res.ok) throw new Error('Generation failed')
      const { mediaPack } = await res.json()
      
      setCurrent(mediaPack)
      setHasGenerated(true)
      setData({ ...data, mediaPack, hasGenerated: true })
    } catch (e: any) {
      setError(e.message ?? 'Generation failed')
      console.error('Media pack generation failed:', e)
    } finally {
      setIsGenerating(false)
    }
  }

  // Use the same demo data as Tools version
  const [packData, setPackData] = useState<MediaPackData | null>(null)

  // Load demo data on component mount
  useEffect(() => {
    const loadDemoData = () => {
      const data = createDemoMediaPackData()
      // Merge theme settings
      const finalData = {
        ...data,
        theme: {
          variant: previewVariant,
          dark: darkMode,
          brandColor: primaryColor,
          onePager: onePager
        }
      }
      setPackData(finalData)
    }
    loadDemoData()
  }, [previewVariant, primaryColor, darkMode, onePager])

  const renderVariant = () => {
    if (!packData) return null

    const templateProps = {
      data: {
        ...packData,
        theme: {
          variant: previewVariant,
          dark: darkMode,
          brandColor: primaryColor,
          onePager: onePager
        }
      },
      isPublic: false
    }

    switch (previewVariant) {
      case 'classic':
        return <MPClassic {...templateProps} />
      case 'bold':
        return <MPBold {...templateProps} />
      case 'editorial':
        return <MPEditorial {...templateProps} />
      default:
        return <MPClassic {...templateProps} />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Step 6 — Create Media Pack</h2>
            <p className="text-muted-foreground text-sm">
              Generate a professional media pack with your brand information and contact details.
            </p>
          </div>
          <a 
            href="/tools/pack" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 underline ml-4 shrink-0"
          >
            Learn more →
          </a>
        </div>
        <div className="card p-8 text-center text-muted-foreground">
          <div className="w-8 h-8 mx-auto mb-3 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
          Loading your approved brands…
        </div>
      </div>
    )
  }

  if (!hasGenerated) {
      return (
    <div className="space-y-6">
      {/* Header Block */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Step 5 — Create Media Pack</h2>
            <p className="text-muted-foreground text-sm">
              Generate a professional media pack with your brand information and contact details.<br />
              Generate the media pack to proceed to outreach sequence creation.
            </p>
          </div>
          <a 
            href="/tools/pack" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 underline ml-4 shrink-0"
          >
            Learn more →
          </a>
        </div>

        {error && (
          <div className="card p-4 border-red-200 bg-red-50 text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Media Pack Builder */}
        <div className="card p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-lg font-semibold">Media Pack Builder</div>
              <div className="text-sm text-muted-foreground">Choose a template, tweak details, and generate a share-ready deck.</div>
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
                  className={`text-left rounded-[14px] border p-4 transition-all ${active ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600' : 'border-gray-200 bg-white'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gray-100"><Brush className="w-4 h-4"/></div>
                    <div className="min-w-0">
                      <div className="font-medium">{t.name}</div>
                      <div className="text-sm text-muted-foreground">{t.blurb}</div>
                    </div>
                    {active && <Check className="ml-auto text-blue-600 w-5 h-5"/>}
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
              <input value={headline} onChange={e=>setHeadline(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-white px-3"/>
              <label className="text-sm mt-3">Notes</label>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 min-h-[84px]"/>
            </div>
          </div>

          {/* Brand selection */}
          <div className="mt-6">
            <div className="text-sm font-medium mb-2">Brands in this deck</div>
            {approvedBrands.length === 0 ? (
              <div className="text-sm text-muted-foreground">No approved brands yet. Approve some brands first.</div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {approvedBrands.map(b => {
                  const active = selectedBrands.includes(b.id)
                  return (
                    <button key={b.id} type="button" onClick={()=>toggleBrand(b.id)}
                            className={`flex items-center gap-3 rounded-[12px] border p-3 text-left ${active ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                      <BrandLogo 
                        name={b.name}
                        domain={b.logo}
                        size={40}
                      />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{b.name}</div>
                        <div className="truncate text-xs text-muted-foreground">{b.primaryColor ? 'Brand color active' : '—'}</div>
                      </div>
                      {active && <Check className="ml-auto w-4 h-4 text-blue-600"/>}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Preview and Generate */}
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800"
            >
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </button>
            <button
              disabled={isGenerating || !selected.length}
              onClick={generateMediaPack}
              className="inline-flex h-10 items-center rounded-[10px] px-4 bg-blue-600 text-white disabled:opacity-60"
            >
              {isGenerating ? 'Generating…' : 'Generate Media Pack'}
            </button>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <div>
                    <h2 className="text-xl font-semibold">Media Pack Preview</h2>
                    <p className="text-sm text-muted-foreground">Live preview of your media pack</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-1 p-1 bg-gray-100 rounded-lg border border-gray-200">
                    {(['classic', 'bold', 'editorial'] as const).map((v) => (
                      <button
                        key={v}
                        onClick={() => setPreviewVariant(v)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          previewVariant === v 
                            ? 'bg-blue-600 text-white' 
                            : 'text-muted-foreground hover:text-gray-900'
                        }`}
                      >
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                      </button>
                    ))}
                  </div>
                  
                  {/* Theme Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                      {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </button>
                    
                    <button
                      onClick={() => setOnePager(!onePager)}
                      className={`p-2 rounded-lg transition-colors ${
                        onePager ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={onePager ? 'Switch to multi-page' : 'Switch to one-page'}
                    >
                      <OnePage className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="bg-white text-gray-900 rounded-lg border border-gray-200 overflow-hidden">
                  <div className="max-w-[960px] mx-auto">
                    {renderVariant()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Block */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Step 5 — Create Media Pack</h2>
          <p className="text-muted-foreground text-sm">
            Your professional media pack has been generated successfully.<br />
            Media pack is ready to proceed to outreach sequence creation.
          </p>
        </div>
        <a 
          href="/tools/pack" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 underline ml-4 shrink-0"
        >
          Learn more →
        </a>
      </div>

      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800 text-sm">
          ✓ Media pack ready for download
        </p>
      </div>

      {/* Media Pack Preview */}
      <div className="card p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Preview</div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg border border-gray-200">
              {(['classic', 'bold', 'editorial'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setPreviewVariant(v)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    previewVariant === v 
                      ? 'bg-blue-600 text-white' 
                      : 'text-muted-foreground hover:text-gray-900'
                  }`}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Theme Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              
              <button
                onClick={() => setOnePager(!onePager)}
                className={`p-2 rounded-lg transition-colors ${
                  onePager ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={onePager ? 'Switch to multi-page' : 'Switch to one-page'}
              >
                <OnePage className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white text-gray-900 rounded-lg border border-gray-200 overflow-hidden">
          <div className="max-w-[960px] mx-auto">
            {renderVariant()}
          </div>
        </div>
        
        {current && (
          <div className="flex gap-3 mt-4">
            {current.pdfUrl && (
              <a className="inline-flex h-10 items-center gap-2 rounded-[10px] px-4 border border-gray-200 bg-white hover:bg-gray-50"
                 href={current.pdfUrl} target="_blank" rel="noreferrer">
                <Download className="w-4 h-4" />
                Download PDF
              </a>
            )}
            {current.htmlUrl && (
              <a className="inline-flex h-10 items-center gap-2 rounded-[10px] px-4 bg-blue-600 text-white hover:bg-blue-700"
                 href={current.htmlUrl} target="_blank" rel="noreferrer">
                <Eye className="w-4 h-4" />
                Open Web Version
              </a>
            )}
            {!current.pdfUrl && !current.htmlUrl && (
              <a className="inline-flex h-10 items-center gap-2 rounded-[10px] px-4 border border-gray-200 bg-white hover:bg-gray-50"
                 href={`/api/media-pack/download/${current.id || 'pack_123'}?variant=${previewVariant}`} target="_blank" rel="noreferrer">
                <Download className="w-4 h-4" />
                Download PDF
              </a>
            )}
          </div>
        )}
      </div>

      <div className="text-center pt-4">
        <button
          onClick={goNext}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Outreach Sequence
        </button>
      </div>
    </div>
  )
}
/* Force recompilation */
/* Force recompilation */
