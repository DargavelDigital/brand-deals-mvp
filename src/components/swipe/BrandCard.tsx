import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export interface BrandInfo {
  id: string | number;
  name: string;
  logoUrl?: string;
  reasons?: string[]; // match reasons / tags
}

function BrandCardBase({ brand }: { brand: BrandInfo }) {
  const { name, logoUrl, reasons = [] } = brand || {};
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-8 w-8 rounded-md border border-[var(--border)] bg-white overflow-hidden flex items-center justify-center">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={`${name} logo`} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-[var(--muted)]">•</span>
          )}
        </div>
        <div className="font-medium">{name}</div>
      </div>

      <ul className="text-sm text-[var(--muted)] space-y-1">
        {reasons.length
          ? reasons.slice(0, 3).map((r, i) => <li key={i}>• {r}</li>)
          : <li>No match details available.</li>}
      </ul>

      <div className="mt-4 flex items-center gap-3">
        <Button>Shortlist</Button>
        <Button variant="secondary">Skip</Button>
        <Button variant="ghost">Details</Button>
      </div>
    </Card>
  );
}

// Named + default export so imports like
//   import BrandCard from "..."
// or
//   import { BrandCard } from "..."
// both work.
export const BrandCard = BrandCardBase;
export default BrandCardBase;
