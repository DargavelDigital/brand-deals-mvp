'use client';

import { useState, useEffect } from 'react';
import { Section } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EvalResult {
  id: string;
  date: string;
  auditScore: number;
  matchScore: number;
  outreachScore: number;
  avgTokens: number;
  totalTests: number;
  passedTests: number;
  overallScore: number;
  userApprovalRate: number;
}

interface DriftAlert {
  type: string;
  severity: 'warning' | 'critical';
  message: string;
  currentValue: number;
  baselineValue: number;
  changePercent: number;
}

export default function AIQualityPage() {
  const [evalResults, setEvalResults] = useState<EvalResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningEval, setRunningEval] = useState(false);

  useEffect(() => {
    loadEvalResults();
  }, []);

  const loadEvalResults = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/evals/trend');
      if (!response.ok) {
        throw new Error('Failed to load evaluation results');
      }
      const data = await response.json();
      setEvalResults(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const runEvaluation = async () => {
    try {
      setRunningEval(true);
      const response = await fetch('/api/evals/run', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to run evaluation');
      }
      await loadEvalResults(); // Reload results
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setRunningEval(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 0.8) return '✅ Excellent';
    if (score >= 0.6) return '⚠️ Good';
    return '❌ Needs Attention';
  };

  if (loading) {
    return (
      <Section title="AI Quality Monitoring" description="Track AI model performance and detect drift">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">Loading evaluation data...</div>
        </div>
      </Section>
    );
  }

  if (error) {
    return (
      <Section title="AI Quality Monitoring" description="Track AI model performance and detect drift">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="text-[var(--error)]">Error: {error}</div>
            <Button onClick={loadEvalResults}>Retry</Button>
          </div>
        </div>
      </Section>
    );
  }

  const latestResult = evalResults[0];
  const chartData = evalResults.slice(0, 30).reverse().map(result => ({
    date: formatDate(result.date),
    audit: result.auditScore * 100,
    match: result.matchScore * 100,
    outreach: result.outreachScore * 100,
    overall: result.overallScore * 100,
    userApproval: result.userApprovalRate * 100
  }));

  return (
    <Section title="AI Quality Monitoring" description="Track AI model performance and detect drift">
      <div className="space-y-6">
        {/* Run Evaluation */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Model Evaluation</h3>
                <p className="text-sm text-[var(--muted-fg)]">
                  Run automated tests against golden datasets to evaluate AI quality
                </p>
              </div>
              <Button 
                onClick={runEvaluation} 
                disabled={runningEval}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {runningEval ? 'Running...' : 'Run Evaluation'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Latest Results */}
        {latestResult && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Latest Evaluation Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {(latestResult.overallScore * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Overall Score</div>
                  <div className={`text-xs mt-1 ${getScoreColor(latestResult.overallScore)}`}>
                    {getScoreStatus(latestResult.overallScore)}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {(latestResult.auditScore * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Audit Quality</div>
                  <div className={`text-xs mt-1 ${getScoreColor(latestResult.auditScore)}`}>
                    {getScoreStatus(latestResult.auditScore)}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {(latestResult.matchScore * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Match Quality</div>
                  <div className={`text-xs mt-1 ${getScoreColor(latestResult.matchScore)}`}>
                    {getScoreStatus(latestResult.matchScore)}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {(latestResult.outreachScore * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Outreach Quality</div>
                  <div className={`text-xs mt-1 ${getScoreColor(latestResult.outreachScore)}`}>
                    {getScoreStatus(latestResult.outreachScore)}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">
                    {(latestResult.userApprovalRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">User Approval</div>
                  <div className={`text-xs mt-1 ${getScoreColor(latestResult.userApprovalRate)}`}>
                    {getScoreStatus(latestResult.userApprovalRate)}
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Tests: {latestResult.passedTests}/{latestResult.totalTests} passed • 
                Date: {formatDate(latestResult.date)}
              </div>
            </div>
          </Card>
        )}

        {/* Performance Chart */}
        {chartData.length > 0 && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Trends (Last 30 Evaluations)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                  <Line type="monotone" dataKey="overall" stroke="#3b82f6" strokeWidth={2} name="Overall" />
                  <Line type="monotone" dataKey="audit" stroke="#10b981" strokeWidth={1} name="Audit" />
                  <Line type="monotone" dataKey="match" stroke="#8b5cf6" strokeWidth={1} name="Match" />
                  <Line type="monotone" dataKey="outreach" stroke="#f97316" strokeWidth={1} name="Outreach" />
                  <Line type="monotone" dataKey="userApproval" stroke="#6366f1" strokeWidth={1} name="User Approval" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Recent Results Table */}
        {evalResults.length > 0 && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Evaluation History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Overall</th>
                      <th className="text-left p-2">Audit</th>
                      <th className="text-left p-2">Match</th>
                      <th className="text-left p-2">Outreach</th>
                      <th className="text-left p-2">User Approval</th>
                      <th className="text-left p-2">Tests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evalResults.slice(0, 10).map((result) => (
                      <tr key={result.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{formatDate(result.date)}</td>
                        <td className={`p-2 font-medium ${getScoreColor(result.overallScore)}`}>
                          {(result.overallScore * 100).toFixed(1)}%
                        </td>
                        <td className={`p-2 ${getScoreColor(result.auditScore)}`}>
                          {(result.auditScore * 100).toFixed(1)}%
                        </td>
                        <td className={`p-2 ${getScoreColor(result.matchScore)}`}>
                          {(result.matchScore * 100).toFixed(1)}%
                        </td>
                        <td className={`p-2 ${getScoreColor(result.outreachScore)}`}>
                          {(result.outreachScore * 100).toFixed(1)}%
                        </td>
                        <td className={`p-2 ${getScoreColor(result.userApprovalRate)}`}>
                          {(result.userApprovalRate * 100).toFixed(1)}%
                        </td>
                        <td className="p-2 text-gray-600">
                          {result.passedTests}/{result.totalTests}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        )}

        {/* No Results */}
        {evalResults.length === 0 && (
          <Card>
            <div className="p-6 text-center">
              <div className="text-gray-500 mb-4">No evaluation results yet</div>
              <p className="text-sm text-gray-600 mb-4">
                Run your first evaluation to start monitoring AI quality
              </p>
              <Button onClick={runEvaluation} className="bg-blue-600 hover:bg-blue-700">
                Run First Evaluation
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Section>
  );
}
