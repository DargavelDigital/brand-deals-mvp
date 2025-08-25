'use client';

import Button from '@/components/ui/Button';

interface StepConnectProps {
  onContinue: () => void;
  className?: string;
}

export function StepConnect({ onContinue, className = '' }: StepConnectProps) {
  const connectedAccounts = [
    { platform: 'Instagram', connected: true, handle: '@yourbrand', icon: '📷' },
    { platform: 'TikTok', connected: false, handle: null, icon: '🎵' },
    { platform: 'YouTube', connected: false, handle: null, icon: '📺' },
    { platform: 'X (Twitter)', connected: false, handle: null, icon: '🐦' },
    { platform: 'Facebook', connected: false, handle: null, icon: '📘' },
    { platform: 'LinkedIn', connected: false, handle: null, icon: '💼' },
  ];

  const connectedCount = connectedAccounts.filter(acc => acc.connected).length;
  const canContinue = connectedCount >= 1;

  return (
    <div>
      <div>
        <h1>Connect Accounts</h1>
        <p>
          Connect your social media accounts so we can audit your content and find the best brand matches.
        </p>
      </div>

      <div>
        <h2>Social Media Accounts</h2>
        
        <div>
          {connectedAccounts.map((account) => (
            <div key={account.platform}>
              <div>
                <div>
                  {account.connected ? '✓' : account.icon}
                </div>
                <div>
                  <div>{account.platform}</div>
                  {account.connected && (
                    <div>{account.handle}</div>
                  )}
                </div>
              </div>
              
              {account.connected ? (
                <span>
                  Connected
                </span>
              ) : (
                <Button>
                  Connect
                </Button>
              )}
            </div>
          ))}
        </div>

        <div>
          <div>
            <div>
              <div>
                {connectedCount} of {connectedAccounts.length} accounts connected
              </div>
              <div>
                {canContinue ? 'Ready to continue' : 'Connect at least 1 account to continue'}
              </div>
            </div>
            <Button
              onClick={onContinue}
              disabled={!canContinue}
            >
              Connected — Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
