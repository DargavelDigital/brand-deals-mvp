'use client';

import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export default function SettingsGeneralPage() {
  return (
    <>
      {/* Workspace Settings */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Workspace Settings</h2>
        <Card className="p-5 lg:p-6 space-y-4 rounded-xl bg-[var(--card)]">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">Workspace Name</label>
              <Input defaultValue="My Brand Deals" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Timezone</label>
              <Select defaultValue="UTC">
                <option value="UTC">UTC</option>
                <option value="EST">Eastern Time</option>
                <option value="PST">Pacific Time</option>
                <option value="GMT">GMT</option>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <Input placeholder="Describe your workspace..." />
            </div>
          </div>
        </Card>
      </section>

      {/* Notification Settings */}
      <section className="mt-10 space-y-6">
        <h2 className="text-xl font-semibold">Notification Settings</h2>
        <Card className="p-5 lg:p-6 space-y-4 rounded-xl bg-[var(--card)]">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="email-notifications" className="w-4 h-4" defaultChecked />
              <label htmlFor="email-notifications" className="text-sm">Email notifications</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="push-notifications" className="w-4 h-4" defaultChecked />
              <label htmlFor="push-notifications" className="text-sm">Push notifications</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="brand-matches" className="w-4 h-4" defaultChecked />
              <label htmlFor="brand-matches" className="text-sm">Brand match alerts</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="outreach-updates" className="w-4 h-4" />
              <label htmlFor="outreach-updates" className="text-sm">Outreach updates</label>
            </div>
          </div>
        </Card>
      </section>

      {/* API Settings */}
      <section className="mt-10 space-y-6">
        <h2 className="text-xl font-semibold">API & Integrations</h2>
        <Card className="p-5 lg:p-6 space-y-4 rounded-xl bg-[var(--card)]">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">API Key</label>
              <Input type="password" defaultValue="sk_..." />
              <p className="text-[var(--error)] text-sm mt-1">API key will be regenerated on save</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Webhook URL</label>
              <Input placeholder="https://..." />
            </div>
          </div>
        </Card>
      </section>

      {/* Agency Management */}
      <section className="mt-10 space-y-6">
        <h2 className="text-xl font-semibold">Agency Management</h2>
        <Card className="p-5 lg:p-6 space-y-4 rounded-xl bg-[var(--card)]">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Agency Access Control</h4>
              <p className="text-[var(--muted-fg)] text-sm">Manage agency members and quickly switch agencies</p>
            </div>
            <a 
              href="/settings/agency-access"
              className="px-4 py-2 bg-[var(--accent)] text-white rounded-md hover:bg-[var(--accent)]/90 transition-colors"
            >
              Manage Access
            </a>
          </div>
        </Card>
      </section>

      {/* AI Usage & Costs */}
      <section className="mt-10 space-y-6">
        <h2 className="text-xl font-semibold">AI Usage & Costs</h2>
        <Card className="p-5 lg:p-6 space-y-4 rounded-xl bg-[var(--card)]">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Current Balance</h4>
              <p className="text-[var(--muted-fg)] text-sm">AI tokens remaining</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">1,247</div>
              <div className="text-[var(--muted-fg)] text-sm">tokens</div>
            </div>
          </div>
          <div className="pt-4 border-t border-[var(--border)]">
            <div className="flex items-center justify-between text-sm">
              <span>Daily Usage</span>
              <span className="text-[var(--muted-fg)]">23 tokens</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Monthly Average</span>
              <span className="text-[var(--muted-fg)]">156 tokens</span>
            </div>
          </div>
        </Card>
      </section>
    </>
  );
}
