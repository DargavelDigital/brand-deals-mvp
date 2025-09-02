'use client'

import React from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { RunProgressWheel } from './RunProgressWheel'
import { BrandRunV3Provider, useBrandRunV3 } from './BrandRunV3Context'
import { toast } from 'sonner'

// Import step components
import StepConnectEmbed from './steps/StepConnectEmbed'
import StepAuditEmbed from './steps/StepAuditEmbed'
import StepMatchesEmbed from './steps/StepMatchesEmbed'
import StepApproveEmbed from './steps/StepApproveEmbed'
import StepContactsApproveEmbed from './steps/StepContactsApproveEmbed'
import StepPackEmbed from './steps/StepPackEmbed'
import StepOutreachEmbed from './steps/StepOutreachEmbed'
import StepSendEmbed from './steps/StepSendEmbed'

interface BrandRunV3Props {
  initialRun?: any
}

const STEPS = [
  { id: 'CONNECT', title: 'Choose Channels', component: StepConnectEmbed },
  { id: 'AUDIT', title: 'Audit', component: StepAuditEmbed },
  { id: 'MATCHES', title: 'Matches', component: StepMatchesEmbed },
  { id: 'APPROVE', title: 'Approve Brands', component: StepApproveEmbed },
  { id: 'PACK', title: 'Media Packs', component: StepPackEmbed },
  { id: 'CONTACTS', title: 'Contacts', component: StepContactsApproveEmbed },
  { id: 'OUTREACH', title: 'Outreach', component: StepOutreachEmbed },
  { id: 'DONE', title: 'Send', component: StepSendEmbed }
] as const

type StepId = typeof STEPS[number]['id']

