'use client';

import { useState } from 'react'
import { CheckCircle, Circle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button';

interface StepMatchesProps {
  onContinue: (selectedBrandIds: string[]) => void;
  className?: string;
}

interface Brand {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  categories: string[];
  matchScore: number;
}

export function StepMatches({ onContinue, className = '' }: StepMatchesProps) {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  
  const mockBrands: Brand[] = [
    {
      id: '1',
      name: 'Nike',
      description: 'Global athletic footwear and apparel brand',
      logoUrl: 'https://logo.clearbit.com/nike.com',
      categories: ['Fitness', 'Sports', 'Lifestyle'],
      matchScore: 94
    },
    {
      id: '2',
      name: 'Apple',
      description: 'Technology company known for innovative consumer electronics',
      logoUrl: 'https://logo.clearbit.com/apple.com',
      categories: ['Technology', 'Electronics', 'Lifestyle'],
      matchScore: 87
    },
    {
      id: '3',
      name: 'Starbucks',
      description: 'International coffeehouse chain',
      logoUrl: 'https://logo.clearbit.com/starbucks.com',
      categories: ['Food & Drink', 'Beverages', 'Lifestyle'],
      matchScore: 82
    }
  ];

  const mockMatchReasons = [
    'High audience overlap with your content',
    'Your content style matches their brand voice',
    'Recent campaigns align with your niche'
  ];

  const handleApprove = (brandId: string) => {
    if (selectedBrands.includes(brandId)) {
      setSelectedBrands(selectedBrands.filter(id => id !== brandId));
    } else {
      setSelectedBrands([...selectedBrands, brandId]);
    }
  };

  const handleSkip = (brandId: string) => {
    // Remove from selected if it was there
    setSelectedBrands(selectedBrands.filter(id => id !== brandId));
  };

  const canContinue = selectedBrands.length >= 1;

  return (
    <div>
      <div>
        <h1>Brand Matches</h1>
        <p>
          Based on your content audit, here are the brands that best match your audience and style.
        </p>
      </div>

      <div>
        <h2>Recommended Brands</h2>
        
        <div>
          {mockBrands.map((brand) => (
            <div key={brand.id}>
              <BrandCard
                brand={brand}
                matchReasons={mockMatchReasons}
                onApprove={() => handleApprove(brand.id)}
                onStartOutreach={() => {}} // Not used in this step
                onSave={() => {}} // Not used in this step
                onSkip={() => handleSkip(brand.id)}
              />
              <div>
                <div>
                  <div>
                    <span>Match Score:</span>
                    <span>{brand.matchScore}%</span>
                  </div>
                  <div>
                    {selectedBrands.includes(brand.id) ? (
                      <Button
                        onClick={() => handleApprove(brand.id)}
                      >
                        ✓ Approved
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleApprove(brand.id)}
                      >
                        Approve
                      </Button>
                    )}
                    <Button
                      onClick={() => handleSkip(brand.id)}
                    >
                      Skip
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div>
            <div>
              <div>
                {selectedBrands.length} brand{selectedBrands.length !== 1 ? 's' : ''} selected
              </div>
              <div>
                {canContinue ? 'Ready to continue' : 'Select at least 1 brand to continue'}
              </div>
            </div>
            <Button
              onClick={() => onContinue(selectedBrands)}
              disabled={!canContinue}
            >
              Approve & Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
