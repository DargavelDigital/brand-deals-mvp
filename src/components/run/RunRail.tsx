'use client';

import { BrandRun } from '@/services/orchestrator/brandRun';
import Button from '@/components/ui/Button';

interface RunRailProps {
  run: BrandRun;
  onAutoModeToggle: (enabled: boolean) => void;
}

export function RunRail({ run, onAutoModeToggle }: RunRailProps) {
  return (
    <div>
      {/* Run Status */}
      <div>
        <h3>Run Status</h3>
        
        {/* Auto Mode Toggle */}
        <div>
          <label>
            <input
              type="checkbox"
              checked={run.auto}
              onChange={(e) => onAutoModeToggle(e.target.checked)}
            />
            <div></div>
            <span>Run automatically</span>
          </label>
          <p>
            Advance and send without prompts. Respects 'Pause before send' setting.
          </p>
        </div>
        
        {/* Current Step */}
        <div>
          <div>Current Step</div>
          <div>
            {run.step.toLowerCase().replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Selected Brands */}
      {run.selectedBrandIds.length > 0 && (
        <div>
          <h3>Selected Brands</h3>
          <div>
            {run.selectedBrandIds.map((brandId, index) => (
              <div key={brandId}>
                <div>
                  {index + 1}
                </div>
                <div>
                  <div>
                    Brand {brandId}
                  </div>
                  <div>Selected for this run</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Credits Remaining */}
      <div>
        <h3>Credits Remaining</h3>
        <div>
          <div>
            <span>Audit</span>
            <span>200</span>
          </div>
          <div>
            <span>Media Pack</span>
            <span>50</span>
          </div>
          <div>
            <span>Outreach</span>
            <span>100</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3>Quick Actions</h3>
        <div>
          <Button>
            Pause Run
          </Button>
          <Button>
            Save Progress
          </Button>
        </div>
      </div>
    </div>
  );
}
