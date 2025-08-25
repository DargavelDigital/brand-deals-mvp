'use client';

import { useState } from 'react'
import { CheckCircle, Circle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

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
    <Section title="Settings" description="Configure your workspace">
      <div className="space-y-6">
        {/* General Settings */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">General Settings</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">Workspace Name</label>
              <Input defaultValue="Hyper Workspace" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Timezone</label>
              <Select defaultValue="UTC">
                <option value="UTC">UTC</option>
                <option value="EST">Eastern Time</option>
                <option value="PST">Pacific Time</option>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Default Language</label>
              <Select defaultValue="en">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </Select>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Notifications</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-accent bg-surface border-border rounded focus:ring-accent focus:ring-2" />
              <span className="text-sm">Email notifications</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-accent bg-surface border-border rounded focus:ring-accent focus:ring-2" />
              <span className="text-sm">Push notifications</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 text-accent bg-surface border-border rounded focus:ring-accent focus:ring-2" />
              <span className="text-sm">Weekly reports</span>
            </label>
          </div>
        </Card>

        {/* Save Row */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary">Reset</Button>
          <Button>Save Changes</Button>
        </div>
      </div>
    </Section>
  );
}
