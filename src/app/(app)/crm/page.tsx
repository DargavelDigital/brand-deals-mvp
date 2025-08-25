'use client';

import { Kanban, Plus, Filter, Search } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function CRMPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM</h1>
          <p className="text-[var(--muted-fg)] mt-2">Manage your leads, deals, and customer relationships.</p>
        </div>
        <Button>
          <Plus className="size-4 mr-2" />
          New Deal
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="card p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--muted-fg)]" />
            <input
              type="text"
              placeholder="Search deals..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] focus:border-[var(--ring)] focus:outline-none"
            />
          </div>
          <Button variant="secondary">
            <Filter className="size-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* CRM Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Lead Generation */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Lead Generation</h3>
            <span className="text-sm text-[var(--muted-fg)]">12</span>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 bg-[var(--muted)] rounded-lg">
                <div className="font-medium text-sm">Lead {i + 1}</div>
                <div className="text-xs text-[var(--muted-fg)]">Company {i + 1}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Qualification */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Qualification</h3>
            <span className="text-sm text-[var(--muted-fg)]">8</span>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 bg-[var(--muted)] rounded-lg">
                <div className="font-medium text-sm">Deal {i + 1}</div>
                <div className="text-xs text-[var(--muted-fg)]">$2,500</div>
              </div>
            ))}
          </div>
        </div>

        {/* Proposal */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Proposal</h3>
            <span className="text-sm text-[var(--muted-fg)]">5</span>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-3 bg-[var(--muted)] rounded-lg">
                <div className="font-medium text-sm">Proposal {i + 1}</div>
                <div className="text-xs text-[var(--muted-fg)]">$5,000</div>
              </div>
            ))}
          </div>
        </div>

        {/* Closed Won */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Closed Won</h3>
            <span className="text-sm text-[var(--muted-fg)]">3</span>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-3 bg-[var(--success)]/10 rounded-lg border border-[var(--success)]/20">
                <div className="font-medium text-sm">Won Deal {i + 1}</div>
                <div className="text-xs text-[var(--success)]">$8,500</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
