import { prisma } from '@/lib/prisma';
import { runEval } from './runEval';

export interface EvalResult {
  id: string;
  date: Date;
  auditScore: number;
  matchScore: number;
  outreachScore: number;
  avgTokens: number;
  totalTests: number;
  passedTests: number;
  overallScore: number;
}

export interface DriftAlert {
  type: 'score_decline' | 'token_increase' | 'overall_regression';
  severity: 'warning' | 'critical';
  message: string;
  currentValue: number;
  baselineValue: number;
  changePercent: number;
}

// Calculate average scores from evaluation results
function calculateAverageScores(results: any[]): {
  auditScore: number;
  matchScore: number;
  outreachScore: number;
  avgTokens: number;
} {
  if (results.length === 0) {
    return { auditScore: 0, matchScore: 0, outreachScore: 0, avgTokens: 0 };
  }

  const auditScores = results.filter(r => r.details?.expected && r.details?.actual?.strengths).map(r => r.score);
  const matchScores = results.filter(r => r.details?.expected && r.details?.actual?.topRecommendation).map(r => r.score);
  const outreachScores = results.filter(r => r.details?.expected && r.details?.actual?.subject).map(r => r.score);

  return {
    auditScore: auditScores.length > 0 ? auditScores.reduce((a, b) => a + b, 0) / auditScores.length : 0,
    matchScore: matchScores.length > 0 ? matchScores.reduce((a, b) => a + b, 0) / matchScores.length : 0,
    outreachScore: outreachScores.length > 0 ? outreachScores.reduce((a, b) => a + b, 0) / outreachScores.length : 0,
    avgTokens: 0 // TODO: Extract from AI response metadata
  };
}

// Calculate user approval rate from feedback
async function calculateUserApprovalRate(): Promise<number> {
  try {
    const response = await fetch('/api/feedback/summary?type=MATCH');
    if (response.ok) {
      const data = await response.json();
      return data.data.ratio || 0;
    }
  } catch (error) {
    console.error('Error fetching user approval rate:', error);
  }
  return 0;
}

// Detect drift by comparing current results to baseline
export function detectDrift(currentResults: any[], baselineResults: any[]): DriftAlert[] {
  const alerts: DriftAlert[] = [];
  
  if (baselineResults.length === 0) return alerts;
  
  const current = calculateAverageScores(currentResults);
  const baseline = calculateAverageScores(baselineResults);
  
  // Check for score decline (>10% week-on-week)
  const auditChange = ((current.auditScore - baseline.auditScore) / baseline.auditScore) * 100;
  if (auditChange < -10) {
    alerts.push({
      type: 'score_decline',
      severity: auditChange < -20 ? 'critical' : 'warning',
      message: `Audit score declined by ${Math.abs(auditChange).toFixed(1)}%`,
      currentValue: current.auditScore,
      baselineValue: baseline.auditScore,
      changePercent: auditChange
    });
  }
  
  const matchChange = ((current.matchScore - baseline.matchScore) / baseline.matchScore) * 100;
  if (matchChange < -10) {
    alerts.push({
      type: 'score_decline',
      severity: matchChange < -20 ? 'critical' : 'warning',
      message: `Match score declined by ${Math.abs(matchChange).toFixed(1)}%`,
      currentValue: current.matchScore,
      baselineValue: baseline.matchScore,
      changePercent: matchChange
    });
  }
  
  const outreachChange = ((current.outreachScore - baseline.outreachScore) / baseline.outreachScore) * 100;
  if (outreachChange < -10) {
    alerts.push({
      type: 'score_decline',
      severity: outreachChange < -20 ? 'critical' : 'warning',
      message: `Outreach score declined by ${Math.abs(outreachChange).toFixed(1)}%`,
      currentValue: current.outreachScore,
      baselineValue: baseline.outreachScore,
      changePercent: outreachChange
    });
  }
  
  // Check for token increase (>20% above baseline)
  if (baseline.avgTokens > 0) {
    const tokenChange = ((current.avgTokens - baseline.avgTokens) / baseline.avgTokens) * 100;
    if (tokenChange > 20) {
      alerts.push({
        type: 'token_increase',
        severity: tokenChange > 50 ? 'critical' : 'warning',
        message: `Token usage increased by ${tokenChange.toFixed(1)}%`,
        currentValue: current.avgTokens,
        baselineValue: baseline.avgTokens,
        changePercent: tokenChange
      });
    }
  }
  
  // Check overall regression
  const overallCurrent = (current.auditScore + current.matchScore + current.outreachScore) / 3;
  const overallBaseline = (baseline.auditScore + baseline.matchScore + baseline.outreachScore) / 3;
  const overallChange = ((overallCurrent - overallBaseline) / overallBaseline) * 100;
  
  if (overallChange < -15) {
    alerts.push({
      type: 'overall_regression',
      severity: overallChange < -25 ? 'critical' : 'warning',
      message: `Overall AI quality declined by ${Math.abs(overallChange).toFixed(1)}%`,
      currentValue: overallCurrent,
      baselineValue: overallBaseline,
      changePercent: overallChange
    });
  }

  // Check user approval rate decline
  if (current.userApprovalRate && baseline.userApprovalRate) {
    const approvalChange = ((current.userApprovalRate - baseline.userApprovalRate) / baseline.userApprovalRate) * 100;
    if (approvalChange < -10) {
      alerts.push({
        type: 'user_approval_decline',
        severity: approvalChange < -20 ? 'critical' : 'warning',
        message: `User approval rate declined by ${Math.abs(approvalChange).toFixed(1)}%`,
        currentValue: current.userApprovalRate,
        baselineValue: baseline.userApprovalRate,
        changePercent: approvalChange
      });
    }
  }
  
  return alerts;
}

