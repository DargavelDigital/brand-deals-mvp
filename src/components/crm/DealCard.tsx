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
        return '';
      case 'ACTIVE':
        return '';
      case 'COMPLETED':
        return '';
      case 'CANCELLED':
        return '';
      default:
        return '';
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
    <div onClick={onClick}>
      {/* Brand info */}
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
          <h4>{brand.name}</h4>
        </div>
      </div>

      {/* Deal title */}
      <h3>
        {deal.title}
      </h3>

      {/* Deal value and status */}
      <div>
        <span>
          {formatValue(deal.value)}
        </span>
        <span>
          {deal.status}
        </span>
      </div>

      {/* Last activity */}
      <div>
        {formatLastActivity(deal.lastActivity)}
      </div>
    </div>
  );
}
