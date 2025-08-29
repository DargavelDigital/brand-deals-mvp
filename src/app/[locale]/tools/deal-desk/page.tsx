import { DealCalculator } from '@/components/deals/DealCalculator';
import { CounterOfferGenerator } from '@/components/deals/CounterOfferGenerator';
import { DealRedline } from '@/components/deals/DealRedline';
import { Card } from '@/components/ui/Card';

export default function DealDeskPage() {
  return (
    <div className="container-1200 space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Deal Desk & Pricing Assistant</h1>
        <p className="text-gray-600 text-lg">
          Get pricing intelligence, generate AI-powered counter-offers, and analyze contract terms to close deals faster and with confidence.
        </p>
      </div>

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
        <CounterOfferGenerator 
          audienceSize={10000}
          engagementRate={3.5}
          suggestedCpm={12}
          suggestedFlatFee={1200}
        />
        
        <DealRedline />
      </div>
    </div>
  );
}
