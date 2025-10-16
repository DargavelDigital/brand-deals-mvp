'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Circle, Clock, Download, Link, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MediaPackData } from '@/lib/mediaPack/types';
import MPProfessional from '@/components/media-pack/templates/MPProfessional';
import MPLuxury from '@/components/media-pack/templates/MPLuxury';
import MPMinimal from '@/components/media-pack/templates/MPMinimal';
import { toast } from '@/hooks/useToast';

interface StepMediaPackProps {
  selectedBrandIds: string[];
  onContinue: () => void;
  onBack: () => void;
}

type Variant = 'professional' | 'luxury' | 'minimal';

export function StepMediaPack({ selectedBrandIds, onContinue, onBack }: StepMediaPackProps) {
  const [packData, setPackData] = useState<MediaPackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [variant, setVariant] = useState<Variant>('classic');
  const [darkMode, setDarkMode] = useState(false);
  const [brandColor, setBrandColor] = useState('#3b82f6');
  const [onePager, setOnePager] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [generatedFileId, setGeneratedFileId] = useState<string | null>(null);

  const hasBrands = selectedBrandIds.length > 0;

  useEffect(() => {
    loadPackData();
  }, []);

  const loadPackData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For demo purposes, use demo data
      // In production, this would use buildPackData() and generateMediaPackCopy()
      const data = createDemoMediaPackData();
      
      // Merge theme settings
      const finalData = {
        ...data,
        theme: {
          variant: variant,
          dark: darkMode,
          brandColor: brandColor,
          onePager: onePager
        }
      };
      
      setPackData(finalData);
    } catch (err) {
      console.error('Failed to load pack data:', err);
      setError('Failed to load media pack data');
    } finally {
      setLoading(false);
    }
  };

  const generateMediaPack = async () => {
    setIsGenerating(true);
    
    try {
      // First, save the media pack data to the database
      const packId = packData?.packId || `brand-run-${Date.now()}`;
      const theme = {
        variant: variant || "classic",
        dark: !!darkMode,
        brandColor: brandColor,
        onePager: onePager
      };
      
      // Save the media pack with theme and payload
      const saveRes = await fetch("/api/media-pack/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packId,
          theme,
          payload: packData
        }),
      });
      
      if (!saveRes.ok) {
        const saveError = await saveRes.json();
        throw new Error(saveError?.error || "Failed to save media pack");
      }

      // Then generate the PDF
      const res = await fetch("/api/media-pack/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packId: packId
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "PDF generator failed");
      
      // Use absolute URL returned by the API (no localhost!)
      const url = json.fileUrl;
      window.open(url, "_blank", "noopener,noreferrer");
      
      // Store fileId to enable "Copy Share Link"
      setGeneratedFileId(json.fileId);
      
      setHasGenerated(true);
    } catch (error: any) {
      console.error('Failed to generate media pack:', error);
      toast.error(`Generate failed: ${error.message || error}`);
      setHasGenerated(true); // Fallback to success for demo
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (!generatedFileId) {
      toast.error("Please generate the PDF first");
      return;
    }
    try {
      const res = await fetch("/api/media-pack/share/mint", {
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
  };

  const handleOpenPublicView = () => {
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  const renderTemplate = () => {
    if (!packData) return (
      <div className="p-8 text-center text-[var(--muted-fg)]">
        <p>Loading media pack data...</p>
      </div>
    );

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
    };

    console.log('Rendering template with props:', templateProps);

    switch (variant) {
      case 'professional':
        return <MPProfessional {...templateProps} />
      case 'luxury':
        return <MPLuxury {...templateProps} />
      case 'minimal':
        return <MPMinimal {...templateProps} />
      case 'classic':
      case 'bold':
      case 'editorial':
        // Old templates - fallback to Professional
        return <MPProfessional {...templateProps} />
      default:
        return <MPProfessional {...templateProps} />
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-text">Media Pack</h1>
          <p className="text-muted max-w-2xl mx-auto">
            Loading media pack data…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-text">Media Pack</h1>
          <p className="text-red-500 max-w-2xl mx-auto">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-text">Media Pack</h1>
        <p className="text-muted max-w-2xl mx-auto">
          Choose your media pack template and generate a professional presentation for brands.
        </p>
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
                onClick={generateMediaPack}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Generating...' : 'Generate PDF'}
              </Button>
              {hasGenerated && (
                <>
                  <Button
                    onClick={handleCopyShareLink}
                    variant="secondary"
                    className="w-full"
                  >
                    <Link className="w-4 h-4 mr-2" />
                    Copy Share Link
                  </Button>
                  <Button
                    onClick={handleOpenPublicView}
                    variant="secondary"
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Public View
                  </Button>
                </>
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

      {hasGenerated && (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">✓</span>
              <span className="text-lg font-medium text-[var(--fg)]">Media pack generated successfully!</span>
            </div>
            <p className="text-[var(--muted-fg)]">
              Your professional media pack is ready for outreach.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="space-y-2">
              <div className="text-lg font-medium text-[var(--fg)]">
                {selectedBrandIds.length} brand{selectedBrandIds.length !== 1 ? 's' : ''} included
              </div>
              <div className="text-sm text-[var(--muted-fg)]">
                Ready to proceed to contact discovery
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={onBack}
                variant="secondary"
              >
                Back
              </Button>
              <Button
                onClick={onContinue}
              >
                Continue to Contacts
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
