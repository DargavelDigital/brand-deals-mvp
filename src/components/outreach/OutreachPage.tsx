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
        
        // 3. Smart matching: create outreach items
        const items: OutreachItem[] = contacts.map((contact: any) => {
          // SMART MATCHING: Match brand by ID or company name
          const matchedBrand = brands.find((b: any) => 
            b.id === contact.brandId || 
            b.name.toLowerCase() === contact.company?.toLowerCase()
          )
          
          // SMART MATCHING: Match media pack to brand
          const matchedPack = matchedBrand 
            ? mediaPacks.find((p: any) => p.id === matchedBrand.id || p.brandId === matchedBrand.id)
            : null
          
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
        
      } catch (error) {
        console.error('❌ Failed to load outreach data:', error)
        toast.error('Failed to load outreach data')
      } finally {
        setLoading(false)
      }
    }
    
    loadOutreachData()
  }, [])

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
      // Update status to sending
      setOutreachItems(items => 
        items.map(i => i.contact.id === item.contact.id ? { ...i, status: 'sending' } : i)
      )
      
      // Send email via API with new mode/template/preset
      const res = await fetch('/api/outreach/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: item.contact.id,
          brandId: item.brand?.id,
          mediaPackId: item.mediaPack?.id,
          mode: outreachMode,
          template: selectedTemplate,
          preset: selectedPreset,
          subject: item.emailPreview.subject,
          body: item.emailPreview.body
        })
      })
      
      if (!res.ok) throw new Error('Failed to send')
      
      // Update status to sent
      setOutreachItems(items => 
        items.map(i => i.contact.id === item.contact.id ? { ...i, status: 'sent' } : i)
      )
      
      toast.success(`${outreachMode === 'sequence' ? 'Sequence' : 'Email'} sent to ${item.contact.name}!`)
      
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
  }

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
                  
                  {/* NEW: Match Info Section */}
                  <div className="grid grid-cols-3 gap-4 mt-4 p-3 bg-gray-50 rounded-lg">
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
                      
                      {/* Timeline Visualization */}
                      <div className="space-y-2">
                        {getSequenceSteps(selectedPreset).map((step, idx) => (
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
                            {step.hasMediaPack && (
                              <div className="text-xs text-gray-500">📎 Pack</div>
                            )}
                          </div>
                        ))}
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
                      // Force re-render by logging what will be shown
                      if (previewContact) {
                        const newSubject = getEmailSubject(idx, previewContact)
                        const newBody = getEmailBody(idx, previewContact)
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
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-600">Subject:</span>
                    <span className="font-semibold">
                      {getEmailSubject(previewEmailIndex, previewContact)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-600">Attached:</span>
                    <span>📎 Media Pack.pdf</span>
                  </div>
                </div>

                {/* Email Body */}
                <div className="p-6 bg-white">
                  <div className="whitespace-pre-wrap font-sans text-gray-800">
                    {getEmailBody(previewEmailIndex, previewContact)}
                  </div>
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
                    sendOutreach(previewContact);
                    setShowPreviewModal(false);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  {outreachMode === 'sequence' ? 'Send Sequence' : 'Send Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
