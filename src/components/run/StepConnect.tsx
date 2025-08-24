'use client';

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
    <div className={`space-y-6 ${className}`}>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)] mb-2">Connect Accounts</h1>
        <p className="text-[var(--muted)]">
          Connect your social media accounts so we can audit your content and find the best brand matches.
        </p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
        <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Social Media Accounts</h2>
        
        <div className="space-y-4">
          {connectedAccounts.map((account) => (
            <div key={account.platform} className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                  account.connected ? 'bg-[var(--positive)]' : 'bg-[var(--muted)]'
                }`}>
                  {account.connected ? '✓' : account.icon}
                </div>
                <div>
                  <div className="font-medium text-[var(--text)]">{account.platform}</div>
                  {account.connected && (
                    <div className="text-sm text-[var(--muted)]">{account.handle}</div>
                  )}
                </div>
              </div>
              
              {account.connected ? (
                <span className="px-3 py-1 bg-[var(--positive)]/20 text-[var(--positive)] text-sm font-medium rounded-full">
                  Connected
                </span>
              ) : (
                <button className="px-4 py-2 bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white font-medium rounded-lg transition-colors">
                  Connect
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-[var(--panel)] rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[var(--text)]">
                {connectedCount} of {connectedAccounts.length} accounts connected
              </div>
              <div className="text-xs text-[var(--muted)]">
                {canContinue ? 'Ready to continue' : 'Connect at least 1 account to continue'}
              </div>
            </div>
            <button
              onClick={onContinue}
              disabled={!canContinue}
              className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                canContinue
                  ? 'bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white'
                  : 'bg-[var(--muted)] text-[var(--text)] cursor-not-allowed'
              }`}
            >
              Connected — Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
