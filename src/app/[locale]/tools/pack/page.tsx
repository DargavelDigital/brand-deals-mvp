'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { MediaPackData } from '@/lib/mediaPack/types'
import MPProfessional from '@/components/media-pack/templates/MPProfessional'
import MPLuxury from '@/components/media-pack/templates/MPLuxury'
import MPMinimal from '@/components/media-pack/templates/MPMinimal'
import MPEnergetic from '@/components/media-pack/templates/MPEnergetic'
import MPModernTech from '@/components/media-pack/templates/MPModernTech'
import MPCreative from '@/components/media-pack/templates/MPCreative'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Sparkles, Download, ExternalLink, Check, Copy } from 'lucide-react'
import { isToolEnabled } from '@/lib/launch'
import { ComingSoon } from '@/components/ComingSoon'
import PageShell from '@/components/PageShell'
import { toast } from '@/hooks/useToast'
import { WorkflowProgress } from '@/components/ui/WorkflowProgress'
import { generateAndUploadMediaPackPDF } from '@/lib/generateMediaPackPDF'

type Variant = 'professional' | 'luxury' | 'minimal' | 'creative' | 'energetic' | 'moderntech'

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
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] || 'en' // Extract locale from path
  const enabled = isToolEnabled("pack")
  
  const [packData, setPackData] = useState<MediaPackData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [variant, setVariant] = useState<Variant>('professional')
  const [darkMode] = useState(false) // Always false, no dark mode
  const [brandColor, setBrandColor] = useState('#3b82f6')
  const [onePager, setOnePager] = useState(false)
  
  // New state for approved brands from BrandRun
  const [approvedBrands, setApprovedBrands] = useState<any[]>([])
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([])
  const [generatedPDFs, setGeneratedPDFs] = useState<GeneratedPDF[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null) // Store workspace ID from brandRun
  
  // Share dialog state
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [currentShareLink, setCurrentShareLink] = useState('')
  
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
        
        // Extract and store workspace ID for PDF generation
        const wsId = runData.data?.workspaceId || runData.workspaceId
        console.log('📦 Step 7.5: Extracted workspaceId:', wsId)
        setWorkspaceId(wsId)
        
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
      let snapshot: any = null // Declare at higher scope so it's available for finalData
      
      try {
        const auditRes = await fetch('/api/audit/latest')
        if (auditRes.ok) {
          const auditResponse = await auditRes.json()
          const audit = auditResponse.audit
          
          if (audit) {
            console.log('✅ Loaded audit data')
            console.log('📦 Raw audit structure:', JSON.stringify(audit, null, 2))
            
            // Extract creator profile
            snapshot = audit.snapshotJson || {}
            const insights = audit.insightsJson || {}
            
            console.log('📦 Snapshot keys:', Object.keys(snapshot))
            console.log('📦 Insights keys:', Object.keys(insights))
            console.log('📦 socialSnapshot:', snapshot.socialSnapshot)
            console.log('📦 Instagram data:', snapshot.socialSnapshot?.instagram)
            console.log('📦 Demographics from brandFit:', snapshot.brandFit?.audienceDemographics)
            console.log('📦 Demographics raw:', snapshot.demographics)
            
            // Get the creator name properly from audit data
            const creatorName = 
              snapshot?.creatorProfile?.name || 
              snapshot?.creatorProfile?.primaryNiche + ' Creator' || 
              'Professional Creator'
            
            const username = creatorName.toLowerCase().replace(/\s+/g, '_')
            
            creatorData = {
              name: creatorName,
              handle: `@${username}`,
              username: username,
              followers: snapshot?.audience?.totalFollowers || 0,
              engagement: (snapshot?.audience?.avgEngagement * 100) || 0, // Convert to percentage
              bio: snapshot?.creatorProfile?.uniqueValue || snapshot?.creatorProfile?.bio || '',
              niche: snapshot?.creatorProfile?.primaryNiche || insights.niche || '',
              location: snapshot?.creatorProfile?.location || '',
              contentStyle: snapshot?.creatorProfile?.contentStyle || '',
              // Add array fields with defaults to prevent template crashes
              recentPosts: snapshot?.socialSnapshot?.instagram?.posts || [],
              topPosts: snapshot?.socialSnapshot?.instagram?.topPosts || [],
              contentPillars: insights.contentPillars || insights.themes || [],
              niches: insights.niches || []
            }
            
            console.log('📦 Mapped creator data:', creatorData)
            
            // Extract audit insights
            auditData = {
              stage: snapshot?.stageInfo?.label || insights.stage || '',
              stageMessage: snapshot?.stageMessage || '',
              strengths: snapshot?.strengthAreas || insights.strengthAreas || [],
              insights: snapshot?.insights || insights.keyInsights || [],
              // Add array fields with defaults
              recommendations: insights.recommendations || [],
              nextSteps: insights.nextSteps || [],
              opportunities: insights.opportunities || []
            }
            
            console.log('📦 Mapped audit data:', auditData)
            
            // Extract social stats from audit
            statsData = {
              followers: snapshot?.audience?.totalFollowers || 0,
              avgLikes: snapshot?.audience?.avgLikes || 0,
              avgComments: snapshot?.audience?.avgComments || 0,
              avgShares: snapshot?.audience?.avgShares || 0,
              engagement: (snapshot?.audience?.avgEngagement * 100) || 0, // Convert to percentage
              reachRate: snapshot?.audience?.reachRate || 0,
              posts: snapshot?.socialSnapshot?.instagram?.posts?.length || 0,
              // Add array fields with defaults to prevent template crashes
              topPosts: snapshot?.socialSnapshot?.instagram?.topPosts || [],
              recentPosts: snapshot?.socialSnapshot?.instagram?.posts || [],
              demographics: snapshot?.brandFit?.audienceDemographics || [],
              ageRanges: snapshot?.brandFit?.audienceDemographics?.primaryAgeRange || [],
              locations: snapshot?.brandFit?.audienceDemographics?.topGeoMarkets || []
            }
            
            console.log('📦 Mapped stats data:', statsData)
          }
        }
      } catch (auditError) {
        console.warn('⚠️ Could not load audit data:', auditError)
        console.error('⚠️ Error details:', auditError)
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
      
      // Merge all data together - MUST match MediaPackData type!
      const finalData = {
        packId: 'preview',
        workspaceId: 'preview',
        ...previewBrandData,
        
        // Creator (match MediaPackData structure) - USE REAL AUDIT DATA
        creator: {
          name: creatorData?.name || 'Professional Creator',
          tagline: creatorData?.bio || creatorData?.contentStyle || 'Professional content creator',
          headshotUrl: undefined,
          logoUrl: undefined,
          niche: creatorData?.niche ? [creatorData.niche] : []
        },
        
        // Socials - REQUIRED! Template expects array - USE REAL AUDIT DATA
        socials: [
          {
            platform: 'instagram' as const,
            followers: statsData?.followers || 0, // Real follower count from audit
            avgViews: undefined,
            engagementRate: statsData?.engagement ? statsData.engagement / 100 : 0, // Real engagement from audit
            growth30d: undefined
          }
        ],
        
        // Audience - REQUIRED! - USE REAL AUDIT DATA
        // Transform audit data into AudienceSlice format { label: string, value: number }
        audience: {
          // Transform age range into chart format
          age: snapshot?.brandFit?.audienceDemographics?.primaryAgeRange 
            ? [{ label: snapshot.brandFit.audienceDemographics.primaryAgeRange, value: 1.0 }]
            : [],
          
          // Transform gender into chart format
          gender: snapshot?.brandFit?.audienceDemographics?.genderSkew === 'Balanced'
            ? [
                { label: 'Male', value: 0.5 },
                { label: 'Female', value: 0.5 }
              ]
            : snapshot?.brandFit?.audienceDemographics?.genderSkew === 'Male-skewed'
            ? [
                { label: 'Male', value: 0.65 },
                { label: 'Female', value: 0.35 }
              ]
            : snapshot?.brandFit?.audienceDemographics?.genderSkew === 'Female-skewed'
            ? [
                { label: 'Female', value: 0.65 },
                { label: 'Male', value: 0.35 }
              ]
            : [],
          
          // Transform locations into chart format (distribute evenly for now)
          geo: (snapshot?.brandFit?.audienceDemographics?.topGeoMarkets || []).map((market: string, index: number, arr: string[]) => ({
            label: market,
            value: index === 0 ? 0.5 : (0.5 / (arr.length - 1)) // First market gets 50%, rest split remaining
          })),
          
          interests: creatorData?.contentPillars || [] // Content pillars as strings array
        },
        
        // Stats - FOR MPROFESSIONAL TEMPLATE - USE REAL AUDIT DATA
        stats: {
          followers: statsData?.followers || 0,
          engagement: statsData?.engagement || 0, // Already converted to percentage
          avgLikes: statsData?.avgLikes || 0,
          avgComments: statsData?.avgComments || 0,
          reachRate: statsData?.reachRate || 0
        },
        
        // Brand Fit - FOR MPROFESSIONAL TEMPLATE - USE REAL AUDIT DATA
        brandFit: {
          idealIndustries: snapshot?.brandFit?.idealIndustries || [],
          brandTypes: snapshot?.brandFit?.brandTypes || [],
          estimatedCPM: snapshot?.brandFit?.estimatedCPM || '',
          readiness: snapshot?.brandFit?.partnershipReadiness || ''
        },
        
        // Brands - FROM APPROVED BRANDS
        brands: approvedBrands || [],
        
        // Contacts - FROM BRAND RUN
        contacts: [], // TODO: Load from brand run contacts
        
        // Content pillars - USE REAL AUDIT DATA
        contentPillars: creatorData?.contentPillars || [],
        
        // Content themes - USE REAL AUDIT DATA
        contentThemes: snapshot?.contentSignals || 
                       snapshot?.socialSnapshot?.derived?.contentThemes || 
                       creatorData?.contentPillars || 
                       [],
        
        // Case studies
        caseStudies: [],
        
        // Services
        services: [],
        
        // Contact - REQUIRED!
        contact: {
          email: 'contact@example.com',
          phone: undefined,
          website: undefined,
          socials: []
        },
        
        // AI - REQUIRED! - USE REAL AUDIT DATA
        ai: {
          elevatorPitch: auditData?.insights?.[0] || auditData?.stageMessage || 'Professional content creator',
          whyThisBrand: undefined,
          highlights: auditData?.strengths || []
        },
        
        // Theme settings
        theme: {
          variant: variant as any,
          dark: darkMode,
          brandColor: brandColor,
          onePager: onePager
        }
      };
      
      console.log('✅ Complete pack data loaded:', {
        hasCreator: !!finalData.creator,
        hasSocials: !!finalData.socials && finalData.socials.length > 0,
        hasAudience: !!finalData.audience,
        hasContact: !!finalData.contact,
        hasAI: !!finalData.ai,
        hasBrand: !!finalData.brandContext
      })
      
      console.log('📦 DETAILED pack data being sent to template:', {
        creatorName: finalData.creator?.name,
        creatorTagline: finalData.creator?.tagline,
        creatorNiche: finalData.creator?.niche,
        socialsCount: finalData.socials?.length,
        followers: finalData.socials?.[0]?.followers,
        engagement: finalData.socials?.[0]?.engagementRate,
        elevatorPitch: finalData.ai?.elevatorPitch,
        highlights: finalData.ai?.highlights,
        contentPillars: finalData.contentPillars,
        brandContext: finalData.brandContext
      })
      
      console.log('📦 FULL creator data:', JSON.stringify(finalData.creator, null, 2));
      console.log('📦 FULL audience data:', JSON.stringify(finalData.audience, null, 2));
      console.log('📦 FULL socials data:', JSON.stringify(finalData.socials, null, 2));
      console.log('📦 FULL stats data:', JSON.stringify(finalData.stats, null, 2));
      console.log('📦 FULL brandFit data:', JSON.stringify(finalData.brandFit, null, 2));
      console.log('📦 Raw audit snapshot demographics:', JSON.stringify(snapshot?.brandFit?.audienceDemographics, null, 2));
      console.log('📦 Raw audit snapshot demographics (raw):', JSON.stringify(snapshot?.demographics, null, 2));
      
      console.log('📦 ✨ COMPLETE packData for template:', JSON.stringify(finalData, null, 2))
      
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
    console.log('=== generatePDFsForSelectedBrands CALLED (Browser-based) ===');
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

    if (!workspaceId) {
      console.log('No workspace ID, showing error');
      toast.error('Workspace ID not available. Please reload the page.')
      return
    }

    console.log('Starting browser-based PDF generation...');
    setIsGenerating(true)
    setGeneratedPDFs([])

    const results: GeneratedPDF[] = []
    let successCount = 0
    let errorCount = 0

    try {
      // Generate PDFs for each selected brand
      for (const brandId of selectedBrandIds) {
        const brand = approvedBrands.find(b => b.id === brandId)
        if (!brand) {
          console.warn(`Brand ${brandId} not found in approved brands`)
          continue
        }

        console.log(`\n🚀 Generating PDF for: ${brand.name}`)

        try {
          // Generate PDF using browser-based method
          const pdfResult = await generateAndUploadMediaPackPDF(
            'media-pack-preview',
            brand.name,
            brand.id,
            workspaceId
          )

          if (!pdfResult.success) {
            throw new Error(pdfResult.error || 'PDF generation failed')
          }

          console.log(`✅ PDF generated for ${brand.name}:`, pdfResult.fileUrl)

          // Save metadata to database
          const packId = `pack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          const saveResponse = await fetch('/api/media-pack/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              packId,
              workspaceId,
              brandId: brand.id,
              brandName: brand.name,
              variant,
              fileUrl: pdfResult.fileUrl,
              fileId: pdfResult.fileId,
              fileName: pdfResult.fileName,
              format: 'pdf',
              status: 'READY'
            })
          })

          const saveData = await saveResponse.json()

          if (saveData.success) {
            console.log(`💾 Saved to database for ${brand.name}`)
            results.push({
              brandId: brand.id,
              brandName: brand.name,
              fileId: pdfResult.fileId!,
              fileUrl: pdfResult.fileUrl!,
              cached: false
            })
            successCount++
            
            // Show share dialog for the first successful PDF
            if (successCount === 1 && pdfResult.fileUrl) {
              setCurrentShareLink(pdfResult.fileUrl)
              setShowShareDialog(true)
            }
          } else {
            throw new Error(saveData.error || 'Failed to save PDF metadata')
          }

        } catch (err) {
          console.error(`❌ Failed to generate PDF for ${brand.name}:`, err)
          const errorMessage = err instanceof Error ? err.message : 'Unknown error'
          results.push({
            brandId: brand.id,
            brandName: brand.name,
            fileId: '',
            fileUrl: '',
            cached: false,
            error: errorMessage
          })
          errorCount++
        }
      }

      // Update state with all results
      setGeneratedPDFs(results)

      // Show toast notifications
      if (successCount > 0) {
        toast.success(`Generated ${successCount} PDF(s) successfully!`)
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} PDF(s) failed to generate`)
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
      case 'professional':
        return <MPProfessional {...templateProps} />
      case 'luxury':
        return <MPLuxury {...templateProps} />
      case 'minimal':
        return <MPMinimal {...templateProps} />
      case 'energetic':
        return <MPEnergetic {...templateProps} />
      case 'moderntech':
        return <MPModernTech {...templateProps} />
      case 'creative':
        return <MPCreative {...templateProps} />
      default:
        return <MPProfessional {...templateProps} />
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
            <h3 className="font-medium text-[var(--fg)] mb-3">Template Style</h3>
            <div className="space-y-2">
              {[
                { id: 'professional' as Variant, name: 'Professional', desc: 'Clean & data-focused', icon: '📊', available: true },
                { id: 'luxury' as Variant, name: 'Luxury', desc: 'Elegant & sophisticated', icon: '✨', available: true },
                { id: 'minimal' as Variant, name: 'Minimal', desc: 'Clean & modern', icon: '⚪', available: true },
                { id: 'creative' as Variant, name: 'Creative', desc: 'Bold & artistic', icon: '🎨', available: true },
                { id: 'energetic' as Variant, name: 'Energetic', desc: 'Dynamic & vibrant', icon: '⚡', available: true },
                { id: 'moderntech' as Variant, name: 'Modern Tech', desc: 'Futuristic & sleek', icon: '🚀', available: true }
              ].map((template) => (
                <button
                  key={template.id}
                  onClick={() => template.available && setVariant(template.id)}
                  disabled={!template.available}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    variant === template.id
                      ? 'bg-[var(--brand-600)] text-white'
                      : template.available
                      ? 'bg-[var(--surface)] text-[var(--fg)] hover:bg-[var(--border)]'
                      : 'bg-[var(--surface)] text-[var(--muted-fg)] opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{template.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs opacity-75">{template.desc}</div>
                    </div>
                    {!template.available && (
                      <span className="text-xs">Soon</span>
                    )}
                  </div>
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
            onClick={async () => {
              try {
                console.log('🎯 Advancing to outreach step...');
                
                // First, advance the workflow to OUTREACH step
                await fetch('/api/brand-run/upsert', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ step: 'OUTREACH' })
                });
                
                console.log('✅ Advanced to OUTREACH, navigating to:', `/${locale}/tools/outreach`);
                
                // Then navigate to the outreach page with correct locale
                router.push(`/${locale}/tools/outreach`);
              } catch (error) {
                console.error('❌ Error advancing to outreach:', error);
                toast.error('Failed to continue to outreach');
              }
            }}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[var(--ds-success)] to-[var(--ds-success-hover)] text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition-all duration-200"
          >
            Continue to Outreach →
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      )}

      {/* Share Dialog */}
      {showShareDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold mb-2">PDF Generated Successfully!</h2>
              <p className="text-gray-600">Your media pack is ready to share</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔗 Shareable Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentShareLink}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded-lg bg-white text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentShareLink);
                    toast.success('Link copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  📋 Copy
                </button>
              </div>
            </div>
            
            <div className="flex gap-3">
              <a
                href={currentShareLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
              >
                📥 Open PDF
              </a>
              <button
                onClick={() => setShowShareDialog(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">
                💡 <strong>Tip:</strong> This link can be shared via email, Slack, or any messaging platform. 
                The PDF will be accessible to anyone with the link.
              </p>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}