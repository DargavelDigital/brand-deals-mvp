'use client'

import { Badge } from '@/components/ui/Badge'
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react'

interface SLABadgeProps {
  lastInboundAt: Date | string
  className?: string
}

export default function SLABadge({ lastInboundAt, className = '' }: SLABadgeProps) {
  const lastInbound = new Date(lastInboundAt)
  const now = new Date()
  const hoursSinceInbound = (now.getTime() - lastInbound.getTime()) / (1000 * 60 * 60)

  let status: 'good' | 'warning' | 'critical'
  let label: string
  let icon: React.ReactNode
  let variant: 'default' | 'secondary' | 'destructive'

  if (hoursSinceInbound < 24) {
    status = 'good'
    label = 'Response due'
    icon = <Clock className="w-3 h-3 mr-1" />
    variant = 'default'
  } else if (hoursSinceInbound < 48) {
    status = 'warning'
    label = 'Due soon'
    icon = <AlertTriangle className="w-3 h-3 mr-1" />
    variant = 'secondary'
  } else {
    status = 'critical'
    label = 'Overdue'
    icon = <AlertTriangle className="w-3 h-3 mr-1" />
    variant = 'destructive'
  }

  return (
    <Badge variant={variant} className={`flex items-center text-xs ${className}`}>
      {icon}
      {label}
    </Badge>
  )
}

/**
 * Get SLA status for filtering purposes
 */
export function getSLAStatus(lastInboundAt: Date | string): 'good' | 'warning' | 'critical' {
  const lastInbound = new Date(lastInboundAt)
  const now = new Date()
  const hoursSinceInbound = (now.getTime() - lastInbound.getTime()) / (1000 * 60 * 60)

  if (hoursSinceInbound < 24) return 'good'
  if (hoursSinceInbound < 48) return 'warning'
  return 'critical'
}

/**
 * Get hours since last inbound for display
 */
export function getHoursSinceInbound(lastInboundAt: Date | string): number {
  const lastInbound = new Date(lastInboundAt)
  const now = new Date()
  return Math.floor((now.getTime() - lastInbound.getTime()) / (1000 * 60 * 60))
}
