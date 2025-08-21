'use client';

import { DashboardGrid, Col } from '@/ui/containers';
import { BrandCard } from '@/components/swipe/BrandCard';

export default function SwipePage() {
  // Mock data for demonstration
  const mockBrands = [
    {
      id: '1',
      name: 'Nike',
      description: 'Global athletic footwear and apparel brand',
      logoUrl: 'https://logo.clearbit.com/nike.com',
      categories: ['Fitness', 'Sports', 'Lifestyle']
    },
    {
      id: '2',
      name: 'Apple',
      description: 'Technology company known for innovative consumer electronics',
      logoUrl: 'https://logo.clearbit.com/apple.com',
      categories: ['Technology', 'Electronics', 'Lifestyle']
    },
    {
      id: '3',
      name: 'Starbucks',
      description: 'International coffeehouse chain',
      logoUrl: 'https://logo.clearbit.com/starbucks.com',
      categories: ['Food & Drink', 'Beverages', 'Lifestyle']
    }
  ];

  const mockMatchReasons = [
    'High audience overlap with your content',
    'Your content style matches their brand voice',
    'Recent campaigns align with your niche'
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Brand Discovery</h1>
        <p className="text-[var(--muted)]">Swipe through potential brand partnerships</p>
      </div>

      <DashboardGrid>
        {mockBrands.map((brand) => (
          <Col key={brand.id}>
            <BrandCard
              brand={brand}
              matchReasons={mockMatchReasons}
              onApprove={() => console.log('Approve:', brand.name)}
              onStartOutreach={() => console.log('Start outreach:', brand.name)}
              onSave={() => console.log('Save:', brand.name)}
              onSkip={() => console.log('Skip:', brand.name)}
            />
          </Col>
        ))}
      </DashboardGrid>
    </div>
  );
}
