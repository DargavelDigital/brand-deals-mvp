'use client'

import DiscoverContactsPage from '@/components/contacts/DiscoverContactsPage'
import { isEnabledSocial } from '@/lib/launch'

export default function Page() { 
  // Check if we're in Instagram-only launch mode
  const igOnly = isEnabledSocial("instagram") && !isEnabledSocial("tiktok")
  
  if (igOnly) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-2">Discover Contacts</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Running in Instagram-only launch mode. Contact discovery will be available soon.
        </p>
        <div className="rounded-xl border p-8 text-center text-muted-foreground">
          <p>Contact discovery features are coming soon during our phased launch.</p>
        </div>
      </div>
    )
  }
  
  return <DiscoverContactsPage/> 
}
