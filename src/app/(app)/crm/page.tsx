'use client'

import { useState } from 'react'
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
    <div>
      <div>
        <h1>CRM Pipeline</h1>
        <p>Manage your brand partnership deals</p>
      </div>

      <div>
        <div>
          <div>
            <h2>Pending</h2>
            <div>
              {pendingDeals.map((deal) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  brand={{
                    name: 'Demo Brand',
                    logoUrl: undefined
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <h2>Active</h2>
            <div>
              {activeDeals.map((deal) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  brand={{
                    name: 'Demo Brand',
                    logoUrl: undefined
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <h2>Completed</h2>
            <div>
              {completedDeals.map((deal) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  brand={{
                    name: 'Demo Brand',
                    logoUrl: undefined
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
