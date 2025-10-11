'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface BulkUserActionsProps {
  selectedUserIds: string[]
  onClearSelection: () => void
}

export function BulkUserActions({
  selectedUserIds,
  onClearSelection
}: BulkUserActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState<'suspend' | 'delete' | null>(null)
  
  async function handleBulkSuspend() {
    setLoading(true)
    try {
      const results = await Promise.allSettled(
        selectedUserIds.map(userId =>
          fetch(`/api/admin/users/${userId}/suspend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ suspend: true })
          })
        )
      )
      
      const successful = results.filter(r => r.status === 'fulfilled').length
      
      alert(`Successfully suspended ${successful} of ${selectedUserIds.length} users`)
      onClearSelection()
      router.refresh()
      setShowConfirm(null)
    } catch (error) {
      alert('Bulk suspend failed')
    } finally {
      setLoading(false)
    }
  }
  
  async function handleBulkDelete() {
    setLoading(true)
    try {
      const results = await Promise.allSettled(
        selectedUserIds.map(userId =>
          fetch(`/api/admin/users/${userId}/delete`, {
            method: 'DELETE'
          })
        )
      )
      
      const successful = results.filter(r => r.status === 'fulfilled').length
      
      alert(`Successfully deleted ${successful} of ${selectedUserIds.length} users`)
      onClearSelection()
      router.refresh()
      setShowConfirm(null)
    } catch (error) {
      alert('Bulk delete failed')
    } finally {
      setLoading(false)
    }
  }
  
  if (selectedUserIds.length === 0) return null
  
  return (
    <>
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
          {selectedUserIds.length} user{selectedUserIds.length !== 1 ? 's' : ''} selected
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setShowConfirm('suspend')}
            disabled={loading}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            Suspend Selected
          </button>
          <button
            onClick={() => setShowConfirm('delete')}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            Delete Selected
          </button>
          <button
            onClick={onClearSelection}
            className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 text-sm"
          >
            Clear
          </button>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowConfirm(null)}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md shadow-xl border dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Confirm Bulk Action
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {showConfirm === 'delete' && (
                <>
                  Are you sure you want to <strong className="text-red-600 dark:text-red-400">DELETE {selectedUserIds.length} users</strong>? 
                  <span className="block mt-2 text-red-600 dark:text-red-400 font-semibold">
                    This action cannot be undone and will remove all associated data.
                  </span>
                </>
              )}
              {showConfirm === 'suspend' && (
                <>
                  Are you sure you want to <strong>SUSPEND {selectedUserIds.length} users</strong>? 
                  They will not be able to login until reactivated.
                </>
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
                  if (showConfirm === 'delete') handleBulkDelete()
                  else if (showConfirm === 'suspend') handleBulkSuspend()
                }}
                className={`px-4 py-2 rounded text-white ${
                  showConfirm === 'delete' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-yellow-600 hover:bg-yellow-700'
                } disabled:opacity-50 transition-colors`}
                disabled={loading}
              >
                {loading ? 'Processing...' : `Confirm ${showConfirm === 'delete' ? 'Delete' : 'Suspend'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

