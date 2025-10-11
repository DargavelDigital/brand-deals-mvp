'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface UserActionsProps {
  userId: string
  userName: string
  userEmail: string
  isAdmin: boolean
  isCurrentUser: boolean
  isSuspended?: boolean
  isSuperAdmin?: boolean
}

export function UserActions({
  userId,
  userName,
  userEmail,
  isAdmin,
  isCurrentUser,
  isSuspended = false,
  isSuperAdmin = false
}: UserActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState<string | null>(null)
  
  async function handleImpersonate() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/impersonate/${userId}`, {
        method: 'POST'
      })
      
      const data = await res.json()
      
      if (res.ok) {
        alert(data.message + '\n\n' + (data.note || ''))
      } else {
        alert(data.error || 'Impersonation failed')
      }
    } catch (error) {
      alert('Error impersonating user')
    } finally {
      setLoading(false)
    }
  }
  
  async function handleSuspend() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspend: !isSuspended })
      })
      
      if (res.ok) {
        router.refresh()
        setShowConfirm(null)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update user')
      }
    } catch (error) {
      alert('Error updating user')
    } finally {
      setLoading(false)
    }
  }
  
  async function handleDelete() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/delete`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        router.refresh()
        setShowConfirm(null)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete user')
      }
    } catch (error) {
      alert('Error deleting user')
    } finally {
      setLoading(false)
    }
  }
  
  async function handleAdminToggle() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: isAdmin ? 'demote' : 'promote',
          role: 'SUPPORT'
        })
      })
      
      if (res.ok) {
        router.refresh()
        setShowConfirm(null)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update admin status')
      }
    } catch (error) {
      alert('Error updating admin status')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <>
      <div className="flex gap-2 flex-wrap items-center">
        {/* Suspend/Activate Button */}
        {!isCurrentUser && (
          <button
            onClick={() => setShowConfirm('suspend')}
            disabled={loading}
            className={`px-3 py-1.5 text-xs rounded-md font-medium whitespace-nowrap ${
              isSuspended
                ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800'
                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800'
            } disabled:opacity-50 transition-colors`}
          >
            {isSuspended ? 'Activate' : 'Suspend'}
          </button>
        )}
        
        {/* Admin Toggle Button */}
        {!isCurrentUser && (
          <button
            onClick={() => setShowConfirm('admin')}
            disabled={loading}
            className="px-3 py-1.5 text-xs rounded-md font-medium whitespace-nowrap bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:hover:bg-purple-800 disabled:opacity-50 transition-colors"
          >
            {isAdmin ? 'Remove Admin' : 'Make Admin'}
          </button>
        )}
        
        {/* Impersonate Button (SUPER admins only) */}
        {!isCurrentUser && isSuperAdmin && (
          <button
            onClick={() => setShowConfirm('impersonate')}
            disabled={loading}
            className="px-3 py-1.5 text-xs rounded-md font-medium whitespace-nowrap bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800 disabled:opacity-50 transition-colors"
            title="Login as this user (logged for security)"
          >
            🎭 Impersonate
          </button>
        )}
        
        {/* Delete Button */}
        {!isCurrentUser && (
          <button
            onClick={() => setShowConfirm('delete')}
            disabled={loading}
            className="px-3 py-1.5 text-xs rounded-md font-medium whitespace-nowrap bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 disabled:opacity-50 transition-colors"
          >
            Delete
          </button>
        )}
        
        {isCurrentUser && (
          <span className="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 italic">
            (You)
          </span>
        )}
      </div>
      
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowConfirm(null)}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-lg w-full shadow-xl border dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Confirm Action
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {showConfirm === 'delete' && (
                <>
                  Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{userName || userEmail}</span>?
                  <span className="block mt-2 text-red-600 dark:text-red-400 font-semibold">
                    This action cannot be undone and will remove all associated data.
                  </span>
                </>
              )}
              {showConfirm === 'suspend' && (
                <>
                  Are you sure you want to {isSuspended ? 'activate' : 'suspend'} <span className="font-semibold text-gray-900 dark:text-white">{userName || userEmail}</span>?
                  <span className="block mt-2">
                    {isSuspended ? 'This will restore their access to the platform.' : 'This will prevent them from logging in.'}
                  </span>
                </>
              )}
              {showConfirm === 'admin' && (
                <>
                  Are you sure you want to {isAdmin ? 'remove admin access from' : 'promote'} <span className="font-semibold text-gray-900 dark:text-white">{userName || userEmail}</span> {isAdmin ? '' : 'to admin'}?
                  <span className="block mt-2">
                    {isAdmin ? 'They will lose administrative privileges.' : 'They will gain administrative privileges.'}
                  </span>
                </>
              )}
              {showConfirm === 'impersonate' && (
                <>
                  Are you sure you want to impersonate <span className="font-semibold text-gray-900 dark:text-white">{userName || userEmail}</span>?
                  <span className="block mt-2 text-amber-600 dark:text-amber-400 font-semibold">
                    This action will be logged for security audit purposes.
                  </span>
                  <span className="block mt-1 text-sm">
                    You'll be able to see the platform as this user for debugging purposes.
                  </span>
                </>
              )}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(null)}
                className="px-5 py-2.5 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showConfirm === 'delete') handleDelete()
                  else if (showConfirm === 'suspend') handleSuspend()
                  else if (showConfirm === 'admin') handleAdminToggle()
                  else if (showConfirm === 'impersonate') handleImpersonate()
                }}
                className={`px-5 py-2.5 rounded-lg text-white font-medium ${
                  showConfirm === 'delete' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : showConfirm === 'suspend' && !isSuspended
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                } disabled:opacity-50 transition-colors`}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

