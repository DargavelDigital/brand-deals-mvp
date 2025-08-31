'use client'

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import DealCard from "@/components/crm/DealCard";
import { Toast } from "@/components/ui/Toast";
import { flags } from "@/config/flags";

const mockDeals = [
  {
    id: "1",
    name: "Acme Corp",
    logoUrl: "/api/placeholder/32/32",
    status: "pending",
    value: "$2,400",
    stage: "Proposal",
    nextStep: "Follow up on proposal"
  },
  {
    id: "2", 
    name: "Globex Inc",
    logoUrl: "/api/placeholder/32/32",
    status: "won",
    value: "$5,600",
    stage: "Closed Won",
    nextStep: "Send thank you email"
  },
  {
    id: "3",
    name: "Initech",
    logoUrl: "/api/placeholder/32/32", 
    status: "pending",
    value: "$3,200",
    stage: "Negotiation",
    nextStep: "Schedule follow-up call"
  }
];

export default function CRMPage() {
  const [deals, setDeals] = useState(mockDeals);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleNextStepUpdate = async (dealId: string, nextStep: string) => {
    if (!flags['crm.light.enabled']) return;

    try {
      const response = await fetch(`/api/deals/${dealId}/next-step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nextStep })
      });

      if (response.ok) {
        // Update local state
        setDeals(prev => prev.map(deal => 
          deal.id === dealId ? { ...deal, nextStep } : deal
        ));
        setToast({ message: 'Next step updated!', type: 'success' });
      } else {
        setToast({ message: 'Failed to update next step', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Error updating next step', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="CRM Pipeline" 
        subtitle="Track deals and manage your sales pipeline"
      />
      
      <div className="container-page">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Pipeline columns */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--fg)]">Prospecting</h3>
            <Card className="p-4 border border-[var(--border)] rounded-lg shadow-sm">
              <div className="space-y-3">
                {deals.filter(d => d.stage === "Proposal").map(deal => (
                  <DealCard key={deal.id} deal={deal} onNextStepUpdate={handleNextStepUpdate} />
                ))}
              </div>
            </Card>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--fg)]">Negotiation</h3>
            <Card className="p-4 border border-[var(--border)] rounded-lg shadow-sm">
              <div className="space-y-3">
                {deals.filter(d => d.stage === "Negotiation").map(deal => (
                  <DealCard key={deal.id} deal={deal} onNextStepUpdate={handleNextStepUpdate} />
                ))}
              </div>
            </Card>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--fg)]">Closed Won</h3>
            <Card className="p-4 border border-[var(--border)] rounded-lg shadow-sm">
              <div className="space-y-3">
                {deals.filter(d => d.stage === "Closed Won").map(deal => (
                  <DealCard key={deal.id} deal={deal} onNextStepUpdate={handleNextStepUpdate} />
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
