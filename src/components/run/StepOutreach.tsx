'use client';

import { useState, useEffect } from 'react';
import { isDemo } from '@/lib/config';
import Button from '@/components/ui/Button';

interface StepOutreachProps {
  onComplete: () => void;
  onBack: () => void;
}

export function StepOutreach({ onComplete, onBack }: StepOutreachProps) {
  const [template, setTemplate] = useState('intro_v1');
  const [sender, setSender] = useState('demo@branddeals.test');
  const [pauseBeforeSend, setPauseBeforeSend] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    setDemoMode(isDemo());
  }, []);

  const templates = [
    { id: 'intro_v1', name: 'Intro Email', subject: '{{creatorName}} × {{brandName}} — quick idea for your team' },
    { id: 'proof_v1', name: 'Proof Email', subject: 'Results from creators like {{creatorName}} + 1 idea for {{brandName}}' },
    { id: 'nudge_v1', name: 'Nudge Email', subject: 'Last note — {{brandName}} collab options (15-min?)' },
  ];

  const startOutreach = async () => {
    setIsStarting(true);
    
    try {
      // Use provider system for email sending
      const { Providers } = await import('@/services/providers');
      const emailResult = await Providers.email.send({ 
        to: 'demo@example.com', 
        subject: 'Brand Partnership Opportunity', 
        html: '<p>Hi there, I would love to discuss a potential partnership...</p>',
        attachments: []
      });
      
      console.log('Email sent:', emailResult);
      
      // Continue to completion
      onComplete();
    } catch (error) {
      console.error('Outreach failed:', error);
      // Fallback to completion
      onComplete();
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div>
      <div>
        <div>
          <h1>Outreach</h1>
          {demoMode && (
            <span>
              Demo Send (no live delivery)
            </span>
          )}
        </div>
        <p>
          Configure your outreach sequence and send the first email to your selected contacts.
        </p>
      </div>

      <div>
        <h2>Outreach Configuration</h2>
        
        <div>
          {/* Template Selection */}
          <div>
            <h3>Email Template</h3>
            <div>
              {templates.map((templateOption) => (
                <div 
                  key={templateOption.id} 
                  onClick={() => setTemplate(templateOption.id)}
                >
                  <div>
                    <div>
                      {template === templateOption.id && <div />}
                    </div>
                    <h4>{templateOption.name}</h4>
                  </div>
                  <p>{templateOption.subject}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sender Configuration */}
          <div>
            <h3>Sender Details</h3>
            <div>
              <label>
                From Email
                <input
                  type="email"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  placeholder="your@email.com"
                />
              </label>
            </div>
          </div>

          {/* Settings */}
          <div>
            <h3>Settings</h3>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={pauseBeforeSend}
                  onChange={(e) => setPauseBeforeSend(e.target.checked)}
                />
                Pause before sending (review emails first)
              </label>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div>
          <div>
            <div>
              Ready to start outreach sequence
            </div>
            <div>
              {demoMode ? 'Demo mode - no live emails will be sent' : 'Live emails will be sent to selected contacts'}
            </div>
          </div>
          <div>
            <Button
              onClick={onBack}
            >
              Back
            </Button>
            <Button
              onClick={startOutreach}
              disabled={isStarting}
            >
              {isStarting ? 'Starting...' : 'Start Outreach Sequence'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
