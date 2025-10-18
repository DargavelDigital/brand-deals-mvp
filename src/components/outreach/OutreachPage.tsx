'use client'
import * as React from 'react'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { toast } from '@/hooks/useToast'
import { Button } from '@/components/ui/Button'
import { useLocale } from 'next-intl'
import { WorkflowProgress } from '@/components/ui/WorkflowProgress'
import { Mail, ExternalLink, CheckCircle } from 'lucide-react'
import { EMAIL_TEMPLATES } from '@/lib/outreach/email-templates'
import { SEQUENCE_PRESETS } from '@/lib/outreach/sequence-presets'

interface OutreachItem {
  contact: {
    id: string
    name: string
    email: string
    title: string
    company: string
  }
  brand: {
    id: string
    name: string
    industry?: string
  } | null
  mediaPack: {
    id: string
    name: string
    fileUrl?: string
  } | null
  emailPreview: {
    subject: string
    body: string
  }
  status: 'ready' | 'sending' | 'sent' | 'error'
}

export default function OutreachPage(){
  const locale = useLocale();
  const [outreachItems, setOutreachItems] = React.useState<OutreachItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState<'outreach' | 'analytics'>('outreach')
  const [expandedPreview, setExpandedPreview] = React.useState<string | null>(null)
  
  // New: Outreach strategy state
  const [outreachMode, setOutreachMode] = React.useState<'quick' | 'sequence'>('sequence')
  const [selectedTemplate, setSelectedTemplate] = React.useState('media_kit_intro')
  const [selectedPreset, setSelectedPreset] = React.useState('first_contact')
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})
  const [showPreviewModal, setShowPreviewModal] = React.useState(false)
  const [previewContact, setPreviewContact] = React.useState<OutreachItem | null>(null)
  const [previewEmailIndex, setPreviewEmailIndex] = React.useState(0)
  
  // New: Edit mode state
  const [isEditMode, setIsEditMode] = React.useState(false)
  const [editedSubject, setEditedSubject] = React.useState('')
  const [editedBody, setEditedBody] = React.useState('')
  
  // Media pack control state
  const [attachMediaPack, setAttachMediaPack] = React.useState(true)
  const [selectedPackId, setSelectedPackId] = React.useState<string | null>(null)
  const [allPacks, setAllPacks] = React.useState<any[]>([])
  const [perEmailPackSettings, setPerEmailPackSettings] = React.useState<Record<number, {
    attach: boolean
    packId: string | null
  }>>({})

  // Load contacts, brands, and media packs from workflow
  React.useEffect(() => {
    const loadOutreachData = async () => {
      try {
        setLoading(true)
        
        // 1. Load current brand run to get contacts, brands, and media packs
        const runRes = await fetch('/api/brand-run/current')
        if (!runRes.ok) {
          throw new Error('No brand run found')
        }
        
        const runData = await runRes.json()
        const contacts = runData.data?.runSummaryJson?.contacts || runData.runSummaryJson?.contacts || []
        const brands = runData.data?.runSummaryJson?.brands || runData.runSummaryJson?.brands || []
        
        console.log('📤 Loaded workflow data:', {
          contacts: contacts.length,
          brands: brands.length
        })
        
        // 2. Load generated media packs
        const packsRes = await fetch('/api/media-pack/list')
        const packsData = await packsRes.json()
        const mediaPacks = packsData.items || []
        
        console.log('📦 Loaded media packs:', mediaPacks.length)
        console.log('📦 Media Packs Debug:', {
          totalPacks: mediaPacks.length,
          packsWithBrandId: mediaPacks.filter((p: any) => p.brandId).length,
          packsReady: mediaPacks.filter((p: any) => p.status === 'READY').length,
          packDetails: mediaPacks.map((p: any) => ({
            id: p.id,
            packId: p.packId,
            brandId: p.brandId || 'NO BRAND ID',
            brandName: p.brandName || 'NO BRAND NAME',
            variant: p.variant,
            status: p.status,
            fileName: p.fileName,
            fileUrl: p.fileUrl ? 'YES' : 'NO',
            createdAt: p.createdAt
          }))
        })

        // Group packs by brand for easier analysis
        const packsByBrand = mediaPacks.reduce((acc: any, pack: any) => {
          const brand = pack.brandName || pack.brandId || 'NO BRAND'
          if (!acc[brand]) acc[brand] = []
          acc[brand].push({
            id: pack.id,
            variant: pack.variant,
            fileUrl: pack.fileUrl ? 'YES' : 'NO'
          })
          return acc
        }, {})
        
        console.log('📊 Packs Grouped by Brand:', packsByBrand)
        console.log('📊 Total Brands with Packs:', Object.keys(packsByBrand).length)
        
        // Log what brands we're trying to match against
        console.log('🎯 Brands to Match:', brands.map((b: any) => ({
          id: b.id,
          name: b.name,
          industry: b.industry
        })))
        
        // 3. Smart matching: create outreach items
        const items: OutreachItem[] = contacts.map((contact: any) => {
          // SMART MATCHING: Match brand by ID or company name
          const matchedBrand = brands.find((b: any) => 
            b.id === contact.brandId || 
            b.name.toLowerCase() === contact.company?.toLowerCase()
          )
          
          // SMART MATCHING: Match media pack to brand (enhanced with multiple strategies)
          const matchedPack = matchedBrand 
            ? (() => {
                console.log('🔍 Looking for pack for brand:', matchedBrand.id, matchedBrand.name)
                
                // Strategy 1: Direct brandId match
                let pack = mediaPacks.find((p: any) => p.brandId === matchedBrand.id)
                if (pack) {
                  console.log('✅ Found pack via brandId:', pack.id)
                  return pack
                }
                
                // Strategy 2: Legacy ID match
                pack = mediaPacks.find((p: any) => p.id === matchedBrand.id)
                if (pack) {
                  console.log('✅ Found pack via legacy ID:', pack.id)
                  return pack
                }
                
                // Strategy 3: Brand name match
                pack = mediaPacks.find((p: any) => 
                  p.brandName?.toLowerCase() === matchedBrand.name?.toLowerCase()
                )
                if (pack) {
                  console.log('✅ Found pack via brand name:', pack.id)
                  return pack
                }
                
                // Strategy 4: Partial brand name match
                pack = mediaPacks.find((p: any) => 
                  p.brandName?.toLowerCase().includes(matchedBrand.name?.toLowerCase())
                )
                if (pack) {
                  console.log('✅ Found pack via partial match:', pack.id)
                  return pack
                }
                
                // Strategy 5: If no brand-specific pack, use first available generic pack
                if (!pack && mediaPacks.length > 0) {
                  pack = mediaPacks.find((p: any) => !p.brandId && p.status === 'READY')
                  if (pack) {
                    console.log('⚠️ Using generic pack as fallback:', pack.id)
                    return pack
                  }
                }
                
                console.log('❌ No pack found for brand:', matchedBrand.name)
                return null
              })()
            : null
          
          console.log('📦 Final matched pack for', contact.name, ':', matchedPack?.id || 'none')
          
          // Generate personalized email preview
          const emailPreview = generateEmailPreview(contact, matchedBrand)
          
          return {
            contact: {
              id: contact.id,
              name: contact.name,
              email: contact.email,
              title: contact.title || 'Contact',
              company: contact.brandName || contact.company || 'Company'
            },
            brand: matchedBrand ? {
              id: matchedBrand.id,
              name: matchedBrand.name,
              industry: matchedBrand.industry
            } : null,
            mediaPack: matchedPack ? {
              id: matchedPack.id,
              name: `${matchedBrand?.name} Media Pack`,
              fileUrl: matchedPack.fileUrl
            } : null,
            emailPreview,
            status: 'ready'
          }
        })
        
        setOutreachItems(items)
        console.log('✅ Created', items.length, 'ready-to-send outreach items')
        console.log('🎯 Contact Matching Debug:', {
          totalContacts: items.length,
          contactsWithBrand: items.filter(i => i.brand).length,
          contactsWithPack: items.filter(i => i.mediaPack).length,
          matchDetails: items.map(i => ({
            name: i.contact.name,
            hasBrand: !!i.brand,
            brandId: i.brand?.id,
            hasPack: !!i.mediaPack,
            packId: i.mediaPack?.id
          }))
        })
        
      } catch (error) {
        console.error('❌ Failed to load outreach data:', error)
        toast.error('Failed to load outreach data')
      } finally {
        setLoading(false)
      }
    }
    
    loadOutreachData()
  }, [])

  // Load all media packs for pack selector
  React.useEffect(() => {
    async function loadPacks() {
      try {
        const response = await fetch('/api/media-pack/list')
        if (response.ok) {
          const data = await response.json()
          setAllPacks(data.items || [])
          console.log('📦 Loaded all media packs:', data.items?.length)
        }
      } catch (error) {
        console.error('Failed to load packs:', error)
      }
    }
    loadPacks()
  }, [])

  // Initialize selectedPackId when preview opens
  React.useEffect(() => {
    if (showPreviewModal && previewContact?.mediaPack) {
      setSelectedPackId(previewContact.mediaPack.id)
    }
  }, [showPreviewModal, previewContact])

  // Generate personalized email preview
  const generateEmailPreview = (contact: any, brand: any) => {
    const brandName = brand?.name || 'your brand'
    const contactFirstName = contact.name?.split(' ')[0] || 'there'
    
    return {
      subject: `Partnership Opportunity - ${brandName}`,
      body: `Hi ${contactFirstName},

I'm reaching out to explore a potential partnership between my audience and ${brandName}. 

With my engaged following and content that aligns with your brand values, I believe we could create something impactful together.

I've attached my media pack with detailed audience insights and partnership options.

Would you be open to a brief call this week?

Best regards`
    }
  }

  const sendOutreach = async (item: OutreachItem) => {
    try {
      console.log('Sending outreach:', {
        mode: outreachMode,
        attachPack: attachMediaPack,
        packId: selectedPackId,
        perEmailSettings: perEmailPackSettings
      })

      // Update status to sending
      setOutreachItems(items => 
        items.map(i => i.contact.id === item.contact.id ? { ...i, status: 'sending' } : i)
      )
      
      // Send email via API with new mode/template/preset/pack settings
      const res = await fetch('/api/outreach/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: item.contact.id,
          brandId: item.brand?.id,
          mediaPackId: attachMediaPack ? (selectedPackId || item.mediaPack?.id) : null, // Only attach if toggled on
          mode: outreachMode,
          template: selectedTemplate,
          preset: selectedPreset,
          subject: item.emailPreview.subject,
          body: item.emailPreview.body,
          perEmailPacks: outreachMode === 'sequence' ? perEmailPackSettings : undefined
        })
      })
      
      if (!res.ok) throw new Error('Failed to send')
      
      // Update status to sent
      setOutreachItems(items => 
        items.map(i => i.contact.id === item.contact.id ? { ...i, status: 'sent' } : i)
      )
      
      toast.success(`${outreachMode === 'sequence' ? 'Sequence' : 'Email'} sent to ${item.contact.name}!`)
      
      // Reset pack settings
      setAttachMediaPack(true)
      setPerEmailPackSettings({})
      
    } catch (error) {
      console.error('Failed to send email:', error)
      setOutreachItems(items => 
        items.map(i => i.contact.id === item.contact.id ? { ...i, status: 'error' } : i)
      )
      toast.error(`Failed to send email to ${item.contact.name}`)
    }
  }

  // Helper functions for enhanced UI
  function getPresetDescription(preset: string): string {
    const descriptions: Record<string, string> = {
      'first_contact': 'Perfect for initial outreach to new brands - gentle, professional approach',
      'cold_outreach_pro': 'Comprehensive sequence for high-value opportunities with multiple touchpoints',
      'warm_intro': 'Quick, friendly approach when you have a mutual connection',
      'quick_pitch': 'Direct pitch for time-sensitive opportunities'
    }
    return descriptions[preset] || ''
  }

  function getPresetEmailCount(preset: string): number {
    const counts: Record<string, number> = {
      'first_contact': 3,
      'cold_outreach_pro': 5,
      'warm_intro': 2,
      'quick_pitch': 1
    }
    return counts[preset] || 1
  }

  function getPresetDuration(preset: string): string {
    const durations: Record<string, string> = {
      'first_contact': '7 days',
      'cold_outreach_pro': '15 days',
      'warm_intro': '5 days',
      'quick_pitch': 'Immediate'
    }
    return durations[preset] || ''
  }

  function getTemplateName(key: string): string {
    const names: Record<string, string> = {
      'media_kit_intro': 'Media Kit Introduction',
      'casual_intro': 'Casual Introduction',
      'mutual_connection': 'Mutual Connection',
      'niche_expert': 'Niche Expert',
      'follow_up_no_response': 'Follow-up (No Response)',
      'final_follow_up': 'Final Follow-up',
      'reactivation': 'Reactivation',
      'value_prop': 'Value Proposition',
      'case_study': 'Case Study & Proof',
      'seasonal': 'Seasonal Collaboration',
      'ugc_content': 'UGC Content Pitch',
      'brand_ambassador': 'Brand Ambassador',
      'event_coverage': 'Event Coverage',
      'affiliate': 'Affiliate Partnership'
    }
    return names[key] || 'Email Template'
  }

  function getSequenceSteps(preset: string) {
    const steps: Record<string, Array<{ day: number; name: string; description: string; hasMediaPack: boolean }>> = {
      'first_contact': [
        { day: 0, name: 'Initial Introduction', description: 'Introduce yourself and the opportunity', hasMediaPack: true },
        { day: 3, name: 'Value Follow-up', description: 'Highlight key benefits and social proof', hasMediaPack: true },
        { day: 7, name: 'Final Check-in', description: 'Last touchpoint with case studies', hasMediaPack: true }
      ],
      'cold_outreach_pro': [
        { day: 0, name: 'Introduction', description: 'Professional introduction', hasMediaPack: true },
        { day: 4, name: 'Value Props', description: 'Key value propositions', hasMediaPack: false },
        { day: 9, name: 'Social Proof', description: 'Case studies and results', hasMediaPack: true },
        { day: 12, name: 'Alternative Angle', description: 'Different approach', hasMediaPack: false },
        { day: 15, name: 'Final Outreach', description: 'Last attempt with urgency', hasMediaPack: true }
      ],
      'warm_intro': [
        { day: 0, name: 'Mutual Connection Intro', description: 'Reference shared connection', hasMediaPack: true },
        { day: 3, name: 'Quick Follow-up', description: 'Brief reminder', hasMediaPack: false }
      ],
      'quick_pitch': [
        { day: 0, name: 'Direct Pitch', description: 'Single email with full details', hasMediaPack: true }
      ]
    }
    return steps[preset] || steps['first_contact']
  }

  function toggleExpanded(contactId: string) {
    setExpanded(prev => ({
      ...prev,
      [contactId]: !prev[contactId]
    }))
  }

  function handlePreview(contact: OutreachItem) {
    setPreviewContact(contact)
    setPreviewEmailIndex(0)
    setShowPreviewModal(true)
    setIsEditMode(false)
    setAttachMediaPack(!!contact.mediaPack) // Default to true if pack exists
    setSelectedPackId(contact.mediaPack?.id || null)
    // Initialize with generated content
    setEditedSubject(getEmailSubject(0, contact))
    setEditedBody(getEmailBody(0, contact))
  }

  // Media Pack Helper Functions
  function getAvailablePacks(brandId?: string): any[] {
    if (!brandId) {
      // No brand - show generic packs only
      return allPacks.filter(p => !p.brandId)
    }
    
    // Show packs for this specific brand + generic packs
    return allPacks.filter(p => 
      p.brandId === brandId || !p.brandId
    )
  }

  function getPackDisplayName(pack: any): string {
    const parts = []
    if (pack.brandName) parts.push(pack.brandName)
    if (pack.variant) parts.push(pack.variant)
    if (pack.fileName) parts.push(`(${pack.fileName})`)
    return parts.join(' - ') || 'Media Pack'
  }

  // Keyboard shortcuts for edit mode and pack management
  React.useEffect(() => {
    if (!showPreviewModal) return

    function handleKeyPress(e: KeyboardEvent) {
      // Cmd/Ctrl + E to toggle edit mode
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault()
        setIsEditMode(!isEditMode)
        if (!isEditMode && previewContact) {
          // Entering edit mode - populate with current content
          setEditedSubject(getEmailSubject(previewEmailIndex, previewContact))
          setEditedBody(getEmailBody(previewEmailIndex, previewContact))
        }
      }
      
      // Cmd/Ctrl + M to toggle pack attachment
      if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
        e.preventDefault()
        setAttachMediaPack(!attachMediaPack)
      }
      
      // Cmd/Ctrl + P to preview pack
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault()
        if (selectedPackId) {
          const pack = allPacks.find(p => p.id === selectedPackId)
          if (pack?.fileUrl) {
            window.open(pack.fileUrl, '_blank')
          }
        }
      }
      
      // Escape to exit edit mode or close modal
      if (e.key === 'Escape') {
        if (isEditMode) {
          setIsEditMode(false)
        } else {
          setShowPreviewModal(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showPreviewModal, isEditMode, previewEmailIndex, previewContact, attachMediaPack, selectedPackId, allPacks])

  // Variable replacement helper
  function replaceEmailVariables(text: string, contact: OutreachItem): string {
    // Get workspace/creator data (using defaults for now)
    const creatorName = 'Your Name' // TODO: Get from user profile
    const followerCount = '50,000' // TODO: Get from audit data
    const engagementRate = '4.5%' // TODO: Get from audit data
    const contentPillars = 'Fashion, Lifestyle, Travel' // TODO: Get from audit data
    
    return text
      .replace(/\{\{contactFirstName\}\}/g, contact.contact.name?.split(' ')[0] || 'there')
      .replace(/\{\{contactName\}\}/g, contact.contact.name || 'there')
      .replace(/\{\{brandName\}\}/g, contact.brand?.name || contact.contact.company || 'your brand')
      .replace(/\{\{companyName\}\}/g, contact.contact.company || 'your company')
      .replace(/\{\{creatorName\}\}/g, creatorName)
      .replace(/\{\{followerCount\}\}/g, followerCount)
      .replace(/\{\{engagementRate\}\}/g, engagementRate)
      .replace(/\{\{contentPillars\}\}/g, contentPillars)
      .replace(/\{\{mediaPackUrl\}\}/g, contact.mediaPack?.fileUrl || '[Media Pack Link]')
      .replace(/\{\{impressions\}\}/g, '50,000+')
      .replace(/\{\{industry\}\}/g, contact.brand?.industry || 'your industry')
      .replace(/\{\{niche\}\}/g, 'lifestyle')
      .replace(/\{\{brandFocus\}\}/g, contact.brand?.industry || 'your products')
  }

  // Get email subject for specific sequence step
  function getEmailSubject(emailIndex: number, contact: OutreachItem): string {
    console.log('🔍 Getting subject for email index:', emailIndex)
    
    // Get the sequence preset to find the right step
    const preset = SEQUENCE_PRESETS.find(p => p.id.includes(selectedPreset.split('_')[0]))
    if (preset && preset.steps[emailIndex]) {
      const stepSubject = preset.steps[emailIndex].subject
      return replaceEmailVariables(stepSubject, contact)
    }

    // Fallback: Generate subject based on index
    const brandName = contact.brand?.name || contact.contact.company || 'your brand'
    
    if (emailIndex === 0) {
      return `Partnership Opportunity - ${brandName}`
    } else if (emailIndex === 1) {
      return `Re: Partnership with ${brandName}`
    } else if (emailIndex === 2) {
      return `Following up: ${brandName} collaboration`
    } else if (emailIndex === 3) {
      return `Quick update: ${brandName} partnership`
    } else {
      return `Final follow-up: ${brandName} opportunity`
    }
  }

  // Get email body for specific sequence step
  function getEmailBody(emailIndex: number, contact: OutreachItem): string {
    console.log('🔍 Getting email body for:', { emailIndex, contact: contact.contact.name })

    // Get the sequence preset to find the right step
    const preset = SEQUENCE_PRESETS.find(p => p.id.includes(selectedPreset.split('_')[0]))
    if (preset && preset.steps[emailIndex]) {
      const stepBody = preset.steps[emailIndex].body
      const result = replaceEmailVariables(stepBody, contact)
      console.log('✅ Generated body for email', emailIndex + 1, '- First 100 chars:', result.substring(0, 100))
      return result
    }

    // Fallback: Generate different content for each email
    const contactFirstName = contact.contact.name?.split(' ')[0] || 'there'
    const brandName = contact.brand?.name || contact.contact.company || 'your brand'
    
    let body = ''
    
    if (emailIndex === 0) {
      // First email - introduction
      body = `Hi ${contactFirstName},

I'm reaching out to explore a potential partnership between my audience and ${brandName}.

With my engaged following and content that aligns with your brand values, I believe we could create something impactful together.

I've attached my media pack with detailed audience insights and partnership options.

Would you be open to a brief call this week?

Best regards`
    } else if (emailIndex === 1) {
      // Second email - follow-up
      body = `Hi ${contactFirstName},

I wanted to follow up on my email from a few days ago about partnering with ${brandName}.

To give you a quick snapshot:
• 50,000 followers with 4.5% engagement
• Content focus on lifestyle and fashion
• Previous partnerships with similar brands

My media pack has all the details: [Media Pack Link]

Would love to discuss this week if you're interested!

Best regards`
    } else if (emailIndex === 2) {
      // Third email - value reminder
      body = `Hi ${contactFirstName},

I know inboxes get busy, so I wanted to send a quick follow-up about collaborating with ${brandName}.

I genuinely believe my audience would be a great match for your brand. My followers are highly engaged with lifestyle content.

If you're interested, here's my media pack: [Media Pack Link]

Let me know if you'd like to chat!

Best regards`
    } else if (emailIndex === 3) {
      // Fourth email - social proof
      body = `Hi ${contactFirstName},

Quick update: I've been working with brands similar to ${brandName} and seeing great results.

My latest campaign generated:
• 50,000+ impressions
• 4.5% engagement rate
• Strong ROI for the brand

I think we could achieve similar results together. Media pack: [Media Pack Link]

Would you be open to a brief call?

Best regards`
    } else {
      // Final email - last attempt
      body = `Hi ${contactFirstName},

I know you're busy, so this will be my last note.

I genuinely believe there's a great opportunity for ${brandName} and my audience to work together.

If you'd like to explore this, all my details are here: [Media Pack Link]

Either way, I appreciate your time and wish you all the best!

Best regards`
    }

    console.log('✅ Generated body for email', emailIndex + 1, '- First 100 chars:', body.substring(0, 100))
    return body
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: 'Tools', href: `/${locale}/tools` },
          { label: 'Start Outreach' }
        ]} />
        
        <WorkflowProgress 
          currentStep={5} 
          steps={['Connect', 'Audit', 'Matches', 'Contacts', 'Pack', 'Outreach']}
        />
        
        <div className="card p-8 text-center">
          <div className="w-8 h-8 mx-auto mb-3 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
          <p className="text-gray-600">Loading outreach data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Tools', href: `/${locale}/tools` },
        { label: 'Start Outreach' }
      ]} />
      
      <WorkflowProgress 
        currentStep={5} 
        steps={['Connect', 'Audit', 'Matches', 'Contacts', 'Pack', 'Outreach']}
      />
      
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Smart Outreach</h1>
        <p className="text-gray-600">AI-matched contacts with brand-specific media packs, ready to send.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{outreachItems.length}</div>
          <div className="text-sm text-gray-600">Total Contacts</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {outreachItems.filter(i => i.brand).length}
          </div>
          <div className="text-sm text-gray-600">Auto-Matched</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {outreachItems.filter(i => i.mediaPack).length}
          </div>
          <div className="text-sm text-gray-600">Packs Attached</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            {outreachItems.filter(i => i.status === 'sent').length}
          </div>
          <div className="text-sm text-gray-600">Sent</div>
        </div>
      </div>

      {/* NEW: Outreach Strategy Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">📧 Choose Your Outreach Strategy</h2>
        
        {/* Mode Selection */}
        <div className="space-y-4 mb-6">
          {/* Quick Send Option */}
          <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
            <input
              type="radio"
              name="outreachMode"
              value="quick"
              checked={outreachMode === 'quick'}
              onChange={() => setOutreachMode('quick')}
              className="mt-1"
            />
            <div>
              <div className="font-semibold">Quick Send (Single Email)</div>
              <div className="text-sm text-gray-600">
                Send one personalized email now - best for warm contacts
              </div>
            </div>
          </label>

          {/* Sequence Option */}
          <label className="flex items-start gap-3 p-4 border-2 border-blue-500 rounded-lg cursor-pointer bg-blue-50">
            <input
              type="radio"
              name="outreachMode"
              value="sequence"
              checked={outreachMode === 'sequence'}
              onChange={() => setOutreachMode('sequence')}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="font-semibold">Email Sequence</div>
                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                  Recommended
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-3">
                Automated follow-ups increase response rates by 30%
              </div>

              {/* Template Selector - Only show when sequence mode selected */}
              {outreachMode === 'sequence' && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Email Template
                    </label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg bg-white"
                    >
                      <optgroup label="👋 Introduction">
                        <option value="media_kit_intro">Media Kit Introduction</option>
                        <option value="casual_intro">Casual Introduction</option>
                        <option value="mutual_connection">Mutual Connection Introduction</option>
                        <option value="niche_expert">Niche Expert Introduction</option>
                      </optgroup>
                      <optgroup label="🔄 Follow-up">
                        <option value="follow_up_no_response">Follow-up (No Response)</option>
                        <option value="final_follow_up">Final Follow-up</option>
                        <option value="reactivation">Reactivation (Old Contact)</option>
                      </optgroup>
                      <optgroup label="🎯 Pitch">
                        <option value="value_prop">Value Proposition Pitch</option>
                        <option value="case_study">Case Study & Proof</option>
                        <option value="seasonal">Seasonal Collaboration</option>
                        <option value="ugc_content">UGC Content Pitch</option>
                        <option value="brand_ambassador">Brand Ambassador Interest</option>
                        <option value="event_coverage">Event Coverage Offer</option>
                        <option value="affiliate">Affiliate Partnership Pitch</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* Sequence Preset Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Sequence Flow
                    </label>
                    <select
                      value={selectedPreset}
                      onChange={(e) => setSelectedPreset(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg bg-white"
                    >
                      <option value="first_contact">First Contact (3 emails over 7 days)</option>
                      <option value="cold_outreach_pro">Cold Outreach Pro (5 emails over 15 days)</option>
                      <option value="warm_intro">Warm Introduction (2 emails over 5 days)</option>
                      <option value="quick_pitch">Quick Pitch (1 email)</option>
                    </select>
                  </div>

                  {/* Preset Info Display */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">
                      {getPresetDescription(selectedPreset)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>📧 {getPresetEmailCount(selectedPreset)} emails</span>
                      <span>📅 {getPresetDuration(selectedPreset)}</span>
                      <span>🤖 Auto follow-up if no reply</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Ready-to-Send List */}
      {outreachItems.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-xl font-semibold mb-2">No Contacts Ready</h2>
          <p className="text-gray-600 mb-4">
            You need to select contacts from the previous step.
          </p>
          <Button onClick={() => window.location.href = `/${locale}/tools/contacts`}>
            ← Go Back to Contacts
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Ready to Send ({outreachItems.filter(i => i.status === 'ready').length})</h2>
          
          {outreachItems.map((item) => (
            <div 
              key={item.contact.id} 
              className={`p-4 border rounded-lg bg-white transition-all ${
                item.status === 'sent' ? 'opacity-60 bg-green-50 border-green-200' : ''
              } ${
                item.status === 'error' ? 'border-red-200 bg-red-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                {/* LEFT: CONTACT INFO */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{item.contact.name}</h3>
                    {item.status === 'sent' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3" />
                        Sent
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {item.contact.title} at {item.brand?.name || item.contact.company}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>📧 {item.contact.email}</span>
                    {item.mediaPack && (
                      <span className="inline-flex items-center gap-1 text-blue-600">
                        📄 Media Pack: Auto-attached
                      </span>
                    )}
                    {!item.brand && (
                      <span className="text-yellow-600">⚠️ No brand match</span>
                    )}
                  </div>
                  
                  {/* NEW: Match Info Section - 4 Columns */}
                  <div className="grid grid-cols-4 gap-4 mt-4 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Matched Brand</div>
                      <div className="font-medium flex items-center gap-2 text-sm">
                        {item.brand?.name || item.contact.company}
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                          {item.brand ? '95% match' : 'Manual'}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Template</div>
                      <div className="font-medium text-sm">
                        {outreachMode === 'sequence' 
                          ? getTemplateName(selectedTemplate)
                          : 'Single Email'}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Sequence</div>
                      <div className="font-medium text-sm">
                        {outreachMode === 'sequence'
                          ? getPresetEmailCount(selectedPreset) + ' emails'
                          : 'Quick Send'}
                      </div>
                    </div>
                    
                    {/* NEW: Media Pack Column - Smart Status with Actions */}
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Media Pack</div>
                      <div className="font-medium text-sm">
                        {item.mediaPack ? (
                          <div className="flex items-center gap-2">
                            <span>📎 {item.mediaPack.name || 'Attached'}</span>
                            {item.mediaPack.fileUrl && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.open(item.mediaPack.fileUrl, '_blank')
                                }}
                                className="text-xs text-blue-600 hover:text-blue-700 underline"
                              >
                                View
                              </button>
                            )}
                          </div>
                        ) : (() => {
                            // Smart detection: Does this brand have ANY packs?
                            const brandHasPacks = allPacks.some((p: any) => 
                              p.brandName === item.brand?.name || 
                              p.brandId === item.brand?.id
                            )
                            
                            if (allPacks.length === 0) {
                              // No packs at all
                              return (
                                <div className="text-sm">
                                  <span className="text-amber-600">⚠️ No packs</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      window.location.href = `/${locale}/tools/pack`
                                    }}
                                    className="ml-2 text-xs text-blue-600 hover:text-blue-700 underline"
                                  >
                                    Go to Pack page
                                  </button>
                                </div>
                              )
                            } else if (brandHasPacks) {
                              // Packs exist for brand but didn't auto-match
                              return (
                                <div className="text-sm">
                                  <span className="text-amber-600">⚠️ Not matched</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handlePreview(item)
                                    }}
                                    className="ml-2 text-xs text-blue-600 hover:text-blue-700 underline"
                                  >
                                    Select pack
                                  </button>
                                </div>
                              )
                            } else {
                              // Packs exist but NOT for this brand
                              return (
                                <div className="text-sm">
                                  <span className="text-red-600">❌ No {item.brand?.name || 'brand'} pack</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      // Navigate to pack page - user will select brand there
                                      window.location.href = `/${locale}/tools/pack`
                                    }}
                                    className="ml-2 text-xs text-blue-600 hover:text-blue-700 underline font-medium"
                                  >
                                    Go to Pack page
                                  </button>
                                </div>
                              )
                            }
                          })()
                        }
                      </div>
                    </div>
                  </div>

                  {/* NEW: Visual Timeline (only show in sequence mode) */}
                  {outreachMode === 'sequence' && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm font-medium mb-3 flex items-center justify-between">
                        <span>Email Sequence Timeline:</span>
                        <button
                          onClick={() => toggleExpanded(item.contact.id)}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          {expanded[item.contact.id] ? 'Hide Details' : 'Show Details'}
                        </button>
                      </div>
                      
                      {/* Timeline Visualization - Enhanced with Smart Pack Icons */}
                      <div className="space-y-2">
                        {getSequenceSteps(selectedPreset).map((step, idx) => {
                          // Check if THIS email actually has a pack attached
                          const emailHasPack = (() => {
                            // Check per-email settings first
                            if (perEmailPackSettings[idx]) {
                              return perEmailPackSettings[idx].attach && perEmailPackSettings[idx].packId
                            }
                            // Fall back to global setting
                            return attachMediaPack && (selectedPackId || item.mediaPack)
                          })()
                          
                          return (
                            <div key={idx} className="flex items-center gap-3 text-sm">
                              <div className="w-16 text-gray-500 text-xs">
                                Day {step.day}
                              </div>
                              <div className="flex-1 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {idx + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 text-sm">
                                    {step.name}
                                  </div>
                                  {expanded[item.contact.id] && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {step.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* SMART PACK ICON - Shows actual attachment state */}
                              {emailHasPack ? (
                                <div className="flex items-center gap-1 text-xs text-green-600">
                                  <span>📎</span>
                                  <span>Pack attached</span>
                                </div>
                              ) : (
                                <div className="text-xs text-gray-400">
                                  No attachment
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* RIGHT: ACTIONS */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handlePreview(item)}
                    className="px-3 py-1.5 border border-blue-600 text-blue-600 rounded text-sm hover:bg-blue-50"
                  >
                    Preview
                  </button>
                  {item.status === 'ready' && (
                    <button
                      onClick={() => sendOutreach(item)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                    >
                      Send Outreach
                    </button>
                  )}
                  {item.status === 'sending' && (
                    <button disabled className="px-4 py-2 bg-gray-400 text-white rounded text-sm">
                      Sending...
                    </button>
                  )}
                  {item.status === 'sent' && (
                    <button disabled className="px-4 py-2 bg-green-600 text-white rounded text-sm">
                      ✓ Sent
                    </button>
                  )}
                </div>
              </div>
              
              {/* EXPANDABLE EMAIL PREVIEW */}
              {expandedPreview === item.contact.id && (
                <div className="mt-4 p-4 bg-gray-50 rounded border">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-semibold">Subject:</span> {item.emailPreview.subject}
                    </div>
                    <div className="border-t pt-2">
                      <span className="font-semibold">Body:</span>
                      <pre className="mt-2 whitespace-pre-wrap font-sans text-gray-700">
                        {item.emailPreview.body}
                      </pre>
                    </div>
                    {item.mediaPack?.fileUrl && (
                      <div className="border-t pt-2">
                        <span className="font-semibold">Attachment:</span>
                        <a 
                          href={item.mediaPack.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          {item.mediaPack.name}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bulk Actions */}
      {outreachItems.filter(i => i.status === 'ready').length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {outreachItems.filter(i => i.status === 'ready').length} emails ready to send
            </div>
            <button
              onClick={() => {
                outreachItems
                  .filter(i => i.status === 'ready')
                  .forEach(item => sendOutreach(item))
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg"
            >
              📤 Send All {outreachMode === 'sequence' ? 'Sequences' : 'Emails'}
            </button>
          </div>
        </div>
      )}

      {/* NEW: Enhanced Preview Modal */}
      {showPreviewModal && previewContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Preview: {outreachMode === 'sequence' ? 'Email Sequence' : 'Email'} to {previewContact.contact.name}
              </h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* Email Navigation (for sequences) */}
            {outreachMode === 'sequence' && (
              <div className="flex items-center justify-center gap-2 p-4 border-b bg-gray-50">
                {getSequenceSteps(selectedPreset).map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      console.log('📧 Switching to email index:', idx)
                      console.log('📧 Template:', selectedTemplate)
                      console.log('📧 Preset:', selectedPreset)
                      setPreviewEmailIndex(idx)
                      // Reset edit mode when switching emails
                      setIsEditMode(false)
                      // Load content for this email
                      if (previewContact) {
                        const newSubject = getEmailSubject(idx, previewContact)
                        const newBody = getEmailBody(idx, previewContact)
                        setEditedSubject(newSubject)
                        setEditedBody(newBody)
                        console.log('📧 New subject:', newSubject)
                        console.log('📧 New body (first 100 chars):', newBody.substring(0, 100))
                      }
                    }}
                    className={`px-4 py-2 rounded-lg transition text-sm ${
                      idx === previewEmailIndex
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Email {idx + 1}
                    {idx > 0 && (
                      <span className="text-xs ml-1 opacity-75">(Day {step.day})</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {/* Edit Mode Toggle */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">
                  {isEditMode ? '✏️ Editing email content' : '👁️ Preview mode'}
                </div>
                <button
                  onClick={() => {
                    if (!isEditMode && previewContact) {
                      // Entering edit mode - populate with current content
                      setEditedSubject(getEmailSubject(previewEmailIndex, previewContact))
                      setEditedBody(getEmailBody(previewEmailIndex, previewContact))
                    }
                    setIsEditMode(!isEditMode)
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
                >
                  {isEditMode ? (
                    <>
                      <span>👁️</span> Preview
                    </>
                  ) : (
                    <>
                      <span>✏️</span> Edit
                    </>
                  )}
                </button>
              </div>

              {/* NEW: Enhanced Media Pack Control Section */}
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                
                {/* Warning: No packs available */}
                {allPacks.length === 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">📦</span>
                      <div className="flex-1">
                        <div className="font-semibold text-amber-900 mb-2">
                          No Media Packs Available
                        </div>
                        <div className="text-sm text-amber-800 mb-3">
                          Generate a media pack to showcase your audience, engagement rates, and partnership opportunities to brands.
                        </div>
                        <button
                          onClick={() => {
                            window.location.href = `/${locale}/tools/pack`
                          }}
                          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium"
                        >
                          Go to Pack Page
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Warning: Pack not matched */}
                {!previewContact.mediaPack && allPacks.length > 0 && (
                  <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2 text-sm text-amber-800">
                      <span>⚠️</span>
                      <div className="flex-1">
                        <div className="font-medium">No media pack auto-matched</div>
                        <div className="text-xs mt-1">
                          Select a pack manually below or continue without attachment
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Toggle Header */}
                {allPacks.length > 0 && (
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-3 cursor-pointer" title="Attach a media pack PDF to this email (⌘M)">
                      <input
                        type="checkbox"
                        checked={attachMediaPack}
                        onChange={(e) => setAttachMediaPack(e.target.checked)}
                        className="rounded w-4 h-4"
                      />
                      <span className="font-medium text-gray-900">Attach media pack</span>
                    </label>
                    
                    {attachMediaPack && selectedPackId && (
                      <span className="text-sm text-green-600 font-medium">
                        ✓ Pack will be attached
                      </span>
                    )}
                  </div>
                )}
                
                {/* Pack Selector - Only show when attached */}
                {allPacks.length > 0 && attachMediaPack && (
                  <div className="space-y-3 pt-3 border-t border-blue-100">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Media Pack
                      </label>
                      
                      <select
                        value={selectedPackId || ''}
                        onChange={(e) => setSelectedPackId(e.target.value || null)}
                        className="w-full px-3 py-2 border rounded-lg bg-white text-sm"
                      >
                        {getAvailablePacks(previewContact.brand?.id).length === 0 ? (
                          <option value="">No packs available</option>
                        ) : (
                          <>
                            <option value="">Select a pack...</option>
                            {getAvailablePacks(previewContact.brand?.id).map(pack => (
                              <option key={pack.id} value={pack.id}>
                                {pack.brandName ? `${pack.brandName} - ` : ''}
                                {pack.variant} 
                                {pack.fileName ? ` (${pack.fileName})` : ''}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                    
                    {/* Pack Actions */}
                    {selectedPackId && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const pack = allPacks.find(p => p.id === selectedPackId)
                            if (pack?.fileUrl) {
                              window.open(pack.fileUrl, '_blank')
                            }
                          }}
                          className="flex-1 px-4 py-2 text-sm border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
                          title="Preview pack in new tab (⌘P)"
                        >
                          👁️ Preview Pack
                        </button>
                        
                        <button
                          onClick={() => {
                            const pack = allPacks.find(p => p.id === selectedPackId)
                            if (pack?.fileUrl) {
                              // Download pack
                              const a = document.createElement('a')
                              a.href = pack.fileUrl
                              a.download = pack.fileName || 'media-pack.pdf'
                              a.click()
                            }
                          }}
                          className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition"
                        >
                          ⬇️ Download
                        </button>
                      </div>
                    )}
                    
                    {/* Pack Info */}
                    {selectedPackId && (() => {
                      const pack = allPacks.find(p => p.id === selectedPackId)
                      return pack ? (
                        <div className="p-3 bg-white rounded-lg border text-xs text-gray-600">
                          <div className="flex items-center justify-between">
                            <span>📎 {pack.fileName || pack.variant || 'media-pack.pdf'}</span>
                            {pack.brandName && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                {pack.brandName}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : null
                    })()}
                  </div>
                )}
                
                {/* Per-Email Pack Control - Only in sequence mode */}
                {outreachMode === 'sequence' && attachMediaPack && (
                  <div className="mt-4 p-4 bg-white rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-gray-700">
                        Per-Email Pack Control
                      </div>
                      <button
                        onClick={() => {
                          // Apply current pack to all emails
                          const newSettings: Record<number, any> = {}
                          getSequenceSteps(selectedPreset).forEach((_, idx) => {
                            newSettings[idx] = {
                              attach: true,
                              packId: selectedPackId
                            }
                          })
                          setPerEmailPackSettings(newSettings)
                          toast.success('Pack applied to all emails')
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Apply to all emails
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {getSequenceSteps(selectedPreset).map((step, idx) => {
                        const emailSettings = perEmailPackSettings[idx] || {
                          attach: true,
                          packId: selectedPackId
                        }
                        
                        return (
                          <div 
                            key={idx}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              idx === previewEmailIndex ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                {idx + 1}
                              </div>
                              <div className="text-sm">
                                <div className="font-medium">Email {idx + 1}</div>
                                <div className="text-xs text-gray-500">Day {step.day}</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              {/* Show variant as static badge (not selectable) */}
                              {(() => {
                                const selectedPack = allPacks.find(p => p.id === selectedPackId);
                                const packVariant = selectedPack?.variant || 'professional';
                                
                                const variantInfo: Record<string, { icon: string; label: string }> = {
                                  professional: { icon: '📊', label: 'Professional' },
                                  luxury: { icon: '✨', label: 'Luxury' },
                                  minimal: { icon: '⚪', label: 'Minimal' },
                                  creative: { icon: '🎨', label: 'Creative' },
                                  energetic: { icon: '⚡', label: 'Energetic' },
                                  moderntech: { icon: '🚀', label: 'Modern Tech' }
                                };
                                
                                const variant = variantInfo[packVariant] || variantInfo.professional;
                                
                                return (
                                  <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-gradient-to-r from-purple-50 to-blue-50 text-gray-700 border border-purple-200 capitalize flex items-center gap-1.5">
                                    <span>{variant.icon}</span>
                                    <span>{variant.label}</span>
                                  </span>
                                );
                              })()}
                              
                              {/* Attach pack checkbox */}
                              <label className="flex items-center gap-2 text-xs cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={emailSettings.attach}
                                  onChange={(e) => {
                                    setPerEmailPackSettings({
                                      ...perEmailPackSettings,
                                      [idx]: {
                                        ...emailSettings,
                                        attach: e.target.checked,
                                        packId: selectedPackId
                                      }
                                    })
                                  }}
                                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="font-medium text-gray-700 group-hover:text-blue-600 transition">
                                  Attach pack
                                </span>
                              </label>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    
                    <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
                      💡 Tip: Attach full pack on Email 1, then lighter one-pagers on follow-ups
                    </div>
                  </div>
                )}
                
                {/* Keyboard Shortcuts Hint */}
                <div className="mt-3 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
                  <div className="font-medium mb-1">⌨️ Keyboard Shortcuts:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><kbd className="px-1 py-0.5 bg-white border rounded">⌘E</kbd> Toggle edit mode</div>
                    <div><kbd className="px-1 py-0.5 bg-white border rounded">⌘M</kbd> Toggle pack</div>
                    <div><kbd className="px-1 py-0.5 bg-white border rounded">⌘P</kbd> Preview pack</div>
                    <div><kbd className="px-1 py-0.5 bg-white border rounded">ESC</kbd> Close/Exit</div>
                  </div>
                </div>
              </div>
              
              {/* Email Preview Card */}
              <div className="border rounded-lg overflow-hidden">
                
                {/* Email Header */}
                <div className="bg-gray-50 p-4 border-b space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-600">From:</span>
                    <span>Your Name (you@email.com)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-600">To:</span>
                    <span>{previewContact.contact.name} ({previewContact.contact.email})</span>
                  </div>
                  
                  {/* Editable Subject */}
                  <div className="flex items-start gap-2 text-sm">
                    <span className="font-medium text-gray-600 pt-2">Subject:</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editedSubject}
                        onChange={(e) => setEditedSubject(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg font-semibold"
                        placeholder="Email subject..."
                      />
                    ) : (
                      <span className="font-semibold pt-2">
                        {editedSubject || getEmailSubject(previewEmailIndex, previewContact)}
                      </span>
                    )}
                  </div>
                  
                  {/* Attachment info - Dynamic based on pack settings */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-600">Attached:</span>
                    {attachMediaPack && selectedPackId ? (() => {
                      const pack = allPacks.find(p => p.id === selectedPackId)
                      return (
                        <span className="flex items-center gap-2">
                          📎 {pack?.fileName || pack?.brandName || 'Media Pack'}.pdf
                          {pack?.fileUrl && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(pack.fileUrl, '_blank')
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700 underline"
                            >
                              view
                            </button>
                          )}
                        </span>
                      )
                    })() : (
                      <span className="text-gray-500 italic">No attachment</span>
                    )}
                  </div>
                </div>

                {/* Email Body - Editable */}
                <div className="p-6 bg-white">
                  {isEditMode ? (
                    <div className="space-y-2">
                      <textarea
                        value={editedBody}
                        onChange={(e) => setEditedBody(e.target.value)}
                        className="w-full min-h-[400px] px-4 py-3 border rounded-lg font-sans text-gray-800"
                        placeholder="Email body..."
                      />
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{editedBody.length} characters</span>
                        <button
                          onClick={() => {
                            // Reset to original
                            setEditedSubject(getEmailSubject(previewEmailIndex, previewContact))
                            setEditedBody(getEmailBody(previewEmailIndex, previewContact))
                            toast.success('Reset to original')
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          🔄 Reset to original
                        </button>
                      </div>
                      
                      {/* AI Enhancement Buttons */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={async () => {
                            toast.info('Improving email with AI...')
                            try {
                              const response = await fetch('/api/outreach/improve-email', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  currentSubject: editedSubject,
                                  currentBody: editedBody,
                                  tone: 'professional'
                                })
                              })
                              
                              if (response.ok) {
                                const data = await response.json()
                                setEditedSubject(data.subject || editedSubject)
                                setEditedBody(data.body || editedBody)
                                toast.success('Email improved with AI!')
                              } else {
                                toast.error('Failed to improve email')
                              }
                            } catch (error) {
                              console.error('AI improve error:', error)
                              toast.error('Failed to improve email')
                            }
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                          ✨ AI Improve
                        </button>
                        
                        <button
                          onClick={() => {
                            // Shorten the email
                            const shortened = editedBody.split('\n\n').slice(0, 2).join('\n\n') + '\n\nBest regards,\nYour Name'
                            setEditedBody(shortened)
                            toast.success('Email shortened')
                          }}
                          className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
                        >
                          ✂️ Make Shorter
                        </button>
                        
                        <button
                          onClick={() => {
                            // Make more casual
                            const casual = editedBody
                              .replace(/I am /g, "I'm ")
                              .replace(/Would you be open/g, 'Would you be up for')
                              .replace(/Best regards/g, 'Thanks')
                              .replace(/I would /g, "I'd ")
                            setEditedBody(casual)
                            toast.success('Tone adjusted to casual')
                          }}
                          className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
                        >
                          😊 More Casual
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap font-sans text-gray-800">
                      {editedBody || getEmailBody(previewEmailIndex, previewContact)}
                    </div>
                  )}
                </div>

                {/* Unsubscribe Footer Preview */}
                <div className="p-4 bg-gray-50 border-t">
                  <div className="text-xs text-gray-500">
                    If you'd prefer not to receive emails like this, you can{' '}
                    <span className="text-blue-600 underline">unsubscribe here</span>.
                  </div>
                </div>
              </div>

              {/* Sequence Info (for multi-email) */}
              {outreachMode === 'sequence' && previewEmailIndex > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-800">
                    📅 This email will be sent {getSequenceSteps(selectedPreset)[previewEmailIndex].day} days after the first email
                    {getSequenceSteps(selectedPreset)[previewEmailIndex].day > 0 && (
                      <span className="block mt-1 text-xs">
                        ⚠️ Only if {previewContact.contact.name} doesn't reply to previous emails
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Edit Mode Info */}
              {isEditMode && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm text-yellow-800">
                    ✏️ Edits will be saved when you send this {outreachMode === 'sequence' ? 'sequence' : 'email'}. You can edit each email individually.
                  </div>
                  <div className="text-xs text-yellow-700 mt-1">
                    💡 Tip: Press <kbd className="px-1 py-0.5 bg-white border rounded text-xs">Cmd+E</kbd> to toggle edit mode
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {outreachMode === 'sequence' ? (
                  <>
                    Email {previewEmailIndex + 1} of {getSequenceSteps(selectedPreset).length}
                  </>
                ) : (
                  'Single email ready to send'
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Use edited content if available
                    const contactToSend = {
                      ...previewContact,
                      emailPreview: {
                        subject: editedSubject || getEmailSubject(previewEmailIndex, previewContact),
                        body: editedBody || getEmailBody(previewEmailIndex, previewContact)
                      }
                    }
                    sendOutreach(contactToSend);
                    setShowPreviewModal(false);
                    // Reset edit state
                    setIsEditMode(false);
                    setEditedSubject('');
                    setEditedBody('');
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  {outreachMode === 'sequence' ? '📤 Send Sequence' : '📧 Send Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
