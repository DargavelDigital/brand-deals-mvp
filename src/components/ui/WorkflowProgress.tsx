'use client';

import { cn } from '@/lib/utils';

interface Step {
  label: string;
  status: 'completed' | 'active' | 'upcoming';
}

interface WorkflowProgressProps {
  currentStep: number;
  steps: string[];
  className?: string;
}

/**
 * WorkflowProgress - Unified progress indicator for multi-step workflows
 * 
 * Shows user's position in workflow with visual step indicators
 * 
 * @param currentStep - Zero-based index of current step (0 = first step)
 * @param steps - Array of step labels
 * @param className - Optional additional classes
 * 
 * @example
 * <WorkflowProgress 
 *   currentStep={1} 
 *   steps={['Connect', 'Audit', 'Matches', 'Contacts', 'Pack', 'Outreach']} 
 * />
 */
export function WorkflowProgress({ 
  currentStep, 
  steps, 
  className 
}: WorkflowProgressProps) {
  const stepsData: Step[] = steps.map((label, index) => ({
    label,
    status: 
      index < currentStep ? 'completed' : 
      index === currentStep ? 'active' : 
      'upcoming'
  }));

  return (
    <div className={cn('w-full mb-8', className)}>
      <div className="flex items-center justify-between">
        {stepsData.map((step, index) => (
          <div 
            key={step.label} 
            className="flex items-center flex-1 last:flex-none"
          >
            {/* Step Circle and Label */}
            <div className="flex flex-col items-center">
              {/* Circle */}
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                  step.status === 'completed' && 'bg-[var(--ds-success)] text-white',
                  step.status === 'active' && 'bg-[var(--ds-primary)] text-white ring-4 ring-blue-100',
                  step.status === 'upcoming' && 'bg-gray-200 text-gray-500'
                )}
              >
                {step.status === 'completed' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-xs mt-2 text-center whitespace-nowrap transition-all duration-200',
                  step.status === 'active' && 'font-semibold text-gray-900',
                  step.status !== 'active' && 'text-gray-500'
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connecting Line */}
            {index < stepsData.length - 1 && (
              <div className="flex-1 h-0.5 mx-3 bg-gray-200 relative overflow-hidden">
                <div
                  className={cn(
                    'absolute top-0 left-0 h-full transition-all duration-500',
                    step.status === 'completed' ? 'w-full bg-[var(--ds-success)]' : 'w-0'
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

