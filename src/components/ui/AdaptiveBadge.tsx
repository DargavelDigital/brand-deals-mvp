'use client';

import { Badge } from '@/components/ui/Badge';

interface AdaptiveBadgeProps {
  bias?: any;
  className?: string;
}

export default function AdaptiveBadge({ bias, className = '' }: AdaptiveBadgeProps) {
  if (!bias) return null;

  // Check if any bias is actually applied
  const hasBias = bias.outreach || bias.match || bias.audit;
  if (!hasBias) return null;

  const getAdaptationSummary = () => {
    const parts: string[] = [];
    
    if (bias.outreach) {
      if (bias.outreach.toneBias) parts.push('tone');
      if (bias.outreach.do?.length) parts.push('phrases');
      if (bias.outreach.nudge) parts.push('style');
    }
    
    if (bias.match) {
      if (bias.match.geoWeight !== 1) parts.push('geo');
      if (bias.match.boostCategories) parts.push('categories');
      if (bias.match.downrankSignals) parts.push('filtering');
    }
    
    if (bias.audit) {
      if (bias.audit.style) parts.push('presentation');
      if (bias.audit.avoid) parts.push('language');
    }
    
    return parts.join(', ');
  };

  const adaptationSummary = getAdaptationSummary();
  if (!adaptationSummary) return null;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth="2"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4M12 8h.01"/>
        </svg>
        Adaptive
      </Badge>
      <div className="group relative">
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          Adapted to recent feedback: {adaptationSummary}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  );
}
