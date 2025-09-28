'use client'

import { useState, useEffect } from 'react'
import { MediaPackData } from '@/lib/mediaPack/types'
import { buildPackData } from '@/lib/mediaPack/buildPackData'
import { generateMediaPackCopy } from '@/ai/useMediaPackCopy'
import { createDemoMediaPackData } from '@/lib/mediaPack/demoData'
import MPClassic from '@/components/media-pack/templates/MPClassic'
import MPBold from '@/components/media-pack/templates/MPBold'
import MPEditorial from '@/components/media-pack/templates/MPEditorial'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Sparkles, Download, Link, ExternalLink, Palette, Moon, Sun } from 'lucide-react'
import { isToolEnabled } from '@/lib/launch'
import { ComingSoon } from '@/components/ComingSoon'
import PageShell from '@/components/PageShell'

type Variant = 'classic' | 'bold' | 'editorial'

export default function MediaPackPreviewPage() {
  const enabled = isToolEnabled("pack")
  
  if (!enabled) {
    return (
      <PageShell title="Media Pack Preview" subtitle="Preview and customize your media pack before sharing.">
        <div className="mx-auto max-w-md">
          <ComingSoon
            title="Media Pack Preview"
            subtitle="This tool will be enabled soon. The page is visible so you can navigate and preview the UI."
          />
        </div>
      </PageShell>
    )
  }
  
  const [packData, setPackData] = useState<MediaPackData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [variant, setVariant] = useState<Variant>('classic')
  const [darkMode, setDarkMode] = useState(false)
  const [brandColor, setBrandColor] = useState('#3b82f6')
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [onePager, setOnePager] = useState(false)

  useEffect(() => {
    loadPackData()
  }, [])

  const loadPackData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // For demo purposes, use demo data
      // In production, this would use buildPackData() and generateMediaPackCopy()
      const data = createDemoMediaPackData()
      
      // Merge theme settings
      const finalData = {
        ...data,
        theme: {
          variant: variant,
          dark: darkMode,
          brandColor: brandColor
        }
      }
      
      console.log('Loaded pack data:', finalData)
      setPackData(finalData)
    } catch (err) {
      console.error('Failed to load pack data:', err)
      setError('Failed to load media pack data')
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePDF = async () => {
    if (!packData) return
    
    try {
      const response = await fetch('/api/media-pack/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          packId: packData.packId,
          variant: variant,
          dark: darkMode
        })
      })
      
      if (response.ok) {
        // Get the PDF URL from headers
        const pdfUrl = response.headers.get('X-PDF-URL')
        const shareUrl = response.headers.get('X-Share-URL')
        
        // Download the PDF
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `media-pack-${packData.packId}-${variant}${darkMode ? '-dark' : ''}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        console.log('PDF generated successfully:', { pdfUrl, shareUrl })
        // TODO: Show success toast
      } else {
        const error = await response.json()
        console.error('PDF generation failed:', error)
        // TODO: Show error toast
      }
    } catch (err) {
      console.error('Failed to generate PDF:', err)
      // TODO: Show error toast
    }
  }

  const handleCopyShareLink = async () => {
    try {
      const response = await fetch('/api/media-pack/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mpId: packData?.packId })
      })
      
      if (response.ok) {
        const { shareUrl } = await response.json()
        setShareUrl(shareUrl)
        await navigator.clipboard.writeText(shareUrl)
        // TODO: Show success toast
      }
    } catch (err) {
      console.error('Failed to create share link:', err)
    }
  }

  const handleOpenPublicView = () => {
    if (shareUrl) {
      window.open(shareUrl, '_blank')
    }
  }

  const renderTemplate = () => {
    if (!packData) return (
      <div className="p-8 text-center text-[var(--muted-fg)]">
        <p>Loading media pack data...</p>
      </div>
    )

    const templateProps = {
      data: {
        ...packData,
        theme: {
          variant,
          dark: darkMode,
          brandColor,
          onePager
        }
      },
      isPublic: false
    }

    console.log('Rendering template with props:', templateProps)



    switch (variant) {
      case 'classic':
        return <MPClassic {...templateProps} />
      case 'bold':
        return <MPBold {...templateProps} />
      case 'editorial':
        return <MPEditorial {...templateProps} />
      default:
        return <MPClassic {...templateProps} />
    }
  }

  if (loading) {
    return (
      <PageShell title="Media Pack Preview" subtitle="Preview and customize your media pack before sharing.">
        <div className="card p-8 text-center text-[var(--muted-fg)]">
          <div className="w-8 h-8 mx-auto mb-3 border-4 border-[var(--brand-600)] border-t-transparent rounded-full animate-spin"/>
          Loading media pack data…
        </div>
      </PageShell>
    )
  }

  if (error) {
    return (
      <PageShell title="Media Pack Preview" subtitle="Preview and customize your media pack before sharing.">
        <div className="card p-4 border-[var(--error)] bg-[var(--tint-error)] text-[var(--error)] text-sm">
          {error}
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell title="Media Pack Preview" subtitle="Preview and customize your media pack before sharing.">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
          </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-[var(--muted-fg)]">
          <Sparkles className="w-4 h-4"/> AI-enhanced content
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Left Rail - Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Variant Selector */}
          <Card className="p-4">
            <h3 className="font-medium text-[var(--fg)] mb-3">Template</h3>
            <div className="space-y-2">
              {(['classic', 'bold', 'editorial'] as Variant[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setVariant(v)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    variant === v
                      ? 'bg-[var(--brand-600)] text-white'
                      : 'bg-[var(--surface)] text-[var(--fg)] hover:bg-[var(--border)]'
                  }`}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </Card>

          {/* Theme Controls */}
          <Card className="p-4">
            <h3 className="font-medium text-[var(--fg)] mb-3">Theme</h3>
            <div className="space-y-4">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--fg)]">Dark Mode</span>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    darkMode ? 'bg-[var(--brand-600)]' : 'bg-[var(--border)]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* One-Pager Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--fg)]">One-Pager Mode</span>
                <button
                  onClick={() => setOnePager(!onePager)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    onePager ? 'bg-[var(--brand-600)]' : 'bg-[var(--border)]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      onePager ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Brand Color */}
              <div>
                <label className="block text-sm text-[var(--fg)] mb-2">Brand Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-8 h-8 rounded border border-[var(--border)] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-[var(--border)] rounded bg-[var(--bg)] text-[var(--fg)]"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-4">
            <h3 className="font-medium text-[var(--fg)] mb-3">Actions</h3>
            <div className="space-y-2">
              <Button
                onClick={handleGeneratePDF}
                className="w-full justify-start"
                variant="secondary"
              >
                <Download className="w-4 h-4 mr-2" />
                Generate PDF
              </Button>
              
              <Button
                onClick={handleCopyShareLink}
                className="w-full justify-start"
                variant="secondary"
              >
                <Link className="w-4 h-4 mr-2" />
                Copy Share Link
              </Button>
              
              {shareUrl && (
                <Button
                  onClick={handleOpenPublicView}
                  className="w-full justify-start"
                  variant="secondary"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Public View
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Right - Live Preview */}
        <div className="lg:col-span-3">
          <Card className="p-0 overflow-hidden">
            <div className="h-[800px] overflow-auto">
              {renderTemplate()}
            </div>
          </Card>
        </div>
      </div>
      </div>
    </PageShell>
  )
}