'use client'
import React, { useState } from 'react'
import { Send, Play, Pause, CheckCircle, Clock, ExternalLink, FileText, Users, Building2, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface StepSendEmbedProps {
  workspaceId: string
  onDirtyChange: (dirty: boolean) => void
  data: any
  setData: (data: any) => void
  goNext: () => void
}

export default function StepSendEmbed({ 
  workspaceId, 
  onDirtyChange, 
  data, 
  setData, 
  goNext 
}: StepSendEmbedProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [isCreated, setIsCreated] = useState(data?.isCreated || false)
  const [sequence] = useState(data?.sequence || null)
  const router = useRouter()

  React.useEffect(() => {
    onDirtyChange(isCreated)
  }, [isCreated, onDirtyChange])

  const createSequencePaused = async () => {
    setIsCreating(true)
    
    try {
      // Call the outreach start API with pauseFirstSend=true
      const response = await fetch('/api/outreach/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspaceId,
          sequenceId: sequence?.id,
          contacts: data?.selectedContacts || [],
          brands: data?.selectedBrands || [],
          pauseFirstSend: true
        })
      })

      if (response.ok) {
        setIsCreated(true)
        setData({ ...data, isCreated: true })
        toast.success('Sequence created & paused for review')
      } else {
        throw new Error('Failed to create sequence')
      }
    } catch (error) {
      console.error('Failed to create outreach sequence:', error)
      toast.error('Failed to create sequence. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const reviewInOutreach = () => {
    // Navigate to outreach tools with prefilled data
    const params = new URLSearchParams({
      sequenceId: sequence?.id || '',
      contacts: data?.selectedContacts?.join(',') || '',
      brands: data?.selectedBrands?.join(',') || ''
    })
    router.push(`/tools/outreach?${params.toString()}`)
  }

  if (!sequence) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Send Outreach</h2>
          <p className="text-muted">No outreach sequence found.</p>
        </div>
        <div className="text-center py-8">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              Please go back and create an outreach sequence first.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Block */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Step 8 — Launch Campaign</h2>
          <p className="text-muted-foreground text-sm">
            Review your complete campaign summary and choose how to proceed.<br />
            Create a paused sequence or review in the outreach tools.
          </p>
        </div>
        <a 
          href="/outreach/inbox" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 underline ml-4 shrink-0"
        >
          Learn more →
        </a>
      </div>

      {/* Comprehensive Campaign Summary */}
      <div className="space-y-6">
        {/* Channels Used */}
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Building2 className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-text">Channels Connected</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {data?.hasConnections ? (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                ✓ Social accounts connected
              </span>
            ) : (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                No channels connected
              </span>
            )}
          </div>
        </div>

        {/* Audit Snippets */}
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-text">Content Audit</h3>
          </div>
          <div className="space-y-2">
            {data?.hasRun ? (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">Content analysis completed</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Content analysis pending</span>
              </div>
            )}
            {data?.insights && (
              <div className="text-sm text-muted-foreground">
                {data.insights.length} key insights identified
              </div>
            )}
          </div>
        </div>

        {/* Selected Brands */}
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Building2 className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-text">Selected Brands</h3>
          </div>
          <div className="space-y-2">
            {data?.approvedBrands?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.approvedBrands.map((brand: any) => (
                  <span key={brand.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {brand.name}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-sm text-gray-600">No brands selected</span>
            )}
          </div>
        </div>

        {/* Selected Contacts */}
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-text">Selected Contacts</h3>
          </div>
          <div className="space-y-2">
            {data?.approvedContacts?.length > 0 ? (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  {data.approvedContacts.length} contact{data.approvedContacts.length !== 1 ? 's' : ''} approved
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-600">No contacts selected</span>
            )}
          </div>
        </div>

        {/* Sequence Details */}
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Mail className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-text">Outreach Sequence</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted">Sequence Name:</span>
              <span className="text-text">{sequence.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Steps:</span>
              <span className="text-text">{sequence.steps.length} email{sequence.steps.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Tone:</span>
              <span className="text-text">{data?.tone || 'Professional'}</span>
            </div>
          </div>
        </div>

        {/* Media Pack */}
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-text">Media Pack</h3>
          </div>
          <div className="space-y-2">
            {data?.hasGenerated ? (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">Media pack generated</span>
              </div>
            ) : (
              <span className="text-sm text-gray-600">Media pack not generated</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        {!isCreated ? (
          <div className="flex gap-4 justify-center">
            <button
              onClick={createSequencePaused}
              disabled={isCreating}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isCreating ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Creating Sequence...</span>
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Create Sequence (Paused)</span>
                </>
              )}
            </button>
            
            <button
              onClick={reviewInOutreach}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Review in Outreach</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-medium">Sequence Created Successfully!</p>
              <p className="text-green-800 text-sm mt-1">
                Your outreach sequence has been created and paused for review.
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={reviewInOutreach}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Review in Outreach</span>
              </button>
              <button
                onClick={goNext}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Complete Brand Run
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
