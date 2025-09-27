'use client'

import { useState } from 'react'
import { CheckCircle, Circle, Clock } from 'lucide-react'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { socials, COMING_SOON_MSG } from '@/config/socials'

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: 'Demo User',
    email: 'demo@branddeals.test',
    company: 'Demo Company'
  })

  const handleSave = () => {
    // Logic to save profile
  }

  return (
    <Section title="Profile" description="Your details">
      <div className="space-y-6">
        {/* Avatar block */}
        <Card className="p-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-[color:var(--accent)]/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-[color:var(--accent)]">JD</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">John Doe</h3>
              <p className="text-[var(--muted)]">Content Creator & Brand Partner</p>
              <Button variant="secondary" className="mt-2">Change Avatar</Button>
            </div>
          </div>
        </Card>

        {/* Profile form */}
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
              <Input placeholder="Tell us about yourself..." />
            </div>
          </div>
        </Card>

        {/* Social links */}
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Social Links</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {socials.enabled('instagram') && (
              <div>
                <label className="block text-sm font-medium mb-2">Instagram</label>
                <Input placeholder="@yourusername" />
              </div>
            )}
            {socials.enabled('tiktok') && (
              <div>
                <label className="block text-sm font-medium mb-2">TikTok</label>
                <Input placeholder="@yourusername" />
              </div>
            )}
            {socials.enabled('youtube') && (
              <div>
                <label className="block text-sm font-medium mb-2">YouTube</label>
                <Input placeholder="Channel URL" />
              </div>
            )}
            {socials.enabled('x') && (
              <div>
                <label className="block text-sm font-medium mb-2">X (Twitter)</label>
                <Input placeholder="@yourusername" />
              </div>
            )}
            {socials.enabled('facebook') && (
              <div>
                <label className="block text-sm font-medium mb-2">Facebook</label>
                <Input placeholder="Page URL" />
              </div>
            )}
            {socials.enabled('linkedin') && (
              <div>
                <label className="block text-sm font-medium mb-2">LinkedIn</label>
                <Input placeholder="Profile URL" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Website</label>
              <Input placeholder="https://..." />
            </div>
          </div>
          
          {/* Coming soon section for disabled platforms */}
          {!socials.isInstagramOnly() && (
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <h4 className="text-sm font-medium text-[var(--muted-fg)] mb-2">Coming Soon</h4>
              <div className="flex flex-wrap gap-2">
                {!socials.enabled('tiktok') && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">TikTok</span>
                )}
                {!socials.enabled('youtube') && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">YouTube</span>
                )}
                {!socials.enabled('x') && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">X (Twitter)</span>
                )}
                {!socials.enabled('facebook') && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">Facebook</span>
                )}
                {!socials.enabled('linkedin') && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">LinkedIn</span>
                )}
              </div>
              <p className="text-xs text-[var(--muted-fg)] mt-2">{COMING_SOON_MSG}</p>
            </div>
          )}
        </Card>

        {/* Save row */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary">Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </div>
    </Section>
  );
}
