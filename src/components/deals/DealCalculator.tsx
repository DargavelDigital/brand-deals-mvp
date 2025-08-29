'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface DealCalculation {
  cpmLow: number;
  cpmHigh: number;
  cpaEstimate: number;
  flatFeeRange: [number, number];
}

interface DealCalculatorProps {
  defaultAudienceSize?: number;
  defaultEngagementRate?: number;
}

const INDUSTRIES = [
  { value: 'beauty', label: 'Beauty & Cosmetics' },
  { value: 'fashion', label: 'Fashion & Apparel' },
  { value: 'gaming', label: 'Gaming & Entertainment' },
  { value: 'tech', label: 'Technology' },
  { value: 'fitness', label: 'Fitness & Health' },
  { value: 'food', label: 'Food & Beverage' },
  { value: 'travel', label: 'Travel & Tourism' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'education', label: 'Education' },
  { value: 'entertainment', label: 'Entertainment' },
];

const REGIONS = [
  { value: 'north-america', label: 'North America' },
  { value: 'europe', label: 'Europe' },
  { value: 'asia-pacific', label: 'Asia Pacific' },
  { value: 'latin-america', label: 'Latin America' },
  { value: 'africa', label: 'Africa' },
];

export function DealCalculator({ defaultAudienceSize, defaultEngagementRate }: DealCalculatorProps) {
  const [audienceSize, setAudienceSize] = useState(defaultAudienceSize || 10000);
  const [engagementRate, setEngagementRate] = useState(defaultEngagementRate || 3.5);
  const [industry, setIndustry] = useState('tech');
  const [region, setRegion] = useState('north-america');
  const [calculation, setCalculation] = useState<DealCalculation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateDeal = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/deals/calc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audienceSize,
          engagementRate,
          industry,
          region,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate deal pricing');
      }

      const result = await response.json();
      setCalculation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (defaultAudienceSize && defaultEngagementRate) {
      calculateDeal();
    }
  }, [defaultAudienceSize, defaultEngagementRate]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Deal Pricing Calculator</h2>
        <p className="text-gray-600">
          Get instant pricing recommendations based on your audience metrics and industry.
        </p>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="audience-size" className="block text-sm font-medium mb-2">
              Audience Size
            </label>
            <Input
              id="audience-size"
              type="number"
              value={audienceSize}
              onChange={(e) => setAudienceSize(Number(e.target.value))}
              placeholder="10000"
              min="1"
            />
          </div>

          <div>
            <label htmlFor="engagement-rate" className="block text-sm font-medium mb-2">
              Engagement Rate (%)
            </label>
            <Input
              id="engagement-rate"
              type="number"
              value={engagementRate}
              onChange={(e) => setEngagementRate(Number(e.target.value))}
              placeholder="3.5"
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium mb-2">
              Industry
            </label>
            <Select
              id="industry"
              value={industry}
              onValueChange={setIndustry}
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind.value} value={ind.value}>
                  {ind.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="region" className="block text-sm font-medium mb-2">
              Region
            </label>
            <Select
              id="region"
              value={region}
              onValueChange={setRegion}
            >
              {REGIONS.map((reg) => (
                <option key={reg.value} value={reg.value}>
                  {reg.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-6">
          <Button
            onClick={calculateDeal}
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? 'Calculating...' : 'Calculate Pricing'}
          </Button>
        </div>
      </Card>

      {error && (
        <div className="text-[var(--error)] text-sm">
          {error}
        </div>
      )}

      {calculation && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <h3 className="font-semibold text-gray-700 mb-2">Suggested CPM</h3>
            <div className="text-2xl font-bold text-blue-600">
              ${calculation.cpmLow} - ${calculation.cpmHigh}
            </div>
            <p className="text-sm text-gray-500 mt-1">per 1,000 impressions</p>
          </Card>

          <Card className="p-4 text-center">
            <h3 className="font-semibold text-gray-700 mb-2">CPA Estimate</h3>
            <div className="text-2xl font-bold text-green-600">
              ${calculation.cpaEstimate}
            </div>
            <p className="text-sm text-gray-500 mt-1">per action</p>
          </Card>

          <Card className="p-4 text-center">
            <h3 className="font-semibold text-gray-700 mb-2">Flat Fee Range</h3>
            <div className="text-2xl font-bold text-purple-600">
              ${calculation.flatFeeRange[0]} - ${calculation.flatFeeRange[1]}
            </div>
            <p className="text-sm text-gray-500 mt-1">one-time payment</p>
          </Card>
        </div>
      )}
    </div>
  );
}
