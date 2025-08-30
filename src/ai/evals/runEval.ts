import { aiInvoke } from '../invoke';
import auditGoldenSet from './golden.audit.json';
import matchGoldenSet from './golden.match.json';
import outreachGoldenSet from './golden.outreach.json';

interface EvalResult {
  id: string;
  score: number;
  passed: boolean;
  details: {
    expected: any;
    actual: any;
    reasoning: string;
  };
}

interface EvalSummary {
  totalTests: number;
  passedTests: number;
  overallScore: number;
  results: EvalResult[];
}

// Scoring functions for different evaluation types
function scoreAudit(expected: any, actual: any): number {
  let score = 0;
  
  // Check if strengths are identified
  if (actual.strengths && Array.isArray(actual.strengths)) {
    const strengthMatch = expected.strengths.some((s: string) => 
      actual.strengths.some((as: string) => 
        as.toLowerCase().includes(s.toLowerCase())
      )
    );
    if (strengthMatch) score += 0.4;
  }
  
  // Check if weaknesses are identified
  if (actual.weaknesses && Array.isArray(actual.weaknesses)) {
    const weaknessMatch = expected.weaknesses.some((w: string) => 
      actual.weaknesses.some((aw: string) => 
        aw.toLowerCase().includes(w.toLowerCase())
      )
    );
    if (weaknessMatch) score += 0.4;
  }
  
  // Check overall sentiment (positive/negative balance)
  if (actual.score && typeof actual.score === 'number') {
    const scoreDiff = Math.abs(expected.score - actual.score);
    if (scoreDiff <= 0.1) score += 0.2;
    else if (scoreDiff <= 0.2) score += 0.1;
  }
  
  return Math.min(score, 1.0);
}

function scoreMatch(expected: any, actual: any): number {
  let score = 0;
  
  // Check if top recommendation matches
  if (actual.topRecommendation && actual.topRecommendation.name) {
    if (actual.topRecommendation.name.toLowerCase() === expected.expectedTop.toLowerCase()) {
      score += 0.6;
    } else {
      // Check if it's in top 3
      const top3 = actual.recommendations?.slice(0, 3) || [];
      if (top3.some((r: any) => r.name.toLowerCase() === expected.expectedTop.toLowerCase())) {
        score += 0.3;
      }
    }
  }
  
  // Check if score is reasonable
  if (actual.topRecommendation && actual.topRecommendation.score) {
    const scoreDiff = Math.abs(expected.expectedScore - actual.topRecommendation.score);
    if (scoreDiff <= 0.1) score += 0.4;
    else if (scoreDiff <= 0.2) score += 0.2;
  }
  
  return Math.min(score, 1.0);
}

function scoreOutreach(expected: any, actual: any): number {
  let score = 0;
  
  // Check if expected content is present
  if (actual.subject && actual.body) {
    const content = `${actual.subject} ${actual.body}`.toLowerCase();
    const expectedContent = expected.expectedContains || [];
    
    const contentMatches = expectedContent.filter((ec: string) => 
      content.includes(ec.toLowerCase())
    ).length;
    
    const contentScore = contentMatches / expectedContent.length;
    score += contentScore * 0.8;
  }
  
  // Check tone appropriateness
  if (actual.tone && expected.sequence.tone) {
    if (actual.tone.toLowerCase() === expected.sequence.tone.toLowerCase()) {
      score += 0.2;
    }
  }
  
  return Math.min(score, 1.0);
}

