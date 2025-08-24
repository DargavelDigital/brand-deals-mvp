'use client';

import { Card } from '@/ui/containers';
import Button from '@/components/ui/Button';

export default function ContactsPage() {
  return (
    <div className="container py-6">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[var(--fg)]">Contacts</h1>
          <p className="text-lg text-[var(--muted-fg)] mt-2">
            Manage your brand contacts and outreach lists
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Lists */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-[var(--fg)] mb-4">Contact Lists</h2>
            <p className="text-[var(--muted-fg)] mb-4">
              Organize your contacts into lists for targeted outreach campaigns.
            </p>
            <Button>Create New List</Button>
          </Card>

          {/* Recent Contacts */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-[var(--fg)] mb-4">Recent Contacts</h2>
            <p className="text-[var(--muted-fg)] mb-4">
              Your most recently added or contacted brand representatives.
            </p>
            <Button variant="secondary">View All Contacts</Button>
          </Card>

          {/* Import/Export */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-[var(--fg)] mb-4">Import & Export</h2>
            <p className="text-[var(--muted-fg)] mb-4">
              Bulk import contacts from CSV or export your contact lists.
            </p>
            <div className="flex gap-3">
              <Button>Import CSV</Button>
              <Button variant="secondary">Export</Button>
            </div>
          </Card>

          {/* Analytics */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-[var(--fg)] mb-4">Contact Analytics</h2>
            <p className="text-[var(--muted-fg)] mb-4">
              Track engagement rates and response metrics for your contacts.
            </p>
            <Button variant="secondary">View Analytics</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
