'use client'
import { ConnectStep, AuditStep, PackStep, ContactsStep, OutreachStep, CompleteStep } from './StepScreens'
import { StepMatches } from './StepMatches'
import { StepApproval } from './StepApproval'
import React, { useState } from 'react'
import { advance } from '@/services/brand-run/api'
import { useLocale } from 'next-intl'

interface StepSelectorProps {
  step?: string
}

export default function StepSelector({ step = 'CONNECT' }: StepSelectorProps) {
  const locale = useLocale()
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([])

  const handleMatchesContinue = async (brandIds: string[]) => {
    setSelectedBrandIds(brandIds)
    try {
      // Save the selected brands to the database
      await fetch('/api/brand-run/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedBrandIds: brandIds })
      })
      await advance('APPROVE')
      // Don't redirect, let the page re-render with the new step
      window.location.reload()
    } catch (error) {
      console.error('Failed to advance to approval step:', error)
    }
  }

  const handleApprovalContinue = async () => {
    try {
      await advance('PACK')
      // Don't redirect, let the page re-render with the new step
      window.location.reload()
    } catch (error) {
      console.error('Failed to advance to pack step:', error)
    }
  }

  const handleApprovalBack = async () => {
    try {
      await advance('MATCHES')
      // Don't redirect, let the page re-render with the new step
      window.location.reload()
    } catch (error) {
      console.error('Failed to go back to matches step:', error)
    }
  }

  const stepMap: Record<string, React.ComponentType<any>> = {
    CONNECT: ConnectStep,
    AUDIT: AuditStep,
    MATCHES: () => <StepMatches onContinue={handleMatchesContinue} />,
    APPROVE: () => <StepApproval selectedBrandIds={selectedBrandIds} onContinue={handleApprovalContinue} onBack={handleApprovalBack} />,
    PACK: PackStep,
    CONTACTS: ContactsStep,
    OUTREACH: OutreachStep,
    COMPLETE: CompleteStep
  }

  const StepComponent = stepMap[step] || ConnectStep

  // Wrap in error boundary to prevent crashes
  try {
    return <StepComponent />;
  } catch (error) {
    return <ConnectStep />
  }
}
