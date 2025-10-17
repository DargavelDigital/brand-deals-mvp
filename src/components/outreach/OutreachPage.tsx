'use client'
import * as React from 'react'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { toast } from '@/hooks/useToast'
import { Button } from '@/components/ui/Button'
import { useLocale } from 'next-intl'
import { WorkflowProgress } from '@/components/ui/WorkflowProgress'
import { Mail, ExternalLink, CheckCircle } from 'lucide-react'

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
      
      // Send email via API
      const res = await fetch('/api/outreach/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: item.contact.id,
          brandId: item.brand?.id,
          mediaPackId: item.mediaPack?.id,
          subject: item.emailPreview.subject,
          body: item.emailPreview.body
        })
      })
      
      if (!res.ok) throw new Error('Failed to send')
      
      // Update status to sent
      setOutreachItems(items => 
        items.map(i => i.contact.id === item.contact.id ? { ...i, status: 'sent' } : i)
      )
      
      toast.success(`Email sent to ${item.contact.name}!`)
      
    } catch (error) {
      console.error('Failed to send email:', error)
      setOutreachItems(items => 
        items.map(i => i.contact.id === item.contact.id ? { ...i, status: 'error' } : i)
      )
      toast.error(`Failed to send email to ${item.contact.name}`)
    }
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
                </div>
                
                {/* RIGHT: ACTIONS */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setExpandedPreview(
                      expandedPreview === item.contact.id ? null : item.contact.id
                    )}
                    className="px-3 py-1.5 border rounded text-sm hover:bg-gray-50"
                  >
                    {expandedPreview === item.contact.id ? 'Hide' : 'Preview'}
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
              📤 Send All Outreach
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
