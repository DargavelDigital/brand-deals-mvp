'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface BulkWorkspaceActionsProps {
  selectedWorkspaceIds: string[]
  onClearSelection: () => void
}

export function BulkWorkspaceActions({
  selectedWorkspaceIds,
  onClearSelection
}: BulkWorkspaceActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState<'suspend' | 'delete' | null>(null)
  
  async function handleBulkSuspend() {
    setLoading(true)
    try {
      const results = await Promise.allSettled(
        selectedWorkspaceIds.map(workspaceId =>
          fetch(`/api/admin/workspaces/${workspaceId}/suspend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ suspend: true })
          })
        )
      )
      
      const successful = results.filter(r => r.status === 'fulfilled').length
      
      alert(`Successfully suspended ${successful} of ${selectedWorkspaceIds.length} workspaces`)
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
        selectedWorkspaceIds.map(workspaceId =>
          fetch(`/api/admin/workspaces/${workspaceId}/delete`, {
            method: 'DELETE'
          })
        )
      )
      
      const successful = results.filter(r => r.status === 'fulfilled').length
      
      alert(`Successfully deleted ${successful} of ${selectedWorkspaceIds.length} workspaces`)
      onClearSelection()
      router.refresh()
      setShowConfirm(null)
    } catch (error) {
      alert('Bulk delete failed')
    } finally {
      setLoading(false)
    }
  }
  
  if (selectedWorkspaceIds.length === 0) return null
  
  return (
    <>
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
          {selectedWorkspaceIds.length} workspace{selectedWorkspaceIds.length !== 1 ? 's' : ''} selected
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setShowConfirm('suspend')}
            disabled={loading}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            Suspend Selected
          </button>
          <button
            onClick={() => setShowConfirm('delete')}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            Delete Selected
          </button>
          <button
            onClick={onClearSelection}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 text-sm"
          >
            Clear
          </button>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowConfirm(null)}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-lg w-full shadow-xl border dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Confirm Bulk Action
            </h3>
            <div className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {showConfirm === 'delete' && (
                <>
                  <p className="mb-3">
                    Are you sure you want to <span className="font-semibold text-red-600 dark:text-red-400">DELETE {selectedWorkspaceIds.length} workspace{selectedWorkspaceIds.length !== 1 ? 's' : ''}</span>?
                  </p>
                  <p className="text-sm mb-2">This will permanently delete:</p>
                  <ul className="space-y-1 list-disc list-inside text-sm mb-3 ml-2">
                    <li>All workspace members</li>
                    <li>All workspace data</li>
                    <li>All related records</li>
                  </ul>
                  <p className="text-red-600 dark:text-red-400 font-semibold">
                    This action cannot be undone.
                  </p>
                </>
              )}
              {showConfirm === 'suspend' && (
                <>
                  <p className="mb-2">
                    Are you sure you want to <span className="font-semibold text-gray-900 dark:text-white">SUSPEND {selectedWorkspaceIds.length} workspace{selectedWorkspaceIds.length !== 1 ? 's' : ''}</span>?
                  </p>
                  <p>
                    All members will be prevented from accessing these workspaces until reactivated.
                  </p>
                </>
              )}
            </div>
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
                  if (showConfirm === 'delete') handleBulkDelete()
                  else if (showConfirm === 'suspend') handleBulkSuspend()
                }}
                className={`px-5 py-2.5 rounded-lg text-white font-medium ${
                  showConfirm === 'delete' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-yellow-600 hover:bg-yellow-700'
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
                  `Confirm ${showConfirm === 'delete' ? 'Delete' : 'Suspend'}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

