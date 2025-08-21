'use client';

import { useState } from 'react';
import { BrandCard } from '@/components/swipe/BrandCard';

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
    <div className={`space-y-6 ${className}`}>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)] mb-2">Brand Matches</h1>
        <p className="text-[var(--muted)]">
          Based on your content audit, here are the brands that best match your audience and style.
        </p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
        <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Recommended Brands</h2>
        
        <div className="space-y-4">
          {mockBrands.map((brand) => (
            <div key={brand.id} className="border border-[var(--border)] rounded-lg overflow-hidden">
              <BrandCard
                brand={brand}
                matchReasons={mockMatchReasons}
                onApprove={() => handleApprove(brand.id)}
                onStartOutreach={() => {}} // Not used in this step
                onSave={() => {}} // Not used in this step
                onSkip={() => handleSkip(brand.id)}
              />
              <div className="px-6 py-3 bg-[var(--panel)] border-t border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-[var(--muted)]">Match Score:</span>
                    <span className="text-lg font-bold text-[var(--brand)]">{brand.matchScore}%</span>
                  </div>
                  <div className="flex space-x-2">
                    {selectedBrands.includes(brand.id) ? (
                      <button
                        onClick={() => handleApprove(brand.id)}
                        className="px-4 py-2 bg-[var(--positive)] hover:bg-[var(--positive)]/90 text-white font-medium rounded-lg transition-colors"
                      >
                        ✓ Approved
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApprove(brand.id)}
                        className="px-4 py-2 bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white font-medium rounded-lg transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleSkip(brand.id)}
                      className="px-4 py-2 text-[var(--muted)] hover:bg-[var(--panel)] font-medium rounded-lg transition-colors border border-[var(--border)]"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-[var(--panel)] rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[var(--text)]">
                {selectedBrands.length} brand{selectedBrands.length !== 1 ? 's' : ''} selected
              </div>
              <div className="text-xs text-[var(--muted)]">
                {canContinue ? 'Ready to continue' : 'Select at least 1 brand to continue'}
              </div>
            </div>
            <button
              onClick={() => onContinue(selectedBrands)}
              disabled={!canContinue}
              className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                canContinue
                  ? 'bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white'
                  : 'bg-[var(--muted)] text-[var(--text)] cursor-not-allowed'
              }`}
            >
              Approve & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
