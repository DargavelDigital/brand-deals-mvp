'use client'

import { useState, useCallback } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import DealCard from "@/components/crm/DealCard";
import { Toast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { flags } from "@/config/flags";
import { Badge } from "@/components/ui/Badge";

const mockDeals = [
  {
    id: "1",
    name: "Acme Corp",
    logoUrl: "/api/placeholder/32/32",
    status: "OPEN",
    value: 2400,
    stage: "Prospecting",
    nextStep: "Follow up on proposal",
    description: "Initial partnership discussion//NEXT: Follow up on proposal"
  },
  {
    id: "2", 
    name: "Globex Inc",
    logoUrl: "/api/placeholder/32/32",
    status: "WON",
    value: 5600,
    stage: "Closed Won",
    nextStep: "Send thank you email",
    description: "Partnership finalized//NEXT: Send thank you email"
  },
  {
    id: "3",
    name: "Initech",
    logoUrl: "/api/placeholder/32/32", 
    status: "COUNTERED",
    value: 3200,
    stage: "Negotiation",
    nextStep: "Schedule follow-up call",
    description: "Counter-offer received//NEXT: Schedule follow-up call"
  }
];

export default function CRMPage() {
  const [deals, setDeals] = useState(mockDeals);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [reminderFilter, setReminderFilter] = useState<'ALL' | 'UPCOMING' | 'DUE'>('ALL');
  const [draggedDeal, setDraggedDeal] = useState<string | null>(null);

  const handleMetadataUpdate = async (dealId: string, updates: { nextStep?: string; status?: string }) => {
    if (!flags['crm.light.enabled']) return;

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

  // Helper functions for column calculations
  const getDealsForStage = useCallback((stage: string) => {
    return deals.filter(deal => deal.stage === stage);
  }, [deals]);

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
                  <Badge variant="outline" className="text-xs text-green-600">
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
                {getDealsForStage('Prospecting')
                  .filter(deal => {
                    if (reminderFilter === 'ALL') return true;
                    if (reminderFilter === 'DUE') {
                      const reminderMatch = deal.description?.match(/\/\/REMIND: (.+?) \| (.+)$/);
                      const reminderTime = reminderMatch ? new Date(reminderMatch[1]) : null;
                      return reminderTime && reminderTime <= new Date();
                    }
                    if (reminderFilter === 'UPCOMING') {
                      const reminderMatch = deal.description?.match(/\/\/REMIND: (.+?) \| (.+)$/);
                      const reminderTime = reminderMatch ? new Date(reminderMatch[1]) : null;
                      return reminderTime && reminderTime > new Date();
                    }
                    return true;
                  })
                  .map(deal => (
                    <DealCard 
                      key={deal.id} 
                      deal={deal} 
                      onNextStepUpdate={handleNextStepUpdate}
                      onStatusUpdate={handleStatusUpdate}
                      onSetReminder={handleSetReminder}
                      onDragStart={handleDragStart}
                      isDragging={draggedDeal === deal.id}
                    />
                  ))}
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
                  <Badge variant="outline" className="text-xs text-green-600">
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
                {getDealsForStage('Negotiation')
                  .filter(deal => {
                    if (reminderFilter === 'ALL') return true;
                    if (reminderFilter === 'DUE') {
                      const reminderMatch = deal.description?.match(/\/\/REMIND: (.+?) \| (.+)$/);
                      const reminderTime = reminderMatch ? new Date(reminderMatch[1]) : null;
                      return reminderTime && reminderTime <= new Date();
                    }
                    if (reminderFilter === 'UPCOMING') {
                      const reminderMatch = deal.description?.match(/\/\/REMIND: (.+?) \| (.+)$/);
                      const reminderTime = reminderMatch ? new Date(reminderMatch[1]) : null;
                      return reminderTime && reminderTime > new Date();
                    }
                    return true;
                  })
                  .map(deal => (
                    <DealCard 
                      key={deal.id} 
                      deal={deal} 
                      onNextStepUpdate={handleNextStepUpdate}
                      onStatusUpdate={handleStatusUpdate}
                      onSetReminder={handleSetReminder}
                      onDragStart={handleDragStart}
                      isDragging={draggedDeal === deal.id}
                    />
                  ))}
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
                  <Badge variant="outline" className="text-xs text-green-600">
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
                {getDealsForStage('Closed Won')
                  .filter(deal => {
                    if (reminderFilter === 'ALL') return true;
                    if (reminderFilter === 'DUE') {
                      const reminderMatch = deal.description?.match(/\/\/REMIND: (.+?) \| (.+)$/);
                      const reminderTime = reminderMatch ? new Date(reminderMatch[1]) : null;
                      return reminderTime && reminderTime <= new Date();
                    }
                    if (reminderFilter === 'UPCOMING') {
                      const reminderMatch = deal.description?.match(/\/\/REMIND: (.+?) \| (.+)$/);
                      const reminderTime = reminderMatch ? new Date(reminderMatch[1]) : null;
                      return reminderTime && reminderTime > new Date();
                    }
                    return true;
                  })
                  .map(deal => (
                    <DealCard 
                      key={deal.id} 
                      deal={deal} 
                      onNextStepUpdate={handleNextStepUpdate}
                      onStatusUpdate={handleStatusUpdate}
                      onSetReminder={handleSetReminder}
                      onDragStart={handleDragStart}
                      isDragging={draggedDeal === deal.id}
                    />
                  ))}
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
