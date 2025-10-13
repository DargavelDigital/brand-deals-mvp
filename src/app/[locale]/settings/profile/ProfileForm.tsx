'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface ProfileFormProps {
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    emailVerified: Date | null
    createdAt: Date
  }
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'danger'>('profile')

  // Profile Form State
  const [name, setName] = useState(user.name || '')
  const [email, setEmail] = useState(user.email)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  // Delete Account State
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')
    setProfileLoading(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setProfileError(data.error || 'Failed to update profile')
        setProfileLoading(false)
        return
      }

      setProfileSuccess('Profile updated successfully!')
      setProfileLoading(false)
      
      // Refresh the page to show new data
      router.refresh()
    } catch (error) {
      setProfileError('An unexpected error occurred')
      setProfileLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    setPasswordLoading(true)

    try {
      const response = await fetch('/api/user/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        setPasswordError(data.error || 'Failed to change password')
        setPasswordLoading(false)
        return
      }

      setPasswordSuccess('Password changed successfully!')
      setPasswordLoading(false)
      
      // Clear form
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      setPasswordError('An unexpected error occurred')
      setPasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user.email) {
      alert('Please type your email address to confirm deletion')
      return
    }

    if (!confirm('Are you absolutely sure? This action cannot be undone.')) {
      return
    }

    setDeleteLoading(true)

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      })

      if (!response.ok) {
        alert('Failed to delete account')
        setDeleteLoading(false)
        return
      }

      // Sign out and redirect
      await signOut({ callbackUrl: '/auth/signin' })
    } catch (error) {
      alert('An unexpected error occurred')
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`${
              activeTab === 'password'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Password
          </button>
          <button
            onClick={() => setActiveTab('danger')}
            className={`${
              activeTab === 'danger'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Danger Zone
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-6">Profile Information</h2>

          <form onSubmit={handleProfileUpdate} className="space-y-6">
            {profileError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg">
                {profileSuccess}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {user.emailVerified ? '✓ Email verified' : '⚠️ Email not verified'}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Account created: {new Date(user.createdAt).toLocaleDateString()}
              </p>
              <button
                type="submit"
                disabled={profileLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {profileLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-6">Change Password</h2>

          <form onSubmit={handlePasswordChange} className="space-y-6">
            {passwordError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg">
                {passwordSuccess}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Must be at least 8 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {passwordLoading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danger Zone Tab */}
      {activeTab === 'danger' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 p-6">
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-6">
            Danger Zone
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Delete Account
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Once you delete your account, there is no going back. All your data will be permanently deleted.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type <strong>{user.email}</strong> to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder={user.email}
                  />
                </div>

                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || deleteConfirm !== user.email}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete My Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

