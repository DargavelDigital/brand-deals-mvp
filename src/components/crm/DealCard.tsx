import React from 'react';

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

export function DealCard({ deal, brand, className = '', onClick }: DealCardProps) {
  const getStatusColors = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-[var(--warning)]/20 text-[var(--warning)] border-[var(--warning)]/30';
      case 'ACTIVE':
        return 'bg-[var(--brand-600)]/20 text-[var(--brand-600)] border-[var(--brand-600)]/30';
      case 'COMPLETED':
        return 'bg-[var(--success)]/20 text-[var(--success)] border-[var(--success)]/30';
      case 'CANCELLED':
        return 'bg-[var(--error)]/20 text-[var(--error)] border-[var(--error)]/30';
      default:
        return 'bg-[var(--muted)]/20 text-[var(--muted-fg)] border-[var(--muted-fg)]/30';
    }
  };

  const formatValue = (value?: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatLastActivity = (date?: Date) => {
    if (!date) return 'No activity';
    
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div 
      className={`card p-4 cursor-pointer hover:shadow-[var(--shadow-card)] transition-all ${className}`}
      onClick={onClick}
    >
      {/* Brand info */}
      <div className="flex items-center space-x-3 mb-3">
        {brand.logoUrl && (
          <div className="w-8 h-8 rounded-md overflow-hidden bg-[var(--muted)] flex-shrink-0">
            <img 
              src={brand.logoUrl} 
              alt={`${brand.name} logo`}
              className="w-full h-full object-contain"
            />
          </div>
        )}
        <div className="min-w-0 flex-none">
          <h4 className="text-sm font-medium text-[var(--fg)] truncate">{brand.name}</h4>
        </div>
      </div>

      {/* Deal title */}
      <h3 className="text-sm font-semibold text-[var(--fg)] mb-2 line-clamp-2">
        {deal.title}
      </h3>

      {/* Deal value and status */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-[var(--muted-fg)]">
          {formatValue(deal.value)}
        </span>
        <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getStatusColors(deal.status)}`}>
          {deal.status}
        </span>
      </div>

      {/* Last activity */}
      <div className="text-xs text-[var(--muted-fg)]">
        {formatLastActivity(deal.lastActivity)}
      </div>
    </div>
  );
}
