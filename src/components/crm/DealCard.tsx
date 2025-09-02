'use client'

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Bell } from "lucide-react";
import { flags } from "@/config/flags";
import { useClientFlag } from "@/lib/clientFlags";
import { ReminderPopover } from "./ReminderPopover";
import BrandLogo from "@/components/media/BrandLogo";
import { getBrandLogo } from "@/lib/brandLogo";

interface DealCardProps {
  deal: {
    id: string;
    name: string;
    logoUrl?: string;
    status: string;
    value: number;
    stage: string;
    nextStep?: string;
    description?: string;
    subtitle?: string;
  };
  onNextStepUpdate?: (dealId: string, nextStep: string) => void;
  onStatusUpdate?: (dealId: string, status: string) => void;
  onSetReminder?: (dealId: string, reminderTime: Date, note?: string) => void;
  onDragStart?: (dealId: string) => void;
  isDragging?: boolean;
  compact?: boolean;
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

// Currency formatter helper
const currency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function DealCardComponent({ deal, compact = false, onNextStepUpdate, onStatusUpdate, onSetReminder, onDragStart, isDragging }: DealCardProps) {
  const { name, logoUrl, status, value, stage, nextStep, description } = deal;
  
  // Extract next step from description if not provided directly
  const extractedNextStep = nextStep || description?.match(/\/\/NEXT: (.+)$/)?.[1] || '';
  
  // Check if there's a reminder and if it's due
  const reminderMatch = description?.match(/\/\/REMIND: (.+?) \| (.+)$/);
  const hasReminder = !!reminderMatch;
  const reminderTime = reminderMatch ? new Date(reminderMatch[1]) : null;
  const reminderNote = reminderMatch ? reminderMatch[2] : '';
  const isReminderDue = hasReminder && reminderTime && reminderTime <= new Date();
  
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

  const [showReminderPopover, setShowReminderPopover] = React.useState(false);

  return (
    <Card 
      data-testid={compact ? 'deal-card-compact' : 'deal-card-full'}
      className={`p-4 hover:shadow-md transition-standard border border-[var(--border)] rounded-lg shadow-sm relative ${
        isDragging ? 'opacity-50' : ''
      } ${onDragStart ? 'cursor-grab active:cursor-grabbing' : ''}`}
      draggable={!!onDragStart}
      onDragStart={() => onDragStart?.(deal.id)}
    >
      {/* Top row: brand left, value right */}
      <div className="flex items-start justify-between gap-3">
        {/* Left: brand logo + name */}
        <div className="min-w-0 flex items-center gap-2">
          <img
            src={getBrandLogo(logoUrl)}
            alt={name ?? "Brand"}
            width={28}
            height={28}
            className="rounded border border-[var(--border)] object-cover shrink-0"
          />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium leading-5">
              {name ?? "Untitled Deal"}
            </h3>
            {/* Optional subtitle (creator/brand short) */}
            {deal.subtitle ? (
              <p className="truncate text-xs text-[var(--muted-fg)]">{deal.subtitle}</p>
            ) : null}
          </div>
        </div>

        {/* Right: value aligned right */}
        <div className="text-right shrink-0">
          <div className="text-[11px] leading-4 text-[var(--muted-fg)]">Value</div>
          <div className="text-base font-semibold leading-5 tabular-nums">
            {value && value > 0 ? currency(value) : "—"}
          </div>

          {/* Centered bell directly under value */}
          <div className="mt-1 flex justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowReminderPopover(!showReminderPopover);
              }}
              aria-label="Reminder"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--tint-accent)] transition"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-0.5 text-center text-[11px] leading-4 text-[var(--muted-fg)]">
            Next step
          </div>
        </div>
      </div>

      {/* Stage pill row with comfortable spacing */}
      <div className="mt-3 md:mt-4 flex items-center gap-2">
        {/* Status chip */}
        {!compact && (
          <span className="inline-flex items-center rounded-full bg-[var(--card)] text-[13px] leading-5 px-2.5 py-0.5 text-[var(--muted-fg)] border border-[var(--border)]">
            {status ?? "—"}
          </span>
        )}

        {/* Reminder Due Badge */}
        {isReminderDue && (
          <span className="inline-flex items-center rounded-full bg-[var(--error)] text-[13px] leading-5 px-2.5 py-0.5 text-white border border-[var(--error)]">
            Due
          </span>
        )}

        {/* Stage label */}
        <span className="text-[13px] leading-5 text-[var(--muted-fg)]">
          {stage ?? "—"}
        </span>
      </div>

      <div className="border-t border-[var(--border)] my-3" />
      {/* Status and Next Step - Always render */}
      <div className="mt-2 space-y-2">
        {/* Status Picker */}
        <div>
          <label className="block text-[13px] text-[var(--muted-fg)] mb-1">Status</label>
          <Select
            value={status ?? ""}
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
          <label className="block text-[13px] text-[var(--muted-fg)] mb-1">Next Step</label>
          <input
            type="text"
            placeholder="Enter next step..."
            defaultValue={extractedNextStep || "—"}
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
      
      {/* Reminder Popover */}
      {showReminderPopover && flags['crm.reminders.enabled'] && onSetReminder && (
        <ReminderPopover
          dealId={deal.id}
          dealName={deal.name}
          onSetReminder={onSetReminder}
          onClose={() => setShowReminderPopover(false)}
        />
      )}
    </Card>
  );
}

// Named export for compatibility
export const DealCard = DealCardComponent;
