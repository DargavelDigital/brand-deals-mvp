# Epic 23.5: AI Auto-Adaptation from Feedback

**Last Updated**: August 30, 2025  
**Maintainer**: AI Quality Team

## 🎯 Overview

Epic 23.5 extends the AI quality monitoring system with **automatic adaptation** based on user feedback. This creates a closed-loop system where the AI continuously improves without manual prompt engineering.

## 🚀 Key Features

### **1. Feedback-Driven Bias Computation**
- Analyzes user feedback (👍/👎) to infer preferences
- Computes tone biases, phrase preferences, and style adjustments
- Caches results for performance (1-minute TTL)

### **2. Automatic Prompt Adaptation**
- Merges bias into prompt packs before AI calls
- Respects user preferences (user tone selection wins)
- Applies safety overrides for high negative feedback rates

### **3. Multi-Task Adaptation**
- **Outreach**: Tone adjustment, do/don't phrases, style nudges
- **Matches**: Geo weighting, category boosts, downrank signals
- **Audit**: Presentation style, language preferences

### **4. Client-Side Re-ranking**
- Applies bias to match results without additional API calls
- Provides explanations for ranking changes
- Defense-in-depth approach

## 🏗️ Architecture

```
User Feedback → Bias Computation → Prompt Adaptation → AI Generation
     ↓              ↓                    ↓              ↓
  AiFeedback   feedbackBias.ts    aiInvoke.ts    OpenAI API
     ↓              ↓                    ↓              ↓
  Database      Cache (1min)      Bias Merge    Enhanced Output
```

## 📊 Bias Types

### **Outreach Bias**
```typescript
outreach: {
  toneBias?: 'professional' | 'relaxed' | 'fun';
  do?: string[];           // Preferred phrases
  dont?: string[];         // Avoided phrases
  nudge?: string;          // Global style hint
}
```

### **Match Bias**
```typescript
match: {
  boostCategories?: Record<string, number>;  // Category multipliers
  downrankSignals?: string[];                // Phrases to avoid
  geoWeight?: number;                        // Location importance (0.8-2.0)
}
```

### **Audit Bias**
```typescript
audit: {
  style?: 'bullet' | 'narrative' | 'executive';
  avoid?: string[];        // Language to avoid
}
```

## 🔧 Implementation

### **1. Feature Flag Control**
```bash
# Enable adaptation
AI_ADAPT_FEEDBACK=1
```

### **2. Core Services**

#### **Feedback Bias Service** (`src/services/ai/feedbackBias.ts`)
- Computes bias from recent feedback
- Caches results for performance
- Provides safety overrides

#### **AI Invoke Middleware** (`src/services/ai/aiInvoke.ts`)
- Wraps original AI invoke
- Merges bias into prompts
- Logs adaptation for observability

#### **Client Re-ranking** (`src/components/matches/reRank.ts`)
- Applies bias to match results
- Provides ranking explanations
- No additional API calls

### **3. UI Components**

#### **Adaptive Badge** (`src/components/ui/AdaptiveBadge.tsx`)
- Shows when adaptation is active
- Hover tooltip with adaptation details
- Subtle visual indicator

## 📈 Usage Examples

### **Basic AI Call with Adaptation**
```typescript
import { aiInvoke } from '@/services/ai/aiInvoke';

const result = await aiInvoke('outreach.email.v1', {
  creator: creatorProfile,
  brand: brandProfile,
  sequence: outreachSequence
}, {
  workspaceId: 'workspace_123',
  tone: 'professional', // User preference (wins over bias)
  traceId: 'trace_456'
});
```

### **Client-Side Re-ranking**
```typescript
import { reRank, getReRankExplanation } from '@/components/matches/reRank';

// Apply bias to match results
const rankedCandidates = reRank(candidates, bias);

// Get explanations for debugging
const explanations = getReRankExplanation(candidates[0], bias);
```

### **Bias Computation**
```typescript
import { computeBias } from '@/services/ai/feedbackBias';

const bias = await computeBias('workspace_123', { days: 14, limit: 500 });
console.log('Outreach tone bias:', bias.outreach?.toneBias);
```

## 🧪 Testing

### **Run Adaptation Tests**
```bash
pnpm run test:adapt
```

### **Test Coverage**
- Bias computation from feedback
- Hard tone overrides
- Match re-ranking logic
- Feature flag control

### **Sample Test Data**
The test suite includes realistic feedback scenarios:
- Tone preferences (professional vs. casual)
- Category boosts (fitness, outdoor, local)
- Downrank signals (MLM, dropshipping)
- Style preferences (bullet points, executive summary)

## 🚨 Safety Features

### **1. User Preference Priority**
- User-selected tone always wins over bias
- Explicit settings override automatic adaptation

