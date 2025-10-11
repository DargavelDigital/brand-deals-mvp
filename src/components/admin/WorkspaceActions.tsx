'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface WorkspaceActionsProps {
  workspaceId: string
  workspaceName: string
}

export function WorkspaceActions({
  workspaceId,
  workspaceName
}: WorkspaceActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  
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
        <button
          onClick={() => setShowConfirm(true)}
          disabled={loading}
          className="px-3 py-1 text-xs rounded font-medium bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 disabled:opacity-50 transition-colors"
        >
          Delete
        </button>
      </div>
      
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowConfirm(false)}>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md shadow-xl border dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Confirm Delete Workspace
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete workspace <strong>"{workspaceName}"</strong>? 
              This will permanently delete:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 mb-4 space-y-1 list-disc list-inside">
              <li>All workspace members</li>
              <li>All workspace data</li>
              <li>All related records</li>
            </ul>
            <p className="text-sm text-red-600 dark:text-red-400 font-semibold mb-4">
              This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Workspace'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

