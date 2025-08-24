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
    <div className={`card p-6 ${className}`}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[var(--fg)] mb-2">Brand Run Progress</h2>
        <div className="text-sm text-[var(--muted-fg)]">
          Step {currentIndex + 1} of {STEPS.length}: {STEPS[currentIndex]?.label}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-[var(--muted)] rounded-full h-2 mb-4">
        <div 
          className="bg-[var(--brand-600)] h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Step Labels */}
      <div className="grid grid-cols-7 gap-2 text-xs">
        {STEPS.map((step, index) => (
                      <div key={step.step} className="text-center">
            <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${
              index <= currentIndex ? 'bg-[var(--brand-600)]' : 'bg-[var(--muted-fg)]'
            }`} />
            <div className={`${
              index <= currentIndex ? 'text-[var(--fg)]' : 'text-[var(--muted-fg)]'
            }`}>
              {step.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
