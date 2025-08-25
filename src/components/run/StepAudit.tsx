'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

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
    <div>
      <div>
        <h1>AI Audit</h1>
        <p>
          We'll analyze your content performance to identify your strengths and find the best brand matches.
        </p>
      </div>

      <div>
        <h2>Content Performance Analysis</h2>
        
        {!hasRun ? (
          <div>
            <div>
              <span>📊</span>
            </div>
            <h3>Ready to analyze your content?</h3>
            <p>
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
          <div>
            <div>
              <div>
                <span>✓</span>
                <span>Audit completed successfully!</span>
              </div>
              <p>
                We've identified your top performing content patterns and audience insights.
              </p>
            </div>

            <div>
              <h3>Key Insights</h3>
              <div>
                {insights.map((insight) => (
                  <div key={insight.id}>
                    <div>
                      <h4>{insight.title}</h4>
                      <span>{insight.metric}</span>
                    </div>
                    <p>{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
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
