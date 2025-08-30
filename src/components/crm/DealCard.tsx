import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface DealCardProps {
  deal: {
    id: string;
    name: string;
    logoUrl?: string;
    status: string;
    value: string;
    stage: string;
  };
}

export default function DealCardComponent({ deal }: DealCardProps) {
  const { name, logoUrl, status, value, stage } = deal;
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'won':
        return 'text-success border-success/30 bg-success/10';
      case 'lost':
        return 'text-error border-error/30 bg-error/10';
      case 'pending':
        return 'text-warn border-warn/30 bg-warn/10';
      default:
        return 'text-[var(--muted)] border-[var(--border)] bg-[color:var(--muted)]/10';
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-standard border border-[var(--border)] rounded-lg shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-md border border-[var(--border)] bg-white object-cover overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt={`${name} logo`} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-[color:var(--muted)]/20 flex items-center justify-center">
              <span className="text-xs text-[var(--muted)] font-medium">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate text-[var(--fg)]">{name}</div>
          <div className="text-xs text-[var(--muted-fg)]">{stage}</div>
        </div>
        
        <Badge className={`ml-auto ${getStatusColor(status)}`}>
          {status}
        </Badge>
      </div>
      
      <div className="mt-3 pt-3 border-t border-[var(--border)]">
        <div className="text-sm font-medium text-[var(--fg)]">{value}</div>
      </div>
    </Card>
  );
}

// Named export for compatibility
export const DealCard = DealCardComponent;
