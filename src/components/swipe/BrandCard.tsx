import React from 'react';

interface BrandCardProps {
  brand: {
    name: string;
    logoUrl?: string;
    description?: string;
    categories: string[];
  };
  matchReasons: string[];
  className?: string;
  onApprove?: () => void;
  onStartOutreach?: () => void;
  onSave?: () => void;
  onSkip?: () => void;
}

export function BrandCard({ 
  brand, 
  matchReasons, 
  className = '',
  onApprove,
  onStartOutreach,
  onSave,
  onSkip
}: BrandCardProps) {
  return (
    <div className={`card p-6 ${className}`}>
      {/* Header with logo and brand name */}
      <div className="flex items-start space-x-4 mb-4">
        {brand.logoUrl && (
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--muted)] flex-shrink-0">
            <img 
              src={brand.logoUrl} 
              alt={`${brand.name} logo`}
              className="w-full h-full object-contain"
            />
          </div>
        )}
        <div className="min-w-0 flex-none">
          <h3 className="text-lg font-semibold text-[var(--fg)] mb-1">{brand.name}</h3>
          {brand.description && (
            <p className="text-sm text-[var(--muted-fg)] line-clamp-2">{brand.description}</p>
          )}
        </div>
      </div>

      {/* Match reasons */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-[var(--muted-fg)] mb-2">Why this matches:</h4>
        <ul className="space-y-1">
          {matchReasons.map((reason, index) => (
            <li key={index} className="text-sm text-[var(--fg)] flex items-start">
              <span className="text-[var(--brand-600)] mr-2">•</span>
              {reason}
            </li>
          ))}
        </ul>
      </div>

      {/* Tags */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {brand.categories.map((category, index) => (
            <span 
              key={index}
              className="px-2 py-1 text-xs font-medium bg-[var(--muted)] text-[var(--muted-fg)] rounded-md"
            >
              {category}
            </span>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onApprove}
          className="btn-primary"
        >
          Approve
        </button>
        <button
          onClick={onStartOutreach}
          className="btn-primary"
        >
          Start Outreach
        </button>
        <button
          onClick={onSave}
          className="btn-secondary"
        >
          Save
        </button>
        <button
          onClick={onSkip}
          className="px-4 py-2 text-[var(--muted-fg)] hover:bg-[var(--muted)] font-medium rounded-lg transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
