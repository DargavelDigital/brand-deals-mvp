'use client';

import { useState, useEffect } from 'react';
import { Prereq } from '@/components/run/Prereq';

interface BrandRun {
  id: string;
  step: string;
  auto: boolean;
  auditId?: string;
  selectedBrandIds?: string[];
  mediaPackId?: string;
  contactIds?: string[];
  sequenceId?: string;
}

interface PrereqCheck {
  met: boolean;
  missing: string[];
  quickActions: Array<{
    label: string;
    action: string;
    href?: string;
  }>;
}

interface MediaPack {
  id: string;
  name: string;
  description: string;
  downloadUrl: string;
  previewUrl: string;
  createdAt: string;
}

interface Brand {
  id: string;
  name: string;
  industry: string;
  logo: string;
}

export default function PackToolPage() {
  const [run, setRun] = useState<BrandRun | null>(null);
  const [prereqCheck] = useState<PrereqCheck | null>(null);
  const [mediaPack, setMediaPack] = useState<MediaPack | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock workspace ID for demo
  const workspaceId = 'demo-workspace';

  useEffect(() => {
    // Fetch current run status
    fetch(`/api/brand-run/current?workspaceId=${workspaceId}`)
      .then(res => res.json())
      .then(data => {
        if (data.run) {
          setRun(data.run);
        }
      })
      .catch(console.error);

    // Mock brand data
    setBrands([
      {
        id: 'brand-1',
        name: 'EcoStyle',
        industry: 'Fashion & Sustainability',
        logo: '🌱'
      },
      {
        id: 'brand-2',
        name: 'FitFlow',
        industry: 'Athleisure & Wellness',
        logo: '💪'
      },
      {
        id: 'brand-3',
        name: 'GreenBeauty',
        industry: 'Beauty & Wellness',
        logo: '✨'
      }
    ]);
  }, [workspaceId]);

  const handleGeneratePack = async () => {
    setIsGenerating(true);
    
    // Simulate media pack generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockPack: MediaPack = {
      id: 'pack-123',
      name: 'BrandDeals Media Pack 2024',
      description: 'Professional media kit showcasing your content, audience, and partnership opportunities.',
      downloadUrl: '/downloads/media-pack.pdf',
      previewUrl: '/preview/media-pack.html',
      createdAt: new Date().toISOString()
    };
    
    setMediaPack(mockPack);
    setIsGenerating(false);
  };

  const handleAdvance = async () => {
    if (!run || !mediaPack) return;

    try {
      // Record the media pack result
      await fetch('/api/brand-run/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          runId: run.id,
          mediaPackId: mediaPack.id
        })
      });

      // Advance to next step
      const response = await fetch('/api/brand-run/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          runId: run.id, 
          nextStep: 'CONTACTS' 
        })
      });

      if (response.ok) {
        const updatedRun = await response.json();
        setRun(updatedRun.run);
      }
    } catch (error) {
      console.error('Error advancing:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text)] mb-2">
                Generate Media Pack
              </h1>
              <p className="text-[var(--muted)]">
                Create a professional media kit to showcase your partnership opportunities to brands.
              </p>
            </div>

            {prereqCheck && <Prereq check={prereqCheck} />}

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-[var(--text)] mb-4">
                Media Pack Creation
              </h2>
              
              {!mediaPack ? (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <p className="text-[var(--muted)] mb-4">
                      We&apos;ll generate a professional media pack that includes your content highlights, audience insights, and partnership opportunities.
                    </p>
                    <button
                      onClick={handleGeneratePack}
                      disabled={isGenerating}
                      className="bg-[var(--brand)] text-white py-3 px-6 rounded-lg font-medium hover:bg-[var(--brand)]/90 transition-colors disabled:opacity-50"
                    >
                      {isGenerating ? 'Generating...' : 'Generate Media Pack'}
                    </button>
                  </div>

                  <div className="border border-[var(--border)] rounded-lg p-4">
                    <h3 className="font-semibold text-[var(--text)] mb-3">Included Brands</h3>
                    <div className="space-y-2">
                      {brands.map(brand => (
                        <div key={brand.id} className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-[var(--brand)]/10 rounded-lg flex items-center justify-center">
                            {brand.logo}
                          </div>
                          <div>
                            <div className="font-medium text-[var(--text)]">{brand.name}</div>
                            <div className="text-sm text-[var(--muted)]">{brand.industry}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📄</div>
                    <h3 className="text-xl font-semibold text-[var(--text)] mb-2">
                      Media Pack Generated!
                    </h3>
                    <p className="text-[var(--muted)] mb-4">
                      Your professional media kit is ready to share with potential brand partners.
                    </p>
                  </div>

                  <div className="border border-[var(--border)] rounded-lg p-4">
                    <h3 className="font-semibold text-[var(--text)] mb-3">Pack Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[var(--muted)]">Name:</span>
                        <span className="text-[var(--text)]">{mediaPack.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted)]">Description:</span>
                        <span className="text-[var(--text)]">{mediaPack.description}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted)]">Created:</span>
                        <span className="text-[var(--text)]">
                          {new Date(mediaPack.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <a
                      href={mediaPack.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-[var(--secondary)] text-[var(--text)] py-2 px-4 rounded-md font-medium hover:bg-[var(--secondary)]/80 transition-colors text-center"
                    >
                      Preview Pack
                    </a>
                    <a
                      href={mediaPack.downloadUrl}
                      download
                      className="flex-1 bg-[var(--brand)] text-white py-2 px-4 rounded-md font-medium hover:bg-[var(--brand)]/90 transition-colors text-center"
                    >
                      Download PDF
                    </a>
                  </div>
                </div>
              )}
            </div>

            {mediaPack && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[var(--text)] mb-4">
                  Next Steps
                </h2>
                <p className="text-[var(--muted)] mb-4">
                  Perfect! Your media pack is ready. Now let&apos;s discover the right contacts at these brands to reach out to.
                </p>
                <button
                  onClick={handleAdvance}
                  className="bg-[var(--secondary)] text-[var(--text)] py-2 px-4 rounded-md font-medium hover:bg-[var(--secondary)]/80 transition-colors"
                >
                  Advance to Next Stage
                </button>
              </div>
            )}
          </div>

          {/* Right Rail */}
          <div className="space-y-6">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[var(--text)] mb-4">
                Run Status
              </h3>
              {run ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted)]">Current Step:</span>
                    <span className="text-sm font-medium text-[var(--text)]">{run.step}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted)]">Mode:</span>
                    <span className="text-sm font-medium text-[var(--text)]">
                      {run.auto ? 'Auto' : 'Manual'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted)]">Brands:</span>
                    <span className="text-sm font-medium text-[var(--text)]">{brands.length}</span>
                  </div>
                  {mediaPack && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--muted)]">Media Pack:</span>
                      <span className="text-sm font-medium text-[var(--success)]">Ready</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[var(--muted)]">No active run</p>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
