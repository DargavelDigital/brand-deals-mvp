'use client';

import Button from '@/components/ui/Button';

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
    <div>
      <div>
        <h1>Approvals</h1>
        <p>
          Review your selected brands before we proceed to create your media pack.
        </p>
      </div>

      <div>
        <h2>Selected Brands</h2>
        
        <div>
          {selectedBrands.map((brand) => (
            <div key={brand.id}>
              <div>
                <img 
                  src={brand.logoUrl} 
                  alt={`${brand.name} logo`}
                />
              </div>
              <div>
                <h3>{brand.name}</h3>
                <p>{brand.category}</p>
              </div>
              <div>
                Approved
              </div>
            </div>
          ))}
        </div>

        <div>
          <div>
            <div>
              <div>
                {selectedBrands.length} brand{selectedBrands.length !== 1 ? 's' : ''} ready for media pack
              </div>
              <div>
                We'll customize your media pack with these brand's colors and styling
              </div>
            </div>
            <div>
              <Button
                onClick={onBack}
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
    </div>
  );
}
