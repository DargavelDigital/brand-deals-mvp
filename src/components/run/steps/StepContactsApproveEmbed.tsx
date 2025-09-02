'use client'
import React, { useState, useEffect } from 'react'
import DiscoverContactsPage from '@/components/contacts/DiscoverContactsPage'

interface StepContactsApproveEmbedProps {
  workspaceId: string
  onDirtyChange: (dirty: boolean) => void
  data: any
  setData: (data: any) => void
  goNext: () => void
}

export default function StepContactsApproveEmbed({ 
  workspaceId, 
  onDirtyChange, 
  data, 
  setData, 
  goNext 
}: StepContactsApproveEmbedProps) {
  const [hasContacts, setHasContacts] = useState(false)

  useEffect(() => {
    onDirtyChange(hasContacts)
    setData(prevData => ({ ...prevData, hasContacts }))
  }, [hasContacts, onDirtyChange, setData])

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="text-center">
        <p className="text-muted-foreground">
          Select contacts from your existing list and approve them for your outreach campaign.
        </p>
        <a 
          href="/tools/contacts" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
        >
          Learn more about contact discovery →
        </a>
      </div>

      {/* Use the same DiscoverContactsPage component as the individual tool page */}
      <DiscoverContactsPage />
    </div>
  )
}
