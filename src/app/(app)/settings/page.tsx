'use client';

import { Settings, User, Bell, Shield, CreditCard } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-[var(--muted-fg)] mt-2">Manage your account preferences and configuration.</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-lg bg-[var(--brand-600)] grid place-items-center text-white">
              <User className="size-5" />
            </div>
            <h2 className="text-xl font-semibold">Profile</h2>
          </div>
          <p className="text-[var(--muted-fg)] mb-4">
            Update your personal information and profile settings.
          </p>
          <Button variant="secondary">Edit Profile</Button>
        </div>

        {/* Notifications */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-lg bg-[var(--brand-600)] grid place-items-center text-white">
              <Bell className="size-5" />
            </div>
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>
          <p className="text-[var(--muted-fg)] mb-4">
            Configure your notification preferences and alerts.
          </p>
          <Button variant="secondary">Configure</Button>
        </div>

        {/* Security */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-lg bg-[var(--brand-600)] grid place-items-center text-white">
              <Shield className="size-5" />
            </div>
            <h2 className="text-xl font-semibold">Security</h2>
          </div>
          <p className="text-[var(--muted-fg)] mb-4">
            Manage your password and security settings.
          </p>
          <Button variant="secondary">Change Password</Button>
        </div>

        {/* Billing */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-lg bg-[var(--brand-600)] grid place-items-center text-white">
              <CreditCard className="size-5" />
            </div>
            <h2 className="text-xl font-semibold">Billing</h2>
          </div>
          <p className="text-[var(--muted-fg)] mb-4">
            View and manage your subscription and billing information.
          </p>
          <Button variant="secondary">View Billing</Button>
        </div>
      </div>

      {/* Demo Mode Toggle */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Demo Mode</h2>
            <p className="text-[var(--muted-fg)] mt-1">
              Enable demo mode to test features with sample data.
            </p>
          </div>
          <Button variant="secondary">Toggle Demo Mode</Button>
        </div>
      </div>
    </div>
  )
}
