'use client'
import React, { useState, useEffect } from 'react'
import OutreachPage from '@/components/outreach/OutreachPage'

interface StepOutreachEmbedProps {
  workspaceId: string
  onDirtyChange: (dirty: boolean) => void
  data: any
  setData: (data: any) => void
  goNext: () => void
}

export default function StepOutreachEmbed({ 
  workspaceId, 
  onDirtyChange, 
  data, 
  setData, 
  goNext 
}: StepOutreachEmbedProps) {
  const [hasCreated, setHasCreated] = useState(false)

  useEffect(() => {
    onDirtyChange(hasCreated)
    setData(prevData => ({ ...prevData, hasCreated }))
  }, [hasCreated, onDirtyChange, setData])

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="text-center">
        <p className="text-muted-foreground">
          Build a personalized outreach sequence to contact your selected brand partners.
        </p>
        <a 
          href="/tools/outreach" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
        >
          Learn more about outreach sequences →
        </a>
      </div>

      {/* Use the same OutreachPage component as the individual tool page */}
      <OutreachPage />
    </div>
  )
}
