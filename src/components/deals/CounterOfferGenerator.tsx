'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface CounterOfferResult {
  counterAmount: number;
  reasoning: string;
  draftEmail: string;
  negotiationTips: string[];
}

interface CounterOfferGeneratorProps {
  audienceSize: number;
  engagementRate: number;
  suggestedCpm: number;
  suggestedFlatFee: number;
  category?: string;
}

const TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'relaxed', label: 'Relaxed & Friendly' },
  { value: 'fun', label: 'Fun & Energetic' },
];

export function CounterOfferGenerator({ 
  audienceSize, 
  engagementRate, 
  suggestedCpm, 
  suggestedFlatFee,
  category
}: CounterOfferGeneratorProps) {
  const [brandOffer, setBrandOffer] = useState({
    amount: 0,
    deliverables: '',
    format: '',
    timeline: '',
  });
  const [tone, setTone] = useState('professional');
  const [additionalValue, setAdditionalValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<CounterOfferResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historicalContext, setHistoricalContext] = useState<any>(null);

  useEffect(() => {
    if (category) {
      fetchHistoricalContext();
    }
  }, [category]);

  const fetchHistoricalContext = async () => {
    try {
      const response = await fetch('/api/deals/analytics');
      if (response.ok) {
        const data = await response.json();
        if (data.categoryInsights && data.categoryInsights[category]) {
          setHistoricalContext(data.categoryInsights[category]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch historical context:', error);
    }
  };

  const generateCounterOffer = async () => {
    if (!brandOffer.amount || !brandOffer.deliverables) {
      setError('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const payload: any = {
        brandOffer,
        creatorMetrics: {
          audienceSize,
          engagementRate,
          cpm: suggestedCpm,
        },
        minCpm: suggestedCpm * 0.8, // Allow 20% flexibility below suggested
        floorFee: suggestedFlatFee * 0.7, // Allow 30% flexibility below suggested
        tone,
        additionalValue: additionalValue || undefined,
      };

      // Add historical context if available
      if (historicalContext && category) {
        payload.historicalContext = {
          category,
          avgOffer: historicalContext.avgOffer,
          avgFinal: historicalContext.avgFinal,
          avgUpliftPct: historicalContext.avgUpliftPct,
        };
      }

      const response = await fetch('/api/deals/counter-offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate counter-offer');
      }

      const counterOffer = await response.json();
      setResult(counterOffer);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Generate Counter-Offer</h3>
        <p className="text-gray-600">
          Create a professional counter-offer email using AI assistance.
        </p>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="brand-amount" className="block text-sm font-medium mb-2">
              Brand's Offer Amount ($)
            </label>
            <Input
              id="brand-amount"
              type="number"
              value={brandOffer.amount}
              onChange={(e) => setBrandOffer(prev => ({ ...prev, amount: Number(e.target.value) }))}
              placeholder="500"
              min="0"
            />
          </div>

          <div>
            <label htmlFor="deliverables" className="block text-sm font-medium mb-2">
              Deliverables *
            </label>
            <Input
              id="deliverables"
              value={brandOffer.deliverables}
              onChange={(e) => setBrandOffer(prev => ({ ...prev, deliverables: e.target.value }))}
              placeholder="One Instagram post and two stories"
            />
          </div>

          <div>
            <label htmlFor="format" className="block text-sm font-medium mb-2">
              Content Format
            </label>
            <Input
              id="format"
              value={brandOffer.format}
              onChange={(e) => setBrandOffer(prev => ({ ...prev, format: e.target.value }))}
              placeholder="Instagram post + stories"
            />
          </div>

          <div>
            <label htmlFor="timeline" className="block text-sm font-medium mb-2">
              Timeline
            </label>
            <Input
              id="timeline"
              value={brandOffer.timeline}
              onChange={(e) => setBrandOffer(prev => ({ ...prev, timeline: e.target.value }))}
              placeholder="Within 2 weeks"
            />
          </div>

          <div>
            <label htmlFor="tone" className="block text-sm font-medium mb-2">
              Email Tone
            </label>
            <Select
              id="tone"
              value={tone}
              onValueChange={setTone}
            >
              {TONES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="additional-value" className="block text-sm font-medium mb-2">
              Additional Value
            </label>
            <Input
              id="additional-value"
              value={additionalValue}
              onChange={(e) => setAdditionalValue(e.target.value)}
              placeholder="30-day exclusivity, extended timeline"
            />
          </div>
        </div>

        {historicalContext && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>💡 Historical Context Available:</strong> 
              {category} category shows {historicalContext.avgUpliftPct.toFixed(1)}% average uplift 
              (${historicalContext.avgOffer.toLocaleString()} → ${historicalContext.avgFinal.toLocaleString()})
            </div>
          </div>
        )}

        <div className="mt-6">
          <Button
            onClick={generateCounterOffer}
            disabled={isGenerating}
            className="w-full md:w-auto"
          >
            {isGenerating ? 'Generating...' : 'Generate Counter-Offer'}
          </Button>
        </div>
      </Card>

      {error && (
        <div className="text-[var(--error)] text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-semibold">Suggested Counter: ${result.counterAmount}</h4>
                <p className="text-gray-600 text-sm">{result.reasoning}</p>
              </div>
              <Button
                onClick={() => copyToClipboard(result.draftEmail)}
                variant="outline"
                size="sm"
              >
                Copy Email
              </Button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium mb-2">Draft Email:</h5>
              <div className="whitespace-pre-wrap text-sm text-gray-700">
                {result.draftEmail}
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h5 className="font-medium mb-3">Negotiation Tips:</h5>
            <ul className="space-y-2">
              {result.negotiationTips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span className="text-sm text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
