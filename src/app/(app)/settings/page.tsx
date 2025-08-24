'use client';

import { DashboardGrid, Col } from '@/ui/containers';
import { DemoToggle } from './demo-toggle';
import { ThemeToggle } from './theme-toggle';

export default function SettingsPage() {
  // Mock data for demonstration
  const mockUser = {
    name: 'Demo User',
    email: 'demo@branddeals.test',
    plan: 'Starter',
    credits: {
      audit: 200,
      mediaPack: 50,
      outreach: 100
    }
  };

  const mockPreferences = [
    {
      id: '1',
      name: 'Email Notifications',
      description: 'Receive notifications about deal updates and responses',
      enabled: true
    },
    {
      id: '2',
      name: 'Weekly Reports',
      description: 'Get weekly summaries of your outreach performance',
      enabled: false
    },
    {
      id: '3',
      name: 'Brand Suggestions',
      description: 'Receive AI-powered brand recommendations',
      enabled: true
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Settings</h1>
        <p className="text-[var(--muted)]">Manage your account preferences and subscription</p>
      </div>

      <DashboardGrid>
        <Col className="md:col-span-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-[var(--fg)] mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--muted-fg)] mb-1">Name</label>
                <input
                  type="text"
                  value={mockUser.name}
                  className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-600)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--muted-fg)] mb-1">Email</label>
                <input
                  type="email"
                  value={mockUser.email}
                  className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-600)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--muted-fg)] mb-1">Current Plan</label>
                <div className="px-3 py-2 bg-[var(--brand-500)] text-white rounded-lg font-medium">
                  {mockUser.plan}
                </div>
              </div>
            </div>
          </div>
        </Col>

        <Col className="md:col-span-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-[var(--fg)] mb-4">Credits & Usage</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--fg)]">{mockUser.credits.audit}</div>
                  <div className="text-sm text-[var(--muted-fg)]">Audit Credits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--fg)]">{mockUser.credits.mediaPack}</div>
                  <div className="text-sm text-[var(--muted-fg)]">Media Pack</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--fg)]">{mockUser.credits.outreach}</div>
                  <div className="text-sm text-[var(--muted-fg)]">Outreach</div>
                </div>
              </div>
              <button className="w-full btn-primary">
                Upgrade Plan
              </button>
            </div>
          </div>
        </Col>

        <Col className="md:col-span-12">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-[var(--fg)] mb-4">Preferences</h2>
            <div className="space-y-4">
              {mockPreferences.map((preference) => (
                <div key={preference.id} className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                  <div>
                    <h3 className="font-medium text-[var(--fg)]">{preference.name}</h3>
                    <p className="text-sm text-[var(--muted-fg)]">{preference.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preference.enabled}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[var(--muted)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--brand-500)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--brand-500)]"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </Col>

        <Col className="md:col-span-12">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-[var(--fg)] mb-4">More Options</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <a 
                  href="/swipe" 
                  className="p-4 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors text-center"
                >
                  <div className="text-2xl mb-2">🔄</div>
                  <h3 className="font-medium text-[var(--fg)]">Legacy Swipe</h3>
                  <p className="text-sm text-[var(--muted-fg)]">Original brand discovery interface</p>
                </a>
                <a 
                  href="/crm" 
                  className="p-4 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors text-center"
                >
                  <div className="text-2xl mb-2">📊</div>
                  <h3 className="font-medium text-[var(--fg)]">Legacy CRM</h3>
                  <p className="text-sm text-[var(--muted-fg)]">Original deal management interface</p>
                </a>
                <a 
                  href="/outreach" 
                  className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors text-center"
                >
                  <div className="text-2xl mb-2">📧</div>
                  <h3 className="font-medium text-[var(--fg)]">Legacy Outreach</h3>
                  <p className="text-sm text-[var(--muted-fg)]">Original email template management</p>
                </a>
              </div>
            </div>
          </div>
        </Col>

        {/* Theme Toggle */}
        <Col className="md:col-span-12">
          <ThemeToggle />
        </Col>

        {/* Demo Mode Toggle - Development Only */}
        <Col className="md:col-span-12">
          <DemoToggle />
        </Col>
      </DashboardGrid>
    </div>
  );
}
