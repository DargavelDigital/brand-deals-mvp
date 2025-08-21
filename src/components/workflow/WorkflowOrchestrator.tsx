'use client';

import { useState } from 'react';
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

  const runStep = async (stageId: string) => {
    setStages(prev => prev.map(stage => 
      stage.id === stageId ? { ...stage, status: 'running' } : stage
    ));

    try {
      let result;
      
      // Call appropriate stub function based on stage ID
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
          result = { error: 'Unknown stage' };
      }

      setStages(prev => prev.map(stage => 
        stage.id === stageId ? { ...stage, status: 'completed', result } : stage
      ));
    } catch (error) {
      setStages(prev => prev.map(stage => 
        stage.id === stageId ? { ...stage, status: 'error' } : stage
      ));
    }
  };

  const advanceToNext = async (currentStageId: string) => {
    const currentIndex = stages.findIndex(stage => stage.id === currentStageId);
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      setStages(prev => prev.map(stage => 
        stage.id === nextStage.id ? { ...stage, status: 'pending' } : stage
      ));
      
      // Auto-trigger the next stage
      await runStep(nextStage.id);
    }
  };

  const runFullWorkflow = async () => {
    setIsRunningFull(true);
    
    try {
      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        await runStep(stage.id);
        
        // Small delay between stages for better UX
        if (i < stages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } finally {
      setIsRunningFull(false);
    }
  };

  const getStatusColor = (status: WorkflowStage['status']) => {
    switch (status) {
      case 'pending': return 'bg-[var(--muted)]';
      case 'running': return 'bg-[var(--brand)]';
      case 'completed': return 'bg-[var(--positive)]';
      case 'error': return 'bg-[var(--negative)]';
      default: return 'bg-[var(--muted)]';
    }
  };

  const getStatusText = (status: WorkflowStage['status']) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'running': return 'Running...';
      case 'completed': return 'Completed';
      case 'error': return 'Error';
      default: return 'Pending';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[var(--text)] mb-4">
          Workflow Orchestrator
        </h1>
        <p className="text-[var(--muted)] text-lg mb-6">
          Manage your brand partnership workflow from start to finish
        </p>
        <button
          onClick={runFullWorkflow}
          disabled={isRunningFull}
          className="bg-[var(--brand)] text-white py-3 px-8 rounded-lg font-medium hover:bg-[var(--brand)]/90 transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunningFull ? 'Running Full Workflow...' : 'Run Full Workflow'}
        </button>
      </div>

      {/* Workflow Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stages.map((stage, index) => (
          <div
            key={stage.id}
            className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 space-y-4"
          >
            {/* Stage Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${getStatusColor(stage.status)}`}>
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text)] text-lg">
                    {stage.name}
                  </h3>
                  <p className="text-[var(--muted)] text-sm">
                    {stage.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(stage.status)}`}></div>
              <span className="text-sm text-[var(--text)]">
                {getStatusText(stage.status)}
              </span>
            </div>

            {/* Result Display */}
            {stage.result && (
              <div className="bg-[var(--bg)] border border-[var(--border)] rounded p-4">
                <p className="text-sm text-[var(--muted)] mb-3 font-medium">Result:</p>
                <div className="space-y-3">
                  {stage.id === 'ai-audit' && stage.result.insights && (
                    <div>
                      <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2">Insights</p>
                      <ul className="space-y-2">
                        {stage.result.insights.map((insight: string, index: number) => (
                          <li key={index} className="flex items-start bg-[var(--card)] p-2 rounded border border-[var(--border)]">
                            <span className="text-[var(--brand)] mr-2 mt-0.5">•</span>
                            <span className="text-sm text-[var(--text)]">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {stage.id === 'brand-identification' && stage.result.brands && (
                    <div>
                      <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2">Brands</p>
                      <div className="grid gap-2">
                        {stage.result.brands.map((brand: any, index: number) => (
                          <div key={index} className="bg-[var(--card)] p-3 rounded border border-[var(--border)]">
                            <div className="font-medium text-[var(--text)] text-sm mb-1">{brand.name}</div>
                            <div className="text-xs text-[var(--muted)]">{brand.reason}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {stage.id === 'contact-finder' && stage.result.contacts && (
                    <div>
                      <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2">Contacts</p>
                      <div className="bg-[var(--card)] rounded border border-[var(--border)] overflow-hidden">
                        <div className="grid grid-cols-2 gap-2 p-2 bg-[var(--panel)] text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                          <div>Name</div>
                          <div>Email</div>
                        </div>
                        {stage.result.contacts.map((contact: any, index: number) => (
                          <div key={index} className="grid grid-cols-2 gap-2 p-2 border-t border-[var(--border)]">
                            <div className="text-sm text-[var(--text)] font-medium">{contact.name}</div>
                            <div className="text-sm text-[var(--muted)]">{contact.email}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {stage.id === 'media-pack-generator' && stage.result.url && (
                    <div>
                      <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2">Media Pack</p>
                      <div className="bg-[var(--card)] p-3 rounded border border-[var(--border)] space-y-2">
                        <div>
                          <a 
                            href={stage.result.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-[var(--brand)] hover:text-[var(--brand)]/80 text-sm font-medium transition-colors"
                          >
                            <span>📄 View Media Pack</span>
                            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                        <div className="text-xs text-[var(--muted)]">{stage.result.summary}</div>
                      </div>
                    </div>
                  )}
                  
                  {stage.id === 'outreach' && stage.result.status && (
                    <div>
                      <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2">Outreach</p>
                      <div className="bg-[var(--card)] p-3 rounded border border-[var(--border)]">
                        <div className="text-sm text-[var(--text)] mb-1">{stage.result.status}</div>
                        <div className="text-xs text-[var(--muted)]">ID: {stage.result.id}</div>
                      </div>
                    </div>
                  )}
                  
                  {stage.id === 'meeting-scheduling' && stage.result.link && (
                    <div>
                      <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2">Meeting</p>
                      <div className="bg-[var(--card)] p-3 rounded border border-[var(--border)]">
                        <a 
                          href={stage.result.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center bg-[var(--brand)] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[var(--brand)]/90 transition-colors"
                        >
                          <span>📅 Schedule Meeting</span>
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {/* Fallback for any other results */}
                  {!['ai-audit', 'brand-identification', 'contact-finder', 'media-pack-generator', 'outreach', 'meeting-scheduling'].includes(stage.id) && (
                    <pre className="text-xs text-[var(--text)] overflow-x-auto bg-[var(--card)] p-3 rounded border border-[var(--border)]">
                      {JSON.stringify(stage.result, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => runStep(stage.id)}
                disabled={stage.status === 'running'}
                className="flex-1 bg-[var(--secondary)] text-[var(--text)] py-2 px-4 rounded-md font-medium hover:bg-[var(--secondary)]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {stage.status === 'running' ? 'Running...' : 'Run Step'}
              </button>
              
              {index < stages.length - 1 && (
                <button
                  onClick={() => advanceToNext(stage.id)}
                  disabled={stage.status !== 'completed'}
                  className="bg-[var(--brand)] text-white py-2 px-4 rounded-md font-medium hover:bg-[var(--brand)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
