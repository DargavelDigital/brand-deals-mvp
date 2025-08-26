'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface ImportModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function ImportModal({ onClose, onSuccess }: ImportModalProps) {
  const [csvText, setCsvText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null)
  const [error, setError] = useState('')

  const handleImport = async () => {
    if (!csvText.trim()) {
      setError('Please paste CSV content')
      return
    }

    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/contacts/import', {
        method: 'POST',
        body: csvText,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Import failed')
      }

      const resultData = await response.json()
      setResult(resultData)
    } catch (err: any) {
      setError(err.message || 'Import failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccess = () => {
    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Import Contacts</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Paste CSV Content
              </label>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Name,Title,Email,Company,Phone&#10;John Doe,Manager,john@example.com,Acme Corp,555-0123&#10;Jane Smith,Director,jane@example.com,Globex Inc,555-0456"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={8}
              />
              <p className="text-sm text-gray-600 mt-1">
                Expected columns: Name, Title, Email, Company, Phone (Name and Email are required)
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            {result && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="text-green-800">
                  <p className="font-medium">Import completed successfully!</p>
                  <p className="text-sm mt-1">
                    Created: {result.created} contacts, Skipped: {result.skipped} rows
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              {result ? (
                <Button
                  onClick={handleSuccess}
                  className="flex-1"
                >
                  Done
                </Button>
              ) : (
                <Button
                  onClick={handleImport}
                  disabled={isLoading || !csvText.trim()}
                  className="flex-1"
                >
                  {isLoading ? 'Importing...' : 'Import Contacts'}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
