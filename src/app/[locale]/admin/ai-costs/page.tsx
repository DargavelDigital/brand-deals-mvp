'use client';

import { useState, useEffect } from 'react';
import { formatCost } from '@/lib/ai-costs';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

interface CostData {
  summary: {
    totalCost: number;
    totalTokens: number;
    totalRequests: number;
  };
  byWorkspace: Array<{
    workspaceId: string;
    workspaceName: string;
    cost: number;
    tokens: number;
    requests: number;
  }>;
  byProvider: Record<string, { cost: number; tokens: number; requests: number }>;
  byFeature: Record<string, { cost: number; tokens: number; requests: number }>;
}

export default function AICostsPage() {
  const [data, setData] = useState<CostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all'); // 'today', 'week', 'month', 'all'
  
  useEffect(() => {
    loadData();
  }, [timeRange]);
  
  const loadData = async () => {
    setLoading(true);
    
    let url = '/api/admin/ai-costs';
    const params = new URLSearchParams();
    
    const now = new Date();
    if (timeRange === 'today') {
      const start = new Date(now.setHours(0, 0, 0, 0));
      params.set('startDate', start.toISOString());
    } else if (timeRange === 'week') {
      const start = new Date(now.setDate(now.getDate() - 7));
      params.set('startDate', start.toISOString());
    } else if (timeRange === 'month') {
      const start = new Date(now.setDate(now.getDate() - 30));
      params.set('startDate', start.toISOString());
    }
    
    if (params.toString()) {
      url += '?' + params.toString();
    }
    
    try {
      const res = await fetch(url);
      
      // Check if response is ok
      if (!res.ok) {
        console.error('API error:', res.status);
        setData(null);
        setLoading(false);
        return;
      }
      
      const json = await res.json();
      
      // Check if data has expected structure
      if (!json || !json.summary) {
        console.error('Invalid data structure:', json);
        setData(null);
        setLoading(false);
        return;
      }
      
      setData(json);
    } catch (error) {
      console.error('Failed to load AI costs:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="p-8">
        <div className="border rounded-lg p-8 text-center max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-2">Unable to Load AI Costs</h2>
          <p className="text-gray-600 mb-4">
            There was an error loading the AI cost data. This might be because:
          </p>
          <ul className="text-left max-w-md mx-auto space-y-2 mb-6 text-sm text-gray-600">
            <li>• The database table hasn&apos;t been created yet</li>
            <li>• Column names in the database don&apos;t match the schema</li>
            <li>• No AI usage has been tracked yet</li>
            <li>• There&apos;s a database connection issue</li>
          </ul>
          <button
            onClick={loadData}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left text-sm">
            <p className="font-medium mb-2">Check the database:</p>
            <code className="text-xs bg-white px-2 py-1 rounded block mb-2">
              SELECT * FROM ai_usage_logs LIMIT 1;
            </code>
            <p className="text-xs text-gray-500 mt-2">
              If the table doesn&apos;t exist or columns are wrong, see CREATE_AI_USAGE_TABLE.sql
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Calculate profit (example: $29/month per workspace)
  const MONTHLY_SUBSCRIPTION = 29;
  const monthlyRevenue = data.byWorkspace.length * MONTHLY_SUBSCRIPTION;
  const monthlyCosts = data.summary.totalCost;
  const monthlyProfit = monthlyRevenue - monthlyCosts;
  const profitMargin = monthlyRevenue > 0 ? ((monthlyProfit / monthlyRevenue) * 100).toFixed(1) : '0';
  
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">💰 AI Cost Tracking</h1>
          <p className="text-gray-600 mt-1">
            Monitor AI usage and costs across all workspaces
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex gap-2">
          {['today', 'week', 'month', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                timeRange === range
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">
            Total AI Cost
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {formatCost(data.summary.totalCost)}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {data.summary.totalRequests.toLocaleString()} requests
          </p>
        </Card>
        
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">
            Total Tokens
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {(data.summary.totalTokens / 1000000).toFixed(2)}M
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Across all models
          </p>
        </Card>
        
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">
            Active Workspaces
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {data.byWorkspace.length}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Using AI features
          </p>
        </Card>
        
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">
            Avg Cost/Workspace
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {data.byWorkspace.length > 0 
              ? formatCost(data.summary.totalCost / data.byWorkspace.length)
              : '$0.00'}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Per workspace
          </p>
        </Card>
      </div>
      
      {/* Profit Analysis */}
      {timeRange === 'month' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">💵 Profit Analysis (Est.)</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-gray-600">Revenue (est.)</div>
              <div className="text-2xl font-bold text-green-600">
                ${monthlyRevenue.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {data.byWorkspace.length} × ${MONTHLY_SUBSCRIPTION}/mo
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">AI Costs</div>
              <div className="text-2xl font-bold text-red-600">
                ${monthlyCosts.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Total AI spending
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Profit</div>
              <div className="text-2xl font-bold text-blue-600">
                ${monthlyProfit.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Revenue - AI costs
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Profit Margin</div>
              <div className="text-2xl font-bold text-purple-600">
                {profitMargin}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                After AI costs
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {/* Cost by Provider */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Cost by AI Provider</h2>
        <div className="space-y-4">
          {Object.entries(data.byProvider).length > 0 ? (
            Object.entries(data.byProvider).map(([provider, stats]) => (
              <div key={provider} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium capitalize text-gray-900">{provider}</div>
                  <div className="text-sm text-gray-600">
                    {stats.requests.toLocaleString()} requests • {(stats.tokens / 1000).toFixed(0)}K tokens
                  </div>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {formatCost(stats.cost)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              No AI usage yet
            </div>
          )}
        </div>
      </Card>
      
      {/* Cost by Feature */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Cost by Feature</h2>
        <div className="space-y-4">
          {Object.entries(data.byFeature).length > 0 ? (
            Object.entries(data.byFeature)
              .sort(([, a], [, b]) => b.cost - a.cost)
              .map(([feature, stats]) => (
                <div key={feature} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{feature.replace(/_/g, ' ')}</div>
                    <div className="text-sm text-gray-600">
                      {stats.requests.toLocaleString()} requests • {(stats.tokens / 1000).toFixed(0)}K tokens
                    </div>
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatCost(stats.cost)}
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              No AI usage yet
            </div>
          )}
        </div>
      </Card>
      
      {/* Cost by Workspace */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Cost by Workspace</h2>
        {data.byWorkspace.length > 0 ? (
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-4 pb-2 border-b font-medium text-sm text-gray-600">
              <div>Workspace</div>
              <div className="text-right">Requests</div>
              <div className="text-right">Tokens</div>
              <div className="text-right">Cost</div>
            </div>
            {data.byWorkspace.slice(0, 20).map((workspace) => (
              <Link
                key={workspace.workspaceId}
                href={`/en/admin/workspaces/${workspace.workspaceId}`}
                className="grid grid-cols-4 gap-4 py-3 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
              >
                <div className="font-medium text-gray-900 truncate">{workspace.workspaceName}</div>
                <div className="text-right text-gray-600">
                  {workspace.requests.toLocaleString()}
                </div>
                <div className="text-right text-gray-600">
                  {(workspace.tokens / 1000).toFixed(0)}K
                </div>
                <div className="text-right font-semibold text-gray-900">
                  {formatCost(workspace.cost)}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No workspace usage yet
          </div>
        )}
      </Card>
    </div>
  );
}

