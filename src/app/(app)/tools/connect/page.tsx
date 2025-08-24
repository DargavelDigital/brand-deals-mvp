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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">
          Connect Social Media Accounts
        </h1>
        <p className="text-[var(--muted)]">
          Connect your social media accounts to start discovering brand opportunities and run comprehensive audits.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* YouTube */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">YT</span>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text)]">YouTube</h3>
                <p className="text-sm text-[var(--muted)]">Channel analytics</p>
              </div>
            </div>
            <button className="w-full bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white py-2 px-4 rounded-lg transition-colors">
              Connect Channel
            </button>
          </div>

          {/* TikTok */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">TT</span>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text)]">TikTok</h3>
                <p className="text-sm text-[var(--muted)]">Account insights</p>
              </div>
            </div>
            <button className="w-full bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white py-2 px-4 rounded-lg transition-colors">
              Connect Account
            </button>
          </div>

          {/* X (Twitter) */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">X</span>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text)]">X (Twitter)</h3>
                <p className="text-sm text-[var(--muted)]">Profile analytics</p>
              </div>
            </div>
            <button className="w-full bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white py-2 px-4 rounded-lg transition-colors">
              Connect Profile
            </button>
          </div>

          {/* Facebook */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">FB</span>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text)]">Facebook</h3>
                <p className="text-sm text-[var(--muted)]">Page insights</p>
              </div>
            </div>
            <button className="w-full bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white py-2 px-4 rounded-lg transition-colors">
              Connect Page
            </button>
          </div>

          {/* LinkedIn */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">LI</span>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text)]">LinkedIn</h3>
                <p className="text-sm text-[var(--muted)]">Company analytics</p>
              </div>
            </div>
            <button className="w-full bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white py-2 px-4 rounded-lg transition-colors">
              Connect Company
            </button>
          </div>

          {/* Instagram */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">IG</span>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text)]">Instagram</h3>
                <p className="text-sm text-[var(--muted)]">Profile insights</p>
              </div>
            </div>
            <button className="w-full bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white py-2 px-4 rounded-lg transition-colors">
              Connect Profile
            </button>
          </div>
        </div>
      </div>
  );
}
