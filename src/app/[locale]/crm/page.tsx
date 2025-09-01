'use client'

import { useState, useCallback, useMemo } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import DealCard from "@/components/crm/DealCard";
import { DealCardSkeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { flags } from "@/config/flags";
import { useClientFlag } from "@/lib/clientFlags";
import { Badge } from "@/components/ui/Badge";
import { filterByTab, type Tab } from '@/lib/crm/filter';
import { useSearchParams } from "next/navigation";

const mockDeals = [
  {
    id: "1",
    name: "Acme Corp",
    logoUrl: undefined,
    status: "OPEN",
    value: 2400,
    stage: "Prospecting",
    nextStep: "Follow up on proposal",
    next: "2025-09-02T10:00:00Z",
    description: "Initial partnership discussion//NEXT: Follow up on proposal"
  },
  {
    id: "2", 
    name: "Globex Inc",
    logoUrl: undefined,
    status: "WON",
    value: 5600,
    stage: "Closed Won",
    nextStep: "Send thank you email",
    next: "2025-09-01T14:00:00Z",
    description: "Partnership finalized//NEXT: Send thank you email"
  },
  {
    id: "3",
    name: "Initech",
    logoUrl: undefined, 
    status: "COUNTERED",
    value: 3200,
    stage: "Negotiation",
    nextStep: "Schedule follow-up call",
    next: "2025-09-05T15:00:00Z",
    description: "Counter-offer received//NEXT: Schedule follow-up call"
  }
];

// Type for the deals we're actually using (with all required properties)
type DealWithDetails = {
  id: string;
  name: string;
  logoUrl?: string;
  status: string;
  value: number;
  stage: string;
  nextStep?: string;
  next?: string | null;
  description?: string;
};

export default function CRMPage() {
  const [deals, setDeals] = useState<DealWithDetails[]>(mockDeals);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [reminderFilter, setReminderFilter] = useState<Tab>('ALL');
  const [draggedDeal, setDraggedDeal] = useState<string | null>(null);

  // Read the public flag once at component level
  const crmLight = process.env.NEXT_PUBLIC_CRM_LIGHT_ENABLED === 'true';

  // Add debug hook to expose flag state for debugging
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__crmDebug = { 
      crmLight, 
      env: { 
        NODE_ENV: process.env.NODE_ENV, 
        NEXT_PUBLIC_CRM_LIGHT_ENABLED: process.env.NEXT_PUBLIC_CRM_LIGHT_ENABLED 
      } 
    };
  }

  // Capture a single "now" snapshot
  const nowIso = useMemo(() => new Date().toISOString(), []);

  // Replace the existing filteredDeals logic with the new helper
  const windowDays = 14;
  const filteredDeals = useMemo(
    () => filterByTab(deals, reminderFilter, nowIso, windowDays),
    [deals, reminderFilter, nowIso]
  );

  const handleMetadataUpdate = async (dealId: string, updates: { nextStep?: string; status?: string }) => {
    if (!crmLight) return;

    try {
      const response = await fetch(`/api/deals/${dealId}/meta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update local state
        setDeals(prev => prev.map(deal => {
          if (deal.id === dealId) {
            const updatedDeal = { ...deal };
            
            // Update status if provided
            if (updates.status !== undefined) {
              updatedDeal.status = updates.status;
            }
            
            // Update next step if provided
            if (updates.nextStep !== undefined) {
              updatedDeal.nextStep = updates.nextStep;
              // Also update description to maintain consistency
              const currentDesc = deal.description || '';
              const nextStepPattern = /\s*\/\/NEXT:.*$/;
              if (updates.nextStep.trim()) {
                updatedDeal.description = currentDesc.replace(nextStepPattern, '') + `//NEXT: ${updates.nextStep.trim()}`;
              } else {
                updatedDeal.description = currentDesc.replace(nextStepPattern, '');
              }
            }
            
            return updatedDeal;
          }
          return deal;
        }));
        
        setToast({ message: 'Deal updated successfully!', type: 'success' });
      } else {
        setToast({ message: 'Failed to update deal', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Error updating deal', type: 'error' });
    }
  };

  const handleNextStepUpdate = (dealId: string, nextStep: string) => {
    handleMetadataUpdate(dealId, { nextStep });
  };

  const handleStatusUpdate = (dealId: string, status: string) => {
    handleMetadataUpdate(dealId, { status });
  };

  const handleSetReminder = async (dealId: string, reminderTime: Date, note?: string) => {
    if (!flags['crm.reminders.enabled']) return;

    try {
      // Update local state by appending reminder to description
      setDeals(prev => prev.map(deal => {
        if (deal.id === dealId) {
          const currentDesc = deal.description || '';
          // Remove any existing reminder
          const descWithoutReminder = currentDesc.replace(/\s*\/\/REMIND:.*$/, '');
          const newDesc = descWithoutReminder + `//REMIND: ${reminderTime.toISOString()} | ${note || 'Reminder set'}`;
          
          return {
            ...deal,
            description: newDesc
          };
        }
        return deal;
      }));
      
      setToast({ message: 'Reminder set successfully!', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to set reminder', type: 'error' });
    }
  };

  // Drag and drop handlers
  const handleDragStart = useCallback((dealId: string) => {
    setDraggedDeal(dealId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(async (newStage: string) => {
    if (!draggedDeal) return;

    try {
      // Update the deal stage via API
      const response = await fetch(`/api/deals/${draggedDeal}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      });

      if (response.ok) {
        // Update local state
        setDeals(prev => prev.map(deal => 
          deal.id === draggedDeal 
            ? { ...deal, stage: newStage }
            : deal
        ));
        setToast({ message: 'Deal moved successfully!', type: 'success' });
      } else {
        setToast({ message: 'Failed to move deal', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Error moving deal', type: 'error' });
    } finally {
      setDraggedDeal(null);
    }
  }, [draggedDeal]);

  // Helper functions for column calculations using filtered deals
  const getDealsForStage = useCallback((stage: string) => {
    return filteredDeals.filter(deal => deal.stage === stage);
  }, [filteredDeals]);

  const getColumnStats = useCallback((stage: string) => {
    const stageDeals = getDealsForStage(stage);
    const count = stageDeals.length;
    const totalValue = stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    return { count, totalValue };
  }, [getDealsForStage]);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="CRM Pipeline" 
        subtitle="Track deals and manage your sales pipeline"
      />
      
      {/* Debug View */}
      {(() => {
        const search = useSearchParams();
        const showDebug = search?.get('debug') === '1';
        const isLight = useClientFlag('crm.light.enabled', false);
        
        return showDebug && (
          <pre className="text-xs mt-2 p-2 rounded border border-[var(--border)] bg-[var(--card)] overflow-x-auto">
            {JSON.stringify({
              env: {
                NEXT_PUBLIC_CRM_LIGHT_ENABLED: process.env.NEXT_PUBLIC_CRM_LIGHT_ENABLED ?? null,
                NODE_ENV: process.env.NODE_ENV
              },
              client: { crmLight: isLight }
            }, null, 2)}
          </pre>
        );
      })()}
      
      {/* Development Flag Chip */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mt-1 text-xs text-[var(--muted-fg)]">
          Flags → crm.light.enabled: {String(useClientFlag('crm.light.enabled', false))}
        </div>
      )}
      
      {/* Reminder Filter */}
      {flags['crm.reminders.enabled'] && (
        <div className="flex items-center gap-2">
          <Button
            variant={reminderFilter === 'ALL' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setReminderFilter('ALL')}
          >
            All
          </Button>
          <Button
            variant={reminderFilter === 'UPCOMING' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setReminderFilter('UPCOMING')}
          >
            Upcoming
          </Button>
          <Button
            variant={reminderFilter === 'DUE' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setReminderFilter('DUE')}
          >
            Due
          </Button>
        </div>
      )}
      
      {/* Debug Information */}
      {process.env.NEXT_PUBLIC_CRM_DEBUG === '1' && (
        <pre className="mt-2 text-xs text-[var(--muted-fg)]">
          {JSON.stringify({
            tab: reminderFilter,
            total: deals.length,
            filtered: filteredDeals.length,
            nowIso,
            sample: filteredDeals.slice(0,3).map(d => ({ id: d.id, stage: d.stage, next: d.next }))
          }, null, 2)}
        </pre>
      )}
      
      <div className="container-page">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Pipeline columns */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--fg)]">Prospecting</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {getColumnStats('Prospecting').count} deals
                </Badge>
                {getColumnStats('Prospecting').totalValue > 0 && (
                  <Badge variant="secondary" className="text-xs text-green-600">
                    ${getColumnStats('Prospecting').totalValue.toLocaleString()}
                  </Badge>
                )}
              </div>
            </div>
            <Card 
              className="p-4 border border-[var(--border)] rounded-lg shadow-sm min-h-[200px]"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop('Prospecting')}
            >
              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <DealCardSkeleton key={index} />
                  ))
                ) : getDealsForStage('Prospecting').map(deal => (
                  <div key={deal.id}>
                    <DealCard 
                      compact={crmLight}
                      deal={deal} 
                      onNextStepUpdate={handleNextStepUpdate}
                      onStatusUpdate={handleStatusUpdate}
                      onSetReminder={handleSetReminder}
                      onDragStart={handleDragStart}
                      isDragging={draggedDeal === deal.id}
                    />
                    {!deal.next && (
                      <span className="ml-2 text-xs text-muted border border-token rounded px-1.5 py-0.5">No next step</span>
                    )}
                  </div>
                ))}
                {!loading && getDealsForStage('Prospecting').length === 0 && (
                  <div className="text-sm text-[var(--muted-fg)] p-6">
                    No deals in this view.
                  </div>
                )}
              </div>
            </Card>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--fg)]">Negotiation</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {getColumnStats('Negotiation').count} deals
                </Badge>
                {getColumnStats('Negotiation').totalValue > 0 && (
                  <Badge variant="secondary" className="text-xs text-green-600">
                    ${getColumnStats('Negotiation').totalValue.toLocaleString()}
                  </Badge>
                )}
              </div>
            </div>
            <Card 
              className="p-4 border border-[var(--border)] rounded-lg shadow-sm min-h-[200px]"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop('Negotiation')}
            >
              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <DealCardSkeleton key={index} />
                  ))
                ) : getDealsForStage('Negotiation').map(deal => (
                  <div key={deal.id}>
                    <DealCard 
                      compact={crmLight}
                      deal={deal} 
                      onNextStepUpdate={handleNextStepUpdate}
                      onStatusUpdate={handleStatusUpdate}
                      onSetReminder={handleSetReminder}
                      onDragStart={handleDragStart}
                      isDragging={draggedDeal === deal.id}
                    />
                    {!deal.next && (
                      <span className="ml-2 text-xs text-muted border border-token rounded px-1.5 py-0.5">No next step</span>
                    )}
                  </div>
                ))}
                {!loading && getDealsForStage('Negotiation').length === 0 && (
                  <div className="text-sm text-[var(--muted-fg)] p-6">
                    No deals in this view.
                  </div>
                )}
              </div>
            </Card>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--fg)]">Closed Won</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {getColumnStats('Closed Won').count} deals
                </Badge>
                {getColumnStats('Closed Won').totalValue > 0 && (
                  <Badge variant="secondary" className="text-xs text-green-600">
                    ${getColumnStats('Closed Won').totalValue.toLocaleString()}
                </Badge>
                )}
              </div>
            </div>
            <Card 
              className="p-4 border border-[var(--border)] rounded-lg shadow-sm min-h-[200px]"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop('Closed Won')}
            >
              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <DealCardSkeleton key={index} />
                  ))
                ) : getDealsForStage('Closed Won').map(deal => (
                  <div key={deal.id}>
                    <DealCard 
                      compact={crmLight}
                      deal={deal} 
                      onNextStepUpdate={handleNextStepUpdate}
                      onStatusUpdate={handleStatusUpdate}
                      onSetReminder={handleSetReminder}
                      onDragStart={handleDragStart}
                      isDragging={draggedDeal === deal.id}
                    />
                    {!deal.next && (
                      <span className="ml-2 text-xs text-muted border border-token rounded px-1.5 py-0.5">No next step</span>
                    )}
                  </div>
                ))}
                {!loading && getDealsForStage('Closed Won').length === 0 && (
                  <div className="text-sm text-[var(--muted-fg)] p-6">
                    No deals in this view.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
