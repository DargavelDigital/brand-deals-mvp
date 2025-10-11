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
      <div className="flex gap-2">
        {/* Suspend/Activate Button */}
        <button
          onClick={() => setShowConfirm('suspend')}
          disabled={loading}
          className={`px-3 py-1 text-xs rounded font-medium ${
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
          className="px-3 py-1 text-xs rounded font-medium bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 disabled:opacity-50 transition-colors"
        >
          Delete
        </button>
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
                <>
                  Are you sure you want to delete workspace <strong>"{workspaceName}"</strong>? 
                  This will permanently delete:
                  <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
                    <li>All workspace members</li>
                    <li>All workspace data</li>
                    <li>All related records</li>
                  </ul>
                  <span className="block mt-2 text-red-600 dark:text-red-400 font-semibold">
                    This action cannot be undone.
                  </span>
                </>
              )}
              {showConfirm === 'suspend' && (
                <>Are you sure you want to {isSuspended ? 'activate' : 'suspend'} workspace <strong>"{workspaceName}"</strong>? {isSuspended ? 'This will restore access for all members.' : 'This will prevent all members from accessing this workspace.'}</>
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
                  else if (showConfirm === 'suspend') handleSuspend()
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

