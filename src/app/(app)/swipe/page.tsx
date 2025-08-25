'use client'

import { useState } from 'react'
import { BrandCard } from '@/components/swipe/BrandCard'

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
      <div>
        <h1>Brand Discovery Complete!</h1>
        <p>You've reviewed all available brands.</p>
        <div>
          <p>Approved Brands: {approvedBrands.length}</p>
          {approvedBrands.map((brand, index) => (
            <div key={index}>
              <h3>{brand.name}</h3>
              <p>{brand.description}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div>
        <h1>Brand Discovery</h1>
        <p>Swipe through potential brand partnerships</p>
      </div>

      <div>
        <BrandCard
          brand={currentBrand}
          matchReasons={matchReasons}
          onApprove={handleApprove}
          onStartOutreach={handleStartOutreach}
          onSave={handleSave}
          onSkip={handleSkip}
        />
      </div>

      <div>
        <p>Progress: {currentIndex + 1} of {mockBrands.length}</p>
        <p>Approved: {approvedBrands.length}</p>
      </div>
    </div>
  )
}
