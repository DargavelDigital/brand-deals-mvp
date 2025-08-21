'use client';

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
    <div className={`space-y-6 ${className}`}>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)] mb-2">Approvals</h1>
        <p className="text-[var(--muted)]">
          Review your selected brands before we proceed to create your media pack.
        </p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
        <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Selected Brands</h2>
        
        <div className="space-y-4">
          {selectedBrands.map((brand) => (
            <div key={brand.id} className="flex items-center space-x-4 p-4 border border-[var(--border)] rounded-lg">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--panel)] flex-shrink-0">
                <img 
                  src={brand.logoUrl} 
                  alt={`${brand.name} logo`}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[var(--text)]">{brand.name}</h3>
                <p className="text-sm text-[var(--muted)]">{brand.category}</p>
              </div>
              <div className="px-3 py-1 bg-[var(--positive)]/20 text-[var(--positive)] text-sm font-medium rounded-full">
                Approved
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-[var(--panel)] rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[var(--text)]">
                {selectedBrands.length} brand{selectedBrands.length !== 1 ? 's' : ''} ready for media pack
              </div>
              <div className="text-xs text-[var(--muted)]">
                We'll customize your media pack with these brand's colors and styling
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onBack}
                className="px-4 py-2 text-[var(--text)] hover:bg-[var(--panel)] font-medium rounded-lg transition-colors border border-[var(--border)]"
              >
                Back
              </button>
              <button
                onClick={onContinue}
                className="px-6 py-2 bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white font-medium rounded-lg transition-colors"
              >
                Proceed to Media Pack
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
