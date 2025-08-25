import React from 'react';
import Button from '@/components/ui/Button';

interface BrandCardProps {
  brand: {
    name: string;
    logoUrl?: string;
    description?: string;
    categories: string[];
  };
  matchReasons: string[];
  onApprove?: () => void;
  onStartOutreach?: () => void;
  onSave?: () => void;
  onSkip?: () => void;
}

export function BrandCard({ 
  brand, 
  matchReasons, 
  onApprove,
  onStartOutreach,
  onSave,
  onSkip
}: BrandCardProps) {
  return (
    <div>
      {/* Header with logo and brand name */}
      <div>
        {brand.logoUrl && (
          <div>
            <img 
              src={brand.logoUrl} 
              alt={`${brand.name} logo`}
            />
          </div>
        )}
        <div>
          <h3>{brand.name}</h3>
          {brand.description && (
            <p>{brand.description}</p>
          )}
        </div>
      </div>

      {/* Match reasons */}
      <div>
        <h4>Why this matches:</h4>
        <ul>
          {matchReasons.map((reason, index) => (
            <li key={index}>
              <span>•</span>
              {reason}
            </li>
          ))}
        </ul>
      </div>

      {/* Tags */}
      <div>
        <div>
          {brand.categories.map((category, index) => (
            <span key={index}>
              {category}
            </span>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div>
        <Button
          onClick={onApprove}
        >
          Approve
        </Button>
        <Button
          onClick={onStartOutreach}
        >
          Start Outreach
        </Button>
        <Button
          onClick={onSave}
        >
          Save
        </Button>
        <Button
          onClick={onSkip}
        >
          Skip
        </Button>
      </div>
    </div>
  );
}
