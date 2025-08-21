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
    <div className={`bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-tile)] p-6 ${className}`}>
      {/* Header with logo and brand name */}
      <div className="flex items-start space-x-4 mb-4">
        {brand.logoUrl && (
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--panel)] flex-shrink-0">
            <img 
              src={brand.logoUrl} 
              alt={`${brand.name} logo`}
              className="w-full h-full object-contain"
            />
          </div>
        )}
        <div className="min-w-0 flex-none">
          <h3 className="text-lg font-semibold text-[var(--text)] mb-1">{brand.name}</h3>
          {brand.description && (
            <p className="text-sm text-[var(--muted)] line-clamp-2">{brand.description}</p>
          )}
        </div>
      </div>

      {/* Match reasons */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-[var(--muted)] mb-2">Why this matches:</h4>
        <ul className="space-y-1">
          {matchReasons.map((reason, index) => (
            <li key={index} className="text-sm text-[var(--text)] flex items-start">
              <span className="text-[var(--brand)] mr-2">•</span>
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
              className="px-2 py-1 text-xs font-medium bg-[var(--panel)] text-[var(--muted)] rounded-md"
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
          className="bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Approve
        </button>
        <button
          onClick={onStartOutreach}
          className="bg-[var(--brand2)] hover:bg-[var(--brand2)]/90 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Start Outreach
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 text-[var(--text)] hover:bg-[var(--panel)] font-medium rounded-lg transition-colors border border-[var(--border)]"
        >
          Save
        </button>
        <button
          onClick={onSkip}
          className="px-4 py-2 text-[var(--muted)] hover:bg-[var(--panel)] font-medium rounded-lg transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
