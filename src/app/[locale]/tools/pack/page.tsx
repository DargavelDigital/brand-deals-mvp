'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MediaPackData } from '@/lib/mediaPack/types'
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
import { WorkflowProgress } from '@/components/ui/WorkflowProgress'

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
  const router = useRouter()
  const enabled = isToolEnabled("pack")
  
  const [packData, setPackData] = useState<MediaPackData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [variant, setVariant] = useState<Variant>('classic')
  const [darkMode] = useState(false) // Always false, no dark mode
  const [brandColor, setBrandColor] = useState('#3b82f6')
  const [onePager, setOnePager] = useState(false)
  
  // New state for approved brands from BrandRun
  const [approvedBrands, setApprovedBrands] = useState<any[]>([])
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([])
  const [generatedPDFs, setGeneratedPDFs] = useState<GeneratedPDF[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Ref for capturing preview HTML
  const previewRef = useRef<HTMLDivElement>(null)

  // Load approved brands from BrandRun
  useEffect(() => {
    const loadApprovedBrands = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('📦 Step 1: Loading approved brands for media pack...')
        
        // Get current brand run (NO workspaceId - backend gets from session!)
        const runRes = await fetch('/api/brand-run/current')
        console.log('📦 Step 2: API response status:', runRes.status, runRes.ok)
        
        if (!runRes.ok) {
          console.error('❌ Failed to fetch brand run:', runRes.status, runRes.statusText)
          throw new Error('Failed to load brand run')
        }
        
        const runData = await runRes.json()
        console.log('📦 Step 3: Full run data:', JSON.stringify(runData, null, 2))
        console.log('📦 Step 4: runData keys:', Object.keys(runData))
        console.log('📦 Step 5: runData.data:', runData.data)
        console.log('📦 Step 6: runData.selectedBrandIds:', runData.selectedBrandIds)
        console.log('📦 Step 7: runData.data?.selectedBrandIds:', runData.data?.selectedBrandIds)
        
        const selectedIds = runData.data?.selectedBrandIds || runData.selectedBrandIds || []
        console.log('📦 Step 8: Parsed selectedBrandIds array:', selectedIds)
        console.log('📦 Step 9: Array length:', selectedIds.length)
        console.log('📦 Step 10: Array type:', typeof selectedIds, Array.isArray(selectedIds))
        
        // Check if we have full brand data in runSummaryJson
        const brandsFromSummary = runData.data?.runSummaryJson?.brands || runData.runSummaryJson?.brands || []
        console.log('📦 Step 11: Brands from runSummaryJson:', brandsFromSummary.length)
        
        if (brandsFromSummary.length > 0) {
          // Use saved brand data (faster, no need to re-fetch)
          console.log('✅ Using saved brand data from runSummaryJson')
          setApprovedBrands(brandsFromSummary)
          setSelectedBrandIds(brandsFromSummary.map((b: any) => b.id))
          setLoading(false)
          return
        }
        
        if (selectedIds.length === 0) {
          console.warn('⚠️ No approved brands found. User should go back to matches.')
          setApprovedBrands([])
          setLoading(false)
          return
        }
        
        // Fallback: Fetch brand data by re-running match search
        console.log('📦 Step 12: No saved brand data, re-fetching...')
        const matchRes = await fetch('/api/match/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // workspaceId: REMOVED - backend gets from session
            includeLocal: true,
            limit: 100
          })
        })
        
        if (matchRes.ok) {
          const matchData = await matchRes.json()
          const brands = (matchData.matches || []).filter((b: any) => 
            selectedIds.includes(b.id)
          )
          console.log('📦 Loaded approved brands:', brands.length)
          setApprovedBrands(brands)
          // Default select all approved brands for media pack
          setSelectedBrandIds(brands.map((b: any) => b.id))
        } else {
          console.warn('⚠️ Failed to fetch brands')
          setApprovedBrands([])
        }
        
      } catch (e: any) {
        console.error('❌ Failed to load approved brands:', e)
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    
    loadApprovedBrands()
  }, [])


  const loadPackData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('📦 Loading complete media pack data (audit + brands + contacts)...')
      
      // Load latest audit for creator profile data
      let creatorData: any = null
      let auditData: any = null
      let statsData: any = null
      
      try {
        const auditRes = await fetch('/api/audit/latest')
        if (auditRes.ok) {
          const auditResponse = await auditRes.json()
          const audit = auditResponse.audit
          
          if (audit) {
            console.log('✅ Loaded audit data')
            
            // Extract creator profile
            const snapshot = audit.snapshotJson || {}
            const insights = audit.insightsJson || {}
            
            creatorData = {
              name: snapshot.socialSnapshot?.instagram?.username || snapshot.creator?.name || 'Creator',
              handle: snapshot.socialSnapshot?.instagram?.username || '',
              followers: snapshot.socialSnapshot?.instagram?.followers || 0,
              engagement: snapshot.socialSnapshot?.instagram?.engagement || 0,
              bio: snapshot.socialSnapshot?.instagram?.bio || '',
              niche: insights.niche || snapshot.niche || '',
              location: snapshot.creator?.location || '',
              // Add array fields with defaults to prevent template crashes
              recentPosts: snapshot.socialSnapshot?.instagram?.posts || [],
              topPosts: snapshot.socialSnapshot?.instagram?.topPosts || [],
              contentPillars: insights.contentPillars || [],
              niches: insights.niches || []
            }
            
            // Extract audit insights
            auditData = {
              stage: insights.stage || '',
              strengths: insights.strengthAreas || [],
              insights: insights.keyInsights || [],
              // Add array fields with defaults
              recommendations: insights.recommendations || [],
              nextSteps: insights.nextSteps || [],
              opportunities: insights.opportunities || []
            }
            
            // Extract social stats
            statsData = {
              followers: snapshot.socialSnapshot?.instagram?.followers || 0,
              avgLikes: snapshot.socialSnapshot?.instagram?.avgLikes || 0,
              avgComments: snapshot.socialSnapshot?.instagram?.avgComments || 0,
              engagement: snapshot.socialSnapshot?.instagram?.engagement || 0,
              posts: snapshot.socialSnapshot?.instagram?.posts?.length || 0,
              // Add array fields with defaults to prevent template crashes
              topPosts: snapshot.socialSnapshot?.instagram?.topPosts || [],
              recentPosts: snapshot.socialSnapshot?.instagram?.posts || [],
              demographics: snapshot.socialSnapshot?.instagram?.demographics || [],
              ageRanges: snapshot.socialSnapshot?.instagram?.ageRanges || [],
              locations: snapshot.socialSnapshot?.instagram?.locations || []
            }
          }
        }
      } catch (auditError) {
        console.warn('⚠️ Could not load audit data:', auditError)
        // Continue without audit data - use defaults
      }
      
      // Use selected brand data for preview
      let previewBrandData: any = null;
      if (selectedBrandIds.length > 0 && approvedBrands.length > 0) {
        const firstBrandId = selectedBrandIds[0];
        const selectedBrand = approvedBrands.find(b => b.id === firstBrandId);
        
        if (selectedBrand) {
          // Create brand-specific preview data
          previewBrandData = {
            brandContext: {
              name: selectedBrand.name,
              domain: selectedBrand.domain || selectedBrand.name
            }
          };
        }
      }
      
      // Merge all data together
      const finalData = {
        ...previewBrandData,
        // Add creator profile (with all array defaults)
        creator: creatorData || {
          name: 'Creator',
          handle: '',
          followers: 0,
          engagement: 0,
          bio: '',
          niche: '',
          location: '',
          recentPosts: [],
          topPosts: [],
          contentPillars: [],
          niches: []
        },
        // Add audit data (with all array defaults)
        audit: auditData || {
          stage: '',
          strengths: [],
          insights: [],
          recommendations: [],
          nextSteps: [],
          opportunities: []
        },
        // Add stats (with all array defaults)
        stats: statsData || {
          followers: 0,
          avgLikes: 0,
          avgComments: 0,
          engagement: 0,
          posts: 0,
          topPosts: [],
          recentPosts: [],
          demographics: [],
          ageRanges: [],
          locations: []
        },
        // Add theme settings
        theme: {
          variant: variant,
          dark: darkMode,
          brandColor: brandColor,
          onePager: onePager
        }
      };
      
      console.log('✅ Complete pack data loaded:', {
        hasCreator: !!finalData.creator,
        hasAudit: !!finalData.audit,
        hasStats: !!finalData.stats,
        hasBrand: !!finalData.brandContext
      })
      setPackData(finalData)
    } catch (err) {
      console.error('Failed to load pack data:', err)
      setError('Failed to load media pack data')
    } finally {
      setLoading(false)
    }
  }, [variant, darkMode, brandColor, onePager, selectedBrandIds, approvedBrands])

  useEffect(() => {
    loadPackData()
  }, [loadPackData])
  
  if (!enabled) {
    return (
      <PageShell title="Media Pack Preview" subtitle="Preview and customize your media pack before sharing.">
        {/* NEW: Workflow progress indicator */}
        <WorkflowProgress 
          currentStep={4} 
          steps={['Connect', 'Audit', 'Matches', 'Contacts', 'Pack', 'Outreach']}
        />
        
        <div className="mx-auto max-w-md">
          <ComingSoon
            title="Media Pack Preview"
            subtitle="This tool will be enabled soon. The page is visible so you can navigate and preview the UI."
          />
        </div>
      </PageShell>
    )
  }

  // availableBrands removed - now using approvedBrands from BrandRun

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

      // Get workspace ID for PDF generation
      console.log('=== CALLING PDF GENERATION API ===');
      console.log('Selected brand IDs:', selectedBrandIds);
      console.log('Approved brands count:', approvedBrands.length);
      console.log('Final data:', finalData);
      
        const res = await fetch('/api/media-pack/generate-with-pdfshift', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // workspaceId: REMOVED - backend gets from session
            selectedBrandIds,
            packData: finalData,
            theme: finalData.theme,
            variant: variant || 'classic',
            force: true // Force regeneration to bypass cache
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
        {/* NEW: Workflow progress indicator */}
        <WorkflowProgress 
          currentStep={4} 
          steps={['Connect', 'Audit', 'Matches', 'Contacts', 'Pack', 'Outreach']}
        />
        
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
        {/* NEW: Workflow progress indicator */}
        <WorkflowProgress 
          currentStep={4} 
          steps={['Connect', 'Audit', 'Matches', 'Contacts', 'Pack', 'Outreach']}
        />
        
        <div className="card p-4 border-[var(--error)] bg-[var(--tint-error)] text-[var(--error)] text-sm">
          {error}
        </div>
      </PageShell>
    )
  }

  // Empty state - no approved brands
  if (!loading && approvedBrands.length === 0) {
    return (
      <PageShell title="Media Pack Preview" subtitle="Preview and customize your media pack before sharing.">
        {/* NEW: Workflow progress indicator */}
        <WorkflowProgress 
          currentStep={4} 
          steps={['Connect', 'Audit', 'Matches', 'Contacts', 'Pack', 'Outreach']}
        />
        
        <Card className="p-8 text-center max-w-2xl mx-auto">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold mb-4">No Approved Brands</h2>
          <p className="text-[var(--muted-fg)] mb-6">
            You need to approve at least one brand before creating a media pack.
          </p>
          <Button onClick={() => window.location.href = '/tools/matches'}>
            ← Go Back to Brand Matches
          </Button>
        </Card>
      </PageShell>
    )
  }

  return (
    <PageShell title="Media Pack Preview" subtitle="Preview and customize your media pack before sharing.">
      {/* NEW: Workflow progress indicator */}
      <WorkflowProgress 
        currentStep={4} 
        steps={['Connect', 'Audit', 'Matches', 'Contacts', 'Pack', 'Outreach']}
      />
      
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
              <div className="hidden">
                <span className="text-sm text-[var(--fg)]">Dark Mode</span>
                <button
                  onClick={() => {}} // Disabled - no dark mode
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
             <h3 className="font-medium text-[var(--fg)] mb-3">
               Select Brands for Media Pack ({approvedBrands.length} approved)
             </h3>
             <div className="space-y-2 max-h-48 overflow-y-auto">
               {approvedBrands.map((brand) => (
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
                        variant="secondary"
                        size="sm"
                        onClick={() => openPDF(pdf.fileUrl)}
                        className="flex items-center space-x-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Open</span>
                      </Button>
                      
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => downloadPDF(pdf.fileUrl, pdf.brandName)}
                        className="flex items-center space-x-1"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </Button>
                      
                      <Button
                        variant="secondary"
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

      {/* NEW: Continue button - show after PDFs generated or skip */}
      {enabled && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => router.push('/tools/outreach')}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[var(--ds-success)] to-[var(--ds-success-hover)] text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition-all duration-200"
          >
            Continue to Outreach
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      )}
    </PageShell>
  )
}