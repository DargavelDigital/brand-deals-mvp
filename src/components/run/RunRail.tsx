'use client';

import { BrandRun } from '@/services/orchestrator/brandRun';

interface RunRailProps {
  run: BrandRun;
  onAutoModeToggle: (enabled: boolean) => void;
  className?: string;
}

export function RunRail({ run, onAutoModeToggle, className = '' }: RunRailProps) {
  return (
    <div className={`sticky top-6 space-y-6 ${className}`}>
      {/* Run Status */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
        <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Run Status</h3>
        
        {/* Auto Mode Toggle */}
        <div className="mb-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={run.auto}
              onChange={(e) => onAutoModeToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-[var(--muted)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--brand)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--brand)]"></div>
            <span className="text-sm font-medium text-[var(--text)]">Run automatically</span>
          </label>
          <p className="text-xs text-[var(--muted)] mt-1">
            Advance and send without prompts. Respects 'Pause before send' setting.
          </p>
        </div>
        
        {/* Current Step */}
        <div className="mb-4">
          <div className="text-sm text-[var(--muted)] mb-1">Current Step</div>
          <div className="text-lg font-semibold text-[var(--text)] capitalize">
            {run.step.toLowerCase().replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Selected Brands */}
      {run.selectedBrandIds.length > 0 && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
          <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Selected Brands</h3>
          <div className="space-y-3">
            {run.selectedBrandIds.map((brandId, index) => (
              <div key={brandId} className="flex items-center space-x-3 p-3 bg-[var(--panel)] rounded-lg">
                <div className="w-8 h-8 bg-[var(--brand)] rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--text)] truncate">
                    Brand {brandId}
                  </div>
                  <div className="text-xs text-[var(--muted)]">Selected for this run</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Credits Remaining */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
        <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Credits Remaining</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--muted)]">Audit</span>
            <span className="text-lg font-bold text-[var(--text)]">200</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--muted)]">Media Pack</span>
            <span className="text-lg font-bold text-[var(--text)]">50</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--muted)]">Outreach</span>
            <span className="text-lg font-bold text-[var(--text)]">100</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
        <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button className="w-full px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--panel)] font-medium rounded-lg transition-colors border border-[var(--border)]">
            Pause Run
          </button>
          <button className="w-full px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--panel)] font-medium rounded-lg transition-colors border border-[var(--border)]">
            Save Progress
          </button>
        </div>
      </div>
    </div>
  );
}
