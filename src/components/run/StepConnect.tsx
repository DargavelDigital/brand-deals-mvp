'use client';

import { useState } from 'react'
import { Button } from '@/components/ui/Button';

interface StepConnectProps {
  onContinue: () => void;
  className?: string;
}

export function StepConnect({ onContinue, className = '' }: StepConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  
  const connectedAccounts = [
    { platform: 'Instagram', connected: true, handle: '@yourbrand', icon: '📷' },
    { platform: 'TikTok', connected: false, handle: null, icon: '🎵' },
    { platform: 'YouTube', connected: false, handle: null, icon: '📺' },
    { platform: 'X (Twitter)', connected: false, handle: null, icon: '🐦' },
    { platform: 'Facebook', connected: false, handle: null, icon: '📘' },
    { platform: 'LinkedIn', connected: false, handle: null, icon: '💼' },
    { platform: 'OnlyFans', connected: false, handle: null, icon: '💎' },
  ];

  const connectedCount = connectedAccounts.filter(acc => acc.connected).length;
  const canContinue = connectedCount >= 1;

  const handleConnectInstagram = async () => {
    setIsConnecting(true);
    try {
      // Redirect to Instagram OAuth start
      window.location.href = '/api/instagram/auth/start';
    } catch (error) {
      console.error('Failed to start Instagram connection:', error);
      setIsConnecting(false);
    }
  };

  const handleConnectTikTok = async () => {
    setIsConnecting(true);
    try {
      // Redirect to TikTok OAuth start
      window.location.href = '/api/tiktok/auth/start';
    } catch (error) {
      console.error('Failed to start TikTok connection:', error);
      setIsConnecting(false);
    }
  };

  const handleConnectLinkedIn = async () => {
    setIsConnecting(true);
    try {
      // Redirect to LinkedIn OAuth start
      window.location.href = '/api/linkedin/auth/start';
    } catch (error) {
      console.error('Failed to start LinkedIn connection:', error);
      setIsConnecting(false);
    }
  };

  const handleConnectX = async () => {
    setIsConnecting(true);
    try {
      // Redirect to X OAuth start
      window.location.href = '/api/x/auth/start';
    } catch (error) {
      console.error('Failed to start X connection:', error);
      setIsConnecting(false);
    }
  };

  const handleConnectOnlyFans = async () => {
    setIsConnecting(true);
    try {
      // Redirect to OnlyFans OAuth start
      window.location.href = '/api/onlyfans/auth/start';
    } catch (error) {
      console.error('Failed to start OnlyFans connection:', error);
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-text">Connect Accounts</h1>
        <p className="text-muted max-w-2xl mx-auto">
          Connect your social media accounts so we can audit your content and find the best brand matches.
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-text">Social Media Accounts</h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {connectedAccounts.map((account) => (
            <div key={account.platform} className="p-4 bg-surface rounded-lg border border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {account.connected ? '✓' : account.icon}
                  </div>
                  <div>
                    <div className="font-medium text-text">{account.platform}</div>
                    {account.connected && (
                      <div className="text-sm text-muted">{account.handle}</div>
                    )}
                  </div>
                </div>
                
                {account.connected ? (
                  <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">
                    Connected
                  </span>
                ) : (
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={
                      account.platform === 'Instagram' ? handleConnectInstagram :
                      account.platform === 'TikTok' ? handleConnectTikTok :
                      account.platform === 'LinkedIn' ? handleConnectLinkedIn :
                      account.platform === 'X (Twitter)' ? handleConnectX :
                      account.platform === 'OnlyFans' ? handleConnectOnlyFans :
                      undefined
                    }
                    disabled={
                      (isConnecting && account.platform === 'Instagram') ||
                      (isConnecting && account.platform === 'TikTok') ||
                      (isConnecting && account.platform === 'LinkedIn') ||
                      (isConnecting && account.platform === 'X (Twitter)') ||
                      (isConnecting && account.platform === 'OnlyFans')
                    }
                                      >
                      {isConnecting && account.platform === 'Instagram' ? 'Connecting...' : 
                       isConnecting && account.platform === 'TikTok' ? 'Connecting...' : 
                       isConnecting && account.platform === 'LinkedIn' ? 'Connecting...' :
                       isConnecting && account.platform === 'X (Twitter)' ? 'Connecting...' :
                       isConnecting && account.platform === 'OnlyFans' ? 'Connecting...' :
                       'Connect'}
                    </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center space-y-4">
          <div className="space-y-2">
            <div className="text-lg font-medium text-text">
              {connectedCount} of {connectedAccounts.length} accounts connected
            </div>
            <div className="text-sm text-muted">
              {canContinue ? 'Ready to continue' : 'Connect at least 1 account to continue'}
            </div>
          </div>
          <Button
            onClick={onContinue}
            disabled={!canContinue}
            variant={canContinue ? 'primary' : 'secondary'}
          >
            Connected — Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
