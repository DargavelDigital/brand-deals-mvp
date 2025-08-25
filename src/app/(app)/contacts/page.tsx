'use client'

import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const mockContacts = [
  { id: 1, name: "John Smith", email: "john@acme.com", company: "Acme Corp", status: "Active" },
  { id: 2, name: "Sarah Johnson", email: "sarah@globex.com", company: "Globex Inc", status: "Pending" },
  { id: 3, name: "Mike Wilson", email: "mike@initech.com", company: "Initech", status: "Active" },
];

export default function ContactsPage() {
  return (
    <Section title="Contacts" description="Import, enrich, and manage contacts">
      <div className="space-y-6">
        {/* Filters and import panel */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input placeholder="Search contacts..." />
            </div>
            <Select>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </Select>
            <Button>Import CSV</Button>
          </div>
        </Card>

        {/* Results list */}
        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-[var(--border)]">
            {mockContacts.map((contact) => (
              <div key={contact.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[color:var(--accent)]/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-[color:var(--accent)]">
                      {contact.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{contact.name}</div>
                    <div className="text-sm text-[var(--muted)]">{contact.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[var(--muted)]">{contact.company}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    contact.status === 'Active' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-warn/10 text-warn'
                  }`}>
                    {contact.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Actions row */}
        <div className="flex items-center gap-3 justify-end">
          <Button variant="secondary">Export</Button>
          <Button>Add Contact</Button>
        </div>
      </div>
    </Section>
  );
}
