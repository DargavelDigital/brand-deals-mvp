'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';

interface DealAnalytics {
  overview: {
    totalDeals: number;
    wonDeals: number;
    lostDeals: number;
    counteredDeals: number;
    winRate: number;
  };
  financials: {
    avgOfferAmount: number;
    avgFinalAmount: number;
    avgUplift: number;
    avgUpliftPct: number;
    totalUplift: number;
  };
  categoryInsights: Record<string, {
    count: number;
    avgOffer: number;
    avgFinal: number;
    avgUpliftPct: number;
  }>;
}

export function DealsOverview() {
  const [analytics, setAnalytics] = useState<DealAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/deals/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch deal analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          No deal data available. Start logging deals to see insights.
        </div>
      </Card>
    );
  }

  const { overview, financials } = analytics;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Deals Overview</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Average Uplift % */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Uplift %</p>
              <p className="text-2xl font-bold text-green-600">
                +{financials.avgUpliftPct.toFixed(1)}%
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Average increase from offer to final
          </p>
        </Card>

        {/* Total Won Deals */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Won Deals</p>
              <p className="text-2xl font-bold text-blue-600">
                {overview.wonDeals}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {overview.totalDeals > 0 
              ? `${((overview.wonDeals / overview.totalDeals) * 100).toFixed(1)}% win rate`
              : 'No deals yet'
            }
          </p>
        </Card>

        {/* Lost Deals */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lost Deals</p>
              <p className="text-2xl font-bold text-red-600">
                {overview.lostDeals}
              </p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {overview.totalDeals > 0 
              ? `${((overview.lostDeals / overview.totalDeals) * 100).toFixed(1)}% loss rate`
              : 'No deals yet'
            }
          </p>
        </Card>

        {/* Average Final Value */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Final Value</p>
              <p className="text-2xl font-bold text-purple-600">
                ${financials.avgFinalAmount.toLocaleString()}
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Average closed deal value
          </p>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Total Deals</p>
            <p className="text-xl font-bold text-gray-900">{overview.totalDeals}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Total Uplift</p>
            <p className="text-xl font-bold text-green-600">
              +${financials.totalUplift.toLocaleString()}
            </p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Countered Deals</p>
            <p className="text-xl font-bold text-blue-600">{overview.counteredDeals}</p>
          </div>
        </Card>
      </div>

      {/* Category Insights */}
      {Object.keys(analytics.categoryInsights).length > 0 && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">Category Insights</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-4 font-medium">Category</th>
                  <th className="text-left py-2 px-4 font-medium">Deals</th>
                  <th className="text-left py-2 px-4 font-medium">Avg Offer</th>
                  <th className="text-left py-2 px-4 font-medium">Avg Final</th>
                  <th className="text-left py-2 px-4 font-medium">Avg Uplift %</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(analytics.categoryInsights).map(([category, stats]) => (
                  <tr key={category} className="border-b border-gray-100">
                    <td className="py-2 px-4 font-medium">{category}</td>
                    <td className="py-2 px-4">{stats.count}</td>
                    <td className="py-2 px-4">${stats.avgOffer.toLocaleString()}</td>
                    <td className="py-2 px-4">${stats.avgFinal.toLocaleString()}</td>
                    <td className="py-2 px-4">
                      <span className={`font-medium ${
                        stats.avgUpliftPct > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stats.avgUpliftPct > 0 ? '+' : ''}{stats.avgUpliftPct.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
