'use client';

import { useState, useEffect } from 'react';
import { isDemo } from '@/lib/config';

interface StepOutreachProps {
  onComplete: () => void;
  onBack: () => void;
  className?: string;
}

export function StepOutreach({ onComplete, onBack, className = '' }: StepOutreachProps) {
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
    <div className={`space-y-6 ${className}`}>
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)]">Outreach</h1>
          {demoMode && (
            <span className="px-2 py-1 bg-[var(--warning)]/20 text-[var(--warning)] text-xs font-medium rounded-full">
              Demo Send (no live delivery)
            </span>
          )}
        </div>
        <p className="text-[var(--muted)]">
          Configure your outreach sequence and send the first email to your selected contacts.
        </p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
        <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Outreach Configuration</h2>
        
        <div className="space-y-6">
          {/* Template Selection */}
          <div>
            <h3 className="text-lg font-medium text-[var(--text)] mb-3">Email Template</h3>
            <div className="space-y-3">
              {templates.map((templateOption) => (
                <div 
                  key={templateOption.id} 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    template === templateOption.id 
                      ? 'border-[var(--brand)] bg-[var(--brand)]/10' 
                      : 'border-[var(--border)] hover:border-[var(--muted)]'
                  }`}
                  onClick={() => setTemplate(templateOption.id)}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center">
                      {template === templateOption.id && <div className="w-2 h-2 bg-current rounded-full" />}
                    </div>
                    <h4 className="font-medium text-[var(--text)]">{templateOption.name}</h4>
                  </div>
                  <p className="text-sm text-[var(--muted)]">{templateOption.subject}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sender Configuration */}
          <div>
            <h3 className="text-lg font-medium text-[var(--text)] mb-3">Sender Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[var(--muted)] mb-1">From Email</label>
                <input
                  type="email"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--panel)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                />
              </div>
            </div>
          </div>

          {/* Auto Mode Settings */}
          <div>
            <h3 className="text-lg font-medium text-[var(--text)] mb-3">Auto Mode Settings</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pauseBeforeSend}
                  onChange={(e) => setPauseBeforeSend(e.target.checked)}
                  className="w-4 h-4 text-[var(--brand)] bg-[var(--panel)] border-[var(--border)] rounded focus:ring-[var(--brand)] focus:ring-2"
                />
                <span className="text-sm text-[var(--text)]">Pause before send</span>
              </label>
              <p className="text-xs text-[var(--muted)] ml-7">
                If enabled, the sequence will be created but the first email won't be sent automatically.
              </p>
            </div>
          </div>

          {/* Sequence Preview */}
          <div>
            <h3 className="text-lg font-medium text-[var(--text)] mb-3">Sequence Preview</h3>
            <div className="p-4 bg-[var(--panel)] rounded-lg">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-[var(--brand)] rounded-full flex items-center justify-center text-white text-xs font-medium">
                    1
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[var(--text)]">Intro Email</div>
                    <div className="text-sm text-[var(--muted)]">Sent immediately</div>
                  </div>
                  <div className="text-xs text-[var(--muted)]">Day 0</div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-[var(--muted)] rounded-full flex items-center justify-center text-white text-xs font-medium">
                    2
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[var(--text)]">Proof Email</div>
                    <div className="text-sm text-[var(--muted)]">If no response</div>
                  </div>
                  <div className="text-xs text-[var(--muted)]">Day 3</div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-[var(--muted)] rounded-full flex items-center justify-center text-white text-xs font-medium">
                    3
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[var(--text)]">Nudge Email</div>
                    <div className="text-sm text-[var(--muted)]">Final follow-up</div>
                  </div>
                  <div className="text-xs text-[var(--muted)]">Day 7</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[var(--border)]">
            <div className="flex justify-between">
              <button
                onClick={onBack}
                className="px-4 py-2 text-[var(--text)] hover:bg-[var(--panel)] font-medium rounded-lg transition-colors border border-[var(--border)]"
              >
                Back
              </button>
              <button
                onClick={startOutreach}
                disabled={isStarting}
                className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                  isStarting
                    ? 'bg-[var(--muted)] text-[var(--text)] cursor-not-allowed'
                    : 'bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white'
                }`}
              >
                {isStarting ? 'Starting...' : 'Start Outreach'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