function BrandRunV3Content({ initialRun }: BrandRunV3Props) {
  const { 
    workspaceId, 
    currentStep, 
    setCurrentStep, 
    stepData, 
    setStepData, 
    isDirty, 
    setIsDirty, 
    goNext, 
    goBack,
    canEnter,
    restart
  } = useBrandRunV3()

  const currentStepData = stepData[STEPS[currentStep].id] || {}
  const currentStepComponent = STEPS[currentStep].component

  // Guards for specific steps - check if current step requirements are satisfied
  const canGoNext = React.useMemo(() => {
    switch (currentStep) {
      case 0: // CONNECT - needs at least one connection
        return currentStepData.hasConnections || isDirty
      case 1: // AUDIT - needs audit completed
        return currentStepData.hasRun || isDirty
      case 2: // MATCHES - needs matches found
        return currentStepData.hasRun || isDirty
      case 3: // APPROVE - needs at least one brand selected
        return currentStepData.selectedBrands?.length > 0
      case 4: // PACK - needs media pack generated
        return currentStepData.hasGenerated || isDirty
      case 5: // CONTACTS - needs at least one contact selected
        return currentStepData.selectedContacts?.length > 0
      case 6: // OUTREACH - needs sequence created
        return currentStepData.hasCreated || isDirty
      case 7: // DONE - needs sequence started
        return currentStepData.isStarted || isDirty
      default:
        return isDirty
    }
  }, [currentStep, currentStepData, isDirty])

  const canGoBack = currentStep > 0

  const handleStepClick = async (stepIndex: number) => {
    if (stepIndex === currentStep) return
    
    // Check if we can enter this step
    if (stepIndex > currentStep && !canEnter(stepIndex)) {
      toast.error("Complete previous step first.")
      return
    }
    
    // Just update the local state - no need to update database
    setCurrentStep(stepIndex)
  }

  const handleNext = async () => {
    if (!canGoNext) {
      toast.error("Complete this step to continue.")
      return
    }
    
    // Just advance locally - no need to update database
    goNext()
  }

  const handleBack = () => {
    if (canGoBack) {
      goBack()
    }
  }

  const handleDirtyChange = React.useCallback((dirty: boolean) => {
    setIsDirty(dirty)
  }, [])

  const handleDataChange = React.useCallback((data: any) => {
    setStepData(STEPS[currentStep].id, data)
  }, [currentStep, setStepData])

  const handleGoNext = React.useCallback(() => {
    handleNext()
  }, [handleNext])

  const handleRestart = React.useCallback(() => {
    const confirmed = window.confirm(
      'Are you sure you want to restart the Brand Run? This will clear all your progress and start from the beginning.'
    )
    
    if (confirmed) {
      restart()
      toast.success('Brand Run restarted successfully!')
    }
  }, [restart])

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader 
        title="Brand Run"
        subtitle="Audit your content, pick brands, build your media pack, discover contacts, and launch outreach — all in one guided flow."
      />

      {/* Main Content */}
      <div className="container-page">
        <div className="space-y-8">
          {/* Radial Progress Wheel */}
          <div className="flex justify-center">
            <RunProgressWheel 
              step={STEPS[currentStep].id as any}
              onStepClick={(stepId) => {
                const stepIndex = STEPS.findIndex(s => s.id === stepId)
                if (stepIndex !== -1) {
                  handleStepClick(stepIndex)
                }
              }}
              canEnterStep={canEnter}
              size={320}
            />
          </div>
          
          {/* Step Status Indicators */}
          <div className="flex justify-center space-x-2">
            {STEPS.map((step, index) => {
              const isCompleted = canEnter(index + 1)
              const isCurrent = index === currentStep
              const isAccessible = canEnter(index)
              
              return (
                <div
                  key={step.id}
                  className={`w-3 h-3 rounded-full ${
                    isCurrent 
                      ? 'bg-blue-600' 
                      : isCompleted 
                        ? 'bg-green-500' 
                        : isAccessible 
                          ? 'bg-gray-300' 
                          : 'bg-gray-200'
                  }`}
                  title={`${step.title} - ${isCurrent ? 'Current' : isCompleted ? 'Complete' : isAccessible ? 'Available' : 'Locked'}`}
                />
              )
            })}
          </div>

          {/* Navigation Bar - Integrated below radial */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              {/* Step Info */}
              <div className="space-y-1">
                <div className="text-sm text-muted">
                  Step {currentStep + 1} of {STEPS.length}
                </div>
                <div className="text-lg font-semibold text-text">
                  {STEPS[currentStep].title}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleRestart}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                  title="Restart Brand Run from the beginning"
                >
                  🔄 Restart
                </button>
                
                <button
                  onClick={handleBack}
                  disabled={!canGoBack}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Back
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={!canGoNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>

            {/* Guard Messages */}
            {!canGoNext && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm text-yellow-800">
                  {currentStep === 3 && "Select at least one brand to continue"}
                  {currentStep === 5 && "Select at least one contact to continue"}
                  {currentStep === 7 && "Create an outreach sequence to continue"}
                  {![3, 5, 7].includes(currentStep) && "Complete this step to continue"}
                </div>
              </div>
            )}
          </div>

          {/* Step Content - Full Width */}
          <div className="w-full">
            {React.createElement(currentStepComponent, {
              workspaceId,
              onDirtyChange: handleDirtyChange,
              data: currentStepData,
              setData: handleDataChange,
              goNext: handleGoNext
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BrandRunV3({ initialRun }: BrandRunV3Props) {
  // Extract workspace ID from initialRun or use a default
  const workspaceId = initialRun?.workspaceId || 'demo-workspace'
  
  // Map the initial step to our step index
  const getInitialStepIndex = (stepId?: string) => {
    if (!stepId) return 0
    const index = STEPS.findIndex(s => s.id === stepId)
    return index !== -1 ? index : 0
  }

  const initialStepIndex = getInitialStepIndex(initialRun?.step)

  return (
    <BrandRunV3Provider 
      workspaceId={workspaceId} 
      initialStep={initialStepIndex}
    >
      <BrandRunV3Content initialRun={initialRun} />
    </BrandRunV3Provider>
  )
}
