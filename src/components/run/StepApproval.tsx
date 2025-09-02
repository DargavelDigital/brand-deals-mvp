'use client';

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button';
import BrandLogo from '@/components/media/BrandLogo';

interface StepApprovalProps {
  selectedBrandIds: string[];
  onContinue: () => void;
  onBack: () => void;
  className?: string;
}

export function StepApproval({ selectedBrandIds, onContinue, onBack, className = '' }: StepApprovalProps) {
  const [selectedBrands, setSelectedBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSelectedBrands = async () => {
      try {
        // Get the current brand run to fetch selected brands
        const response = await fetch('/api/brand-run/current');
        const data = await response.json();
        
        if (data?.data?.selectedBrandIds) {
          // Map the selected brand IDs to mock brand data
          const mockBrands = [
            { id: '1', name: 'Nike', logoUrl: 'https://logo.clearbit.com/nike.com', category: 'Fitness & Sports' },
            { id: '2', name: 'Apple', logoUrl: 'https://logo.clearbit.com/apple.com', category: 'Technology' },
            { id: '3', name: 'Starbucks', logoUrl: 'https://logo.clearbit.com/starbucks.com', category: 'Food & Beverage' },
          ];
          
          const brands = mockBrands.filter(brand => data.data.selectedBrandIds.includes(brand.id));
          setSelectedBrands(brands);
        }
      } catch (error) {
        console.error('Failed to fetch selected brands:', error);
        setSelectedBrands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSelectedBrands();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-text">Approvals</h1>
          <p className="text-muted max-w-2xl mx-auto">
            Loading your selected brands...
          </p>
        </div>
      </div>
    );
  }

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
        
        {selectedBrands.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted">No brands selected. Please go back to the matches step to select brands.</p>
            <Button onClick={onBack} variant="secondary" className="mt-4">
              ← Back to Selection
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {selectedBrands.map((brand) => (
            <div key={brand.id} className="p-6 bg-surface rounded-lg border border-border space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-text">{brand.name.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text text-lg">{brand.name}</h3>
                  <p className="text-sm text-muted">{brand.category}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted">Status</div>
                <div className="text-sm bg-success/10 text-success px-3 py-1 rounded-full font-medium">
                  ✓ Approved
                </div>
              </div>
              
              <div className="pt-2 border-t border-border">
                <div className="text-xs text-muted">
                  Ready for media pack generation
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {selectedBrands.length > 0 && (
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <div className="text-lg font-medium text-text">
                {selectedBrands.length} brand{selectedBrands.length !== 1 ? 's' : ''} ready for media pack
              </div>
              <div className="text-sm text-muted">
                We'll customize your media pack with these brand's colors and styling
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={onBack}
                variant="secondary"
                className="px-6"
              >
                ← Back to Selection
              </Button>
              <Button
                onClick={onContinue}
                className="px-8"
              >
                Create Media Pack →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
