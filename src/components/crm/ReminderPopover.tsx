import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { flags } from "@/config/flags";

interface ReminderPopoverProps {
  dealId: string;
  dealName: string;
  onSetReminder: (dealId: string, reminderTime: Date, note?: string) => void;
  onClose: () => void;
}

const REMINDER_PRESETS = [
  { label: "2 hours", value: "2h" },
  { label: "Tomorrow 9am", value: "tomorrow-9am" },
  { label: "Next Monday 9am", value: "monday-9am" },
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
    <Card className="absolute top-full right-0 mt-2 p-4 w-80 z-50 shadow-lg border border-[var(--border)] bg-[var(--card)]">
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-[var(--fg)]">Set Reminder</h4>
          <p className="text-sm text-[var(--muted-fg)]">Remind me about {dealName}</p>
        </div>

        {/* Preset Options */}
        <div>
          <label className="block text-xs text-[var(--muted-fg)] mb-2">Quick Presets</label>
          <div className="grid grid-cols-3 gap-2">
            {REMINDER_PRESETS.map((preset) => (
              <Button
                key={preset.value}
                variant={selectedPreset === preset.value ? "default" : "secondary"}
                size="sm"
                onClick={() => handlePresetSelect(preset.value)}
                className="text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom DateTime */}
        <div>
          <label className="block text-xs text-[var(--muted-fg)] mb-2">Or Custom Time</label>
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
          <label className="block text-xs text-[var(--muted-fg)] mb-2">Note (optional)</label>
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
          <div className="text-xs text-[var(--muted-fg)] bg-[var(--muted)]/10 p-2 rounded">
            Reminder set for: {reminderTime.toLocaleString()}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSetReminder}
            disabled={!isValid || isSetting}
            className="flex-1"
          >
            {isSetting ? "Setting..." : "Set Reminder"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
