import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

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

export default function BrandCard({ 
  brand, 
  onShortlist, 
  onSkip, 
  onDetails 
}: BrandCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-3">
        {brand.logoUrl ? (
          <img 
            src={brand.logoUrl} 
            alt={brand.name}
            className="h-8 w-8 rounded-md border border-[var(--border)] bg-white object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-md border border-[var(--border)] bg-white flex items-center justify-center text-xs font-medium text-[var(--muted)]">
            {brand.name.charAt(0)}
          </div>
        )}
        <div>
          <h3 className="font-medium">{brand.name}</h3>
          <p className="text-sm text-[var(--muted)]">{brand.category}</p>
        </div>
      </div>
      
      <div className="text-sm text-[var(--muted)] space-y-1">
        <p>Match Score: {brand.matchScore}%</p>
        <p>Budget: ${brand.budget}</p>
        <p>Audience: {brand.audience}</p>
      </div>
      
      <div className="mt-4 flex items-center gap-3">
        <Button onClick={onShortlist}>Shortlist</Button>
        <Button variant="secondary" onClick={onSkip}>Skip</Button>
        <Button variant="ghost" onClick={onDetails}>Details</Button>
      </div>
    </Card>
  );
}
