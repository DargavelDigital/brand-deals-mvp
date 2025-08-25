'use client';

import { RunStep } from '@/services/orchestrator/brandRun';

interface RunProgressProps {
  currentStep: RunStep;
  className?: string;
}

const STEPS: { step: RunStep; label: string }[] = [
  { step: 'CONNECT', label: 'Connect Accounts' },
  { step: 'AUDIT', label: 'AI Audit' },
  { step: 'MATCHES', label: 'Brand Matches' },
  { step: 'APPROVE', label: 'Approvals' },
  { step: 'PACK', label: 'Media Pack' },
  { step: 'CONTACTS', label: 'Contacts' },
  { step: 'OUTREACH', label: 'Outreach' },
];

export function RunProgress({ currentStep, className = '' }: RunProgressProps) {
  const currentIndex = STEPS.findIndex(s => s.step === currentStep);
  const progress = ((currentIndex + 1) / STEPS.length) * 100;

  return (
    <div>
      <div>
        <h2>Brand Run Progress</h2>
        <div>
          Step {currentIndex + 1} of {STEPS.length}: {STEPS[currentIndex]?.label}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div>
        <div 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Step Labels */}
      <div>
        {STEPS.map((step, index) => (
          <div key={step.step}>
            <div />
            <div>
              {step.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
