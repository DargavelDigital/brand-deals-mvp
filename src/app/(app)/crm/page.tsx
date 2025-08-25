'use client'

import { useState } from 'react'
import { Plus, Search, Filter, MoreHorizontal, DollarSign, Calendar, User } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { DealCard } from '@/components/crm/DealCard'

interface Deal {
  id: string
  title: string
  value: number
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  lastActivity: Date
}

const mockDeals: Deal[] = [
  {
    id: '1',
    title: 'Summer Campaign Partnership',
    value: 5000,
    status: 'PENDING',
    lastActivity: new Date('2024-01-15')
  },
  {
    id: '2',
    title: 'Product Launch Collaboration',
    value: 8000,
    status: 'ACTIVE',
    lastActivity: new Date('2024-01-14')
  },
  {
    id: '3',
    title: 'Holiday Season Promotion',
    value: 3000,
    status: 'COMPLETED',
    lastActivity: new Date('2024-01-10')
  }
]

export default function CRMPage() {
  const [deals] = useState<Deal[]>(mockDeals)

  const pendingDeals = deals.filter(deal => deal.status === 'PENDING')
  const activeDeals = deals.filter(deal => deal.status === 'ACTIVE')
  const completedDeals = deals.filter(deal => deal.status === 'COMPLETED')

  return (
    <Section title="CRM" description="Your pipeline">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold mb-3">Pending</h2>
          <div className="space-y-3">
            {pendingDeals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                brand={{
                  name: 'Demo Brand',
                  logoUrl: undefined
                }}
                onClick={() => console.log('Deal clicked:', deal.id)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold mb-3">Active</h2>
          <div className="space-y-3">
            {activeDeals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                brand={{
                  name: 'Demo Brand',
                  logoUrl: undefined
                }}
                onClick={() => console.log('Deal clicked:', deal.id)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold mb-3">Completed</h2>
          <div className="space-y-3">
            {completedDeals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                brand={{
                  name: 'Demo Brand',
                  logoUrl: undefined
                }}
                onClick={() => console.log('Deal clicked:', deal.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
