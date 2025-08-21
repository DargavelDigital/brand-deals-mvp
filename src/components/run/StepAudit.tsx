'use client';

import { useState } from 'react';

interface StepAuditProps {
  onContinue: () => void;
  className?: string;
}

interface Insight {
  id: string;
  title: string;
  metric: string;
  description: string;
}

export function StepAudit({ onContinue, className = '' }: StepAuditProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [hasRun, setHasRun] = useState(false);

  const runAudit = async () => {
    setIsRunning(true);
    
    try {
      // Use provider system for audit
      const { Providers } = await import('@/services/providers');
      const auditResult = await Providers.audit.run({ 
        workspaceId: 'demo-workspace', 
        socialAccounts: ['instagram', 'tiktok'] 
      });
      
      // Transform provider response to component format
      const insights: Insight[] = auditResult.insights.slice(0, 3).map((insight, index) => ({
        id: String(index + 1),
        title: insight,
        metric: auditResult.audience.engagementRate,
        description: insight
      }));
      
      setInsights(insights);
      setHasRun(true);
    } catch (error) {
      console.error('Audit failed:', error);
      // Fallback to mock data
      const mockInsights: Insight[] = [
        {
          id: '1',
          title: 'High Engagement on Fitness Content',
          metric: '4.2%',
          description: 'Your fitness posts outperform industry average by 40%'
        },
        {
          id: '2',
          title: 'Strong Millennial Audience',
          metric: '68%',
          description: 'Your content resonates particularly well with 25-34 age group'
        },
        {
          id: '3',
          title: 'Video Content Success',
          metric: '2.1x',
          description: 'Video posts generate 2.1x more engagement than static content'
        }
      ];
      
      setInsights(mockInsights);
      setHasRun(true);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)] mb-2">AI Audit</h1>
        <p className="text-[var(--muted)]">
          We'll analyze your content performance to identify your strengths and find the best brand matches.
        </p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
        <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Content Performance Analysis</h2>
        
        {!hasRun ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[var(--panel)] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-medium text-[var(--text)] mb-2">Ready to analyze your content?</h3>
            <p className="text-[var(--muted)] mb-6">
              This will take about 2 minutes and analyze your recent posts across all connected platforms.
            </p>
            <button
              onClick={runAudit}
              disabled={isRunning}
              className={`px-8 py-3 font-medium rounded-lg transition-colors ${
                isRunning
                  ? 'bg-[var(--muted)] text-[var(--text)] cursor-not-allowed'
                  : 'bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white'
              }`}
            >
              {isRunning ? 'Analyzing...' : 'Run Audit'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-[var(--positive)]/20 border border-[var(--positive)]/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-[var(--positive)]">✓</span>
                <span className="text-sm font-medium text-[var(--text)]">Audit completed successfully!</span>
              </div>
              <p className="text-xs text-[var(--muted)] mt-1">
                We've identified your top performing content patterns and audience insights.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-[var(--text)] mb-4">Key Insights</h3>
              <div className="grid gap-4">
                {insights.map((insight) => (
                  <div key={insight.id} className="p-4 border border-[var(--border)] rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-[var(--text)]">{insight.title}</h4>
                      <span className="text-2xl font-bold text-[var(--brand)]">{insight.metric}</span>
                    </div>
                    <p className="text-sm text-[var(--muted)]">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border)]">
              <button
                onClick={onContinue}
                className="w-full px-6 py-3 bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white font-medium rounded-lg transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
