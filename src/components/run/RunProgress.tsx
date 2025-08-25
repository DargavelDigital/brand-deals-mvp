'use client';

import { ReactNode } from 'react'
import { CheckCircle, Circle, Clock } from 'lucide-react'
import { Card } from '@/components/ui/Card';

interface RunProgressProps {
  currentStep: RunStep;
  className?: string;
}

export default function RunProgress({ 
  currentStep, 
  onStepComplete, 
  onStepBack, 
  onStepContinue 
}: RunProgressProps) {
  const steps = [
    'CONNECT_ACCOUNTS',
    'AI_AUDIT', 
    'BRAND_MATCHES',
    'APPROVALS',
    'MEDIA_PACK',
    'CONTACTS',
    'OUTREACH'
  ];
  
  const currentIndex = steps.indexOf(currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <Card className="p-4">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-text mb-2">Brand Run Progress</h2>
          <div className="text-muted">Step {currentIndex + 1} of {steps.length}: {currentStep.replace('_', ' ').toLowerCase()}</div>
        </div>
        
        <div className="h-2 w-full rounded-full bg-[color:var(--muted)]/15">
          <div 
            className="h-2 rounded-full bg-[color:var(--accent)] transition-standard" 
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {steps.map((step, index) => (
            <div key={step} className="text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                index <= currentIndex ? 'bg-accent' : 'bg-border'
              }`} />
              <div className="text-xs text-[var(--muted)]">{step.replace('_', ' ')}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
