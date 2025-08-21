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
            result = { error: 'Unknown stage' };
        }
      } else {
        // REAL MODE: Call actual services (AI, API, SMTP, etc.)
        switch (stageId) {
          case 'ai-audit':
            try {
              const response = await fetch('/api/audit/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              });
              
              if (!response.ok) {
                const errorData = await response.json();
                if (errorData.code === 'INSUFFICIENT_CREDITS') {
                  result = { error: 'Insufficient credits for audit. Please upgrade your plan.' };
                } else {
                  result = { error: errorData.error || 'Audit failed' };
                }
              } else {
                const auditData = await response.json();
                result = {
                  auditId: auditData.data.auditId,
                  insights: auditData.data.insights,
                  audience: auditData.data.audience,
                  similarCreators: auditData.data.similarCreators,
                  sources: auditData.data.sources
                };
              }
            } catch (error) {
              result = { error: 'Failed to run audit' };
            }
            break;
          case 'brand-identification':
            try {
              const response = await fetch('/api/match/top?limit=20', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
              });
              
              if (!response.ok) {
                const errorData = await response.json();
                result = { error: errorData.error || 'Brand matching failed' };
              } else {
                const matchData = await response.json();
                result = {
                  matches: matchData.data,
                  count: matchData.count,
                  message: `Found ${matchData.count} brand matches`
                };
              }
            } catch (error) {
              result = { error: 'Failed to fetch brand matches' };
            }
            break;
          case 'contact-finder':
            // TODO: Call contact database/API
            result = { error: 'Real contact finder service not implemented yet' };
            break;
          case 'media-pack-generator':
            try {
              // For now, use a demo brand ID - in real app, this would come from brand selection
              const demoBrandId = 'demo-brand-123';
              const response = await fetch('/api/media-pack/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  brandId: demoBrandId,
                  variant: 'default'
                })
              });
              
              if (!response.ok) {
                const errorData = await response.json();
                if (errorData.code === 'INSUFFICIENT_CREDITS') {
                  result = { error: 'Insufficient credits for media pack generation. Please upgrade your plan.' };
                } else if (errorData.code === 'NO_AUDIT_DATA') {
                  result = { error: 'No audit data available. Please run an audit first.' };
                } else {
                  result = { error: errorData.error || 'Media pack generation failed' };
                }
              } else {
                const mediaPackData = await response.json();
                result = {
                  mediaPackId: mediaPackData.data.mediaPackId,
                  url: mediaPackData.data.htmlUrl,
                  summary: mediaPackData.data.summary,
                  pdfUrl: mediaPackData.data.pdfUrl
                };
              }
            } catch (error) {
              result = { error: 'Failed to generate media pack' };
            }
            break;
          case 'outreach':
            try {
              // For now, use demo data - in real app, this would come from previous steps
              const demoBrandId = 'demo-brand-123';
              const demoMediaPackId = 'demo-media-pack-123';
              const demoContactIds = ['demo-contact-1', 'demo-contact-2'];
              
              const response = await fetch('/api/sequence/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  brandId: demoBrandId,
                  mediaPackId: demoMediaPackId,
                  contactIds: demoContactIds,
                  pauseFirstSend: false
                })
              });
              
              if (!response.ok) {
                const errorData = await response.json();
                if (errorData.code === 'INSUFFICIENT_CREDITS') {
                  result = { error: 'Insufficient credits for outreach. Please upgrade your plan.' };
                } else if (errorData.code === 'NO_VALID_CONTACTS') {
                  result = { error: 'No valid contacts found for outreach.' };
                } else {
                  result = { error: errorData.error || 'Outreach failed' };
                }
              } else {
                const outreachData = await response.json();
                result = {
                  sequenceId: outreachData.data.sequenceId,
                  status: `Outreach sequence started with ${outreachData.data.stepsCreated} steps`,
                  firstEmailSent: outreachData.data.firstEmailSent,
                  dealStatus: outreachData.data.dealStatus
                };
              }
            } catch (error) {
              result = { error: 'Failed to start outreach sequence' };
            }
            break;
          case 'meeting-scheduling':
            // TODO: Call calendar/scheduling service
            result = { error: 'Real scheduling service not implemented yet' };
            break;
          default:
            result = { error: 'Unknown stage' };
        }
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
               
               <div className="flex items-center justify-center space-x-4 mb-6">
                 <button
                   onClick={runFullWorkflow}
                   disabled={isRunningFull}
                   className="bg-[var(--brand)] text-white py-3 px-8 rounded-lg font-medium hover:bg-[var(--brand)]/90 transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {isRunningFull ? 'Running Full Workflow...' : 'Run Full Workflow'}
                 </button>
                 
                 <div className="flex items-center space-x-3">
                   <span className="text-sm text-[var(--muted)]">Demo Mode:</span>
                   <button
                     onClick={() => setDemoMode(!demoMode)}
                     className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                       demoMode 
                         ? 'bg-[var(--positive)] text-white hover:bg-[var(--positive)]/90' 
                         : 'bg-[var(--muted)] text-[var(--text)] hover:bg-[var(--muted)]/80'
                     }`}
                   >
                     {demoMode ? 'ON' : 'OFF'}
                   </button>
                 </div>
               </div>
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
                     
                     <div className="flex items-center space-x-2">
                       <div className={`w-2 h-2 rounded-full ${getStatusColor(stage.status)}`}></div>
                       <span className="text-sm text-[var(--text)]">
                         {getStatusText(stage.status)}
                       </span>
                       {demoMode && (
                         <span className="text-xs bg-[var(--muted)] text-[var(--text)] px-2 py-1 rounded">
                           DEMO
                         </span>
                       )}
                     </div>
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
                      
                      {/* Audience Data */}
                      {stage.result.audience && (
                        <div className="mt-4">
                          <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2">Audience</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[var(--card)] p-3 rounded border border-[var(--border)]">
                              <div className="text-2xl font-bold text-[var(--brand)]">{formatNumber(stage.result.audience.size)}</div>
                              <div className="text-xs text-[var(--muted)]">Total Followers</div>
                            </div>
                            <div className="bg-[var(--card)] p-3 rounded border border-[var(--border)]">
                              <div className="text-2xl font-bold text-[var(--positive)]">{(stage.result.audience.engagementRate * 100).toFixed(1)}%</div>
                              <div className="text-xs text-[var(--muted)]">Engagement Rate</div>
                            </div>
                          </div>
                          
                          {stage.result.audience.topGeo.length > 0 && (
                            <div className="mt-3">
                              <div className="text-xs text-[var(--muted)] mb-1">Top Locations</div>
                              <div className="flex flex-wrap gap-1">
                                {stage.result.audience.topGeo.map((geo: string, index: number) => (
                                  <span key={index} className="bg-[var(--muted)] text-[var(--text)] px-2 py-1 rounded text-xs">
                                    {geo}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Sources */}
                      {stage.result.sources && stage.result.sources.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs text-[var(--muted)] mb-1">Data Sources</div>
                          <div className="flex flex-wrap gap-1">
                            {stage.result.sources.map((source: string, index: number) => (
                              <span key={index} className="bg-[var(--brand)] text-white px-2 py-1 rounded text-xs">
                                {source}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {stage.id === 'brand-identification' && stage.result.matches && (
                    <div>
                      <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2">Brand Matches</p>
                      <div className="grid gap-2">
                        {stage.result.matches.map((match: any, index: number) => (
                          <div key={index} className="bg-[var(--card)] p-3 rounded border border-[var(--border)]">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-[var(--text)] text-sm">{match.brand.name}</div>
                              <div className="text-xs bg-[var(--brand)] text-white px-2 py-1 rounded">
                                Score: {match.score}
                              </div>
                            </div>
                            {match.brand.industry && (
                              <div className="text-xs text-[var(--muted)] mb-2">
                                {match.brand.industry}
                              </div>
                            )}
                            <div className="space-y-1">
                              {match.reasons.map((reason: string, reasonIndex: number) => (
                                <div key={reasonIndex} className="text-sm text-[var(--muted)] flex items-start">
                                  <span className="text-[var(--brand)] mr-2">•</span>
                                  {reason}
                                </div>
                              ))}
                            </div>
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
                               <div className="flex flex-wrap gap-2">
                                 <a
                                   href={stage.result.url}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="inline-flex items-center text-[var(--brand)] hover:text-[var(--brand)]/80 text-sm font-medium transition-colors"
                                 >
                                   <span>📄 View HTML</span>
                                   <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                   </svg>
                                 </a>
                                 
                                 {stage.result.pdfUrl && (
                                   <a
                                     href={stage.result.pdfUrl}
                                     target="_blank"
                                     rel="noopener noreferrer"
                                     className="inline-flex items-center text-[var(--positive)] hover:text-[var(--positive)]/80 text-sm font-medium transition-colors"
                                   >
                                     <span>📥 Download PDF</span>
                                     <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                     </svg>
                                   </a>
                                 )}
                               </div>
                               
                               <div className="text-xs text-[var(--muted)]">{stage.result.summary}</div>
                               
                               {stage.result.mediaPackId && (
                                 <div className="text-xs text-[var(--muted)]">
                                   ID: {stage.result.mediaPackId}
                                 </div>
                               )}
                             </div>
                           </div>
                         )}
                  
                                           {stage.id === 'outreach' && stage.result.status && (
                           <div>
                             <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2">Outreach</p>
                             <div className="bg-[var(--card)] p-3 rounded border border-[var(--border)] space-y-2">
                               <div className="text-sm text-[var(--text)] font-medium">{stage.result.status}</div>
                               
                               {stage.result.sequenceId && (
                                 <div className="text-xs text-[var(--muted)]">
                                   Sequence ID: {stage.result.sequenceId}
                                 </div>
                               )}
                               
                               {stage.result.firstEmailSent !== undefined && (
                                 <div className="flex items-center space-x-2">
                                   <span className="text-xs text-[var(--muted)]">First Email:</span>
                                   <span className={`text-xs px-2 py-1 rounded ${
                                     stage.result.firstEmailSent 
                                       ? 'bg-[var(--positive)] text-white' 
                                       : 'bg-[var(--muted)] text-[var(--text)]'
                                   }`}>
                                     {stage.result.firstEmailSent ? 'Sent' : 'Paused'}
                                   </span>
                                 </div>
                               )}
                               
                               {stage.result.dealStatus && (
                                 <div className="flex items-center space-x-2">
                                   <span className="text-xs text-[var(--muted)]">Deal Status:</span>
                                   <span className="text-xs px-2 py-1 rounded bg-[var(--brand)] text-white">
                                     {stage.result.dealStatus}
                                   </span>
                                 </div>
                               )}
                               
                               <div className="text-xs text-[var(--muted)] mt-2">
                                 Next steps scheduled: D+3 (Proof), D+7 (Nudge)
                               </div>
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
