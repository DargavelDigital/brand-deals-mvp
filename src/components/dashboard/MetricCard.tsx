import { ReactNode } from 'react'

interface Badge {
  text: string
  tone: 'positive' | 'neutral' | 'negative'
}

interface MetricCardProps {
  label: string
  value: string | number
  delta?: {
    value: string | number
    isPositive: boolean
  }
  badge?: Badge
  icon?: ReactNode
  className?: string
}

const getBadgeColors = (tone: Badge['tone']) => {
  switch (tone) {
    case 'positive': return ''
    case 'negative': return ''
    case 'neutral': return ''
    default: return ''
  }
}

export default function MetricCard({ 
  label, 
  value, 
  delta, 
  badge, 
  icon 
}: MetricCardProps) {
  return (
    <div>
      <div>
        <div>
          <p>{label}</p>
          {icon && <div>{icon}</div>}
        </div>
        <div>
          <span>
            {value}
          </span>
          {delta && (
            <span>
              {delta.isPositive ? '+' : ''}{delta.value}
            </span>
          )}
        </div>
      </div>
      {badge && (
        <div>
          <div>
            {badge.text}
          </div>
        </div>
      )}
    </div>
  )
}
