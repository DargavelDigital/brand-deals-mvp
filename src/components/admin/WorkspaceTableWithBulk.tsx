'use client'

import { useState } from 'react'
import Link from 'next/link'
import { WorkspaceActions } from './WorkspaceActions'
import { BulkWorkspaceActions } from './BulkWorkspaceActions'

interface Workspace {
  id: string
  name: string
  createdAt: Date
  suspended?: boolean
  _count: {
    Membership: number
  }
  Membership: Array<{
    role: string
    User_Membership_userIdToUser: {
      name: string | null
      email: string | null
    }
  }>
}

interface WorkspaceTableWithBulkProps {
  workspaces: Workspace[]
}

export function WorkspaceTableWithBulk({ workspaces }: WorkspaceTableWithBulkProps) {
  const [selectedWorkspaceIds, setSelectedWorkspaceIds] = useState<string[]>([])
  
  function toggleWorkspace(workspaceId: string) {
    setSelectedWorkspaceIds(prev => 
      prev.includes(workspaceId) 
        ? prev.filter(id => id !== workspaceId)
        : [...prev, workspaceId]
    )
  }
  
  function selectAll() {
    if (selectedWorkspaceIds.length === workspaces.length) {
      setSelectedWorkspaceIds([])
    } else {
      setSelectedWorkspaceIds(workspaces.map(w => w.id))
    }
  }
  
  return (
    <>
      <BulkWorkspaceActions
        selectedWorkspaceIds={selectedWorkspaceIds}
        onClearSelection={() => setSelectedWorkspaceIds([])}
      />
      
      <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedWorkspaceIds.length === workspaces.length && workspaces.length > 0}
                  onChange={selectAll}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Workspace Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Members
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {workspaces.map((workspace) => {
              const owner = workspace.Membership.find(m => m.role === 'OWNER')
              return (
                <tr key={workspace.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedWorkspaceIds.includes(workspace.id)}
                      onChange={() => toggleWorkspace(workspace.id)}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      {workspace.name}
                      {workspace.suspended && (
                        <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded font-semibold">
                          SUSPENDED
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {workspace.id.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {workspace._count.Membership} {workspace._count.Membership === 1 ? 'member' : 'members'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {owner?.User_Membership_userIdToUser.name || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {owner?.User_Membership_userIdToUser.email || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(workspace.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/en/admin/workspaces/${workspace.id}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        View Details
                      </Link>
                      <WorkspaceActions
                        workspaceId={workspace.id}
                        workspaceName={workspace.name}
                        isSuspended={workspace.suspended || false}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        
        {workspaces.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            No workspaces found
          </div>
        )}
      </div>
    </>
  )
}

