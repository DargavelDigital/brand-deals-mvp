'use client';

import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  return (
    <Section title="Settings" description="Workspace configuration">
      <div className="space-y-6">
        {/* Workspace Settings */}
        <Card className="p-6 space-y-4">
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
        <Card className="p-6 space-y-4">
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
        <Card className="p-6 space-y-4">
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

        {/* Save row */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary">Reset to Defaults</Button>
          <Button>Save Changes</Button>
        </div>
      </div>
    </Section>
  );
}
