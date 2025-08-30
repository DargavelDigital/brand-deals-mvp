# Epic 23: Model Quality Ops

## Overview

Epic 23 implements a comprehensive AI quality monitoring system that continuously evaluates AI model performance, detects drift, and ensures consistent results across all AI-powered features.

## 🎯 Goals

- **Continuous Evaluation**: Run automated tests against golden datasets
- **Drift Detection**: Identify when AI quality degrades over time
- **Performance Monitoring**: Track scores across audit, matching, and outreach
- **CI Integration**: Block deployments if AI quality falls below thresholds
- **Explainability**: Show reasoning behind AI decisions

## 🏗️ Architecture

### Core Components

1. **Golden Datasets** (`/src/ai/evals/`)
   - `golden.audit.json` - Creator profile evaluation test cases
   - `golden.match.json` - Brand matching test cases  
   - `golden.outreach.json` - Outreach email test cases

2. **Evaluation Runner** (`runEval.ts`)
   - Loads golden datasets
   - Executes AI calls via prompt packs
   - Scores results against expected outcomes
   - Generates comprehensive reports

3. **Drift Detection** (`scores.ts`)
   - Tracks evaluation results over time
   - Detects score declines (>10% week-on-week)
   - Monitors token usage increases (>20% above baseline)
   - Generates alerts for critical regressions

4. **Database Schema**
   - `EvalResult` table for storing evaluation metrics
   - Indexed for performance on date and score queries
   - Supports trend analysis and drift detection

5. **UI Dashboard** (`/settings/ai-quality`)
   - Real-time evaluation results
   - Performance trend charts
   - Drift alert notifications
   - Manual evaluation triggers

## 🚀 Usage

### Running Evaluations

```bash
# Run basic evaluation
pnpm run eval

# Run evaluation with drift detection
pnpm run eval:drift

# Run as part of AI testing suite
pnpm run test:ai
```

### API Endpoints

- `POST /api/evals/run` - Trigger evaluation run
- `GET /api/evals/trend` - Fetch evaluation history

### Environment Variables

```bash
# Required for AI evaluation
OPENAI_API_KEY=your_api_key_here

# Optional: Customize thresholds
AI_EVAL_THRESHOLD=0.8  # Default: 80% pass rate
AI_DRIFT_WARNING=0.1   # Default: 10% decline warning
AI_DRIFT_CRITICAL=0.2  # Default: 20% decline critical
```

## 📊 Evaluation Metrics

### Scoring System

- **Audit Quality**: Evaluates creator profile analysis accuracy
- **Match Quality**: Tests brand recommendation relevance
- **Outreach Quality**: Assesses email generation appropriateness
- **Overall Score**: Weighted average of all metrics

### Thresholds

- **Pass**: ≥80% overall score
- **Warning**: 10-20% decline from baseline
- **Critical**: >20% decline from baseline
- **CI Block**: <80% overall score

## 🔍 Drift Detection

### What Gets Monitored

1. **Score Declines**
   - Week-over-week performance drops
   - Individual metric regressions
   - Overall quality degradation

2. **Token Usage**
   - Cost increases above baseline
   - Inefficient prompt patterns
   - Model performance changes

3. **Response Quality**
   - Schema compliance
   - Content relevance
   - Consistency across runs

### Alert Types

- **Warning**: Performance slipping, monitor closely
- **Critical**: Significant regression, immediate action required
- **CI Block**: Quality below threshold, deployment prevented

## 🧪 Testing

### Golden Dataset Structure

Each test case includes:
- **Input**: Creator profile, brand candidates, or outreach context
- **Expected**: Expected strengths, weaknesses, recommendations
- **Scoring**: Pass/fail thresholds and scoring criteria

### Example Test Case

```json
{
  "id": "audit_001",
  "creatorProfile": {
    "followers": 10000,
    "geo": "UK",
    "topics": ["fitness", "vegan"]
  },
  "expected": {
    "strengths": ["authentic audience", "niche focus"],
    "weaknesses": ["low YouTube presence"],
    "score": 0.75
  }
}
```

## 🔧 CI/CD Integration

### Build Pipeline

```yaml
# .github/workflows/ai-quality.yml
- name: Run AI Quality Tests
  run: pnpm run test:ai
  
- name: Check Quality Threshold
  run: |
    if [ "$(pnpm run eval | grep 'Overall Score' | awk '{print $3}' | sed 's/%//')" -lt 80 ]; then
      echo "❌ AI quality below threshold"
      exit 1
    fi
```

### Netlify Integration

```toml
# netlify.toml
[build]
  command = "pnpm install && pnpm run test:ai && pnpm run build"
```

## 📈 Monitoring & Alerts

### Dashboard Features

- **Real-time Metrics**: Live evaluation scores
- **Trend Analysis**: Performance over time charts
- **Drift Alerts**: Visual indicators for regressions
- **Historical Data**: 30-day evaluation history

### Alert Channels

- **In-app**: Dashboard notifications
- **Email**: Critical drift alerts
- **Slack**: Team notifications (TODO)
- **CI**: Build failure on quality regression

## 🚨 Troubleshooting

### Common Issues

1. **Missing OpenAI API Key**
   ```bash
   export OPENAI_API_KEY=your_key_here
   ```

2. **Database Connection Issues**
   ```bash
   # Run manual setup
   psql $DATABASE_URL -f scripts/setup-epic23.sql
   ```

3. **Evaluation Failures**
   - Check prompt pack availability
   - Verify golden dataset format
   - Review AI response parsing

### Debug Mode

```bash
# Enable detailed logging
DEBUG=ai:evals pnpm run eval

# Check specific components
pnpm run eval:drift --debug
```

## 🔮 Future Enhancements

### Planned Features

1. **Automated Retraining**
   - Trigger model updates on drift detection
   - A/B testing of prompt improvements
   - Performance comparison across versions

2. **Advanced Analytics**
   - Correlation analysis with business metrics
   - User feedback integration
   - Cost optimization recommendations

3. **Multi-Model Support**
   - Compare different AI providers
   - Model performance benchmarking
   - Provider cost analysis

4. **Custom Metrics**
   - Business-specific evaluation criteria
   - Industry benchmark comparisons
   - ROI impact analysis

## 📚 Resources

### Related Documentation

- [AI Prompt Packs](../ai/promptPacks/)
- [Database Schema](../prisma/schema.prisma)
- [API Reference](../src/app/api/)
- [UI Components](../src/components/)

### External References

- [Prisma Documentation](https://www.prisma.io/docs/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Model Drift Detection](https://en.wikipedia.org/wiki/Concept_drift)

## 🤝 Contributing

### Adding New Test Cases

1. Update golden datasets with new scenarios
2. Ensure test cases cover edge cases
3. Validate expected outputs are realistic
4. Add corresponding scoring logic

### Extending Evaluation Types

1. Create new golden dataset file
2. Add scoring function to `runEval.ts`
3. Update database schema if needed
4. Extend UI dashboard for new metrics

---

**Status**: ✅ Implemented  
**Last Updated**: August 30, 2025  
**Maintainer**: AI Quality Team
