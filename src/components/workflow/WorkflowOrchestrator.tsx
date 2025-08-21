'use client';

import { useState } from 'react';

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

  const runStep = async (stageId: string) => {
    setStages(prev => prev.map(stage => 
      stage.id === stageId ? { ...stage, status: 'running' } : stage
    ));

    try {
      // Stub function returning dummy JSON
      const result = await new Promise(resolve => 
        setTimeout(() => resolve({ 
          success: true, 
          data: { message: `Completed ${stages.find(s => s.id === stageId)?.name}` },
          timestamp: new Date().toISOString()
        }), 2000)
      );

      setStages(prev => prev.map(stage => 
        stage.id === stageId ? { ...stage, status: 'completed', result } : stage
      ));
    } catch (error) {
      setStages(prev => prev.map(stage => 
        stage.id === stageId ? { ...stage, status: 'error' } : stage
      ));
    }
  };

  const advanceToNext = (currentStageId: string) => {
    const currentIndex = stages.findIndex(stage => stage.id === currentStageId);
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      setStages(prev => prev.map(stage => 
        stage.id === nextStage.id ? { ...stage, status: 'pending' } : stage
      ));
    }
  };

  const runFullWorkflow = async () => {
    for (const stage of stages) {
      await runStep(stage.id);
      if (stage.id !== stages[stages.length - 1].id) {
        advanceToNext(stage.id);
      }
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
          className="bg-[var(--brand)] text-white py-3 px-8 rounded-lg font-medium hover:bg-[var(--brand)]/90 transition-colors text-lg"
        >
          Run Full Workflow
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
              <div className="bg-[var(--bg)] border border-[var(--border)] rounded p-3">
                <p className="text-xs text-[var(--muted)] mb-1">Result:</p>
                <pre className="text-xs text-[var(--text)] overflow-x-auto">
                  {JSON.stringify(stage.result, null, 2)}
                </pre>
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
