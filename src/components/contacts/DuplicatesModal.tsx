'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ContactDTO } from '@/types/contact'
import { trackContactsDupesOpen } from '@/lib/telemetry'

interface DuplicateGroup {
  key: string
  count: number
  sample: {
    id: string
    name: string
    email: string
    company: string
  }
  ids: string[]
}

interface DuplicatesModalProps {
  isOpen: boolean
  onClose: () => void
  onReview: (group: DuplicateGroup) => void
}

export default function DuplicatesModal({ isOpen, onClose, onReview }: DuplicatesModalProps) {
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchDuplicates()
      trackContactsDupesOpen()
    }
  }, [isOpen])

  const fetchDuplicates = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/contacts/dupes')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      if (result.ok) {
        setDuplicateGroups(result.data.groups)
      } else {
        setError(result.error || 'Failed to fetch duplicates')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch duplicates')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Find Duplicates</h2>
            <p className="text-sm text-[var(--muted-fg)] mt-1">
              Review and merge duplicate contacts to keep your database clean
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-[var(--muted-fg)]">Loading duplicates...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-[var(--error)]">{error}</div>
              <Button onClick={fetchDuplicates} className="mt-4">Retry</Button>
            </div>
          ) : duplicateGroups.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-[var(--muted-fg)]">No duplicates found! 🎉</div>
              <p className="text-sm text-[var(--muted-fg)] mt-2">
                Your contacts database is clean and organized.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {duplicateGroups.map((group) => (
                <Card key={group.key} className="p-4 border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="secondary">
                          {group.count} duplicate{group.count !== 1 ? 's' : ''}
                        </Badge>
                        <span className="text-sm text-[var(--muted-fg)]">
                          Key: {group.key}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="font-medium">
                          {group.sample.name || 'Unnamed Contact'}
                        </div>
                        {group.sample.email && (
                          <div className="text-sm text-[var(--muted-fg)]">
                            {group.sample.email}
                          </div>
                        )}
                        {group.sample.company && (
                          <div className="text-sm text-[var(--muted-fg)]">
                            {group.sample.company}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => onReview(group)}
                      size="sm"
                    >
                      Review
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
