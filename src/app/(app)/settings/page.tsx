'use client';

import { DashboardGrid, Col } from '@/ui/containers';
import { DemoToggle } from './demo-toggle';
import ThemeToggle from './theme-toggle';
import Button from '@/components/ui/Button';

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
    <div>
      <div>
        <h1>Settings</h1>
        <p>Manage your account preferences and subscription</p>
      </div>

      <DashboardGrid>
        <Col>
          <div>
            <h2>Account Information</h2>
            <div>
              <div>
                <label>Name</label>
                <input
                  type="text"
                  value={mockUser.name}
                />
              </div>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  value={mockUser.email}
                />
              </div>
              <div>
                <label>Current Plan</label>
                <div>
                  {mockUser.plan}
                </div>
              </div>
            </div>
          </div>
        </Col>

        <Col>
          <div>
            <h2>Credits & Usage</h2>
            <div>
              <div>
                <div>
                  <div>{mockUser.credits.audit}</div>
                  <div>Audit Credits</div>
                </div>
                <div>
                  <div>{mockUser.credits.mediaPack}</div>
                  <div>Media Pack</div>
                </div>
                <div>
                  <div>{mockUser.credits.outreach}</div>
                  <div>Outreach</div>
                </div>
              </div>
              <Button>
                Upgrade Plan
              </Button>
            </div>
          </div>
        </Col>

        <Col>
          <div>
            <h2>Preferences</h2>
            <div>
              {mockPreferences.map((preference) => (
                <div key={preference.id}>
                  <div>
                    <h3>{preference.name}</h3>
                    <p>{preference.description}</p>
                  </div>
                  <label>
                    <input
                      type="checkbox"
                      checked={preference.enabled}
                    />
                    <span>Enable</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </Col>

        <Col>
          <div>
            <h2>Theme Settings</h2>
            <ThemeToggle />
          </div>
        </Col>

        <Col>
          <div>
            <h2>Demo Settings</h2>
            <DemoToggle />
          </div>
        </Col>
      </DashboardGrid>
    </div>
  );
}
