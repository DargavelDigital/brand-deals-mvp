import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface DealCardProps {
  deal: {
    id: string;
    title: string;
    value?: number;
    status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    lastActivity?: Date;
  };
  brand: {
    name: string;
    logoUrl?: string;
  };
  className?: string;
  onClick?: () => void;
}

function DealCard({ deal, brand, onClick }: DealCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-[color:var(--muted)]/10 border-[var(--border)] text-[var(--muted)]';
      case 'active':
        return 'bg-[color:var(--success)]/10 border-success/30 text-success';
      case 'completed':
        return 'bg-[color:var(--success)]/10 border-success/30 text-success';
      case 'cancelled':
        return 'bg-[color:var(--error)]/10 border-error/30 text-error';
      default:
        return 'bg-[color:var(--muted)]/10 border-[var(--border)] text-[var(--muted)]';
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-standard">
      <div className="flex items-center gap-3">
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
        
        <div className="flex-1 min-w-0">
          <div className="font-medium">{deal.title}</div>
          <div className="text-xs text-[var(--muted)]">
            ${deal.value.toLocaleString()} • {brand.name}
          </div>
        </div>
        
        <Badge className={`ml-auto ${getStatusColor(deal.status)}`}>
          {deal.status}
        </Badge>
      </div>
      
      <div className="mt-3 text-xs text-[var(--muted)]">
        Last activity: {deal.lastActivity.toLocaleDateString()}
      </div>
    </Card>
  );
}

/* Named export expected by import sites */
export const DealCard = DealCard;
/* Default export for consistency */
export default DealCard;
