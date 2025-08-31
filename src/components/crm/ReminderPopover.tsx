import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { flags } from "@/config/flags";

// Modal overlay component
function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

interface ReminderPopoverProps {
  dealId: string;
  dealName: string;
  onSetReminder: (dealId: string, reminderTime: Date, note?: string) => void;
  onClose: () => void;
}

const REMINDER_PRESETS = [
  { label: "2 hours", value: "2h" },
  { label: "Tomorrow 9am", value: "tomorrow-9am" },
  { label: "Next Mon 9am", value: "monday-9am" },
];

export function ReminderPopover({ dealId, dealName, onSetReminder, onClose }: ReminderPopoverProps) {
  const [selectedPreset, setSelectedPreset] = React.useState<string>("");
  const [customDateTime, setCustomDateTime] = React.useState<string>("");
  const [note, setNote] = React.useState<string>("");
  const [isSetting, setIsSetting] = React.useState(false);

  if (!flags['crm.reminders.enabled']) return null;

  const handlePresetSelect = (preset: string) => {
    setSelectedPreset(preset);
    setCustomDateTime("");
  };

  const handleCustomDateTimeChange = (value: string) => {
    setCustomDateTime(value);
    setSelectedPreset("");
  };

  const calculateReminderTime = (): Date | null => {
    if (selectedPreset) {
      const now = new Date();
      
      switch (selectedPreset) {
        case "2h":
          return new Date(now.getTime() + 2 * 60 * 60 * 1000);
        case "tomorrow-9am":
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(9, 0, 0, 0);
          return tomorrow;
        case "monday-9am":
          const monday = new Date(now);
          const daysUntilMonday = (8 - monday.getDay()) % 7;
          monday.setDate(monday.getDate() + daysUntilMonday);
          monday.setHours(9, 0, 0, 0);
          return monday;
        default:
          return null;
      }
    } else if (customDateTime) {
      return new Date(customDateTime);
    }
    return null;
  };

  const handleSetReminder = async () => {
    const reminderTime = calculateReminderTime();
    if (!reminderTime) return;

    setIsSetting(true);
    try {
      await onSetReminder(dealId, reminderTime, note);
      onClose();
    } finally {
      setIsSetting(false);
    }
  };

  const reminderTime = calculateReminderTime();
  const isValid = reminderTime && reminderTime > new Date();

  return (
    <ModalOverlay onClose={onClose}>
      <Card className="w-96 max-w-[90vw] p-6 shadow-2xl border border-[var(--border)] bg-[var(--card)]">
        <div className="space-y-4">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-[var(--fg)]">Set Reminder</h4>
            <p className="text-sm text-[var(--muted-fg)]">Remind me about {dealName}</p>
          </div>

        {/* Preset Options */}
        <div>
          <label className="block text-sm font-medium text-[var(--muted-fg)] mb-3">Quick Presets</label>
          <div className="grid grid-cols-3 gap-3">
            {REMINDER_PRESETS.map((preset) => (
              <Button
                key={preset.value}
                variant={selectedPreset === preset.value ? "default" : "secondary"}
                size="default"
                onClick={() => handlePresetSelect(preset.value)}
                className="text-sm whitespace-nowrap h-10"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom DateTime */}
        <div>
          <label className="block text-sm font-medium text-[var(--muted-fg)] mb-2">Or Custom Time</label>
          <input
            type="datetime-local"
            value={customDateTime}
            onChange={(e) => handleCustomDateTimeChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded bg-[var(--card)] text-[var(--fg)]"
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-[var(--muted-fg)] mb-2">Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., Follow up on proposal"
            className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded bg-[var(--card)] text-[var(--fg)] placeholder-[var(--muted-fg)]"
          />
        </div>

        {/* Preview */}
        {reminderTime && (
          <div className="text-sm text-[var(--muted-fg)] bg-[var(--muted)]/10 p-3 rounded border border-[var(--border)]">
            <span className="font-medium">Reminder set for:</span> {reminderTime.toLocaleString()}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="secondary"
            size="default"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            size="default"
            onClick={handleSetReminder}
            disabled={!isValid || isSetting}
            className="flex-1"
          >
            {isSetting ? "Setting..." : "Set Reminder"}
          </Button>
        </div>
      </div>
    </Card>
    </ModalOverlay>
  );
}
