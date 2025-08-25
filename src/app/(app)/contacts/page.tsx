'use client'

import { useState } from 'react'
import { Plus, Search, Filter, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

interface Contact {
  id: string
  name: string
  email: string
  company: string
  title: string
  status: 'active' | 'inactive'
  lastContact?: Date
}

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@nike.com',
    company: 'Nike',
    title: 'Marketing Director',
    status: 'active',
    lastContact: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike.chen@apple.com',
    company: 'Apple',
    title: 'Brand Partnerships Manager',
    status: 'active',
    lastContact: new Date('2024-01-10')
  }
]

export default function ContactsPage() {
  const [contacts] = useState<Contact[]>(mockContacts)

  return (
    <Section title="Contacts" description="Manage your brand partnership contacts">
      <div className="space-y-6">
        {/* Import/Create/Filters Form */}
        <Card className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">Search Contacts</label>
              <Input placeholder="Search by name, email, or company" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Filter by Status</label>
              <Select>
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <Button>Import Contacts</Button>
              <Button variant="secondary">Create New</Button>
              <Button variant="ghost">Export</Button>
            </div>
          </div>
        </Card>

        {/* Contacts List */}
        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-[var(--border)]">
            {contacts.map((contact) => (
              <div key={contact.id} className="px-4 py-3 hover:bg-[color:var(--surface)]/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[color:var(--accent)] flex items-center justify-center text-white text-sm font-medium">
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-[var(--muted)]">{contact.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={contact.status === 'active' ? 'bg-success/10 text-success' : 'bg-[color:var(--muted)]/10 text-[var(--muted)]'}>
                      {contact.status}
                    </Badge>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Section>
  );
}
