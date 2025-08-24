'use client';

import { useState } from 'react';
import { RunStep, createRun } from '@/services/orchestrator/brandRun';
import { RunProgress } from '@/components/run/RunProgress';
import { RunRail } from '@/components/run/RunRail';
import { StepConnect } from '@/components/run/StepConnect';
import { StepAudit } from '@/components/run/StepAudit';
import { StepMatches } from '@/components/run/StepMatches';
import { StepApproval } from '@/components/run/StepApproval';
import { StepMediaPack } from '@/components/run/StepMediaPack';
import { StepContacts } from '@/components/run/StepContacts';
import { StepOutreach } from '@/components/run/StepOutreach';

export default function BrandRunPage() {
  const [currentStep, setCurrentStep] = useState<RunStep>('CONNECT');
  const [run, setRun] = useState(() => createRun('demo-workspace', false));
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);

  const handleStepComplete = (step: RunStep, data?: any) => {
    if (data?.selectedBrandIds) {
      setSelectedBrandIds(data.selectedBrandIds);
    }
    
    const nextStep = getNextStep(step);
    if (nextStep) {
      setCurrentStep(nextStep);
      setRun(prev => ({ ...prev, step: nextStep }));
    }
  };

  const handleStepBack = (step: RunStep) => {
    const prevStep = getPreviousStep(step);
    if (prevStep) {
      setCurrentStep(prevStep);
      setRun(prev => ({ ...prev, step: prevStep }));
    }
  };

  const handleAutoModeToggle = (enabled: boolean) => {
    setRun(prev => ({ ...prev, auto: enabled }));
  };

  const getNextStep = (current: RunStep): RunStep | null => {
    const steps: RunStep[] = ['CONNECT', 'AUDIT', 'MATCHES', 'APPROVE', 'PACK', 'CONTACTS', 'OUTREACH'];
    const currentIndex = steps.indexOf(current);
    return currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;
  };

  const getPreviousStep = (current: RunStep): RunStep | null => {
    const steps: RunStep[] = ['CONNECT', 'AUDIT', 'MATCHES', 'APPROVE', 'PACK', 'CONTACTS', 'OUTREACH'];
    const currentIndex = steps.indexOf(current);
    return currentIndex > 0 ? steps[currentIndex - 1] : null;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'CONNECT':
        return <StepConnect onContinue={() => handleStepComplete('CONNECT')} />;
      case 'AUDIT':
        return <StepAudit onContinue={() => handleStepComplete('AUDIT')} />;
      case 'MATCHES':
        return <StepMatches onContinue={(brandIds) => handleStepComplete('MATCHES', { selectedBrandIds: brandIds })} />;
      case 'APPROVE':
        return (
          <StepApproval 
            selectedBrandIds={selectedBrandIds}
            onContinue={() => handleStepComplete('APPROVE')}
            onBack={() => handleStepBack('APPROVE')}
          />
        );
      case 'PACK':
        return (
          <StepMediaPack 
            selectedBrandIds={selectedBrandIds}
            onContinue={() => handleStepComplete('PACK')}
            onBack={() => handleStepBack('PACK')}
          />
        );
      case 'CONTACTS':
        return (
          <StepContacts 
            selectedBrandIds={selectedBrandIds}
            onContinue={() => handleStepComplete('CONTACTS')}
            onBack={() => handleStepBack('CONTACTS')}
          />
        );
      case 'OUTREACH':
        return (
          <StepOutreach 
            onComplete={() => handleStepComplete('OUTREACH')}
            onBack={() => handleStepBack('OUTREACH')}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="container py-6">
      {/* Progress Bar */}
      <RunProgress currentStep={currentStep} className="mb-6" />
      
      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left: Content Pane */}
        <div className="max-w-[900px]">
          {renderStep()}
        </div>
        
        {/* Right: Sticky Rail */}
        <div className="lg:block">
          <RunRail 
            run={run}
            onAutoModeToggle={handleAutoModeToggle}
          />
        </div>
      </div>
    </div>
  );
}
