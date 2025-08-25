'use client'

import { useState } from 'react'
import { CheckCircle, Circle, Clock } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: 'Demo User',
    email: 'demo@branddeals.test',
    company: 'Demo Company'
  })

  const handleSave = () => {
    console.log('Profile saved:', profile)
    // Logic to save profile
  }

  return (
    <Section title="Profile" description="Manage your account information">
      <div className="space-y-6">
        {/* Avatar Block */}
        <Card className="p-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-[color:var(--accent)] flex items-center justify-center text-white text-2xl font-bold">
              JD
            </div>
            <div>
              <h3 className="text-lg font-semibold">John Doe</h3>
              <p className="text-[var(--muted)]">john.doe@example.com</p>
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <Input defaultValue="John" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <Input defaultValue="Doe" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input type="email" defaultValue="john.doe@example.com" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea 
                className="min-h-[120px] w-full rounded-md border border-[var(--border)] px-3 py-2 focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                defaultValue="Content creator and brand partnership specialist"
              />
            </div>
          </div>
        </Card>

        {/* Save Row */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary">Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </div>
    </Section>
  );
}
