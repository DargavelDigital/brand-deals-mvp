'use client';

import { Section } from "@/components/ui/Section";
import RunProgress from "@/components/run/RunProgress";
import RunRail from "@/components/run/RunRail";

export default function BrandRunPage() {
  return (
    <Section title="Brand Run" description="Audit → Matches → Pack → Contacts → Outreach">
      <div className="space-y-8">
        {/* Main content area */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main content - takes 2 columns */}
          <div className="md:col-span-2 space-y-6">
            <RunProgress current={2} total={7} label="Brand Run Progress" />
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Current Step: Brand Matches</h3>
              <p className="text-[var(--muted)]">
                Review and approve the AI-generated brand matches for your content.
              </p>
            </div>
          </div>
          
          {/* Side panel - takes 1 column */}
          <div className="space-y-6">
            <RunRail 
              title="Run Status"
              items={[
                { label: "Step", value: "2 of 7" },
                { label: "Brands Selected", value: "3" },
                { label: "Credits Used", value: "45" }
              ]}
              onContinue={() => console.log("Continue to next step")}
            />
            
            <RunRail 
              title="Quick Actions"
              items={[
                { label: "Pause Run", value: "Available" },
                { label: "Save Progress", value: "Auto-saved" }
              ]}
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
