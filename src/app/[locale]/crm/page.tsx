'use client'

import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import DealCard from "@/components/crm/DealCard";

const mockDeals = [
  {
    id: "1",
    name: "Acme Corp",
    logoUrl: "/api/placeholder/32/32",
    status: "pending",
    value: "$2,400",
    stage: "Proposal"
  },
  {
    id: "2", 
    name: "Globex Inc",
    logoUrl: "/api/placeholder/32/32",
    status: "won",
    value: "$5,600",
    stage: "Closed Won"
  },
  {
    id: "3",
    name: "Initech",
    logoUrl: "/api/placeholder/32/32", 
    status: "pending",
    value: "$3,200",
    stage: "Negotiation"
  }
];

export default function CRMPage() {
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
                {mockDeals.filter(d => d.stage === "Proposal").map(deal => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
            </Card>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--fg)]">Negotiation</h3>
            <Card className="p-4 border border-[var(--border)] rounded-lg shadow-sm">
              <div className="space-y-3">
                {mockDeals.filter(d => d.stage === "Negotiation").map(deal => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
            </Card>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--fg)]">Closed Won</h3>
            <Card className="p-4 border border-[var(--border)] rounded-lg shadow-sm">
              <div className="space-y-3">
                {mockDeals.filter(d => d.stage === "Closed Won").map(deal => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
