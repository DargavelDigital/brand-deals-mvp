'use client';

import { Users, Plus, Search, Filter } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-[var(--muted-fg)] mt-2">Manage your brand and influencer contacts.</p>
        </div>
        <Button>
          <Plus className="size-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="card p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--muted-fg)]" />
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] focus:border-[var(--ring)] focus:outline-none"
            />
          </div>
          <Button variant="secondary">
            <Filter className="size-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card p-4 hover:bg-[var(--muted)] transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-12 rounded-full bg-[var(--brand-600)] grid place-items-center text-white font-semibold">
                {String.fromCharCode(65 + i)}
              </div>
              <div>
                <div className="font-medium">Contact {i + 1}</div>
                <div className="text-sm text-[var(--muted-fg)]">contact{i + 1}@example.com</div>
              </div>
            </div>
            <div className="text-sm text-[var(--muted-fg)] mb-3">
              Brand Manager at Company {i + 1}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary">View</Button>
              <Button size="sm">Message</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
