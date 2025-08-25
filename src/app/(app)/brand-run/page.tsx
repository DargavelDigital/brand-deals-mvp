'use client';

import { useState } from 'react';
import { RunProgress } from '@/components/run/RunProgress';
import { RunRail } from '@/components/run/RunRail';
import { Prereq } from '@/components/run/Prereq';
import Button from '@/components/ui/Button';

interface BrandRun {
  id: string;
  step: string;
  auto: boolean;
  selectedBrandIds: string[];
  status: 'running' | 'paused' | 'completed';
}

const mockBrandRun: BrandRun = {
  id: 'run-1',
  step: 'BRAND_IDENTIFICATION',
  auto: false,
  selectedBrandIds: ['brand-1', 'brand-2'],
  status: 'running',
};

export default function BrandRunPage() {
  const [brandRun, setBrandRun] = useState<BrandRun>(mockBrandRun);

  const handleAutoModeToggle = (enabled: boolean) => {
    setBrandRun(prev => ({ ...prev, auto: enabled }));
  };

  const handleStepComplete = (step: string) => {
    console.log('Step completed:', step);
    // Logic to advance to next step
  };

  const handleStepBack = () => {
    console.log('Step back');
    // Logic to go back to previous step
  };

  const handleStepContinue = () => {
    console.log('Step continue');
    // Logic to continue to next step
  };

  const runStepAsTool = async (step: string) => {
    console.log('Running step as tool:', step);
    // Logic to run step independently
  };

  return (
    <div>
      <div>
        <div>
          <h1>Brand Run</h1>
          <p>Execute your brand partnership workflow step by step.</p>
        </div>
      </div>

      <div>
        <div>
          <div>
            <RunProgress
              currentStep={brandRun.step}
              onStepComplete={handleStepComplete}
              onStepBack={handleStepBack}
              onStepContinue={handleStepContinue}
            />
          </div>

          <div>
            <div>
              <h3>Run this step as a tool</h3>
              <div>
                <Button onClick={() => runStepAsTool('audit')}>
                  Run AI Audit
                </Button>
                <Button onClick={() => runStepAsTool('brand-identification')}>
                  Find Brands
                </Button>
                <Button onClick={() => runStepAsTool('contact-finder')}>
                  Find Contacts
                </Button>
                <Button onClick={() => runStepAsTool('media-pack')}>
                  Generate Media Pack
                </Button>
                <Button onClick={() => runStepAsTool('outreach')}>
                  Start Outreach
                </Button>
              </div>
              <p>
                Run any step independently to test or debug specific functionality.
              </p>
            </div>
          </div>
        </div>

        <div>
          <RunRail
            run={brandRun}
            onAutoModeToggle={handleAutoModeToggle}
          />
        </div>
      </div>
    </div>
  );
}
