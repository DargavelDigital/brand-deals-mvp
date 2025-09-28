import { DealCalculator } from '@/components/deals/DealCalculator';
import { CounterOfferGenerator } from '@/components/deals/CounterOfferGenerator';
import { DealRedline } from '@/components/deals/DealRedline';
import { DealTracker } from '@/components/deals/DealTracker';
import { Card } from '@/components/ui/Card';
import { isToolEnabled } from '@/lib/launch';
import { ComingSoon } from '@/components/ComingSoon';
import PageShell from '@/components/PageShell';

export default function DealDeskPage() {
  const enabled = isToolEnabled("dealdesk")
  
  if (!enabled) {
    return (
      <PageShell title="Deal Desk & Pricing Assistant" subtitle="Get pricing intelligence, generate AI-powered counter-offers, and analyze contract terms to close deals faster and with confidence.">
        <div className="mx-auto max-w-md">
          <ComingSoon
            title="Deal Desk & Pricing Assistant"
            subtitle="This tool will be enabled soon. The page is visible so you can navigate and preview the UI."
          />
        </div>
      </PageShell>
    )
  }
  
  return (
    <PageShell title="Deal Desk & Pricing Assistant" subtitle="Get pricing intelligence, generate AI-powered counter-offers, and analyze contract terms to close deals faster and with confidence.">
      <div className="container-1200 space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DealCalculator />
        </div>
        
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Avg. Deal Value</span>
                <span className="font-medium">$2,450</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Negotiation Time</span>
                <span className="font-medium">3.2 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Close Rate</span>
                <span className="font-medium">78%</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Tips for Success</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Always calculate your minimum acceptable rate</li>
              <li>• Use data to justify your pricing</li>
              <li>• Consider offering additional value</li>
              <li>• Review contracts carefully before signing</li>
              <li>• Keep negotiations professional and collaborative</li>
            </ul>
          </Card>
        </div>
      </div>

      <div className="space-y-6">
        <DealTracker />
        
        <CounterOfferGenerator 
          audienceSize={10000}
          engagementRate={3.5}
          suggestedCpm={12}
          suggestedFlatFee={1200}
          category="Tech"
        />
        
        <DealRedline />
      </div>
      </div>
    </PageShell>
  );
}
