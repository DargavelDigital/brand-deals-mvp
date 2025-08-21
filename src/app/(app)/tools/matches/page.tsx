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

interface BrandMatch {
  id: string;
  name: string;
  industry: string;
  matchScore: number;
  description: string;
  logo: string;
}

export default function MatchesToolPage() {
  const [run, setRun] = useState<BrandRun | null>(null);
  const [prereqCheck] = useState<PrereqCheck | null>(null);
  const [brandMatches, setBrandMatches] = useState<BrandMatch[]>([]);
  const [isFinding, setIsFinding] = useState(false);

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
  }, [workspaceId]);

  const handleFindMatches = async () => {
    setIsFinding(true);
    
    // Simulate finding brand matches
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockMatches: BrandMatch[] = [
      {
        id: 'brand-1',
        name: 'EcoStyle',
        industry: 'Fashion & Sustainability',
        matchScore: 94,
        description: 'Sustainable fashion brand focused on eco-friendly materials and ethical production.',
        logo: '🌱'
      },
      {
        id: 'brand-2',
        name: 'FitFlow',
        industry: 'Athleisure & Wellness',
        matchScore: 89,
        description: 'Premium athleisure brand that promotes wellness and sustainable fitness.',
        logo: '💪'
      },
      {
        id: 'brand-3',
        name: 'GreenBeauty',
        industry: 'Beauty & Wellness',
        matchScore: 87,
        description: 'Clean beauty brand with natural ingredients and eco-conscious packaging.',
        logo: '✨'
      },
      {
        id: 'brand-4',
        name: 'UrbanOutdoors',
        industry: 'Outdoor & Adventure',
        matchScore: 82,
        description: 'Urban outdoor gear brand for city dwellers who love adventure.',
        logo: '🏔️'
      }
    ];
    
    setBrandMatches(mockMatches);
    setIsFinding(false);
  };

  const handleAdvance = async () => {
    if (!run || brandMatches.length === 0) return;

    try {
      // Record the brand matches result
      await fetch('/api/brand-run/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          runId: run.id,
          selectedBrandIds: brandMatches.map(b => b.id)
        })
      });

      // Advance to next step
      const response = await fetch('/api/brand-run/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          runId: run.id, 
          nextStep: 'APPROVE' 
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
                Brand Matches
              </h1>
              <p className="text-[var(--muted)]">
                Discover brands that perfectly match your content, audience, and values.
              </p>
            </div>

            {prereqCheck && <Prereq check={prereqCheck} />}

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-[var(--text)] mb-4">
                AI-Powered Brand Discovery
              </h2>
              
              {!brandMatches.length ? (
                <div className="text-center py-8">
                  <p className="text-[var(--muted)] mb-4">
                    We&apos;ll analyze your content and find brands that align with your audience and content style.
                  </p>
                  <button
                    onClick={handleFindMatches}
                    disabled={isFinding}
                    className="bg-[var(--brand)] text-white py-3 px-6 rounded-lg font-medium hover:bg-[var(--brand)]/90 transition-colors disabled:opacity-50"
                  >
                    {isFinding ? 'Finding Matches...' : 'Find Brand Matches'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {brandMatches.map(brand => (
                    <div key={brand.id} className="border border-[var(--border)] rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                                                 <div className="w-12 h-12 bg-[var(--brand)]/10 rounded-lg flex items-center justify-center text-2xl">
                          {brand.logo}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-[var(--text)]">{brand.name}</h3>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-[var(--muted)]">Match Score:</span>
                              <span className="text-lg font-bold text-[var(--brand)]">{brand.matchScore}%</span>
                            </div>
                          </div>
                          <p className="text-sm text-[var(--muted)] mb-1">{brand.industry}</p>
                          <p className="text-[var(--text)]">{brand.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {brandMatches.length > 0 && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[var(--text)] mb-4">
                  Next Steps
                </h2>
                <p className="text-[var(--muted)] mb-4">
                  Great matches found! Now let&apos;s review and approve the brands you want to work with.
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
                  {brandMatches.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--muted)]">Matches Found:</span>
                      <span className="text-sm font-medium text-[var(--text)]">{brandMatches.length}</span>
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
