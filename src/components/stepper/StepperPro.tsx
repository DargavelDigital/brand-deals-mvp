'use client'

import { Check, Circle } from 'lucide-react'

interface Step {
  id: string
  label: string
  description?: string
}

interface StepperProProps {
  steps: Step[]
  currentIndex: number
  className?: string
}

export default function StepperPro({ steps, currentIndex }: StepperProProps) {
  const getStepState = (index: number) => {
    if (index < currentIndex) return 'completed'
    if (index === currentIndex) return 'current'
    return 'next'
  }

  const getStepIcon = (index: number) => {
    const state = getStepState(index)
    if (state === 'completed') return <Check />
    if (state === 'current') return <Circle />
    return <Circle />
  }

  return (
    <div>
      <ol aria-label="Brand Run progress">
        {steps.map((s, i) => {
          const state = getStepState(i)
          return (
            <li key={s.id}>
              <div>
                <div>
                  {getStepIcon(i)}
                </div>
                <div>
                  <div>{s.label}</div>
                  {s.description && (
                    <div>
                      {s.description}
                    </div>
                  )}
                </div>
              </div>
              {i < steps.length - 1 && (
                <div>
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
