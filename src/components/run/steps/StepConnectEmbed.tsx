'use client'
import React, { useEffect } from 'react'
import useSWR from 'swr'
import ConnectGrid from '@/components/connect/ConnectGrid'
import type { ConnectionStatus } from '@/types/connections'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface StepConnectEmbedProps {
  workspaceId: string
  onDirtyChange: (dirty: boolean) => void
  data: any
  setData: (data: any) => void
  goNext: () => void
}

export default function StepConnectEmbed({ 
  workspaceId, 
  onDirtyChange, 
  data, 
  setData, 
  goNext 
}: StepConnectEmbedProps) {
  const { data: connections, isLoading, error } =
    useSWR<ConnectionStatus[]>('/api/connections/status', fetcher, { revalidateOnFocus: false })

  const connectedCount = connections?.filter(c => c.connected).length || 0

  useEffect(() => {
    const hasConnections = connectedCount > 0
    onDirtyChange(hasConnections)
    setData(prevData => ({ ...prevData, hasConnections }))
  }, [connectedCount, onDirtyChange, setData])

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="text-center">
        <p className="text-muted-foreground">
          Connect your social profiles to power audits, matching, and outreach.
        </p>
        <a 
          href="/tools/connect" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
        >
          Learn more about connecting accounts →
        </a>
      </div>

      {connectedCount > 0 && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">
            ✓ {connectedCount} account{connectedCount !== 1 ? 's' : ''} connected
          </p>
        </div>
      )}

      {/* Use the same ConnectGrid component as the individual tool page */}
      <ConnectGrid />

      {connectedCount === 0 && (
        <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            Connect at least one account to continue
          </p>
        </div>
      )}
    </div>
  )
}
