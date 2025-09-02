'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { safeJson } from '@/lib/http/safeJson'
import { findDuplicateEmails } from '@/lib/dedupe'

interface ImportModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function ImportModal({ onClose, onSuccess }: ImportModalProps) {
  const [csvText, setCsvText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null)
  const [error, setError] = useState('')
  const [existingEmails, setExistingEmails] = useState<string[]>([])
  const [dupes, setDupes] = useState<string[]>([])
  const [skipDupes, setSkipDupes] = useState(true)

  const handleImport = async () => {
    if (!csvText.trim()) {
      setError('Please paste CSV content')
      return
    }

    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const { ok, status, body } = await safeJson('/api/contacts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csv: csvText,
          skipDuplicates: skipDupes
        }),
      })

      if (!ok) {
        throw new Error(body?.error || `Import failed (${status})`)
      }

      setResult(body)
    } catch (err: any) {
      setError(err.message || 'Import failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch existing emails on mount
  useEffect(() => {
    fetchExistingEmails()
  }, [])

  // Check for duplicates when CSV text changes
  useEffect(() => {
    if (csvText.trim()) {
      const incomingEmails = parseCsvEmails(csvText)
      const duplicates = findDuplicateEmails(existingEmails, incomingEmails)
      setDupes(duplicates)
    } else {
      setDupes([])
    }
  }, [csvText, existingEmails])

  const fetchExistingEmails = async () => {
    try {
      const { ok, body } = await safeJson('/api/contacts?pageSize=1000')
      if (ok && body?.items) {
        const emails = body.items.map((c: any) => c.email).filter(Boolean)
        setExistingEmails(emails)
      }
    } catch (err) {
      console.warn('Failed to fetch existing emails:', err)
    }
  }

  const parseCsvEmails = (csv: string): string[] => {
    const lines = csv.trim().split('\n')
    if (lines.length < 2) return []
    
    const header = lines[0].toLowerCase()
    const emailIndex = header.split(',').findIndex(col => col.includes('email'))
    if (emailIndex === -1) return []
    
    const emails: string[] = []
    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(',')
      if (columns[emailIndex]) {
        emails.push(columns[emailIndex].trim())
      }
    }
    return emails.filter(Boolean)
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

            {/* Duplicate warning banner */}
            {dupes.length > 0 && (
              <div className="mb-3 rounded-lg border border-[var(--border)] bg-[var(--tint-warn)] p-3">
                <div className="text-sm font-medium">Possible duplicates</div>
                <div className="mt-1 text-sm">
                  We found {dupes.length} email{dupes.length > 1 ? "s" : ""} already in your contacts. 
                  <details className="mt-1">
                    <summary className="cursor-pointer text-sm underline">Show emails</summary>
                    <div className="mt-1 text-xs">{dupes.join(", ")}</div>
                  </details>
                </div>
              </div>
            )}

            {/* Skip duplicates checkbox */}
            {dupes.length > 0 && (
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={skipDupes} 
                  onChange={(e) => setSkipDupes(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)]"
                />
                Skip duplicates
              </label>
            )}

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
