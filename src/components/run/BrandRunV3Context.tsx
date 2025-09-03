'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { flags } from '@/config/flags'

// Step names for observability
const STEP_NAMES = [
  'Connect',
  'Audit', 
  'Matches',
  'Approve',
  'Pack',
  'Contacts',
  'Outreach',
  'Send'
] as const

interface BrandRunV3ContextType {
  workspaceId: string
  currentStep: number
  setCurrentStep: (step: number) => void
  stepData: Record<string, any>
  setStepData: (step: string, data: any) => void
  isDirty: boolean
  setIsDirty: (dirty: boolean) => void
  goNext: () => void
  goBack: () => void
  canEnter: (stepIndex: number) => boolean
  saveToLocalStorage: () => void
  loadFromLocalStorage: () => void
  restart: () => void
}

const BrandRunV3Context = createContext<BrandRunV3ContextType | undefined>(undefined)

interface BrandRunV3ProviderProps {
  children: ReactNode
  workspaceId: string
  initialStep?: number
}

export function BrandRunV3Provider({ 
  children, 
  workspaceId, 
  initialStep = 0 
}: BrandRunV3ProviderProps) {
  const [currentStep, setCurrentStepState] = useState(initialStep)
  
  // Wrapper function with observability beacon
  const setCurrentStep = (step: number) => {
    setCurrentStepState(step)
    
    // Observability beacon for step enter
    if (flags.observability) {
      console.info({
        event: 'brandrun_step_enter',
        stepIndex: step,
        stepName: STEP_NAMES[step] || 'Unknown'
      })
    }
  }
  const [stepData, setStepDataState] = useState<Record<string, any>>({})
  const [isDirty, setIsDirty] = useState(false)

  const storageKey = `brandrun.v3:${workspaceId}`

  // Load from localStorage on mount
  useEffect(() => {
    loadFromLocalStorage()
  }, [workspaceId])

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveToLocalStorage()
  }, [currentStep, stepData, isDirty])

  const setStepData = React.useCallback((step: string, data: any) => {
    setStepDataState(prev => ({
      ...prev,
      [step]: data
    }))
  }, [])

  const saveToLocalStorage = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const state = {
          currentStep,
          stepData,
          isDirty,
          timestamp: Date.now()
        }
        localStorage.setItem(storageKey, JSON.stringify(state))
      } catch (error) {
        console.warn('Failed to save to localStorage:', error)
      }
    }
  }, [currentStep, stepData, isDirty, storageKey])

  // Helper function to determine the appropriate starting step
  const determineStartingStep = React.useCallback((savedStepData: Record<string, any>, savedCurrentStep: number): number => {
    const STEP_IDS = ['CONNECT', 'AUDIT', 'MATCHES', 'APPROVE', 'PACK', 'CONTACTS', 'OUTREACH', 'DONE']
    
    // Check if run is completed (all steps done)
    const isRunCompleted = STEP_IDS.every((stepId, index) => {
      const stepDataForStep = savedStepData[stepId]
      switch (index) {
        case 0: return stepDataForStep?.hasConnections // CONNECT
        case 1: return stepDataForStep?.hasRun // AUDIT
        case 2: return stepDataForStep?.hasRun // MATCHES
        case 3: return stepDataForStep?.selectedBrands?.length > 0 // APPROVE
        case 4: return stepDataForStep?.hasGenerated // PACK
        case 5: return stepDataForStep?.selectedContacts?.length > 0 // CONTACTS
        case 6: return stepDataForStep?.hasCreated // OUTREACH
        case 7: return stepDataForStep?.isStarted // DONE
        default: return false
      }
    })
    
    // If run is completed, start from the beginning for a new run
    if (isRunCompleted) {
      return 0
    }
    
    // Find the furthest completed step
    let furthestCompletedStep = -1
    for (let i = 0; i < STEP_IDS.length; i++) {
      const stepId = STEP_IDS[i]
      const stepDataForStep = savedStepData[stepId]
      
      const isStepCompleted = (() => {
        switch (i) {
          case 0: return stepDataForStep?.hasConnections // CONNECT
          case 1: return stepDataForStep?.hasRun // AUDIT
          case 2: return stepDataForStep?.hasRun // MATCHES
          case 3: return stepDataForStep?.selectedBrands?.length > 0 // APPROVE
          case 4: return stepDataForStep?.hasGenerated // PACK
          case 5: return stepDataForStep?.selectedContacts?.length > 0 // CONTACTS
          case 6: return stepDataForStep?.hasCreated // OUTREACH
          case 7: return stepDataForStep?.isStarted // DONE
          default: return false
        }
      })()
      
      if (isStepCompleted) {
        furthestCompletedStep = i
      } else {
        break // Stop at first incomplete step
      }
    }
    
    // If no steps completed, start at beginning
    if (furthestCompletedStep === -1) {
      return 0
    }
    
    // Start at the next step after the furthest completed step
    // But don't go beyond the saved current step or the last step
    const nextStep = Math.min(furthestCompletedStep + 1, savedCurrentStep, STEP_IDS.length - 1)
    return nextStep
  }, [])

  const loadFromLocalStorage = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          const state = JSON.parse(saved)
          // Only load if the data is recent (within 24 hours)
          if (Date.now() - state.timestamp < 24 * 60 * 60 * 1000) {
            // Determine smart starting step based on completion state
            const smartStartingStep = determineStartingStep(state.stepData || {}, state.currentStep || initialStep)
            
            setCurrentStepState(smartStartingStep)
            setStepDataState(state.stepData || {})
            setIsDirty(state.isDirty || false)
          }
        }
      } catch (error) {
        console.warn('Failed to load from localStorage:', error)
      }
    }
  }, [storageKey, initialStep, determineStartingStep])

  const canEnter = React.useCallback((stepIndex: number): boolean => {
    // Can always go to step 0 (first step)
    if (stepIndex === 0) return true
    
    // Check if all previous steps are complete
    for (let i = 0; i < stepIndex; i++) {
      const stepId = ['CONNECT', 'AUDIT', 'MATCHES', 'APPROVE', 'PACK', 'CONTACTS', 'OUTREACH', 'DONE'][i]
      const stepDataForStep = stepData[stepId]
      
      // Check specific requirements for each step
      switch (i) {
        case 0: // CONNECT - needs at least one connection
          if (!stepDataForStep?.hasConnections) return false
          break
        case 1: // AUDIT - needs audit completed
          if (!stepDataForStep?.hasRun) return false
          break
        case 2: // MATCHES - needs matches found
          if (!stepDataForStep?.hasRun) return false
          break
        case 3: // APPROVE - needs at least one brand selected
          if (!stepDataForStep?.selectedBrands?.length) return false
          break
        case 4: // PACK - needs media pack generated
          if (!stepDataForStep?.hasGenerated) return false
          break
        case 5: // CONTACTS - needs at least one contact selected
          if (!stepDataForStep?.selectedContacts?.length) return false
          break
        case 6: // OUTREACH - needs sequence created
          if (!stepDataForStep?.hasCreated) return false
          break
        case 7: // DONE - needs sequence started
          if (!stepDataForStep?.isStarted) return false
          break
      }
    }
    
    return true
  }, [stepData])

  const goNext = React.useCallback(() => {
    if (currentStep < 7) { // 0-7 for 8 steps
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep, setCurrentStep])

  const goBack = React.useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep, setCurrentStep])

  const restart = React.useCallback(() => {
    // Reset all state to initial values
    setCurrentStepState(0)
    setStepDataState({})
    setIsDirty(false)
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(storageKey)
      } catch (error) {
        console.warn('Failed to clear localStorage:', error)
      }
    }
    
    // Observability beacon for restart
    if (flags.observability) {
      console.info({
        event: 'brandrun_restart',
        stepIndex: 0,
        stepName: 'Connect'
      })
    }
  }, [storageKey])

  const value: BrandRunV3ContextType = React.useMemo(() => ({
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
    saveToLocalStorage,
    loadFromLocalStorage,
    restart
  }), [
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
    saveToLocalStorage,
    loadFromLocalStorage,
    restart
  ])

  return (
    <BrandRunV3Context.Provider value={value}>
      {children}
    </BrandRunV3Context.Provider>
  )
}

export function useBrandRunV3() {
  const context = useContext(BrandRunV3Context)
  if (context === undefined) {
    throw new Error('useBrandRunV3 must be used within a BrandRunV3Provider')
  }
  return context
}