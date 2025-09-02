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
      <div className="flex justify-between items-start gap-3">
        {/* Left: Brand logo + name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9">
            <BrandLogo 
              domain={logoUrl}
              name={name}
              size={36}
              className="shrink-0"
            />
          </div>
          <h4 className="text-[15px] font-medium leading-6 text-[var(--fg)]">
            {name}
          </h4>
        </div>

        {/* Right: Value */}
        {value && value > 0 && (
          <span className="font-semibold text-[var(--fg)]">
            {currency(value)}
          </span>
        )}
      </div>

      {/* Stage pill row with mt-2 spacing */}
      <div className="mt-2 flex items-center gap-2">
        {/* Status chip */}
        {!compact && (
          <span className="inline-flex items-center rounded-full bg-[var(--card)] text-[13px] leading-5 px-2.5 py-0.5 text-[var(--muted-fg)] border border-[var(--border)]">
            {status}
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
          {stage}
        </span>
      </div>

      {/* Bell button - positioned below stage row */}
      {flags['crm.reminders.enabled'] && (
        <div className="flex justify-end mt-2">
          <button 
            className="inline-flex items-center justify-center rounded-full size-6 border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--tint-accent)] transition"
            onClick={() => setShowReminderPopover(!showReminderPopover)}
            title="Set reminder"
          >
            <Bell className="w-3.5 h-3.5 text-[var(--muted-fg)]" />
          </button>
        </div>
      )}
      
      <div className="border-t border-[var(--border)] my-3" />
      {/* Status and Next Step - Always render */}
      <div className="mt-2 space-y-2">
        {/* Status Picker */}
        <div>
          <label className="block text-[13px] text-[var(--muted-fg)] mb-1">Status</label>
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
