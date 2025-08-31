import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { flags } from "@/config/flags";

interface DealCardProps {
  deal: {
    id: string;
    name: string;
    logoUrl?: string;
    status: string;
    value: string;
    stage: string;
    nextStep?: string;
    description?: string;
  };
  onNextStepUpdate?: (dealId: string, nextStep: string) => void;
  onStatusUpdate?: (dealId: string, status: string) => void;
}

// Available deal statuses from the schema
const DEAL_STATUSES = [
  { value: 'OPEN', label: 'Open' },
  { value: 'COUNTERED', label: 'Countered' },
  { value: 'WON', label: 'Won' },
  { value: 'LOST', label: 'Lost' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' }
];

export default function DealCardComponent({ deal, onNextStepUpdate, onStatusUpdate }: DealCardProps) {
  const { name, logoUrl, status, value, stage, nextStep, description } = deal;
  
  // Extract next step from description if not provided directly
  const extractedNextStep = nextStep || description?.match(/\/\/NEXT: (.+)$/)?.[1] || '';
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'won':
        return 'text-success border-success/30 bg-success/10';
      case 'lost':
        return 'text-error border-error/30 bg-error/10';
      case 'pending':
        return 'text-warn border-warn/30 bg-warn/10';
      case 'open':
        return 'text-[var(--muted)] border-[var(--border)] bg-[color:var(--muted)]/10';
      case 'countered':
        return 'text-warn border-warn/30 bg-warn/10';
      case 'active':
        return 'text-success border-success/30 bg-success/10';
      case 'completed':
        return 'text-success border-success/30 bg-success/10';
      case 'cancelled':
        return 'text-error border-error/30 bg-error/10';
      default:
        return 'text-[var(--muted)] border-[var(--border)] bg-[color:var(--muted)]/10';
    }
  };

  const handleNextStepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onNextStepUpdate?.(deal.id, e.target.value);
  };

  const handleStatusChange = (newStatus: string) => {
    onStatusUpdate?.(deal.id, newStatus);
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
        
        {/* Status Badge - Only show if feature flag is disabled */}
        {!flags['crm.light.enabled'] && (
          <Badge className={`ml-auto ${getStatusColor(status)}`}>
            {status}
          </Badge>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-[var(--border)]">
        <div className="text-sm font-medium text-[var(--fg)]">{value}</div>
        
        {/* CRM Light Features - Only show if feature flag is enabled */}
        {flags['crm.light.enabled'] && (
          <div className="mt-3 space-y-2">
            {/* Status Picker */}
            <div>
              <label className="block text-xs text-[var(--muted-fg)] mb-1">Status</label>
              <Select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full"
              >
                {DEAL_STATUSES.map((statusOption) => (
                  <option key={statusOption.value} value={statusOption.value}>
                    {statusOption.label}
                  </option>
                ))}
              </Select>
            </div>
            
            {/* Next Step Field */}
            <div>
              <label className="block text-xs text-[var(--muted-fg)] mb-1">Next Step</label>
              <input
                type="text"
                placeholder="Enter next step..."
                defaultValue={extractedNextStep}
                className="w-full px-2 py-1 text-xs border border-[var(--border)] rounded bg-[var(--card)] text-[var(--fg)] placeholder-[var(--muted-fg)]"
                onBlur={handleNextStepChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// Named export for compatibility
export const DealCard = DealCardComponent;
