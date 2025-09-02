'use client';

import { useState } from 'react'
import { CheckCircle, Circle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button';
import BrandCard from '@/components/matches/BrandCard';

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
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-text">Brand Matches</h1>
        <p className="text-muted max-w-2xl mx-auto">
          Based on your content audit, here are the brands that best match your audience and style.
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-text">Recommended Brands</h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockBrands.map((brand) => (
            <div key={brand.id} className="p-6 bg-surface rounded-lg border border-border space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-text">{brand.name.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text">{brand.name}</h3>
                  <p className="text-sm text-muted">{brand.description}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Match Score</span>
                  <span className="text-sm font-medium text-text">{brand.matchScore}%</span>
                </div>
                
                <div className="space-y-2">
                  <div className="text-xs text-muted">Match Reasons:</div>
                  {mockMatchReasons.map((reason, index) => (
                    <div key={index} className="text-xs text-muted">• {reason}</div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  {selectedBrands.includes(brand.id) ? (
                    <Button
                      onClick={() => handleApprove(brand.id)}
                      className="flex-1 bg-success text-white"
                    >
                      ✓ Approved
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleApprove(brand.id)}
                      className="flex-1"
                    >
                      Approve
                    </Button>
                  )}
                  <Button
                    onClick={() => handleSkip(brand.id)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Skip
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center space-y-4">
          <div className="space-y-2">
            <div className="text-lg font-medium text-text">
              {selectedBrands.length} brand{selectedBrands.length !== 1 ? 's' : ''} selected
            </div>
            <div className="text-sm text-muted">
              {canContinue ? 'Ready to continue to approval' : 'Select at least 1 brand to continue'}
            </div>
          </div>
          <Button
            onClick={() => onContinue(selectedBrands)}
            disabled={!canContinue}
            className="px-8"
          >
            Review Selection
          </Button>
        </div>
      </div>
    </div>
  );
}
