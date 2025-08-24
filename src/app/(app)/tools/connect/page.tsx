'use client';

import { useState, useEffect } from 'react';
import { Prereq } from '@/components/run/Prereq';
import { SocialLogo } from '@/components/ui/SocialLogo';
import { Button } from '@/components/ui/Button';

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
        <h1 className="text-3xl font-bold text-[var(--fg)] mb-2">
          Connect Social Media Accounts
        </h1>
        <p className="text-[var(--muted-fg)]">
          Connect your social media accounts to start discovering brand opportunities and run comprehensive audits.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* YouTube */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-[var(--muted)] rounded-lg flex items-center justify-center">
                <SocialLogo name="youtube" className="size-6 text-[var(--fg)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--fg)]">YouTube</h3>
                <p className="text-sm text-[var(--muted-fg)]">Channel analytics</p>
              </div>
            </div>
            <Button className="w-full">
              Connect Channel
            </Button>
          </div>

          {/* TikTok */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-[var(--muted)] rounded-lg flex items-center justify-center">
                <SocialLogo name="tiktok" className="size-6 text-[var(--fg)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--fg)]">TikTok</h3>
                <p className="text-sm text-[var(--muted-fg)]">Account insights</p>
              </div>
            </div>
            <Button className="w-full">
              Connect Account
            </Button>
          </div>

          {/* X (Twitter) */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-[var(--muted)] rounded-lg flex items-center justify-center">
                <SocialLogo name="x" className="size-6 text-[var(--fg)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--fg)]">X (Twitter)</h3>
                <p className="text-sm text-[var(--muted-fg)]">Profile analytics</p>
              </div>
            </div>
            <Button className="w-full">
              Connect Profile
            </Button>
          </div>

          {/* Facebook */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-[var(--muted)] rounded-lg flex items-center justify-center">
                <SocialLogo name="facebook" className="size-6 text-[var(--fg)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--fg)]">Facebook</h3>
                <p className="text-sm text-[var(--muted-fg)]">Page insights</p>
              </div>
            </div>
            <Button className="w-full">
              Connect Page
            </Button>
          </div>

          {/* LinkedIn */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-[var(--muted)] rounded-lg flex items-center justify-center">
                <SocialLogo name="linkedin" className="size-6 text-[var(--fg)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--fg)]">LinkedIn</h3>
                <p className="text-sm text-[var(--muted-fg)]">Company analytics</p>
              </div>
            </div>
            <Button className="w-full">
              Connect Company
            </Button>
          </div>

          {/* Instagram */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-[var(--muted)] rounded-lg flex items-center justify-center">
                <SocialLogo name="instagram" className="size-6 text-[var(--fg)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--fg)]">Instagram</h3>
                <p className="text-sm text-[var(--muted-fg)]">Profile insights</p>
              </div>
            </div>
            <Button className="w-full">
              Connect Profile
            </Button>
          </div>
        </div>
      </div>
  );
}
