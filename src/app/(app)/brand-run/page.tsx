'use client';

import { useState } from 'react';
import { RunStep, createRun } from '@/services/orchestrator/brandRun';
import { RunRail } from '@/components/run/RunRail';
import StepperPro from '@/components/stepper/StepperPro';
import { StepConnect } from '@/components/run/StepConnect';
import { StepAudit } from '@/components/run/StepAudit';
import { StepMatches } from '@/components/run/StepMatches';
import { StepApproval } from '@/components/run/StepApproval';
import { StepMediaPack } from '@/components/run/StepMediaPack';
import { StepContacts } from '@/components/run/StepContacts';
import { StepOutreach } from '@/components/run/StepOutreach';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function BrandRunPage() {
  const [currentStep, setCurrentStep] = useState<RunStep>('CONNECT');
  const [run, setRun] = useState(() => createRun('demo-workspace', false));
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);

  const steps = [
    { id: 'connect',  label: 'Connect',  icon: 'Plug', toolPath: '/tools/connect' },
    { id: 'audit',    label: 'AI Audit', icon: 'Gauge', toolPath: '/tools/audit' },
    { id: 'matches',  label: 'Matches',  icon: 'BadgeCheck', toolPath: '/tools/matches' },
    { id: 'approve',  label: 'Approvals',icon: 'CheckSquare', toolPath: '/tools/approve' },
    { id: 'pack',     label: 'Media Pack', icon: 'Images', toolPath: '/tools/pack' },
    { id: 'contacts', label: 'Contacts', icon: 'Users', toolPath: '/tools/contacts' },
    { id: 'outreach', label: 'Outreach', icon: 'Send', toolPath: '/tools/outreach' },
  ];

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
      {/* Header with Tools button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Brand Run</h1>
          <p className="text-[var(--muted-fg)] mt-2">Execute your brand partnership workflow step by step.</p>
        </div>
        <Link href="/tools">
          <Button variant="secondary">
            🔧 Open Tools
          </Button>
        </Link>
      </div>

      {/* Premium Stepper */}
      <div className="mb-6">
        <StepperPro steps={steps} current={currentStep.toLowerCase()} />
      </div>
      
      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left: Content Pane */}
        <div className="max-w-[900px]">
          {renderStep()}
          
          {/* Deep links to tools */}
          <div className="mt-6 card p-4">
            <h3 className="font-medium mb-3">Run this step as a tool</h3>
            <div className="flex flex-wrap gap-2">
              {steps.map((step) => (
                <Link key={step.id} href={step.toolPath}>
                  <Button variant="secondary" size="sm">
                    {step.label} →
                  </Button>
                </Link>
              ))}
            </div>
            <p className="text-xs text-[var(--muted-fg)] mt-2">
              Run any step individually from the Tools area. Results automatically flow into your Brand Run.
            </p>
          </div>
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
