'use client'
import OutreachPage from '@/components/outreach/OutreachPage'
import { isToolEnabled } from '@/lib/launch'
import { ComingSoon } from '@/components/ComingSoon'
import PageShell from '@/components/PageShell'
import { WorkflowProgress } from '@/components/ui/WorkflowProgress'

export default function Page(){ 
  const enabled = isToolEnabled("outreach")
  
  if (!enabled) {
    return (
      <PageShell title="Outreach" subtitle="Manage your outreach campaigns and track responses.">
        {/* NEW: Workflow progress indicator */}
        <WorkflowProgress 
          currentStep={5} 
          steps={['Connect', 'Audit', 'Matches', 'Contacts', 'Pack', 'Outreach']}
        />
        
        <div className="mx-auto max-w-md">
          <ComingSoon
            title="Outreach"
            subtitle="This tool will be enabled soon. The page is visible so you can navigate and preview the UI."
          />
        </div>
      </PageShell>
    )
  }
  
  return <OutreachPage/> 
}
