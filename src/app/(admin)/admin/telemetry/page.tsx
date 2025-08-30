'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { isOn } from '@/config/flags';

interface TelemetryStats {
  totalSends: number;
  totalReplies: number;
  totalWins: number;
  avgReplyRate: number;
  avgWinRate: number;
  avgDealValue: number;
}

interface SegmentPerformance {
  industry: string;
  sizeBand: string;
  region: string;
  sends: number;
  replies: number;
  wins: number;
  replyRate: number;
  winRate: number;
}

export default function TelemetryPage() {
  const [stats, setStats] = useState<TelemetryStats | null>(null);
  const [segments, setSegments] = useState<SegmentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isEnabled = isOn('netfx.enabled');

  useEffect(() => {
    if (isEnabled) {
      loadTelemetryData();
    }
  }, [isEnabled]);

  const loadTelemetryData = async () => {
    try {
      setLoading(true);
      
      // Load aggregate stats
      const statsResponse = await fetch('/api/netfx/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }
      
      // Load segment performance
      const segmentsResponse = await fetch('/api/netfx/segments');
      if (segmentsResponse.ok) {
        const segmentsData = await segmentsResponse.json();
        setSegments(segmentsData.segments);
      }
      
    } catch (error) {
      console.error('Failed to load telemetry data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadTelemetryData();
    setRefreshing(false);
  };

  const runAggregation = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/netfx/aggregate', { method: 'POST' });
      if (response.ok) {
        await loadTelemetryData();
      }
    } catch (error) {
      console.error('Failed to run aggregation:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (!isEnabled) {
    return (
      <div className="container-1200 space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Network Effects Telemetry</h1>
          <p className="text-[var(--muted)] mb-6">
            This feature is currently disabled. Enable it in your environment variables.
          </p>
          <Badge variant="secondary">NETFX_ENABLED=0</Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="container-1200 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Network Effects Telemetry</h1>
          <p className="text-[var(--muted)]">
            Anonymous performance data across all workspaces to improve outreach effectiveness
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={refreshData} 
            disabled={refreshing}
            variant="secondary"
          >
            Refresh
          </Button>
          <Button 
            onClick={runAggregation} 
            disabled={refreshing}
          >
            Run Aggregation
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-[var(--muted)]">Loading telemetry data...</div>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="text-sm font-medium text-[var(--muted)] mb-2">Total Sends</div>
              <div className="text-2xl font-bold">{stats?.totalSends?.toLocaleString() || '0'}</div>
            </Card>
            
            <Card className="p-6">
              <div className="text-sm font-medium text-[var(--muted)] mb-2">Reply Rate</div>
              <div className="text-2xl font-bold">
                {stats?.avgReplyRate ? `${(stats.avgReplyRate * 100).toFixed(1)}%` : '0%'}
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="text-sm font-medium text-[var(--muted)] mb-2">Win Rate</div>
              <div className="text-2xl font-bold">
                {stats?.avgWinRate ? `${(stats.avgWinRate * 100).toFixed(1)}%` : '0%'}
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="text-sm font-medium text-[var(--muted)] mb-2">Avg Deal Value</div>
              <div className="text-2xl font-bold">
                {stats?.avgDealValue ? `$${stats.avgDealValue.toLocaleString()}` : '$0'}
              </div>
            </Card>
          </div>

          {/* Segment Performance */}
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Performance by Segment</h3>
              <p className="text-sm text-[var(--muted)]">
                Anonymous performance data grouped by industry, size, and region
              </p>
            </div>
            
            {segments.length === 0 ? (
              <div className="text-center py-8 text-[var(--muted)]">
                No segment data available. Run aggregation to generate insights.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left p-3 font-medium">Industry</th>
                      <th className="text-left p-3 font-medium">Size</th>
                      <th className="text-left p-3 font-medium">Region</th>
                      <th className="text-right p-3 font-medium">Sends</th>
                      <th className="text-right p-3 font-medium">Reply Rate</th>
                      <th className="text-right p-3 font-medium">Win Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {segments.map((segment, index) => (
                      <tr key={index} className="border-b border-[var(--border)]/50">
                        <td className="p-3">{segment.industry || 'Unknown'}</td>
                        <td className="p-3">{segment.sizeBand || 'Unknown'}</td>
                        <td className="p-3">{segment.region || 'Unknown'}</td>
                        <td className="p-3 text-right">{segment.sends}</td>
                        <td className="p-3 text-right">
                          {(segment.replyRate * 100).toFixed(1)}%
                        </td>
                        <td className="p-3 text-right">
                          {(segment.winRate * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Privacy Notice */}
          <Card className="bg-[var(--muted)]/10 border-[var(--muted)]/20 p-6">
            <div className="flex items-start gap-3">
              <div className="text-[var(--muted)]">🔒</div>
              <div>
                <h3 className="font-medium mb-2">Privacy & Data Protection</h3>
                <p className="text-sm text-[var(--muted)]">
                  All data is anonymized and aggregated. No PII (Personal Identifiable Information) 
                  is stored or transmitted. Data is processed using k-anonymity (k≥10) and 
                  differential privacy techniques to ensure individual privacy while maintaining 
                  statistical accuracy.
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
