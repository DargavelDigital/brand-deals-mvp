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

interface AuditResults {
  id: string;
  score: number;
  insights: string[];
  recommendations: string[];
  completedAt: string;
}

export default function AuditToolPage() {
  const [run, setRun] = useState<BrandRun | null>(null);
  const [prereqCheck] = useState<PrereqCheck | null>(null);
  const [auditResults, setAuditResults] = useState<AuditResults | null>(null);
  const [isRunning, setIsRunning] = useState(false);

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

  const handleRunAudit = async () => {
    setIsRunning(true);
    
    // Simulate audit execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResults: AuditResults = {
      id: 'audit-123',
      score: 87,
      insights: [
        'Your content shows strong engagement with lifestyle and fashion topics',
        'Video content performs 40% better than static posts',
        'Your audience is primarily 18-34 year olds interested in sustainable products'
      ],
      recommendations: [
        'Focus on video content creation',
        'Explore partnerships with eco-friendly brands',
        'Consider expanding into wellness and fitness content'
      ],
      completedAt: new Date().toISOString()
    };
    
    setAuditResults(mockResults);
    setIsRunning(false);
  };

  const handleAdvance = async () => {
    if (!run || !auditResults) return;

    try {
      // Record the audit result
      await fetch('/api/brand-run/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          runId: run.id,
          auditId: auditResults.id
        })
      });

      // Advance to next step
      const response = await fetch('/api/brand-run/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          runId: run.id, 
          nextStep: 'MATCHES' 
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
                AI Audit
              </h1>
              <p className="text-[var(--muted)]">
                Analyze your content and audience to discover the best brand partnership opportunities.
              </p>
            </div>

            {prereqCheck && <Prereq check={prereqCheck} />}

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-[var(--text)] mb-4">
                Content Analysis
              </h2>
              
              {!auditResults ? (
                <div className="text-center py-8">
                  <p className="text-[var(--muted)] mb-4">
                    We&apos;ll analyze your social media content to understand your audience, content performance, and brand partnership potential.
                  </p>
                  <button
                    onClick={handleRunAudit}
                    disabled={isRunning}
                    className="bg-[var(--brand)] text-white py-3 px-6 rounded-lg font-medium hover:bg-[var(--brand)]/90 transition-colors disabled:opacity-50"
                  >
                    {isRunning ? 'Running Audit...' : 'Run Audit'}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                                         <div className="text-4xl font-bold text-[var(--brand)] mb-2">
                      {auditResults.score}/100
                    </div>
                    <div className="text-[var(--muted)]">Brand Partnership Score</div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[var(--text)] mb-3">Key Insights</h3>
                    <ul className="space-y-2">
                      {auditResults.insights.map((insight, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="w-2 h-2 bg-[var(--brand)] rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-[var(--text)]">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[var(--text)] mb-3">Recommendations</h3>
                    <ul className="space-y-2">
                      {auditResults.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="w-2 h-2 bg-[var(--positive)] rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-[var(--text)]">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {auditResults && (
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[var(--text)] mb-4">
                  Next Steps
                </h2>
                <p className="text-[var(--muted)] mb-4">
                  Your audit is complete! Now let&apos;s find brands that match your content and audience.
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
                  {auditResults && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--muted)]">Audit Score:</span>
                      <span className="text-sm font-medium text-[var(--text)]">{auditResults.score}/100</span>
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
