'use client'

import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function OutreachPage() {
  return (
    <Section title="Outreach" description="Sequences and templates">
      <div className="space-y-6">
        {/* Editor card */}
        <Card className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Subject Line</label>
            <Input placeholder="Enter email subject..." />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Email Template</label>
            <textarea 
              className="min-h-[120px] w-full rounded-md border border-[var(--border)] px-3 py-2 focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              placeholder="Write your email template here..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Sequence Name</label>
            <Input placeholder="e.g., Initial Outreach, Follow-up 1" />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button>Save Template</Button>
          <Button variant="secondary">Preview</Button>
          <Button variant="ghost">Load Template</Button>
        </div>

        {/* Templates list */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Saved Templates</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-[var(--border)] rounded-md">
              <div>
                <div className="font-medium">Initial Outreach</div>
                <div className="text-sm text-[var(--muted)]">First contact with potential brand partners</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">Edit</Button>
                <Button variant="ghost" size="sm">Use</Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-[var(--border)] rounded-md">
              <div>
                <div className="font-medium">Follow-up</div>
                <div className="text-sm text-[var(--muted)]">Gentle reminder after initial contact</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">Edit</Button>
                <Button variant="ghost" size="sm">Use</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Section>
  );
}
