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

interface BrandDetail {
  id: string;
  name: string;
  industry: string;
  matchScore: number;
  description: string;
  logo: string;
  approved: boolean;
}

export default function ApproveToolPage() {
  const [run, setRun] = useState<BrandRun | null>(null);
  const [prereqCheck] = useState<PrereqCheck | null>(null);
  const [brands, setBrands] = useState<BrandDetail[]>([]);

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
        matchScore: 94,
        description: 'Sustainable fashion brand focused on eco-friendly materials and ethical production.',
        logo: '🌱',
        approved: false
      },
      {
        id: 'brand-2',
        name: 'FitFlow',
        industry: 'Athleisure & Wellness',
        matchScore: 89,
        description: 'Premium athleisure brand that promotes wellness and sustainable fitness.',
        logo: '💪',
        approved: false
      },
      {
        id: 'brand-3',
        name: 'GreenBeauty',
        industry: 'Beauty & Wellness',
        matchScore: 87,
        description: 'Clean beauty brand with natural ingredients and eco-conscious packaging.',
        logo: '✨',
        approved: false
      },
      {
        id: 'brand-4',
        name: 'UrbanOutdoors',
        industry: 'Outdoor & Adventure',
        matchScore: 82,
        description: 'Urban outdoor gear brand for city dwellers who love adventure.',
        logo: '🏔️',
        approved: false
      }
    ]);
  }, [workspaceId]);

  const handleBrandToggle = (brandId: string) => {
    setBrands(prev => prev.map(brand => 
      brand.id === brandId ? { ...brand, approved: !brand.approved } : brand
    ));
  };

  const handleAdvance = async () => {
    if (!run) return;

    const approvedBrands = brands.filter(brand => brand.approved);
    if (approvedBrands.length === 0) return;

    try {
      // Record the approved brands result
      await fetch('/api/brand-run/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          runId: run.id,
          selectedBrandIds: approvedBrands.map(b => b.id)
        })
      });

      // Advance to next step
      const response = await fetch('/api/brand-run/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          runId: run.id, 
          nextStep: 'PACK' 
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

  const approvedCount = brands.filter(brand => brand.approved).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text)] mb-2">
                Approve Brands
              </h1>
              <p className="text-[var(--muted)]">
                Review and approve the brands you want to work with for partnerships.
              </p>
            </div>

            {prereqCheck && <Prereq check={prereqCheck} />}

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-[var(--text)] mb-4">
                Brand Selection
              </h2>
              
              <div className="space-y-4">
                {brands.map(brand => (
                  <div key={brand.id} className="border border-[var(--border)] rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                                             <div className="w-12 h-12 bg-[var(--brand)]/10 rounded-lg flex items-center justify-center text-2xl">
                        {brand.logo}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-[var(--text)]">{brand.name}</h3>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-[var(--muted)]">Match Score:</span>
                                                         <span className="text-lg font-bold text-[var(--brand)]">{brand.matchScore}%</span>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={brand.approved}
                                onChange={() => handleBrandToggle(brand.id)}
                                className="w-4 h-4 text-[var(--brand)] border-[var(--border)] rounded focus:ring-[var(--brand)]"
                              />
                              <span className="text-sm text-[var(--text)]">Approve</span>
                            </label>
                          </div>
                        </div>
                        <p className="text-sm text-[var(--muted)] mb-1">{brand.industry}</p>
                        <p className="text-[var(--text)]">{brand.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-[var(--border)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-[var(--muted)]">
                    {approvedCount} of {brands.length} brands selected
                  </div>
                  <button
                    onClick={handleAdvance}
                    disabled={approvedCount === 0}
                    className="bg-[var(--brand)] text-white py-2 px-4 rounded-md font-medium hover:bg-[var(--brand)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Approve Brands
                  </button>
                </div>
              </div>
            </div>

            {approvedCount > 0 && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[var(--text)] mb-4">
                  Next Steps
                </h2>
                <p className="text-[var(--muted)] mb-4">
                  Great! You&apos;ve approved {approvedCount} brands. Now let&apos;s generate a media pack to showcase your partnership opportunities.
                </p>
                <button
                  onClick={handleAdvance}
                  className="bg-[var(--muted)] text-[var(--text)] py-2 px-4 rounded-md font-medium hover:bg-[var(--muted)]/80 transition-colors"
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
                    <span className="text-sm text-[var(--muted)]">Brands Approved:</span>
                    <span className="text-sm font-medium text-[var(--text)]">{approvedCount}</span>
                  </div>
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
