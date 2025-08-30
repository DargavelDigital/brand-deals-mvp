'use client';

import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  return (
    <div className="container-page py-6 lg:py-8">
      {/* Page title block */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-[var(--muted-fg)] mt-1">Manage your workspace configuration</p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6 lg:gap-10">
        {/* Left rail - Navigation */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-[var(--muted-fg)] uppercase tracking-wide">Settings</div>
          <nav className="space-y-1">
            <a href="#workspace" className="block px-3 py-2 text-sm rounded-md text-[var(--text)] hover:bg-[var(--muted)]/10">Workspace</a>
            <a href="#notifications" className="block px-3 py-2 text-sm rounded-md text-[var(--muted-fg)] hover:bg-[var(--muted)]/10">Notifications</a>
            <a href="#api" className="block px-3 py-2 text-sm rounded-md text-[var(--muted-fg)] hover:bg-[var(--muted)]/10">API & Integrations</a>
            <a href="#ai" className="block px-3 py-2 text-sm rounded-md text-[var(--muted-fg)] hover:bg-[var(--muted)]/10">AI & Usage</a>
            <a href="#access" className="block px-3 py-2 text-sm rounded-md text-[var(--muted-fg)] hover:bg-[var(--muted)]/10">Access Control</a>
            <a href="#activity" className="block px-3 py-2 text-sm rounded-md text-[var(--muted-fg)] hover:bg-[var(--muted)]/10">Activity</a>
          </nav>
        </div>

        {/* Right content */}
        <div className="space-y-6">
        {/* Workspace Settings */}
        <Card className="p-5 lg:p-6 space-y-4 rounded-xl bg-[var(--card)]">
          <h3 className="text-lg font-semibold">Workspace Settings</h3>
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

        {/* Notification Settings */}
        <Card className="p-5 lg:p-6 space-y-4 rounded-xl bg-[var(--card)]">
          <h3 className="text-lg font-semibold">Notification Settings</h3>
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

        {/* API Settings */}
        <Card className="p-5 lg:p-6 space-y-4 rounded-xl bg-[var(--card)]">
          <h3 className="text-lg font-semibold">API & Integrations</h3>
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

        {/* AI Usage & Costs */}
        <Card className="p-5 lg:p-6 space-y-4 rounded-xl bg-[var(--card)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">AI Usage & Costs</h3>
              <p className="text-sm text-[var(--muted-fg)]">Monitor token usage and costs</p>
            </div>
            <a 
              href="/settings/ai-usage" 
              className="inline-flex items-center justify-center rounded-md font-medium transition-standard focus-visible:outline-2 focus-visible:outline-[var(--accent)] disabled:opacity-60 disabled:cursor-not-allowed h-10 px-4 text-sm bg-surface text-[var(--text)] border border-[var(--border)] hover:bg-[var(--muted)]/10"
            >
              View Usage Dashboard
            </a>
          </div>
          <div className="text-sm text-[var(--muted-fg)]">
            Track AI model usage, token consumption, and cost breakdown across all AI-powered features.
          </div>
        </Card>

        {/* Agency Access */}
        <Card className="p-5 lg:p-6 space-y-4 rounded-xl bg-[var(--card)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Agency Access</h3>
              <p className="text-sm text-[var(--muted-fg)]">Manage who can access your workspace</p>
            </div>
            <a 
              href="/settings/agency-access" 
              className="inline-flex items-center justify-center rounded-md font-medium transition-standard focus-visible:outline-2 focus-visible:outline-[var(--accent)] disabled:opacity-60 disabled:cursor-not-allowed h-10 px-4 text-sm bg-surface text-[var(--text)] border border-[var(--border)] hover:bg-[var(--muted)]/10"
            >
              Manage Access
            </a>
          </div>
          <div className="text-sm text-[var(--muted-fg)]">
            Invite agency managers to help run Brand Runs, Outreach, and Media Packs on your behalf.
          </div>
        </Card>

        {/* Activity Log */}
        <Card className="p-5 lg:p-6 space-y-4 rounded-xl bg-[var(--card)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Activity Log</h3>
              <p className="text-sm text-[var(--muted-fg)]">Track all workspace activities</p>
            </div>
            <a 
              href="/settings/activity" 
              className="inline-flex items-center justify-center rounded-md font-medium transition-standard focus-visible:outline-2 focus-visible:outline-[var(--accent)] disabled:opacity-60 disabled:cursor-not-allowed h-10 px-4 text-sm bg-surface text-[var(--text)] border border-[var(--border)] hover:bg-[var(--muted)]/10"
            >
              View Log
            </a>
          </div>
          <div className="text-sm text-[var(--muted-fg)]">
            Monitor all actions taken in your workspace, including agency manager activities.
          </div>
        </Card>

        {/* AI Quality Monitoring */}
        <Card className="p-5 lg:p-6 space-y-4 rounded-xl bg-[var(--card)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">AI Quality Monitoring</h3>
              <p className="text-sm text-[var(--muted-fg)]">Track AI model performance and detect drift</p>
            </div>
            <a 
              href="/settings/ai-quality" 
              className="inline-flex items-center justify-center rounded-md font-medium transition-standard focus-visible:outline-2 focus-visible:outline-[var(--accent)] disabled:opacity-60 disabled:cursor-not-allowed h-10 px-4 text-sm bg-surface text-[var(--text)] border border-[var(--border)] hover:bg-[var(--muted)]/10"
            >
              Monitor Quality
            </a>
          </div>
          <div className="text-sm text-[var(--muted-fg)]">
            Continuously evaluate AI model quality, detect performance drift, and ensure consistent results across audit, matching, and outreach features.
          </div>
        </Card>



        {/* Save row */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary">Reset to Defaults</Button>
          <Button>Save Changes</Button>
        </div>
        </div>
      </div>
    </div>
  );
}
