'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ContactDTO } from '@/types/contact'
import { flags } from '@/config/flags'

interface CreateDealModalProps {
  contact: ContactDTO
  onClose: () => void
}

const DEAL_STAGES = [
  'Prospecting',
  'Qualification',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost'
]

export default function CreateDealModal({ contact, onClose }: CreateDealModalProps) {
  const [title, setTitle] = useState('')
  const [value, setValue] = useState('')
  const [stage, setStage] = useState('Prospecting')
  const [brandId, setBrandId] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([])

  // Load brands on mount
  useEffect(() => {
    const loadBrands = async () => {
      try {
        const response = await fetch('/api/brands')
        if (response.ok) {
          const result = await response.json()
          setBrands(result.data || [])
        }
      } catch (error) {
        console.error('Failed to load brands:', error)
      }
    }
    loadBrands()
  }, [])

  const handleCreateDeal = async () => {
    if (!title.trim() || !brandId) {
      alert('Please fill in all required fields')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          value: value ? parseInt(value) : null,
          brandId,
          contactId: contact.id,
          stage,
          description: `Deal created from contact: ${contact.name} (${contact.email})`
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert('Deal created successfully!')
        onClose()
        
        // Optionally redirect to CRM or refresh the page
        if (flags['crm.light.enabled']) {
          window.location.href = '/crm'
        }
      } else {
        const error = await response.json()
        alert(`Failed to create deal: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating deal:', error)
      alert('Failed to create deal')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Create Deal</h2>
            <p className="text-sm text-[var(--muted-fg)] mt-1">
              From contact: {contact.name}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            ✕
          </Button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Deal Title */}
          <div>
            <label className="block text-sm font-medium text-[var(--muted-fg)] mb-2">
              Deal Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Partnership opportunity"
              className="w-full"
            />
          </div>

          {/* Brand Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--muted-fg)] mb-2">
              Brand *
            </label>
            <Select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full"
            >
              <option value="">Select a brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Estimated Value */}
          <div>
            <label className="block text-sm font-medium text-[var(--muted-fg)] mb-2">
              Estimated Value
            </label>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g., 5000"
              type="number"
              className="w-full"
            />
          </div>

          {/* Stage */}
          <div>
            <label className="block text-sm font-medium text-[var(--muted-fg)] mb-2">
              Stage
            </label>
            <Select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full"
            >
              {DEAL_STAGES.map((stageOption) => (
                <option key={stageOption} value={stageOption}>
                  {stageOption}
                </option>
              ))}
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateDeal}
              disabled={!title.trim() || !brandId || isCreating}
              className="flex-1"
            >
              {isCreating ? 'Creating...' : 'Create Deal'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