// Main evaluation runner
export async function runEval(): Promise<EvalSummary> {
  console.log('🚀 Starting AI Model Quality Evaluation...\n');
  
  const results: EvalResult[] = [];
  let totalTests = 0;
  let passedTests = 0;
  
  // Run Audit Evaluations
  console.log('📊 Running Audit Evaluations...');
  for (const testCase of auditGoldenSet) {
    try {
      const prompt = `Analyze this creator profile and provide strengths, weaknesses, and a score (0-1):
      
Creator Profile:
- Followers: ${testCase.creatorProfile.followers}
- Location: ${testCase.creatorProfile.geo}
- Topics: ${testCase.creatorProfile.topics.join(', ')}
- Platform: ${testCase.creatorProfile.platform}
- Engagement Rate: ${testCase.creatorProfile.engagementRate}

Please provide:
1. 3-5 key strengths
2. 3-5 key weaknesses  
3. Overall score (0-1)

Format as JSON with keys: strengths, weaknesses, score`;

      const response = await aiInvoke('audit.insights', { prompt });
      const actual = JSON.parse(response.content);
      
      const score = scoreAudit(testCase.expected, actual);
      const passed = score >= 0.7;
      
      if (passed) passedTests++;
      totalTests++;
      
      results.push({
        id: testCase.id,
        score,
        passed,
        details: {
          expected: testCase.expected,
          actual,
          reasoning: `Audit evaluation scored ${(score * 100).toFixed(1)}%`
        }
      });
      
      console.log(`  ${testCase.id}: ${passed ? '✅' : '❌'} ${(score * 100).toFixed(1)}%`);
      
    } catch (error) {
      console.error(`  ${testCase.id}: ❌ Error - ${error}`);
      totalTests++;
      results.push({
        id: testCase.id,
        score: 0,
        passed: false,
        details: {
          expected: testCase.expected,
          actual: null,
          reasoning: `Error: ${error}`
        }
      });
    }
  }
  
  // Run Match Evaluations
  console.log('\n🎯 Running Brand Match Evaluations...');
  for (const testCase of matchGoldenSet) {
    try {
      const prompt = `Given this creator profile, rank these brand candidates by relevance:

Creator Profile:
- Topics: ${testCase.auditSnapshot.topics.join(', ')}
- Location: ${testCase.auditSnapshot.geo}
- Followers: ${testCase.auditSnapshot.followers}
- Engagement: ${testCase.auditSnapshot.engagementRate}

Brand Candidates:
${testCase.candidates.map((b, i) => `${i + 1}. ${b.name} (${b.category}) - ${b.domain}`).join('\n')}

Provide top 3 recommendations with scores (0-1) and reasoning.
Format as JSON with keys: topRecommendation, recommendations, reasoning`;

      const response = await aiInvoke('match.brandSearch', { prompt });
      const actual = JSON.parse(response.content);
      
      const score = scoreMatch(testCase.expected, actual);
      const passed = score >= 0.7;
      
      if (passed) passedTests++;
      totalTests++;
      
      results.push({
        id: testCase.id,
        score,
        passed,
        details: {
          expected: testCase.expected,
          actual,
          reasoning: `Match evaluation scored ${(score * 100).toFixed(1)}%`
        }
      });
      
      console.log(`  ${testCase.id}: ${passed ? '✅' : '❌'} ${(score * 100).toFixed(1)}%`);
      
    } catch (error) {
      console.error(`  ${testCase.id}: ❌ Error - ${error}`);
      totalTests++;
      results.push({
        id: testCase.id,
        score: 0,
        passed: false,
        details: {
          expected: testCase.expected,
          actual: null,
          reasoning: `Error: ${error}`
        }
      });
    }
  }
  
  // Run Outreach Evaluations
  console.log('\n📧 Running Outreach Evaluations...');
  for (const testCase of outreachGoldenSet) {
    try {
      const prompt = `Create an outreach email for this collaboration:

Creator Profile:
- Topics: ${testCase.sequence.creatorProfile.topics.join(', ')}
- Location: ${testCase.sequence.creatorProfile.geo}
- Followers: ${testCase.sequence.creatorProfile.followers}

Brand: ${testCase.sequence.brand}
Tone: ${testCase.sequence.tone}

Create a subject line and email body that matches the tone and includes relevant content.
Format as JSON with keys: subject, body, tone`;

      const response = await aiInvoke('outreach.email', { prompt });
      const actual = JSON.parse(response.content);
      
      const score = scoreOutreach(testCase.expected, actual);
      const passed = score >= 0.7;
      
      if (passed) passedTests++;
      totalTests++;
      
      results.push({
        id: testCase.id,
        score,
        passed,
        details: {
          expected: testCase.expected,
          actual,
          reasoning: `Outreach evaluation scored ${(score * 100).toFixed(1)}%`
        }
      });
      
      console.log(`  ${testCase.id}: ${passed ? '✅' : '❌'} ${(score * 100).toFixed(1)}%`);
      
    } catch (error) {
      console.error(`  ${testCase.id}: ❌ Error - ${error}`);
      totalTests++;
      results.push({
        id: testCase.id,
        score: 0,
        passed: false,
        details: {
          expected: testCase.expected,
          actual: null,
          reasoning: `Error: ${error}`
        }
      });
    }
  }
  
  const overallScore = totalTests > 0 ? passedTests / totalTests : 0;
  
  console.log('\n📈 Evaluation Summary:');
  console.log(`  Total Tests: ${totalTests}`);
  console.log(`  Passed: ${passedTests}`);
  console.log(`  Overall Score: ${(overallScore * 100).toFixed(1)}%`);
  console.log(`  Status: ${overallScore >= 0.8 ? '✅ PASS' : '❌ FAIL'}`);
  
  return {
    totalTests,
    passedTests,
    overallScore,
    results
  };
}

// CLI runner
if (require.main === module) {
  runEval()
    .then((summary) => {
      if (summary.overallScore < 0.8) {
        process.exit(1); // Fail CI if score is below threshold
      }
    })
    .catch((error) => {
      console.error('❌ Evaluation failed:', error);
      process.exit(1);
    });
}
