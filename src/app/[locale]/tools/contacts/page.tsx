'use client'

import { useState, useEffect } from 'react'
import DiscoverContactsPage from '@/components/contacts/DiscoverContactsPage'
import { SetupNotice } from '@/components/contacts/SetupNotice'
import { isToolEnabled } from '@/lib/launch'
import { ComingSoon } from '@/components/ComingSoon'
import PageShell from '@/components/PageShell'
import { WorkflowProgress } from '@/components/ui/WorkflowProgress'

export default function Page() { 
  const enabled = isToolEnabled("contacts")
  const [providersOk, setProvidersOk] = useState<boolean | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [useDemoMode, setUseDemoMode] = useState(false)
  
  // Check provider capabilities on client side
  useEffect(() => {
    const checkProviders = async () => {
      try {
        const res = await fetch('/api/contacts/capabilities')
        const data = await res.json()
        setProvidersOk(data.providersOk)
        setIsDemoMode(data.isDemoMode)
      } catch (err) {
        console.error('Failed to check provider capabilities:', err)
        setProvidersOk(false)
        setIsDemoMode(false)
      }
    }
    
    if (enabled) {
      checkProviders()
    }
  }, [enabled])
  
  const handleEnableDemo = () => {
    setUseDemoMode(true)
  }
  
  if (!enabled) {
    return (
      <PageShell title="Discover Contacts" subtitle="Find and manage potential brand partners.">
        {/* NEW: Workflow progress indicator */}
        <WorkflowProgress 
          currentStep={3} 
          steps={['Connect', 'Audit', 'Matches', 'Contacts', 'Pack', 'Outreach']}
        />
        
        <div className="mx-auto max-w-md">
          <ComingSoon
            title="Discover Contacts"
            subtitle="This tool will be enabled soon. The page is visible so you can navigate and preview the UI."
          />
        </div>
      </PageShell>
    )
  }
  
  // Show loading state while checking capabilities
  if (providersOk === null) {
    return (
      <PageShell title="Discover Contacts" subtitle="Find and manage potential brand partners.">
        {/* NEW: Workflow progress indicator */}
        <WorkflowProgress 
          currentStep={3} 
          steps={['Connect', 'Audit', 'Matches', 'Contacts', 'Pack', 'Outreach']}
        />
        
        <div className="mx-auto max-w-2xl">
          <div className="card p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--ds-primary)] mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Checking capabilities...</p>
          </div>
        </div>
      </PageShell>
    )
  }
  
  if (!providersOk && !useDemoMode) {
    return (
      <PageShell title="Discover Contacts" subtitle="Find and manage potential brand partners.">
        {/* NEW: Workflow progress indicator */}
        <WorkflowProgress 
          currentStep={3} 
          steps={['Connect', 'Audit', 'Matches', 'Contacts', 'Pack', 'Outreach']}
        />
        
        <div className="mx-auto max-w-2xl">
          <SetupNotice 
            isDemoMode={isDemoMode}
            onEnableDemo={handleEnableDemo}
          />
        </div>
      </PageShell>
    )
  }
  
  return (
    <PageShell title="Discover Contacts" subtitle="Find and manage potential brand partners.">
      {/* NEW: Workflow progress indicator */}
      <WorkflowProgress 
        currentStep={3} 
        steps={['Connect', 'Audit', 'Matches', 'Contacts', 'Pack', 'Outreach']}
      />
      
      <DiscoverContactsPage />
    </PageShell>
  )
}
