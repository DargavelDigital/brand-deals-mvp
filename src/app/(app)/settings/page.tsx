'use client';

import { DashboardGrid, Col } from '@/ui/containers';
import { DemoToggle } from './demo-toggle';

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
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
            <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--muted)] mb-1">Name</label>
                <input
                  type="text"
                  value={mockUser.name}
                  className="w-full px-3 py-2 bg-[var(--panel)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--muted)] mb-1">Email</label>
                <input
                  type="email"
                  value={mockUser.email}
                  className="w-full px-3 py-2 bg-[var(--panel)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--muted)] mb-1">Current Plan</label>
                <div className="px-3 py-2 bg-[var(--brand)] text-white rounded-lg font-medium">
                  {mockUser.plan}
                </div>
              </div>
            </div>
          </div>
        </Col>

        <Col className="md:col-span-6">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
            <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Credits & Usage</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--text)]">{mockUser.credits.audit}</div>
                  <div className="text-sm text-[var(--muted)]">Audit Credits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--text)]">{mockUser.credits.mediaPack}</div>
                  <div className="text-sm text-[var(--muted)]">Media Pack</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--text)]">{mockUser.credits.outreach}</div>
                  <div className="text-sm text-[var(--muted)]">Outreach</div>
                </div>
              </div>
              <button className="w-full bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Upgrade Plan
              </button>
            </div>
          </div>
        </Col>

        <Col className="md:col-span-12">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
            <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Preferences</h2>
            <div className="space-y-4">
              {mockPreferences.map((preference) => (
                <div key={preference.id} className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                  <div>
                    <h3 className="font-medium text-[var(--text)]">{preference.name}</h3>
                    <p className="text-sm text-[var(--muted)]">{preference.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preference.enabled}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[var(--muted)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--brand)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--brand)]"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </Col>

        <Col className="md:col-span-12">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
            <h2 className="text-xl font-semibold text-[var(--text)] mb-4">More Options</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <a 
                  href="/swipe" 
                  className="p-4 border border-[var(--border)] rounded-lg hover:bg-[var(--panel)] transition-colors text-center"
                >
                  <div className="text-2xl mb-2">🔄</div>
                  <h3 className="font-medium text-[var(--text)]">Legacy Swipe</h3>
                  <p className="text-sm text-[var(--muted)]">Original brand discovery interface</p>
                </a>
                <a 
                  href="/crm" 
                  className="p-4 border border-[var(--border)] rounded-lg hover:bg-[var(--panel)] transition-colors text-center"
                >
                  <div className="text-2xl mb-2">📊</div>
                  <h3 className="font-medium text-[var(--text)]">Legacy CRM</h3>
                  <p className="text-sm text-[var(--muted)]">Original deal management interface</p>
                </a>
                <a 
                  href="/outreach" 
                  className="p-4 border border-[var(--border)] rounded-lg hover:bg-[var(--panel)] transition-colors text-center"
                >
                  <div className="text-2xl mb-2">📧</div>
                  <h3 className="font-medium text-[var(--text)]">Legacy Outreach</h3>
                  <p className="text-sm text-[var(--muted)]">Original email template management</p>
                </a>
              </div>
            </div>
          </div>
        </Col>

        {/* Demo Mode Toggle - Development Only */}
        <Col className="md:col-span-12">
          <DemoToggle />
        </Col>
      </DashboardGrid>
    </div>
  );
}
