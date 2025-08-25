'use client'

import { ReactNode } from 'react'
import { CheckCircle, Circle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'

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
    <div className="p-6 bg-warn/10 border border-warn/20 rounded-lg">
      <div className="flex gap-4 mb-4">
        <div className="text-2xl text-warn">!</div>
        <div className="flex-1">
          <h3 className="font-medium text-text mb-3">
            {title}
          </h3>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-warn mt-0.5">•</span>
                <span className="text-sm text-text">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {actions && actions.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-text">Quick actions:</p>
          <div className="flex gap-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                variant={action.variant || 'primary'}
                size="sm"
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
