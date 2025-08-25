'use client';

import { ReactNode } from 'react'
import { CheckCircle, Circle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface RunRailProps {
  run: BrandRun;
  onAutoModeToggle: (enabled: boolean) => void;
}

export default function RunRail({ 
  run, 
  onPause, 
  onResume, 
  onStop 
}: RunRailProps) {
  return (
    <Card className="p-4">
      <div className="space-y-6">
        <h3 className="text-sm font-medium mb-2">Run Status</h3>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              className="w-4 h-4 text-accent bg-surface border-border rounded focus:ring-accent focus:ring-2"
            />
            <div className="flex-1">
              <span className="font-medium text-text">Run automatically</span>
              <p className="text-sm text-muted mt-1">Advance and send without prompts. Respects 'Pause before send' setting.</p>
            </div>
          </label>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium text-[var(--muted)]">Current Step</div>
          <div className="text-lg font-semibold text-text">{run.step.replace('_', ' ').toLowerCase()}</div>
        </div>
      </div>
      
      <div className="card mt-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium mb-2">Selected Brands</h3>
          <div className="space-y-3">
            {run.selectedBrandIds.map((brandId, index) => (
              <div key={brandId} className="flex items-center gap-4 p-3 bg-surface/50 rounded-md">
                <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-text">Brand {brandId}</div>
                  <div className="text-sm text-muted">Selected for this run</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="card mt-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium mb-2">Credits Remaining</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
              <span className="text-muted">Audit</span>
              <span className="font-medium text-text">200</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
              <span className="text-muted">Media Pack</span>
              <span className="font-medium text-text">50</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
              <span className="text-muted">Outreach</span>
              <span className="font-medium text-text">100</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card mt-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium mb-2">Quick Actions</h3>
          <div className="flex gap-3">
            <Button className="w-full mt-3" variant="secondary">Pause Run</Button>
            <Button className="w-full mt-3" variant="secondary">Save Progress</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