// Save evaluation results to database
export async function saveEvalResults(evalSummary: any): Promise<void> {
  try {
    const scores = calculateAverageScores(evalSummary.results);
    const userApprovalRate = await calculateUserApprovalRate();
    
    await prisma.evalResult.create({
      data: {
        date: new Date(),
        auditScore: scores.auditScore,
        matchScore: scores.matchScore,
        outreachScore: scores.outreachScore,
        avgTokens: scores.avgTokens,
        totalTests: evalSummary.totalTests,
        passedTests: evalSummary.passedTests,
        overallScore: evalSummary.overallScore,
        userApprovalRate
      }
    });
    
    console.log('✅ Evaluation results saved to database');
  } catch (error) {
    console.error('❌ Failed to save evaluation results:', error);
  }
}

// Get evaluation trend data (last 30 results)
export async function getEvalTrend(): Promise<EvalResult[]> {
  try {
    const results = await prisma.evalResult.findMany({
      orderBy: { date: 'desc' },
      take: 30
    });
    
    return results.map(r => ({
      id: r.id,
      date: r.date,
      auditScore: r.auditScore,
      matchScore: r.matchScore,
      outreachScore: r.outreachScore,
      avgTokens: r.avgTokens,
      totalTests: r.totalTests,
      passedTests: r.passedTests,
      overallScore: r.overallScore
    }));
  } catch (error) {
    console.error('❌ Failed to fetch evaluation trend:', error);
    return [];
  }
}

// Run evaluation and save results
export async function runAndSaveEval(): Promise<{
  evalSummary: any;
  alerts: DriftAlert[];
}> {
  console.log('🚀 Running AI evaluation and drift detection...');
  
  // Run evaluation
  const evalSummary = await runEval();
  
  // Save results
  await saveEvalResults(evalSummary);
  
  // Get recent results for drift detection
  const recentResults = await getEvalTrend();
  
  // Get baseline (results from 7-14 days ago)
  const baselineResults = recentResults.filter(r => {
    const daysAgo = (Date.now() - r.date.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo >= 7 && daysAgo <= 14;
  });
  
  // Detect drift
  const alerts = detectDrift(recentResults.slice(0, 7), baselineResults);
  
  if (alerts.length > 0) {
    console.log('\n🚨 Drift Alerts Detected:');
    alerts.forEach(alert => {
      console.log(`  ${alert.severity === 'critical' ? '🔴' : '🟡'} ${alert.message}`);
    });
    
    // TODO: Send notifications (Slack, email, etc.)
    await sendDriftNotifications(alerts);
  } else {
    console.log('\n✅ No drift detected - AI quality is stable');
  }
  
  return { evalSummary, alerts };
}

// Send drift notifications
async function sendDriftNotifications(alerts: DriftAlert[]): Promise<void> {
  // TODO: Implement Slack/email notifications
  console.log('📢 Sending drift notifications...');
  
  for (const alert of alerts) {
    if (alert.severity === 'critical') {
      console.log(`  🔴 CRITICAL: ${alert.message}`);
      // TODO: Send immediate notification
    } else {
      console.log(`  🟡 WARNING: ${alert.message}`);
      // TODO: Send scheduled notification
    }
  }
}

// CLI runner for scheduled evaluations
if (require.main === module) {
  runAndSaveEval()
    .then(({ evalSummary, alerts }) => {
      if (evalSummary.overallScore < 0.8) {
        console.log('❌ Evaluation failed quality threshold');
        process.exit(1);
      }
      if (alerts.some(a => a.severity === 'critical')) {
        console.log('🚨 Critical drift detected');
        process.exit(1);
      }
      console.log('✅ Evaluation completed successfully');
    })
    .catch((error) => {
      console.error('❌ Evaluation failed:', error);
      process.exit(1);
    });
}
