'use client'

import { ReactNode } from 'react'
import Button from '@/components/ui/Button'

interface PrereqProps {
  title: string
  items: string[]
  actions?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }[]
  className?: string
}

export default function Prereq({ title, items, actions }: PrereqProps) {
  return (
    <div>
      <div>
        <div>
          <span>!</span>
        </div>
        <div>
          <h3>
            {title}
          </h3>
          <div>
            {items.map((item, index) => (
              <div key={index}>
                <span></span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {actions && actions.length > 0 && (
        <div>
          <p>Quick actions:</p>
          <div>
            {actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
