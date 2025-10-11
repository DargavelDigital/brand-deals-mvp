'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface UserActionsProps {
  userId: string
  userName: string
  userEmail: string
  isAdmin: boolean
  isCurrentUser: boolean
}

export function UserActions({
  userId,
  userName,
  userEmail,
  isAdmin,
  isCurrentUser
}: UserActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState<string | null>(null)
  
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
      <div className="flex gap-2">
        {/* Admin Toggle Button */}
        {!isCurrentUser && (
          <button
            onClick={() => setShowConfirm('admin')}
            disabled={loading}
            className="px-3 py-1 text-xs rounded font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:hover:bg-purple-800 disabled:opacity-50 transition-colors"
          >
            {isAdmin ? 'Remove Admin' : 'Make Admin'}
          </button>
        )}
        
        {/* Delete Button */}
        {!isCurrentUser && (
          <button
            onClick={() => setShowConfirm('delete')}
            disabled={loading}
            className="px-3 py-1 text-xs rounded font-medium bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 disabled:opacity-50 transition-colors"
          >
            Delete
          </button>
        )}
        
        {isCurrentUser && (
          <span className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400 italic">
            (You)
          </span>
        )}
      </div>
      
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowConfirm(null)}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md shadow-xl border dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Confirm Action
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {showConfirm === 'delete' && (
                <>Are you sure you want to delete <strong>{userName || userEmail}</strong>? This action cannot be undone and will remove all associated data.</>
              )}
              {showConfirm === 'admin' && (
                <>Are you sure you want to {isAdmin ? 'remove admin access from' : 'promote'} <strong>{userName || userEmail}</strong> {isAdmin ? '' : 'to admin'}?</>
              )}
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirm(null)}
                className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showConfirm === 'delete') handleDelete()
                  else if (showConfirm === 'admin') handleAdminToggle()
                }}
                className={`px-4 py-2 rounded text-white ${
                  showConfirm === 'delete' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } disabled:opacity-50 transition-colors`}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

