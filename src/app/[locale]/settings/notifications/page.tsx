'use client'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'

type DigestPreference = {
  id: string
  workspaceId: string
  cadence: 'daily' | 'weekly' | 'off'
  hourOfDay: number
  timezone: string
}

export default function NotificationsSettingsPage() {
  const [preferences, setPreferences] = useState<DigestPreference | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPreferences()
  }, [])

  async function fetchPreferences() {
    try {
      // For now, create default preferences
      setPreferences({
        id: 'default',
        workspaceId: 'demo-workspace',
        cadence: 'off',
        hourOfDay: 9,
        timezone: 'UTC'
      })
    } catch (error) {
      // Failed to fetch preferences
    } finally {
      setLoading(false)
    }
  }

  async function savePreferences() {
    if (!preferences) return
    
    setSaving(true)
    try {
      // TODO: Implement actual API call to save preferences
      // const res = await fetch('/api/settings/digest', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(preferences)
      // })
      
      // Show success message
    } catch (error) {
      // Show error message
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading notification settings...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notification Settings</h1>
        <p className="text-[var(--muted-fg)]">
          Configure how and when you receive notifications and updates.
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Email Digest</h2>
        <p className="text-sm text-[var(--muted-fg)] mb-6">
          Receive periodic summaries of your outreach activity and brand matches.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Frequency</label>
            <Select
              value={preferences?.cadence || 'off'}
              onChange={(e) => setPreferences(prev => prev ? { ...prev, cadence: e.target.value as any } : null)}
            >
              <option value="off">Off</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </Select>
          </div>

          {preferences?.cadence !== 'off' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Preferred Hour (Local Time)</label>
                <Select
                  value={preferences?.hourOfDay || 9}
                  onChange={(e) => setPreferences(prev => prev ? { ...prev, hourOfDay: parseInt(e.target.value) } : null)}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Timezone</label>
                <Select
                  value={preferences?.timezone || 'UTC'}
                  onChange={(e) => setPreferences(prev => prev ? { ...prev, timezone: e.target.value } : null)}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </Select>
              </div>
            </>
          )}

          <div className="pt-4">
            <Button onClick={savePreferences} disabled={saving}>
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Real-time Notifications</h2>
        <p className="text-sm text-[var(--muted-fg)] mb-4">
          Receive instant notifications for important events like:
        </p>
        <ul className="text-sm text-[var(--muted-fg)] space-y-1 mb-4">
          <li>• Audit progress updates</li>
          <li>• Media pack generation status</li>
          <li>• New outreach replies</li>
          <li>• Brand match discoveries</li>
        </ul>
        <p className="text-sm text-[var(--muted-fg)]">
          These notifications appear as toasts in the top-right corner and are always enabled when real-time features are active.
        </p>
      </Card>
    </div>
  )
}
