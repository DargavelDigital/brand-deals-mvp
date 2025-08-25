'use client';

import { useState } from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { 
  runAudit, 
  runBrandIdentification, 
  runContactFinder, 
  runMediaPack, 
  runOutreach, 
  runScheduleMeeting 
} from '@/services/workflowStubs';

interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: any;
}

const WORKFLOW_STAGES: Omit<WorkflowStage, 'status' | 'result'>[] = [
  {
    id: 'ai-audit',
    name: 'AI Content Audit',
    description: 'Analyze content and audience for brand partnership potential'
  },
  {
    id: 'brand-identification',
    name: 'Brand Identification',
    description: 'Discover brands that match your content and audience'
  },
  {
    id: 'contact-finder',
    name: 'Contact Finder',
    description: 'Find decision makers and contact information for target brands'
  },
  {
    id: 'media-pack-generator',
    name: 'Media Pack Generator',
    description: 'Create professional media kits for brand outreach'
  },
  {
    id: 'outreach',
    name: 'Outreach',
    description: 'Send personalized outreach emails to brand contacts'
  },
  {
    id: 'meeting-scheduling',
    name: 'Meeting Scheduling',
    description: 'Schedule and coordinate partnership meetings'
  }
];

export function WorkflowOrchestrator() {
  const [stages, setStages] = useState<WorkflowStage[]>(
    WORKFLOW_STAGES.map(stage => ({
      ...stage,
      status: 'pending' as const
    }))
  );
  const [isRunningFull, setIsRunningFull] = useState(false);
  const [demoMode, setDemoMode] = useState(process.env.NEXT_PUBLIC_DEMO_MODE === 'true');

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const runStep = async (stageId: string) => {
    setStages(prev => prev.map(stage => 
      stage.id === stageId ? { ...stage, status: 'running' } : stage
    ));

    try {
      let result;
      
      if (demoMode) {
        // DEMO MODE: Use stub functions for testing
        switch (stageId) {
          case 'ai-audit':
            result = await runAudit();
            break;
          case 'brand-identification':
            result = await runBrandIdentification();
            break;
          case 'contact-finder':
            result = await runContactFinder();
            break;
          case 'media-pack-generator':
            result = await runMediaPack();
            break;
          case 'outreach':
            result = await runOutreach();
            break;
          case 'meeting-scheduling':
            result = await runScheduleMeeting();
            break;
          default:
            throw new Error(`Unknown stage: ${stageId}`);
        }
      } else {
        // PRODUCTION MODE: Use real API calls
        // TODO: Implement real workflow execution
        throw new Error('Production workflow not implemented yet');
      }

      setStages(prev => prev.map(stage => 
        stage.id === stageId ? { ...stage, status: 'completed', result } : stage
      ));
    } catch (error) {
      console.error(`Stage ${stageId} failed:`, error);
      setStages(prev => prev.map(stage => 
        stage.id === stageId ? { ...stage, status: 'error' } : stage
      ));
    }
  };

  const runFullWorkflow = async () => {
    setIsRunningFull(true);
    
    try {
      for (const stage of stages) {
        await runStep(stage.id);
        // Add delay between stages for demo purposes
        if (demoMode) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error('Full workflow failed:', error);
    } finally {
      setIsRunningFull(false);
    }
  };

  const resetWorkflow = () => {
    setStages(prev => prev.map(stage => ({
      ...stage,
      status: 'pending' as const,
      result: undefined
    })));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '';
      case 'running': return '';
      case 'completed': return '';
      case 'error': return '';
      default: return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'running': return 'Running...';
      case 'completed': return 'Completed';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  const renderStageResult = (stage: WorkflowStage) => {
    if (!stage.result) return null;

    switch (stage.id) {
      case 'ai-audit':
        return (
          <div>
            <p>Result:</p>
            <div>
              <p>Insights</p>
              <ul>
                {stage.result.insights?.map((insight: string, index: number) => (
                  <li key={index}>
                    <span>•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p>Audience</p>
              <div>
                <div>
                  <div>{formatNumber(stage.result.audience.size)}</div>
                  <div>Total Followers</div>
                </div>
                <div>
                  <div>{(stage.result.audience.engagementRate * 100).toFixed(1)}%</div>
                  <div>Engagement Rate</div>
                </div>
              </div>
              <div>
                <div>Top Locations</div>
                <div>
                  {stage.result.audience.topLocations?.map((location: string, index: number) => (
                    <span key={index}>{location}</span>
                  ))}
                </div>
              </div>
              <div>
                <div>Data Sources</div>
                <div>
                  {stage.result.audience.dataSources?.map((source: string, index: number) => (
                    <span key={index}>{source}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'brand-identification':
        return (
          <div>
            <p>Brand Matches</p>
            <div>
              {stage.result.brands?.map((match: any, index: number) => (
                <div key={index}>
                  <div>
                    <div>{match.brand.name}</div>
                    <div>{match.score}% Match</div>
                  </div>
                  <div>
                    <div>Match Reasons:</div>
                    <div>
                      {match.reasons?.map((reason: string, reasonIndex: number) => (
                        <div key={reasonIndex}>
                          <span>•</span>
                          {reason}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'contact-finder':
        return (
          <div>
            <p>Contacts</p>
            <div>
              <div>
                <div>Name</div>
                <div>Email</div>
              </div>
              {stage.result.contacts?.map((contact: any, index: number) => (
                <div key={index}>
                  <div>{contact.name}</div>
                  <div>{contact.email}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'media-pack-generator':
        return (
          <div>
            <p>Media Pack</p>
            <div>
              <div>
                {stage.result.files?.map((file: any, index: number) => (
                  <a key={index} href={file.url} target="_blank" rel="noopener noreferrer">
                    {file.name}
                  </a>
                ))}
              </div>
              <div>
                <a href={stage.result.previewUrl} target="_blank" rel="noopener noreferrer">
                  Preview HTML
                </a>
              </div>
            </div>
            <div>{stage.result.summary}</div>
            <div>
              Generated with {stage.result.template} template
            </div>
          </div>
        );

      case 'outreach':
        return (
          <div>
            <p>Outreach</p>
            <div>
              <div>{stage.result.status}</div>
              <div>
                {stage.result.emailsSent} emails sent
              </div>
            </div>
            <div>
              <span>First Email:</span>
              <span>{stage.result.firstEmailStatus}</span>
            </div>
            <div>
              <span>Response Rate:</span>
              <span>{stage.result.responseRate}%</span>
            </div>
            <div>
              <span>Deal Status:</span>
              <span>{stage.result.dealStatus}</span>
            </div>
            <div>
              {stage.result.nextSteps}
            </div>
          </div>
        );

      case 'meeting-scheduling':
        return (
          <div>
            <p>Meeting</p>
            <div>
              <div>{stage.result.status}</div>
              <div>
                <a href={stage.result.calendarUrl} target="_blank" rel="noopener noreferrer">
                  Schedule Meeting
                </a>
              </div>
            </div>
            <div>
              {stage.result.summary}
            </div>
          </div>
        );

      default:
        return (
          <pre>
            {JSON.stringify(stage.result, null, 2)}
          </pre>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-text">
          AI-Powered Brand Partnership Workflow
        </h1>
        <p className="text-muted max-w-2xl mx-auto">
          Automate your entire brand partnership process from content audit to meeting scheduling
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={runFullWorkflow}
            disabled={isRunningFull}
          >
            {isRunningFull ? 'Running Full Workflow...' : 'Run Full Workflow'}
          </Button>
          <Button onClick={resetWorkflow} variant="secondary">
            Reset All
          </Button>
        </div>
        <div className="flex items-center gap-3 justify-center">
          <span className="text-sm text-muted">Demo Mode:</span>
          <Button
            onClick={() => setDemoMode(!demoMode)}
            variant="ghost"
            size="sm"
          >
            {demoMode ? 'Disable' : 'Enable'}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {stages.map((stage) => (
          <div key={stage.id} className="p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {stage.status === 'completed' ? '✓' : stage.status === 'running' ? '⟳' : stage.status === 'error' ? '✗' : '○'}
                </div>
                <div>
                  <h3 className="font-medium text-text">{stage.name}</h3>
                  <p className="text-sm text-muted">{stage.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted mb-1">
                  {getStatusText(stage.status)}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  stage.status === 'completed' 
                    ? 'bg-success/10 text-success' 
                    : stage.status === 'error' 
                    ? 'bg-error/10 text-error' 
                    : 'bg-muted/10 text-muted'
                }`}>
                  {stage.status === 'completed' ? 'Success' : stage.status === 'error' ? 'Failed' : 'Ready'}
                </span>
              </div>
            </div>

            {stage.status === 'completed' && stage.result && (
              <div className="mb-4">
                {renderStageResult(stage)}
              </div>
            )}

            <div className="text-center">
              <Button
                onClick={() => runStep(stage.id)}
                disabled={stage.status === 'running'}
                variant={stage.status === 'completed' ? 'secondary' : 'primary'}
              >
                {stage.status === 'running' ? 'Running...' : 'Run Step'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
