'use client'
import { ConnectStep, AuditStep, MatchesStep, ApproveStep, PackStep, ContactsStep, OutreachStep, CompleteStep } from './StepScreens'
import React from 'react'

interface StepSelectorProps {
  step?: string
}

export default function StepSelector({ step = 'CONNECT' }: StepSelectorProps) {
  const stepMap: Record<string, React.ComponentType> = {
    CONNECT: ConnectStep,
    AUDIT: AuditStep,
    MATCHES: MatchesStep,
    APPROVE: ApproveStep,
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
