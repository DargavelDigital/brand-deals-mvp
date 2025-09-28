'use client'

import DiscoverContactsPage from '@/components/contacts/DiscoverContactsPage'
import { isToolEnabled } from '@/lib/launch'
import { ComingSoon } from '@/components/ComingSoon'
import PageShell from '@/components/PageShell'

export default function Page() { 
  const enabled = isToolEnabled("contacts")
  
  return (
    <PageShell title="Discover Contacts" subtitle="Find and manage potential brand partners.">
      {enabled ? (
        <DiscoverContactsPage />
      ) : (
        <div className="mx-auto max-w-md">
          <ComingSoon
            title="Discover Contacts"
            subtitle="This tool will be enabled soon. The page is visible so you can navigate and preview the UI."
          />
        </div>
      )}
    </PageShell>
  )
}
