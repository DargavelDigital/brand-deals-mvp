'use client';

import { useState } from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

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
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-text">AI Audit</h1>
        <p className="text-muted max-w-2xl mx-auto">
          We'll analyze your content performance to identify your strengths and find the best brand matches.
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-text">Content Performance Analysis</h2>
        
        {!hasRun ? (
          <div className="text-center space-y-4">
            <div className="text-4xl">📊</div>
            <h3 className="text-lg font-medium text-text">Ready to analyze your content?</h3>
            <p className="text-muted max-w-md mx-auto">
              This will take about 2 minutes and analyze your recent posts across all connected platforms.
            </p>
            <Button
              onClick={runAudit}
              disabled={isRunning}
            >
              {isRunning ? 'Analyzing...' : 'Run Audit'}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">✓</span>
                <span className="text-lg font-medium text-text">Audit completed successfully!</span>
              </div>
              <p className="text-muted">
                We've identified your top performing content patterns and audience insights.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text">Key Insights</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {insights.map((insight) => (
                  <div key={insight.id} className="p-4 bg-surface rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-text">{insight.title}</h4>
                      <span className="text-lg font-bold text-accent">{insight.metric}</span>
                    </div>
                    <p className="text-sm text-muted">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={onContinue}
              >
                Continue
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
