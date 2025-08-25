'use client';

import { useState } from 'react'
import { Button } from '@/components/ui/Button';

interface StepApprovalProps {
  selectedBrandIds: string[];
  onContinue: () => void;
  onBack: () => void;
  className?: string;
}

export function StepApproval({ selectedBrandIds, onContinue, onBack, className = '' }: StepApprovalProps) {
  const mockBrands = [
    { id: '1', name: 'Nike', logoUrl: 'https://logo.clearbit.com/nike.com', category: 'Fitness & Sports' },
    { id: '2', name: 'Apple', logoUrl: 'https://logo.clearbit.com/apple.com', category: 'Technology' },
  ];

  const selectedBrands = mockBrands.filter(brand => selectedBrandIds.includes(brand.id));

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-text">Approvals</h1>
        <p className="text-muted max-w-2xl mx-auto">
          Review your selected brands before we proceed to create your media pack.
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-text">Selected Brands</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          {selectedBrands.map((brand) => (
            <div key={brand.id} className="p-4 bg-surface rounded-lg border border-border">
              <div className="flex items-center gap-4">
                <img 
                  src={brand.logoUrl} 
                  alt={`${brand.name} logo`}
                  className="w-12 h-12 rounded-lg object-contain"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-text mb-1">{brand.name}</h3>
                  <p className="text-sm text-muted">{brand.category}</p>
                </div>
                <div className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">
                  Approved
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center space-y-4">
          <div className="space-y-2">
            <div className="text-lg font-medium text-text">
              {selectedBrands.length} brand{selectedBrands.length !== 1 ? 's' : ''} ready for media pack
            </div>
            <div className="text-sm text-muted">
              We'll customize your media pack with these brand's colors and styling
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={onBack}
              variant="secondary"
            >
              Back
            </Button>
            <Button
              onClick={onContinue}
            >
              Proceed to Media Pack
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