### **2. Value Clamping**
- Geo weights: 0.8 to 2.0
- Category boosts: 0.8 to 2.0
- Prevents extreme bias values

### **3. Safety Overrides**
- High negative feedback → Professional tone
- Threshold: 60% downvotes in 24 hours
- Automatic recovery when feedback improves

### **4. Error Handling**
- Adaptation failures don't break AI calls
- Graceful fallback to original behavior
- Comprehensive error logging

## 📊 Observability

### **Bias Application Logging**
```typescript
console.log('[AI-ADAPT] Bias applied for outreach.email.v1:', {
  traceId: 'trace_456',
  biasKeysApplied: {
    outreachTone: 'professional',
    do: 3,
    dont: 2,
    nudge: true
  },
  workspaceId: 'workspace_123'
});
```

### **Metrics to Monitor**
- Bias computation frequency
- Adaptation success rate
- User preference overrides
- Safety override triggers

## 🚀 Rollout Strategy

### **Phase 1: Outreach Only** ✅
- Tone adaptation
- Phrase preferences
- Style nudges

### **Phase 2: Matches** ✅
- Geo weighting
- Category boosts
- Downrank signals

### **Phase 3: Audit** ✅
- Presentation style
- Language preferences

### **Phase 4: Advanced Features**
- Cross-workspace learning
- Industry-specific biases
- A/B testing framework

## 🔍 Monitoring & Alerts

### **Key Metrics**
- **Adaptation Rate**: % of AI calls using bias
- **Bias Effectiveness**: User satisfaction with adapted outputs
- **Override Frequency**: How often user preferences win
- **Safety Triggers**: Professional tone overrides

### **Alert Thresholds**
- Adaptation rate < 10% → Check feature flag
- User preference overrides > 80% → Review bias computation
- Safety overrides > 20% → Investigate feedback quality

## 🛠️ Troubleshooting

### **Common Issues**

#### **1. No Adaptation Applied**
```bash
# Check feature flag
echo $AI_ADAPT_FEEDBACK

# Verify bias computation
pnpm run test:adapt
```

#### **2. Bias Not Updating**
- Check cache TTL (1 minute)
- Verify feedback data exists
- Check database connectivity

#### **3. Performance Issues**
- Monitor bias computation time
- Check cache hit rates
- Review feedback query performance

### **Debug Commands**
```bash
# Test bias computation
pnpm run test:adapt

# Check database setup
pnpm run db:setup:adaptation

# Verify feature flags
grep -r "AI_ADAPT_FEEDBACK" .env*
```

## 🔮 Future Enhancements

### **Planned Features**
1. **Cross-Workspace Learning**: Share insights across similar workspaces
2. **Industry-Specific Biases**: Pre-trained bias models for common niches
3. **A/B Testing**: Compare adapted vs. original outputs
4. **Bias Visualization**: Dashboard showing adaptation history
5. **Manual Overrides**: Admin controls for bias adjustment

### **Advanced Adaptation**
1. **Real-time Learning**: Update bias during user sessions
2. **Contextual Adaptation**: Different bias for different content types
3. **Seasonal Adjustments**: Time-based bias variations
4. **Performance Correlation**: Link bias to business metrics

## 📚 Resources

### **Related Documentation**
- [Epic 23: AI Quality Ops](./EPIC_23_AI_QUALITY_OPS.md)
- [Feedback System Guide](./FEEDBACK_SYSTEM.md)
- [AI Quality Dashboard](./AI_QUALITY_DASHBOARD.md)

### **Code References**
- `src/services/ai/feedbackBias.ts` - Core bias computation
- `src/services/ai/aiInvoke.ts` - Adaptation middleware
- `src/components/matches/reRank.ts` - Client-side re-ranking
- `__tests__/ai/adapt.test.ts` - Test suite

### **Environment Variables**
```bash
# Enable AI adaptation
AI_ADAPT_FEEDBACK=1

# Demo authentication (for testing)
ENABLE_DEMO_AUTH=1
NEXT_PUBLIC_ENABLE_DEMO_AUTH=1
```

---

## 🎉 Success Metrics

### **Immediate Goals**
- ✅ AI calls automatically adapt to user feedback
- ✅ User preferences always respected
- ✅ Safety overrides prevent quality degradation
- ✅ Comprehensive test coverage

### **Long-term Impact**
- 🚀 Reduced manual prompt engineering
- 🚀 Improved user satisfaction
- 🚀 Faster AI quality improvements
- 🚀 Competitive advantage in AI-driven features

---

**The AI adaptation system transforms your app from a static AI implementation to a living, learning system that continuously improves based on real user feedback. This is production-grade RLHF (Reinforcement Learning from Human Feedback) built right into your application.** 🎯
