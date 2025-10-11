'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface WorkspaceActionsProps {
  workspaceId: string
  workspaceName: string
  isSuspended?: boolean
}

export function WorkspaceActions({
  workspaceId,
  workspaceName,
  isSuspended = false
}: WorkspaceActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState<string | null>(null)
  
  async function handleSuspend() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/workspaces/${workspaceId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspend: !isSuspended })
      })
      
      if (res.ok) {
        router.refresh()
        setShowConfirm(null)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update workspace')
      }
    } catch (error) {
      alert('Error updating workspace')
    } finally {
      setLoading(false)
    }
  }
  
  async function handleDelete() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/workspaces/${workspaceId}/delete`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        router.push('/en/admin/workspaces')
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete workspace')
      }
    } catch (error) {
      alert('Error deleting workspace')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <>
      <div className="flex gap-2 flex-wrap items-center">
        {/* Suspend/Activate Button */}
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
        
        {/* Delete Button */}
        <button
          onClick={() => setShowConfirm('delete')}
          disabled={loading}
          className="px-3 py-1.5 text-xs rounded-md font-medium whitespace-nowrap bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 disabled:opacity-50 transition-colors"
        >
          Delete
        </button>
      </div>
      
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowConfirm(null)}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-lg w-full shadow-xl border dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Confirm Action
            </h3>
            <div className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {showConfirm === 'delete' && (
                <>
                  <p className="mb-3">
                    Are you sure you want to delete workspace <span className="font-semibold text-gray-900 dark:text-white">"{workspaceName}"</span>?
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
                  <p>
                    Are you sure you want to {isSuspended ? 'activate' : 'suspend'} workspace <span className="font-semibold text-gray-900 dark:text-white">"{workspaceName}"</span>?
                  </p>
                  <p className="mt-2">
                    {isSuspended 
                      ? 'This will restore access for all members.' 
                      : 'This will prevent all members from accessing this workspace.'}
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
                  if (showConfirm === 'delete') handleDelete()
                  else if (showConfirm === 'suspend') handleSuspend()
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

