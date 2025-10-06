'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MediaPackData } from '@/lib/mediaPack/types'
import { createDemoMediaPackData } from '@/lib/mediaPack/demoData'
import MPClassic from '@/components/media-pack/templates/MPClassic'
import MPBold from '@/components/media-pack/templates/MPBold'
import MPEditorial from '@/components/media-pack/templates/MPEditorial'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Sparkles, Download, ExternalLink, Check, Copy } from 'lucide-react'
import { isToolEnabled } from '@/lib/launch'
import { ComingSoon } from '@/components/ComingSoon'
import PageShell from '@/components/PageShell'
import { toast } from '@/hooks/useToast'

type Variant = 'classic' | 'bold' | 'editorial'

interface GeneratedPDF {
  brandId: string
  brandName: string
  fileId: string
  fileUrl: string
  cached: boolean
  error?: string
}

interface DemoBrand {
  id: string
  name: string
  domain?: string
  industry?: string
  description?: string
}

export default function MediaPackPreviewPage() {
  const enabled = isToolEnabled("pack")
  
  const [packData, setPackData] = useState<MediaPackData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [variant, setVariant] = useState<Variant>('classic')
  const [darkMode, setDarkMode] = useState(false)
  const [brandColor, setBrandColor] = useState('#3b82f6')
  const [onePager, setOnePager] = useState(false)
  
  // New state for brand selection and PDF generation
  const [availableBrands, setAvailableBrands] = useState<DemoBrand[]>([])
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([])
  const [generatedPDFs, setGeneratedPDFs] = useState<GeneratedPDF[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Ref for capturing preview HTML
  const previewRef = useRef<HTMLDivElement>(null)


  const loadPackData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get base demo data
      const baseData = createDemoMediaPackData()
      
      // If brands are selected, use the first selected brand for preview
      let previewBrandData = baseData;
      if (selectedBrandIds.length > 0) {
        const firstBrandId = selectedBrandIds[0];
        const demoBrands = {
          'demo-1': { name: 'Nike', domain: 'nike.com', industry: 'Sports & Fitness' },
          'demo-2': { name: 'Apple', domain: 'apple.com', industry: 'Technology' },
          'demo-3': { name: 'Starbucks', domain: 'starbucks.com', industry: 'Food & Beverage' }
        };
        
        const selectedBrand = demoBrands[firstBrandId];
        if (selectedBrand) {
          // Create brand-specific preview data
          previewBrandData = {
            ...baseData,
            brandContext: {
              name: selectedBrand.name,
              domain: selectedBrand.domain
            }
          };
        }
      }
      
      // Merge theme settings
      const finalData = {
        ...previewBrandData,
        theme: {
          variant: variant,
          dark: darkMode,
          brandColor: brandColor,
          onePager: onePager
        }
      }
      
      console.log('Loaded pack data:', finalData)
      setPackData(finalData)
    } catch (err) {
      console.error('Failed to load pack data:', err)
      setError('Failed to load media pack data')
    } finally {
      setLoading(false)
    }
  }, [variant, darkMode, brandColor, onePager, selectedBrandIds])

  useEffect(() => {
    loadPackData()
    loadAvailableBrands()
  }, [loadPackData])
  
  if (!enabled) {
    return (
      <PageShell title="Media Pack Preview" subtitle="Preview and customize your media pack before sharing.">
        <div className="mx-auto max-w-md">
          <ComingSoon
            title="Media Pack Preview"
            subtitle="This tool will be enabled soon. The page is visible so you can navigate and preview the UI."
          />
        </div>
      </PageShell>
    )
  }

  const loadAvailableBrands = async () => {
    // For demo purposes, create some mock brands
    // In production, this would fetch from the database
    const mockBrands: DemoBrand[] = [
      { id: 'demo-1', name: 'Nike', domain: 'nike.com', industry: 'Sports & Fitness', description: 'Global sportswear leader' },
      { id: 'demo-2', name: 'Coca-Cola', domain: 'coca-cola.com', industry: 'Food & Beverage', description: 'World\'s most recognized beverage brand' },
      { id: 'demo-3', name: 'Apple', domain: 'apple.com', industry: 'Technology', description: 'Innovative technology company' },
      { id: 'demo-4', name: 'Tesla', domain: 'tesla.com', industry: 'Automotive', description: 'Electric vehicle and clean energy company' },
      { id: 'demo-5', name: 'Spotify', domain: 'spotify.com', industry: 'Music & Entertainment', description: 'Music streaming platform' },
      { id: 'demo-6', name: 'Airbnb', domain: 'airbnb.com', industry: 'Travel & Hospitality', description: 'Online marketplace for lodging' }
    ]
    setAvailableBrands(mockBrands)
  }

  const toggleBrandSelection = (brandId: string) => {
    console.log('Toggling brand selection for:', brandId);
    setSelectedBrandIds(prev => {
      const newSelection = prev.includes(brandId) 
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId];
      console.log('New brand selection:', newSelection);
      return newSelection;
    })
    
    // Reload pack data to update preview with selected brand
    loadPackData();
  }

  const generatePDFsForSelectedBrands = async () => {
    console.log('=== generatePDFsForSelectedBrands CALLED ===');
    console.log('selectedBrandIds:', selectedBrandIds);
    console.log('packData:', packData);
    
    if (selectedBrandIds.length === 0) {
      console.log('No brands selected, showing error');
      toast.error('Please select at least one brand')
      return
    }

    if (!packData) {
      console.log('No pack data, showing error');
      toast.error('No media pack data available')
      return
    }

    console.log('Starting PDF generation...');
    setIsGenerating(true)
    setGeneratedPDFs([])

    try {
      const finalData = {
        ...packData,
        theme: {
          variant: variant || "classic",
          dark: !!darkMode,
          brandColor: brandColor,
          onePager: !!onePager
        }
      }

      console.log('=== CALLING PDF GENERATION API ===');
      console.log('Selected brand IDs:', selectedBrandIds);
      console.log('Final data:', finalData);
      
      const res = await fetch('/api/media-pack/generate-with-pdfshift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: 'demo-workspace', // In production, get from auth context
          selectedBrandIds,
          packData: finalData,
          theme: finalData.theme,
          variant: variant || 'classic'
        })
      })
      
      console.log('API response status:', res.status);
      console.log('API response ok:', res.ok);

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to generate PDFs')
      }

      const result = await res.json()
      console.log('API response result:', result);
      setGeneratedPDFs(result.results)
      
      if (result.totalGenerated > 0) {
        toast.success(`Generated ${result.totalGenerated} PDF(s) successfully!`)
      }
      
      if (result.totalErrors > 0) {
        toast.error(`${result.totalErrors} PDF(s) failed to generate`)
      }

    } catch (err: unknown) {
      console.error('PDF generation failed:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      toast.error(`Generation failed: ${errorMessage}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard!`)
    } catch (err) {
      console.error('Failed to copy:', err)
      toast.error('Failed to copy to clipboard')
    }
  }

  const openPDF = (fileUrl: string) => {
    window.open(fileUrl, '_blank', 'noopener,noreferrer')
  }

  const downloadPDF = async (fileUrl: string, brandName: string) => {
    try {
      const response = await fetch(fileUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `media-pack-${brandName.toLowerCase().replace(/\s+/g, '-')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF downloaded!')
    } catch (err) {
      console.error('Download failed:', err)
      toast.error('Download failed')
    }
  }





  const renderTemplate = () => {
    if (!packData) return (
      <div className="p-8 text-center text-[var(--muted-fg)]">
        <p>Loading media pack data...</p>
      </div>
    )

    const templateProps = {
      data: {
        ...packData,
        theme: {
          variant,
          dark: darkMode,
          brandColor,
          onePager
        }
      },
      isPublic: false
    }

    console.log('Rendering template with props:', templateProps)



    switch (variant) {
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
      <PageShell title="Media Pack Preview" subtitle="Preview and customize your media pack before sharing.">
        <div className="card p-8 text-center text-[var(--muted-fg)]">
          <div className="w-8 h-8 mx-auto mb-3 border-4 border-[var(--brand-600)] border-t-transparent rounded-full animate-spin"/>
          Loading media pack data…
        </div>
      </PageShell>
    )
  }

  if (error) {
    return (
      <PageShell title="Media Pack Preview" subtitle="Preview and customize your media pack before sharing.">
        <div className="card p-4 border-[var(--error)] bg-[var(--tint-error)] text-[var(--error)] text-sm">
          {error}
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell title="Media Pack Preview" subtitle="Preview and customize your media pack before sharing.">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
          </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-[var(--muted-fg)]">
          <Sparkles className="w-4 h-4"/> AI-enhanced content
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Left Rail - Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Variant Selector */}
          <Card className="p-4">
            <h3 className="font-medium text-[var(--fg)] mb-3">Template</h3>
            <div className="space-y-2">
              {(['classic', 'bold', 'editorial'] as Variant[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setVariant(v)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    variant === v
                      ? 'bg-[var(--brand-600)] text-white'
                      : 'bg-[var(--surface)] text-[var(--fg)] hover:bg-[var(--border)]'
                  }`}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </Card>

          {/* Theme Controls */}
          <Card className="p-4">
            <h3 className="font-medium text-[var(--fg)] mb-3">Theme</h3>
            <div className="space-y-4">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--fg)]">Dark Mode</span>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    darkMode ? 'bg-[var(--brand-600)]' : 'bg-[var(--border)]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* One-Pager Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--fg)]">One-Pager Mode</span>
                <button
                  onClick={() => setOnePager(!onePager)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    onePager ? 'bg-[var(--brand-600)]' : 'bg-[var(--border)]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      onePager ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

               {/* Brand Color */}
               <div>
                 <label htmlFor="brand-color" className="block text-sm text-[var(--fg)] mb-2">Brand Color</label>
                 <div className="flex items-center gap-2">
                   <input
                     id="brand-color"
                     type="color"
                     value={brandColor}
                     onChange={(e) => setBrandColor(e.target.value)}
                     className="w-8 h-8 rounded border border-[var(--border)] cursor-pointer"
                   />
                   <input
                     type="text"
                     value={brandColor}
                     onChange={(e) => setBrandColor(e.target.value)}
                     className="px-2 py-1 text-sm border border-[var(--border)] rounded bg-[var(--surface)] text-[var(--fg)]"
                     style={{ flex: 1 }}
                   />
                 </div>
               </div>
            </div>
          </Card>

           {/* Brand Selection */}
           <Card className="p-4">
             <h3 className="font-medium text-[var(--fg)] mb-3">Select Brands</h3>
             <div className="space-y-2 max-h-48 overflow-y-auto">
               {availableBrands.map((brand) => (
                 <button
                   key={brand.id}
                   type="button"
                   className={`w-full p-2 rounded-lg cursor-pointer transition-colors text-left ${
                     selectedBrandIds.includes(brand.id)
                       ? 'bg-[var(--brand-600)] text-white'
                       : 'bg-[var(--surface)] text-[var(--fg)] hover:bg-[var(--border)]'
                   }`}
                   onClick={() => toggleBrandSelection(brand.id)}
                 >
                   <div className="flex items-center space-x-2">
                     <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                       selectedBrandIds.includes(brand.id)
                         ? 'border-white bg-white'
                         : 'border-[var(--muted-fg)]'
                     }`}>
                       {selectedBrandIds.includes(brand.id) && (
                         <Check className="w-3 h-3 text-[var(--brand-600)]" />
                       )}
                     </div>
                     <div className="min-w-0" style={{ flex: 1 }}>
                       <p className="text-sm font-medium truncate">{brand.name}</p>
                       <p className="text-xs opacity-75 truncate">
                         {brand.industry}
                       </p>
                     </div>
                   </div>
                 </button>
               ))}
             </div>
             <div className="mt-2 text-xs text-[var(--muted-fg)]">
               {selectedBrandIds.length} selected
             </div>
           </Card>

           {/* Actions */}
           <Card className="p-4">
             <h3 className="font-medium text-[var(--fg)] mb-3">Actions</h3>
             <div className="space-y-2">
               <Button
                 onClick={generatePDFsForSelectedBrands}
                 disabled={isGenerating || selectedBrandIds.length === 0 || !packData}
                 className="w-full justify-start"
                 variant="secondary"
                 title={selectedBrandIds.length === 0 ? 'Select brands first' : undefined}
               >
                 <Sparkles className="w-4 h-4 mr-2" />
                 {isGenerating ? 'Generating...' : 'Generate PDF'}
               </Button>
             </div>
           </Card>
        </div>

         {/* Right - Live Preview */}
         <div className="lg:col-span-3">
           <Card className="p-0 overflow-hidden">
             <div ref={previewRef} className="h-[800px] overflow-auto">
               {renderTemplate()}
             </div>
           </Card>
         </div>
       </div>

       {/* Generated PDFs Section */}
       {generatedPDFs.length > 0 && (
         <div className="mt-6">
           <Card className="p-6">
             <h3 className="text-lg font-semibold mb-4">Generated PDFs</h3>
             <div className="space-y-4">
               {generatedPDFs.map((pdf) => (
                 <div
                   key={pdf.brandId}
                   className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg"
                 >
                   <div style={{ flex: 1 }}>
                     <div className="flex items-center space-x-3">
                       <div className={`w-2 h-2 rounded-full ${
                         pdf.error ? 'bg-[var(--error)]' : 'bg-[var(--success)]'
                       }`}></div>
                       <div>
                         <p className="font-medium">{pdf.brandName}</p>
                         <p className="text-sm text-[var(--muted-fg)]">
                           {pdf.error ? 'Error' : pdf.cached ? 'Cached' : 'Generated'} • Ready to share
                         </p>
                       </div>
                     </div>
                   </div>
                   
                   {!pdf.error && (
                     <div className="flex items-center space-x-2">
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => openPDF(pdf.fileUrl)}
                         className="flex items-center space-x-1"
                       >
                         <ExternalLink className="w-4 h-4" />
                         <span>Open</span>
                       </Button>
                       
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => downloadPDF(pdf.fileUrl, pdf.brandName)}
                         className="flex items-center space-x-1"
                       >
                         <Download className="w-4 h-4" />
                         <span>Download</span>
                       </Button>
                       
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => copyToClipboard(pdf.fileUrl, 'PDF link')}
                         className="flex items-center space-x-1"
                       >
                         <Copy className="w-4 h-4" />
                         <span>Copy Link</span>
                       </Button>
                     </div>
                   )}
                   
                   {pdf.error && (
                     <div className="text-sm text-[var(--error)]">
                       {pdf.error}
                     </div>
                   )}
                 </div>
               ))}
             </div>
           </Card>
         </div>
       )}
      </div>
    </PageShell>
  )
}