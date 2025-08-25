'use client'

import { useState } from 'react'
import { CheckCircle, Circle, Clock } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Brand {
  name: string
  logoUrl?: string
  description?: string
  categories: string[]
}

const mockBrands: Brand[] = [
  {
    name: 'Nike',
    logoUrl: '/api/placeholder/48/48',
    description: 'Global athletic footwear and apparel brand',
    categories: ['Sports', 'Athletics', 'Lifestyle']
  },
  {
    name: 'Apple',
    logoUrl: '/api/placeholder/48/48',
    description: 'Technology company known for innovative products',
    categories: ['Technology', 'Consumer Electronics', 'Software']
  },
  {
    name: 'Starbucks',
    logoUrl: '/api/placeholder/48/48',
    description: 'Coffeehouse chain and roastery reserves',
    categories: ['Food & Beverage', 'Retail', 'Hospitality']
  }
]

export default function SwipePage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [approvedBrands, setApprovedBrands] = useState<Brand[]>([])

  const currentBrand = mockBrands[currentIndex]
  const matchReasons = [
    'High audience overlap with your content',
    'Similar brand values and messaging',
    'Active in creator partnerships'
  ]

  const handleApprove = () => {
    if (currentBrand) {
      setApprovedBrands(prev => [...prev, currentBrand])
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handleSkip = () => {
    setCurrentIndex(prev => prev + 1)
  }

  const handleSave = () => {
    if (currentBrand) {
      setApprovedBrands(prev => [...prev, currentBrand])
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handleStartOutreach = () => {
    if (currentBrand) {
      // Navigate to outreach flow
      console.log('Starting outreach for:', currentBrand.name)
    }
  }

  if (currentIndex >= mockBrands.length) {
    return (
      <Section 
        title="Brand Discovery Complete!" 
        description="You've reviewed all available brands."
      >
        <Card>
          <div className="text-center space-y-6">
            <div className="text-2xl font-bold text-text">
              Approved Brands: {approvedBrands.length}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedBrands.map((brand, index) => (
                <div key={index} className="p-4 bg-surface rounded-lg border border-border">
                  <h3 className="font-semibold text-text mb-2">{brand.name}</h3>
                  <p className="text-sm text-muted">{brand.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </Section>
    )
  }

  return (
    <Section title="Discover Brands" description="Swipe or shortlist">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockBrands.map((brand) => (
          <BrandCard
            key={brand.name}
            brand={brand}
            onShortlist={() => handleShortlist(brand.name)}
            onSkip={() => handleSkip(brand.name)}
            onDetails={() => handleDetails(brand.name)}
          />
        ))}
      </div>
    </Section>
  );
}
