'use client';

import { useState, useEffect } from 'react';
import { Prereq } from '@/components/run/Prereq';

interface BrandRun {
  id: string;
  step: string;
  auto: boolean;
  auditId?: string;
  selectedBrandIds?: string[];
  mediaPackId?: string;
  contactIds?: string[];
  sequenceId?: string;
}

interface PrereqCheck {
  met: boolean;
  missing: string[];
  quickActions: Array<{
    label: string;
    action: string;
    href?: string;
  }>;
}

interface Account {
  id: string;
  name: string;
  type: 'instagram' | 'tiktok' | 'youtube';
  followers: number;
  connected: boolean;
}

export default function ConnectToolPage() {
  const [run, setRun] = useState<BrandRun | null>(null);
  const [prereqCheck] = useState<PrereqCheck | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([
    { id: '1', name: '@branddeals_demo', type: 'instagram', followers: 125000, connected: false },
    { id: '2', name: '@branddeals_tiktok', type: 'tiktok', followers: 89000, connected: false },
    { id: '3', name: 'BrandDeals Channel', type: 'youtube', followers: 45000, connected: false },
  ]);

  // Mock workspace ID for demo
  const workspaceId = 'demo-workspace';

  useEffect(() => {
    // Fetch current run status
    fetch(`/api/brand-run/current?workspaceId=${workspaceId}`)
      .then(res => res.json())
      .then(data => {
        if (data.run) {
          setRun(data.run);
        }
      })
      .catch(console.error);
  }, [workspaceId]);

  const handleConnectAccount = (accountId: string) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === accountId ? { ...acc, connected: true } : acc
    ));
  };

  const handleSaveAndAdvance = async () => {
    if (!run) return;

    try {
      // Record the connection result
      await fetch('/api/brand-run/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId: run.id })
      });

      // Advance to next step
      const response = await fetch('/api/brand-run/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          runId: run.id, 
          nextStep: 'AUDIT' 
        })
      });

      if (response.ok) {
        const updatedRun = await response.json();
        setRun(updatedRun.run);
      }
    } catch (error) {
      console.error('Error advancing:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text)] mb-2">
                Connect Accounts
              </h1>
              <p className="text-[var(--muted)]">
                Connect your social media accounts to start discovering brand opportunities.
              </p>
            </div>

            {prereqCheck && <Prereq check={prereqCheck} />}

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-[var(--text)] mb-4">
                Social Media Accounts
              </h2>
              
              <div className="space-y-4">
                {accounts.map(account => (
                  <div key={account.id} className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                    <div className="flex items-center space-x-3">
                                              <div className="w-10 h-10 bg-[var(--brand)]/10 rounded-full flex items-center justify-center">
                          <span className="text-[var(--brand)] font-semibold">
                          {account.type === 'instagram' ? '📷' : account.type === 'tiktok' ? '🎵' : '📺'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-[var(--text)]">{account.name}</div>
                        <div className="text-sm text-[var(--muted)]">
                          {account.followers.toLocaleString()} followers
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleConnectAccount(account.id)}
                      disabled={account.connected}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        account.connected
                          ? 'bg-[var(--positive)]/10 text-[var(--positive)] cursor-not-allowed'
                          : 'bg-[var(--brand)] text-white hover:bg-[var(--brand)]/90'
                      }`}
                    >
                      {account.connected ? 'Connected' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-[var(--border)]">
                <button
                  onClick={handleSaveAndAdvance}
                  className="w-full bg-[var(--brand)] text-white py-3 px-4 rounded-lg font-medium hover:bg-[var(--brand)]/90 transition-colors"
                >
                  Mark as Connected & Save
                </button>
              </div>
            </div>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-[var(--text)] mb-4">
                Next Steps
              </h2>
              <p className="text-[var(--muted)] mb-4">
                Once your accounts are connected, you&apos;ll be able to run an AI audit to analyze your content and find brand matches.
              </p>
              <button
                onClick={handleSaveAndAdvance}
                className="bg-[var(--secondary)] text-[var(--text)] py-2 px-4 rounded-md font-medium hover:bg-[var(--secondary)]/80 transition-colors"
              >
                Advance to Next Stage
              </button>
            </div>
          </div>

          {/* Right Rail */}
          <div className="space-y-6">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[var(--text)] mb-4">
                Run Status
              </h3>
              {run ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted)]">Current Step:</span>
                    <span className="text-sm font-medium text-[var(--text)]">{run.step}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted)]">Mode:</span>
                    <span className="text-sm font-medium text-[var(--text)]">
                      {run.auto ? 'Auto' : 'Manual'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[var(--muted)]">No active run</p>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
