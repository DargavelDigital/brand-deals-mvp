'use client'

import { useState } from 'react'
import { CheckCircle, Circle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

interface EmailTemplate {
  id: string
  name: string
  description: string
  variables: string[]
  lastUsed?: Date
}

interface Outreach {
  id: string
  brand: string
  template: string
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied'
  sentAt: Date
  response?: string
}

const mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Intro Email',
    description: 'Initial outreach to introduce yourself and your content',
    variables: ['{{creatorName}}', '{{brandName}}', '{{contentType}}'],
    lastUsed: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Follow-up Email',
    description: 'Gentle reminder after initial contact',
    variables: ['{{creatorName}}', '{{brandName}}', '{{previousEmail}}'],
    lastUsed: new Date('2024-01-10')
  }
]

const mockOutreach: Outreach[] = [
  {
    id: '1',
    brand: 'Nike',
    template: 'Intro Email',
    status: 'replied',
    sentAt: new Date('2024-01-15'),
    response: 'Thanks for reaching out! We\'d love to discuss a potential partnership.'
  },
  {
    id: '2',
    brand: 'Apple',
    template: 'Intro Email',
    status: 'opened',
    sentAt: new Date('2024-01-14')
  }
]

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'sent': return 'default'
    case 'delivered': return 'info'
    case 'opened': return 'warn'
    case 'clicked': return 'warn'
    case 'replied': return 'success'
    default: return 'default'
  }
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString()
}

export default function OutreachPage() {
  const [templates] = useState<EmailTemplate[]>(mockTemplates)
  const [outreach] = useState<Outreach[]>(mockOutreach)

  return (
    <Section title="Outreach" description="Configure and manage your outreach sequences">
      <div className="space-y-6">
        {/* Sequence Editor */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Email Sequence</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">Sequence Name</label>
              <Input defaultValue="Brand Partnership Outreach" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Delay Between Emails</label>
              <Select defaultValue="3">
                <option value="1">1 day</option>
                <option value="2">2 days</option>
                <option value="3">3 days</option>
                <option value="7">1 week</option>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Email Template</label>
            <textarea 
              className="min-h-[120px] w-full rounded-md border border-[var(--border)] px-3 py-2 focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              defaultValue="Hi {firstName},

I came across your brand and thought it would be a great fit for a partnership. Your products align perfectly with my audience and values.

Would you be interested in discussing a potential collaboration?

Best regards,
{myName}"
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">From Name</label>
              <Input defaultValue="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">From Email</label>
              <Input type="email" defaultValue="john@example.com" />
            </div>
          </div>
        </Card>

        {/* Send/Test Buttons */}
        <div className="flex items-center gap-3">
          <Button>Send Sequence</Button>
          <Button variant="secondary">Test Email</Button>
          <Button variant="ghost">Save Draft</Button>
        </div>
      </div>
    </Section>
  );
}
