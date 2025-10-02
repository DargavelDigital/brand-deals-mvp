'use client'

import { useState, useEffect, useRef } from 'react'
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
import { toast } from '@/hooks/useToast'
import { isOn } from '@/config/flags'

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
  const [mpBusy, setMpBusy] = useState(false)
  const [generatedFileId, setGeneratedFileId] = useState<string | null>(null)
  
  // Ref for capturing preview HTML
  const previewRef = useRef<HTMLDivElement>(null)

  // Check if Media Pack v2 is enabled
  const canMP = isOn('mediapack.v2') || process.env.NEXT_PUBLIC_MEDIAPACK_V2 === 'true'

  // Helper to make a unique idempotency key
  const makeKey = () =>
    `mp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

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
    
    setLoading(true);
    try {
      const res = await fetch("/api/media-pack/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packId: packData.packId || "demo-pack-123",
          variant: variant || "classic",
          dark: !!darkMode,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Generate failed");
      // Open the PDF in a new tab
      window.open(json.url, "_blank", "noopener,noreferrer");
      // Optionally store json.fileId to enable "Copy Share Link"
      setGeneratedFileId(json.fileId);
    } catch (e: any) {
      console.error(e);
      toast.error(`Generate failed: ${e.message || e}`);
    } finally {
      setLoading(false);
    }
  }

  const handleCopyShareLink = async () => {
    if (!generatedFileId) {
      toast.error("Please generate the PDF first");
      return;
    }
    try {
      const res = await fetch("/api/media-pack/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: generatedFileId }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Share failed");
      await navigator.clipboard.writeText(json.url);
      toast.success("Share link copied!");
    } catch (e: any) {
      console.error(e);
      toast.error(`Copy link failed: ${e.message || e}`);
    }
  }

  const onGeneratePdf = async () => {
    if (mpBusy) return;
    
    // Pre-flight guard: check if there's meaningful content to export
    if (!packData) {
      toast.error('No media pack data available');
      return;
    }
    
    // Check if there's enough content to generate a meaningful media pack
    const hasCreatorInfo = packData.creator?.name && packData.creator?.tagline;
    const hasSocials = packData.socials && packData.socials.length > 0;
    const hasAudience = packData.audience && (packData.audience.age?.length > 0 || packData.audience.geo?.length > 0);
    const hasContent = hasCreatorInfo || hasSocials || hasAudience;
    
    if (!hasContent) {
      toast.error('Nothing to export yet - please add creator info, social metrics, or audience data');
      return;
    }
    
    setMpBusy(true);
    try {
      // Capture the preview HTML
      const html = previewRef.current?.innerHTML ?? '';
      if (!html) {
        throw new Error('No preview HTML to generate PDF from');
      }
      
      const res = await fetch('/api/media-pack/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': makeKey(),
        },
        body: JSON.stringify({ 
          html,
          fileName: `media-pack-${Date.now()}.pdf`
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Generate failed (${res.status}) ${text}`);
      }

      // Handle both local (URL) and serverless (inline) responses
      const data = await res.json();
      
      if (data.ok && data.url) {
        // Local/dev mode: open the saved file URL
        window.open(data.url, "_blank");
      } else if (data.ok && data.inline && data.base64) {
        // Serverless mode: construct a Blob and force a download
        const byteChars = atob(data.base64);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        // Force a file download:
        const a = document.createElement("a");
        a.href = url;
        a.download = data.filename || `media-pack-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else {
        throw new Error("Unexpected response from PDF generator");
      }

      toast.success('Media Pack generated');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to generate Media Pack');
    } finally {
      setMpBusy(false);
    }
  };

  const onCopyShareLink = async () => {
    try {
      if (!packData?.packId) {
        toast.error('No media pack available to share');
        return;
      }

      // Try API first to get signed token
      const res = await fetch('/api/media-pack/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': makeKey(),
        },
        body: JSON.stringify({ mpId: packData.packId }),
      });

      let url: string | undefined;
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        url = data?.shareUrl || data?.url;
      }
      
      // Fallback: construct URL with pack ID (requires the pack to exist in DB)
      if (!url && typeof window !== 'undefined') {
        // Note: This fallback URL won't have a signed token, so the view page must handle unsigned requests
        url = `${window.location.origin}/media-pack/view?mp=${encodeURIComponent(packData.packId)}`;
      }

      if (!url) throw new Error('No share URL available');

      await navigator.clipboard.writeText(url);
      toast.success('Share link copied to clipboard');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to copy share link');
    }
  };

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
                onClick={onGeneratePdf}
                disabled={!canMP || mpBusy || !packData}
                className="w-full justify-start"
                variant="secondary"
                title={!canMP ? 'Temporarily disabled' : undefined}
              >
                <Download className="w-4 h-4 mr-2" />
                {!canMP ? 'Coming soon' : mpBusy ? 'Generating...' : 'Generate PDF'}
              </Button>
              
              <Button
                onClick={onCopyShareLink}
                disabled={!canMP}
                className="w-full justify-start"
                variant="secondary"
                title={!canMP ? 'Temporarily disabled' : undefined}
              >
                <Link className="w-4 h-4 mr-2" />
                {!canMP ? 'Coming soon' : 'Copy Share Link'}
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
            <div ref={previewRef} className="h-[800px] overflow-auto">
              {renderTemplate()}
            </div>
          </Card>
        </div>
      </div>
      </div>
    </PageShell>
  )
}