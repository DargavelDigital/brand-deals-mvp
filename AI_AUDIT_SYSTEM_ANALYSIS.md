# AI Audit System - Complete Analysis

**Generated:** 2025-10-09  
**Status:** Instagram Integration Working, GPT-5 Configuration In Progress  
**Purpose:** Comprehensive system audit to identify and fix all error points

---

## 🎯 Executive Summary

### Current Status
- ✅ **Instagram OAuth**: Working perfectly (@hypeandswagger, 5 followers, 2 posts)
- ✅ **Real Data Fetch**: Instagram Graph API returning real metrics
- ✅ **Data Aggregation**: Sources: ['INSTAGRAM']
- ⚠️ **GPT-5 Integration**: Multiple parameter issues being resolved
- ❌ **End-to-End Flow**: Blocked by GPT-5 response format issues

### Critical Issues
1. GPT-5 returning `undefined` for `headline`, `keyFindings`, `moves`
2. Schema enforcement not working as expected
3. Multiple defensive coding patches applied
4. Need root cause analysis of GPT-5 response format

---

## 1. Complete User Flow: "Run Audit" → Display Results

### Step 1: User Clicks "Run Audit"

**File:** `src/app/[locale]/tools/audit/page.tsx` (Line 33)
```typescript
const onRun = () => run({ platforms: selected })
```

**OR**

**File:** `src/components/run/steps/StepAuditEmbed.tsx` (Brand Run workflow)
```typescript
const onRun = useCallback(async () => {
  // ... runs audit
}, [])
```

---

### Step 2: useAuditRunner Hook

**File:** `src/components/audit/useAuditRunner.ts`

**Function:** `run()` (Line 64-99)

**What it does:**
1. Calls `POST /api/audit/run`
2. Sends `{ socialAccounts: platforms }`
3. Gets back `{ jobId, auditId }`
4. Polls for completion or fetches latest

**API Call:**
```typescript
const r = await fetch('/api/audit/run', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    socialAccounts: body.platforms || []
  }),
})
```

---

### Step 3: API Route Handler

**File:** `src/app/api/audit/run/route.ts`

**Function:** `POST()` (Line 13-379)

**What it does:**
1. Validates session/workspace
2. Creates audit record in database (status: 'queued')
3. Checks `AUDIT_INLINE` flag
4. Calls provider system

**Key Code:**
```typescript
// Get providers with feature flag gating
const providers = getProviders(effectiveWorkspaceId);

// Run audit synchronously (inline mode) or queue
const auditResult = await providers.audit(effectiveWorkspaceId, socialAccounts);

// Update audit record with results
await prisma().audit.update({
  where: { id: auditId },
  data: {
    snapshotJson: {
      jobId,
      status: 'succeeded',
      metadata: {
        auditResult  // ← The audit data goes here
      }
    }
  }
});
```

---

### Step 4: Provider System

**File:** `src/services/providers/index.ts`

**Function:** `getProviders()` (Line 102-142)

**Returns:**
```typescript
{
  audit: runRealAudit,  // Real provider
  // OR
  audit: mockAuditService.runAudit  // Mock provider
}
```

**Decision logic:**
- Uses **real providers** if flags enabled
- Falls back to **mock providers** for demo/development

---

### Step 5: Real Audit Service

**File:** `src/services/audit/index.ts`

**Function:** `runRealAudit()` (Line 18-137)

**What it does:**

#### 5.1 Check Credits
```typescript
await requireCredits('AUDIT', 1, workspaceId);
```

#### 5.2 Build Social Snapshot
```typescript
const snapshot: Snapshot = await buildSnapshot({
  workspaceId,
  youtube: opts.youtubeChannelId ? { channelId: opts.youtubeChannelId } : undefined,
});
```

#### 5.3 Aggregate Platform Data
```typescript
const auditData = await aggregateAuditData(workspaceId);
```

**Returns:**
```typescript
{
  audience: { totalFollowers, avgEngagement, reachRate, ... },
  performance: { avgLikes, avgComments, avgShares, ... },
  contentSignals: string[],
  insights: string[],
  sources: string[]  // e.g., ['INSTAGRAM']
}
```

#### 5.4 Generate AI Insights (GPT-5)
```typescript
insights = await aiInvoke<unknown, AuditInsightsOutput>(
  'audit.insights',  // ← Prompt pack key
  { snapshot }
);
```

**Expected Output:**
```typescript
{
  headline: string,
  keyFindings: string[],  // Array of 3+ strings
  risks: string[],
  moves: Array<{ title: string, why: string }>  // 3-6 items
}
```

#### 5.5 Save to Database
```typescript
const audit = await prisma().audit.create({
  data: {
    workspaceId,
    sources: auditData.sources,
    snapshotJson: {
      audience: auditData.audience,
      performance: auditData.performance,
      contentSignals: auditData.contentSignals,
      insights: [
        insights.headline, 
        ...(Array.isArray(insights.keyFindings) ? insights.keyFindings : [])
      ].filter(Boolean),  // ← Defensive coding
      similarCreators: Array.isArray(insights.moves) 
        ? insights.moves.map(move => ({ name: move.title, description: move.why }))
        : [],
      socialSnapshot: snapshot
    }
  }
});
```

#### 5.6 Return Result
```typescript
return {
  auditId: audit.id,
  audience: auditData.audience,
  insights: [...],
  similarCreators: [...],
  sources: auditData.sources
};
```

---

### Step 6: Data Aggregation

**File:** `src/services/audit/aggregate.ts`

**Function:** `aggregateAuditData()` (Line 22-418)

**What it does:**

#### 6.1 Try Instagram Provider
```typescript
const { InstagramProvider } = await import('@/services/audit/providers/instagram');
const instagramData = await InstagramProvider.fetchAccountMetrics(workspaceId);

if (instagramData) {
  // Use REAL Instagram data
  sources.push('INSTAGRAM');
  audienceData.push({
    totalFollowers: instagramData.audience.size,
    avgEngagement: instagramData.audience.engagementRate * 100,
    reachRate: 10.2
  });
} else {
  // Fallback to stub
  sources.push('INSTAGRAM_STUB');
}
```

#### 6.2 Aggregate All Platforms
- Instagram (real or stub)
- TikTok (stub)
- YouTube (stub)
- Twitter (stub)

#### 6.3 Calculate Final Metrics
```typescript
return {
  audience: {
    totalFollowers: sum(audienceData.totalFollowers),
    avgEngagement: avg(audienceData.avgEngagement),
    reachRate: avg(audienceData.reachRate),
    topCountries: [...],
    ageDistribution: {...}
  },
  performance: {
    avgLikes: avg(...),
    avgComments: avg(...),
    avgShares: avg(...)
  },
  contentSignals: [...],
  insights: [...],
  sources: ['INSTAGRAM', 'TIKTOK_STUB', ...]
}
```

---

### Step 7: Instagram Provider (Real Data)

**File:** `src/services/audit/providers/instagram.ts`

**Function:** `InstagramProvider.fetchAccountMetrics()` (Line 22-124)

**What it does:**

#### 7.1 Load Connection
```typescript
const conn = await loadIgConnection(workspaceId)
// Returns: { igUserId: '24751119544530670', userAccessToken: '...' }
```

**File:** `src/services/instagram/store.ts`
```typescript
export async function loadIgConnection(workspaceId: string) {
  const account = await prisma().socialAccount.findFirst({
    where: { workspaceId, platform: 'instagram' }
  })
  
  return account ? {
    igUserId: account.externalId,
    userAccessToken: account.accessToken
  } : null
}
```

#### 7.2 Call Instagram Graph API (5 calls)

**File:** `src/services/instagram/graph.ts`

**1. Account Info:**
```typescript
const info = await igAccountInfo({ 
  igUserId: conn.igUserId, 
  accessToken: token 
})

// URL: https://graph.instagram.com/v21.0/{userId}?fields=id,username,account_type,media_count,followers_count,profile_picture_url&access_token=...
```

**2. User Insights:**
```typescript
const user = await igUserInsights({ 
  igUserId: conn.igUserId, 
  accessToken: token 
})

// URL: https://graph.instagram.com/v21.0/{userId}/insights?metric=reach,follower_count,profile_views&period=day&access_token=...
```

**3. Audience Insights:**
```typescript
const audience = await igAudienceInsights({ 
  igUserId: conn.igUserId, 
  accessToken: token 
})

// URL: https://graph.instagram.com/v21.0/{userId}/insights?metric=engaged_audience_demographics,reached_audience_demographics,follower_demographics&period=lifetime&access_token=...
```

**4. Media List:**
```typescript
const media = await igMedia({ 
  igUserId: conn.igUserId, 
  accessToken: token, 
  limit: 20 
})

// URL: https://graph.instagram.com/v21.0/{userId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&access_token=...

// Response: { data: { data: [...posts] } }
```

**5. Media Insights (per post):**
```typescript
for (const post of posts) {
  const ins = await igMediaInsights({ 
    mediaId: post.id, 
    accessToken: token 
  })
  
  // URL: https://graph.instagram.com/v21.0/{mediaId}/insights?metric=engagement,impressions,reach,saved&access_token=...
}
```

#### 7.3 Process & Return
```typescript
return {
  audience: { 
    size: followerCount, 
    topGeo: [], 
    topAge: [], 
    engagementRate 
  },
  performance: {
    avgViews: Math.max(reach, impressions) / 30,
    avgLikes,
    avgComments,
    avgShares: saves
  },
  contentSignals: ['Short-form Video', 'Carousel', ...]
}
```

---

### Step 8: AI Insights Generation (GPT-5)

**File:** `src/ai/invoke.ts`

**Function:** `aiInvoke()` (Line 24-159)

**What it does:**

#### 8.1 Load Prompt Pack
```typescript
const pack = loadPack(packKey as any, opts.version);
// Loads: src/ai/promptPacks/audit.insights.v1.ts
```

#### 8.2 Build Messages
```typescript
const messagesWithFewshots = [
  // Add few-shot examples
  { role: 'user', content: JSON.stringify(fewshot.input) },
  { role: 'assistant', content: JSON.stringify(fewshot.output) },
  // Add actual input
  { role: 'user', content: userContent }
];
```

#### 8.3 Call OpenAI
```typescript
const response = await openAIJsonResponse({
  model,
  system: baseSystem,
  messages: messagesWithFewshots,
  schema: pack.outputSchema,
  temperature: pack.modelHints?.temperature ?? 0.2,
  max_output_tokens: pack.modelHints?.max_output_tokens ?? 800,
  traceId,
});
```

**File:** `src/ai/client.ts`

**Function:** `openAIJsonResponse()` (Line 7-43)

```typescript
const res = await openai.chat.completions.create({
  model: 'gpt-5',
  messages: [
    { role: 'system', content: system },
    ...messages
  ],
  response_format: { 
    type: 'json_schema', 
    json_schema: { 
      name: 'audit_insights', 
      schema: schema,  // ← outputSchema from prompt pack
      strict: true 
    } 
  },
  temperature: 1,
  max_completion_tokens: max_output_tokens,
});

const text = res.choices[0]?.message?.content?.trim() || '{}';
return { text, inputTokens, outputTokens, model };
```

#### 8.4 Parse Response
```typescript
const parsed = JSON.parse(response.text);
return { ...parsed, __traceId: traceId } as TOut;
```

---

### Step 9: Display Results

**File:** `src/components/audit/AuditResults.tsx`

**Component:** `AuditResults` (Line 26-299)

**What it displays:**

1. **Overall Score Card**
   - Grade (A+, A, B, C, D)
   - Score out of 100
   - Sources (e.g., "INSTAGRAM")

2. **KPI Metrics Grid**
   - Total Audience
   - Avg Engagement
   - Reach Rate
   - Avg Shares

3. **Key Strengths**
   ```typescript
   const strengths = data.insights.filter((_, i) => i % 3 === 0).slice(0, 3)
   ```

4. **Recommendations**
   ```typescript
   const recommendations = data.insights.filter((_, i) => i % 3 === 2).slice(0, 3)
   ```

5. **Similar Creators**
   ```typescript
   data.similarCreators.map(creator => ...)
   ```

---

## 2. All OpenAI/GPT API Calls

### Call #1: Audit Insights Generation

**Location:** `src/ai/client.ts` → `openAIJsonResponse()`

**Invoked by:** `src/ai/invoke.ts` → `aiInvoke('audit.insights', { snapshot })`

**Model:** `gpt-5`

**Prompt Structure:**
```typescript
System: "You are a senior brand strategist. Analyze creator performance across platforms, surface crisp insights, risks, and 3–5 recommended moves. Be precise and grounded in the data."

User: "INPUT JSON:\n{snapshot data}\n\nTone: professional, concise, specific, no hype.\nAlways return VALID JSON strictly following the output schema."
```

**Expected Response:**
```json
{
  "headline": "Emerging micro-influencer with authentic engagement",
  "keyFindings": [
    "Small but engaged audience (5 followers)",
    "Content resonates with niche community",
    "Consistent posting pattern"
  ],
  "risks": [
    "Limited reach due to small audience",
    "Growth potential unclear"
  ],
  "moves": [
    {
      "title": "Focus on engagement quality over quantity",
      "why": "Current followers show high engagement rates"
    },
    {
      "title": "Develop content consistency",
      "why": "Build trust with regular posting schedule"
    },
    {
      "title": "Collaborate with similar micro-influencers",
      "why": "Expand reach within niche community"
    }
  ]
}
```

**Current Parameters:**
```typescript
{
  model: 'gpt-5',
  messages: [...],
  response_format: { 
    type: 'json_schema', 
    json_schema: { 
      name: 'audit_insights', 
      schema: {
        type: 'object',
        required: ['headline', 'keyFindings', 'risks', 'moves'],
        properties: {
          headline: { type: 'string' },
          keyFindings: { type: 'array', items: { type: 'string' }, minItems: 3 },
          risks: { type: 'array', items: { type: 'string' } },
          moves: {
            type: 'array',
            items: {
              type: 'object',
              required: ['title', 'why'],
              properties: {
                title: { type: 'string' },
                why: { type: 'string' }
              },
              additionalProperties: false
            },
            minItems: 3,
            maxItems: 6
          }
        },
        additionalProperties: false
      },
      strict: true 
    } 
  },
  temperature: 1,
  max_completion_tokens: 800
}
```

---

### Call #2: Domain Resolution (Contact Discovery)

**Location:** `src/app/api/contacts/resolve-domain/route.ts` (Line 11-26)

**Model:** `gpt-4o`

**Prompt:**
```typescript
messages: [{
  role: 'user',
  content: `What is the primary corporate domain for "${brandName}"? Reply with ONLY the domain (e.g., "nike.com"), nothing else. If uncertain, reply "unknown".`
}]
```

**Parameters:**
```typescript
{
  model: 'gpt-4o',
  messages: [...],
  max_tokens: 50,
  temperature: 0
}
```

**Note:** This uses direct fetch to OpenAI API, NOT the SDK

---

### Call #3: Other AI Invocations (Through aiInvoke)

**File:** `src/ai/invoke.ts`

**Supported Prompt Packs:**
- `audit.insights` - Audit insights generation
- `match.brandSearch` - Brand matching
- `outreach.email` - Email draft generation
- `outreach.mediaPackCopy` - Media pack copy generation

**All use same flow:**
1. Load prompt pack
2. Build messages with few-shots
3. Call `openAIJsonResponse()`
4. Parse and return

---

## 3. Database Schema

### Audit Table

**File:** `prisma/schema.prisma` (Line 106-115)

```prisma
model Audit {
  id           String    @id
  workspaceId  String
  sources      String[]  @default([])
  snapshotJson Json?
  createdAt    DateTime  @default(now())
  Workspace    Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@index([workspaceId, createdAt])
}
```

**Fields:**

| Field | Type | Required | Default | Purpose |
|-------|------|----------|---------|---------|
| `id` | String | ✅ | - | Primary key |
| `workspaceId` | String | ✅ | - | Foreign key to Workspace |
| `sources` | String[] | ❌ | `[]` | Platforms used (e.g., ['INSTAGRAM']) |
| `snapshotJson` | Json | ❌ | `null` | **ALL audit data stored here** |
| `createdAt` | DateTime | ❌ | `now()` | Timestamp |

**snapshotJson Structure:**
```typescript
{
  // Job metadata
  jobId?: string,
  status?: 'queued' | 'running' | 'succeeded' | 'failed',
  provider?: string,
  
  // Audit data (when succeeded)
  audience?: {
    totalFollowers: number,
    avgEngagement: number,
    reachRate: number,
    avgLikes: number,
    avgComments: number,
    avgShares: number,
    topCountries?: string[],
    ageDistribution?: object
  },
  performance?: {
    avgLikes: number,
    avgComments: number,
    avgShares: number
  },
  contentSignals?: string[],
  insights?: string[],  // [headline, ...keyFindings]
  similarCreators?: Array<{ name: string, description: string }>,
  socialSnapshot?: Snapshot,
  
  // Metadata
  metadata?: {
    createdAt: string,
    completedAt?: string,
    failedAt?: string,
    socialAccounts?: string[],
    auditResult?: any,
    error?: string
  }
}
```

**Note:** `snapshotJson` is a flexible JSON field - NO schema enforcement at database level!

---

### AiUsageEvent Table

**File:** `prisma/schema.prisma` (Line 86-105)

```prisma
model AiUsageEvent {
  id            String    @id
  workspaceId   String
  traceId       String
  packKey       String
  provider      String
  model         String
  inputTokens   Int       @default(0)
  outputTokens  Int       @default(0)
  inputCostUsd  Float     @default(0)
  outputCostUsd Float     @default(0)
  totalCostUsd  Float     @default(0)
  dryRun        Boolean   @default(false)
  createdAt     DateTime  @default(now())
  Workspace     Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@index([workspaceId, createdAt])
}
```

**All fields required except defaults.**

**Created by:** `src/services/ai/runtime.ts` → `logAiUsage()`

---

### SocialAccount Table (Instagram OAuth)

**File:** `prisma/schema.prisma`

```prisma
model SocialAccount {
  id              String    @id
  workspaceId     String
  platform        String
  externalId      String    // Instagram User ID
  username        String?
  accessToken     String    // Instagram access token
  refreshToken    String?
  expiresAt       DateTime?
  metadata        Json?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @default(now())
  Workspace       Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@unique([workspaceId, platform])
  @@index([workspaceId])
}
```

---

## 4. Current Error Points & Data Transformation Issues

### Error Point #1: GPT-5 Response Format

**Location:** `src/ai/client.ts` → OpenAI API call

**Issue:** GPT-5 returning `undefined` for required fields

**Expected:**
```json
{
  "headline": "string",
  "keyFindings": ["string1", "string2", "string3"],
  "risks": ["string1"],
  "moves": [
    { "title": "string", "why": "string" },
    { "title": "string", "why": "string" },
    { "title": "string", "why": "string" }
  ]
}
```

**Actually Getting:**
```json
{
  "headline": undefined,
  "keyFindings": undefined,
  "risks": undefined,
  "moves": undefined
}
```

**OR possibly:**
```json
"some text response"  // Not even JSON
```

**Root Cause Analysis Needed:**
1. Is GPT-5 model name valid?
2. Is the schema format correct for GPT-5?
3. Are there additional parameters required?
4. Is the prompt clear enough?

---

### Error Point #2: Defensive Coding (Applied)

**Location:** `src/services/audit/index.ts`

**Protection Added:**

```typescript
// Line 86-89: Database save
insights: [
  insights.headline, 
  ...(Array.isArray(insights.keyFindings) ? insights.keyFindings : [])
].filter(Boolean),  // ✅ Removes undefined

// Line 90-92: Database save
similarCreators: Array.isArray(insights.moves) 
  ? insights.moves.map(move => ({ name: move.title, description: move.why }))
  : [],  // ✅ Safe fallback

// Line 106: Logging
insightsCount: (Array.isArray(insights.keyFindings) ? insights.keyFindings.length : 0) + 1,  // ✅ Safe length

// Line 117-120: Return value
insights: [
  insights.headline,
  ...(Array.isArray(insights.keyFindings) ? insights.keyFindings : [])
].filter(Boolean),  // ✅ Removes undefined

// Line 121-123: Return value
similarCreators: Array.isArray(insights.moves) 
  ? insights.moves.map(move => ({ name: move.title, description: move.why }))
  : [],  // ✅ Safe fallback
```

**Status:** ✅ Applied, but **defensive coding is a band-aid**. We need GPT-5 to return correct format!

---

### Error Point #3: Data Transformation Chain

**The data goes through multiple transformations:**

1. **Instagram API** → Raw Instagram data
   ```typescript
   { id, username, followers_count, media_count, ... }
   ```

2. **Instagram Provider** → Normalized audit data
   ```typescript
   { 
     audience: { size, topGeo, topAge, engagementRate },
     performance: { avgViews, avgLikes, avgComments, avgShares },
     contentSignals: string[]
   }
   ```

3. **Aggregator** → Combined platform data
   ```typescript
   {
     audience: { totalFollowers, avgEngagement, reachRate, ... },
     performance: { avgLikes, avgComments, avgShares },
     contentSignals: string[],
     insights: string[],
     sources: string[]
   }
   ```

4. **Snapshot Builder** → Social snapshot
   ```typescript
   {
     instagram?: { profile, posts, insights },
     youtube?: { ... },
     tiktok?: { ... }
   }
   ```

5. **GPT-5** → AI insights
   ```typescript
   {
     headline: string,
     keyFindings: string[],
     risks: string[],
     moves: Array<{ title, why }>
   }
   ```

6. **Audit Service** → Final audit result
   ```typescript
   {
     auditId: string,
     audience: { totalFollowers, avgEngagement, ... },
     insights: [headline, ...keyFindings],  // ← Merged!
     similarCreators: moves.map(...),       // ← Transformed!
     sources: string[]
   }
   ```

7. **Database** → Stored in snapshotJson
   ```typescript
   snapshotJson: {
     audience: {...},
     performance: {...},
     contentSignals: [...],
     insights: [...],           // ← Array of strings
     similarCreators: [...],    // ← Array of objects
     socialSnapshot: {...}
   }
   ```

8. **API Response** → Returned to client
   ```typescript
   metadata: {
     auditResult: {
       audience: {...},
       insights: [...],
       similarCreators: [...]
     }
   }
   ```

9. **useAuditRunner** → Transforms for UI
   ```typescript
   const transformed = {
     auditId: audit.id,
     sources: audit.sources,
     audience: auditResult.audience,
     insights: auditResult.insights,
     similarCreators: auditResult.similarCreators
   }
   ```

10. **AuditResults Component** → Displays
    ```typescript
    data.insights.map(...)
    data.similarCreators.map(...)
    ```

**Each transformation is a potential error point!**

---

### Error Point #4: Missing Validation Points

**Where validation is MISSING:**

1. **After GPT-5 response** (Line 107 in `src/ai/invoke.ts`)
   ```typescript
   const parsed = JSON.parse(response.text);
   // ❌ No validation that parsed matches AuditInsightsOutput
   // ❌ No check for required fields
   // ❌ No type guard
   ```

2. **After Instagram API calls** (`src/services/audit/providers/instagram.ts`)
   ```typescript
   const info = await igAccountInfo(...)
   // ✅ Has ok/error handling
   // ❌ But assumes data.followers_count exists if ok=true
   ```

3. **In useAuditRunner transform** (`src/components/audit/useAuditRunner.ts`)
   ```typescript
   const transformed = {
     audience: auditResult.audience || { /* defaults */ },
     insights: auditResult.insights || [],
     // ✅ Has fallbacks
     // ❌ But doesn't validate structure
   }
   ```

4. **In AuditResults component** (`src/components/audit/AuditResults.tsx`)
   ```typescript
   data.insights.filter((_, i) => i % 3 === 0)
   // ❌ Assumes insights is array
   // ❌ No validation
   ```

---

## 5. Critical Issues & Recommendations

### Issue #1: GPT-5 Not Returning Expected Format

**Evidence:**
```
🤖 AI Event:
inputTokens: 584
outputTokens: 1  // ← Only 1 token returned!
```

**Expected:** Hundreds of tokens for full insights response

**Actual:** 1 token (likely error or empty response)

**Possible Causes:**
1. ❌ GPT-5 model name invalid (doesn't exist yet)
2. ❌ Schema format incompatible
3. ❌ Temperature restriction (only supports 1)
4. ❌ Response format parameter issues
5. ❌ Prompt not instructing JSON output clearly enough

**Recommendation:**
- **Add logging** to see EXACT GPT-5 response text
- **Fallback to GPT-4o** if GPT-5 doesn't exist
- **Validate response** before parsing

---

### Issue #2: No Response Validation

**Current Code:**
```typescript
const parsed = JSON.parse(response.text);
return { ...parsed, __traceId: traceId } as TOut;
```

**Problems:**
- ❌ No check if `parsed` matches expected schema
- ❌ No validation of required fields
- ❌ Type assertion (`as TOut`) bypasses TypeScript
- ❌ Errors only caught when data is used later

**Recommendation:**
```typescript
const parsed = JSON.parse(response.text);

// Validate required fields
if (!parsed.headline || !Array.isArray(parsed.keyFindings) || !Array.isArray(parsed.moves)) {
  console.error('❌ GPT-5 returned invalid format:', parsed);
  throw new Error('Invalid AI response format');
}

// Validate minimum items
if (parsed.keyFindings.length < 3 || parsed.moves.length < 3) {
  console.error('❌ GPT-5 returned insufficient data:', parsed);
  throw new Error('Insufficient AI insights generated');
}

return { ...parsed, __traceId: traceId } as TOut;
```

---

### Issue #3: Multiple OpenAI Client Instances

**Found:**
1. `src/services/ai/openai.ts` - Creates `new OpenAI({ apiKey })`
2. `src/ai/client.ts` - Creates `new OpenAI({ apiKey })`
3. `src/ai/aiInvoke.ts` - Creates `new OpenAI({ apiKey })`

**Inconsistency:**
- Different configurations
- Different error handling
- Different parameter formats

**Recommendation:**
- Consolidate to single client
- Use consistent parameters
- Centralize error handling

---

### Issue #4: Schema Format Questions

**Current outputSchema:**
```typescript
{
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  required: ['headline', 'keyFindings', 'risks', 'moves'],
  properties: { ... },
  additionalProperties: false
}
```

**Sent to GPT-5 as:**
```typescript
response_format: { 
  type: 'json_schema', 
  json_schema: { 
    name: 'audit_insights', 
    schema: schema,  // ← Entire schema including $schema field
    strict: true 
  } 
}
```

**Question:** Does GPT-5 accept the `$schema` field in the schema? Might need to strip it.

**Recommendation:**
```typescript
const { $schema, ...cleanSchema } = schema;
json_schema: { 
  name: 'audit_insights', 
  schema: cleanSchema,  // ← Without $schema field
  strict: true 
}
```

---

### Issue #5: Fallback Logic Inconsistency

**In `src/services/audit/index.ts` (Line 54-76):**

```typescript
try {
  insights = await aiInvoke('audit.insights', { snapshot });
  console.log('🤖 AI insights generated successfully');
} catch (aiError) {
  console.log('⚠️ AI insights failed, falling back to standard insights:', aiError);
  insights = await buildAuditInsights({}, {
    creator: { name: 'Creator', niche: 'Social Media', country: 'Unknown' },
    audit: { ... }
  });
}
```

**Issue:** Fallback always succeeds, so errors are hidden!

**If GPT-5 returns garbage:**
1. `aiInvoke` might not throw (returns invalid data)
2. Code continues with invalid `insights` object
3. Crashes later when accessing `insights.keyFindings`

**Recommendation:**
- Add validation INSIDE try block
- Throw if GPT-5 response is invalid
- Let fallback handle it

---

## 6. Recommended Fixes (Priority Order)

### Priority 1: Add Response Logging

**File:** `src/ai/client.ts`

**After line 41, add:**
```typescript
const text = res.choices[0]?.message?.content?.trim() || '{}';

console.error('🔴 GPT-5 RAW RESPONSE:', text);
console.error('🔴 GPT-5 RESPONSE LENGTH:', text.length);

return { text, inputTokens, outputTokens, model };
```

**Why:** We need to see EXACTLY what GPT-5 is returning (only 1 token!)

---

### Priority 2: Validate Model Name

**Check if GPT-5 exists:**
- GPT-5 may not be released yet
- Fallback to `gpt-4o` or `gpt-4o-mini`

**File:** `src/config/ai.ts`

```typescript
// Test with known-working model first
export const AI_MODEL = "gpt-4o";  // ← Use this to verify system works

// Then try GPT-5 once confirmed working
// export const AI_MODEL = "gpt-5";
```

---

### Priority 3: Strip $schema from Schema

**File:** `src/ai/client.ts`

**Line 20-39, update:**
```typescript
const { $schema, ...cleanSchema } = schema;

const res = await openai.chat.completions.create({
  model: 'gpt-5',
  messages: [...],
  response_format: { 
    type: 'json_schema', 
    json_schema: { 
      name: 'audit_insights', 
      schema: cleanSchema,  // ← Without $schema field
      strict: true 
    } 
  },
  temperature: 1,
  max_completion_tokens: max_output_tokens,
});
```

---

### Priority 4: Add Response Validation

**File:** `src/ai/invoke.ts`

**After line 106, add:**
```typescript
try {
  const parsed = JSON.parse(response.text);
  
  // Validate for audit.insights specifically
  if (packKey === 'audit.insights') {
    if (!parsed.headline) {
      throw new Error('Missing headline in AI response');
    }
    if (!Array.isArray(parsed.keyFindings) || parsed.keyFindings.length < 3) {
      throw new Error('Invalid keyFindings in AI response');
    }
    if (!Array.isArray(parsed.moves) || parsed.moves.length < 3) {
      throw new Error('Invalid moves in AI response');
    }
  }
  
  // Log AI usage...
  return { ...parsed, __traceId: traceId } as TOut;
} catch (parseError) {
  console.error('❌ Failed to parse AI response:', response.text);
  throw parseError;
}
```

---

### Priority 5: Simplify Prompt Pack Call

**The current flow is complex:**
- `aiInvoke` → `loadPack` → `openAIJsonResponse` → OpenAI API

**Consider simpler approach for debugging:**
```typescript
// Direct call to test GPT-5
const directTest = await openai.chat.completions.create({
  model: 'gpt-4o',  // Use known-working model
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Return JSON with: {"test": "hello", "items": ["a", "b", "c"]}' }
  ],
  response_format: { type: 'json_object' }  // Simple format
});

console.log('Direct test response:', directTest.choices[0]?.message?.content);
```

---

## 7. Debugging Checklist

### Immediate Actions

- [ ] **Add logging** to see GPT-5 raw response text
- [ ] **Check if GPT-5 model exists** (might need to use gpt-4o)
- [ ] **Test with simpler prompt** to isolate issue
- [ ] **Strip $schema** from schema before sending to GPT-5
- [ ] **Add response validation** to catch bad responses early
- [ ] **Review OpenAI SDK docs** for GPT-5 specific requirements

### Testing Strategy

1. **Test Instagram data flow** (✅ Working)
   ```
   ✅ OAuth: Working
   ✅ API calls: graph.instagram.com
   ✅ Data fetch: 5 followers, 2 posts
   ✅ Aggregation: sources: ['INSTAGRAM']
   ```

2. **Test GPT-5 in isolation**
   - Simple prompt
   - Simple schema
   - Verify it returns JSON
   - Check token counts

3. **Test prompt pack loading**
   - Verify `audit.insights` loads
   - Verify schema is correct
   - Verify few-shots are sent

4. **Test end-to-end**
   - Run full audit
   - Check logs at each step
   - Verify data at each transformation

---

## 8. Key Files Reference

### Core Flow Files
| File | Purpose | Lines |
|------|---------|-------|
| `src/app/[locale]/tools/audit/page.tsx` | UI entry point | 91 |
| `src/components/audit/useAuditRunner.ts` | React hook for audit | 104 |
| `src/app/api/audit/run/route.ts` | API endpoint | 435 |
| `src/services/providers/index.ts` | Provider selection | 265 |
| `src/services/audit/index.ts` | Main audit service | 137 |
| `src/services/audit/aggregate.ts` | Data aggregation | 418 |

### Instagram Integration
| File | Purpose | Lines |
|------|---------|-------|
| `src/services/audit/providers/instagram.ts` | Instagram data fetcher | 161 |
| `src/services/instagram/graph.ts` | Instagram Graph API wrappers | 191 |
| `src/services/instagram/store.ts` | Database connection loader | - |
| `src/services/instagram/meta.ts` | OAuth functions | - |

### AI Integration
| File | Purpose | Lines |
|------|---------|-------|
| `src/ai/invoke.ts` | Main AI invocation | 160 |
| `src/ai/client.ts` | OpenAI API wrapper | 44 |
| `src/ai/promptPacks/index.ts` | Prompt pack registry | 26 |
| `src/ai/promptPacks/audit.insights.v1.ts` | Audit prompt definition | 100 |
| `src/services/ai/openai.ts` | Alternative OpenAI wrapper | 143 |
| `src/services/ai/runtime.ts` | Usage logging | 78 |

### UI Display
| File | Purpose | Lines |
|------|---------|-------|
| `src/components/audit/AuditResults.tsx` | Results display | 299 |
| `src/components/audit/AuditConfig.tsx` | Platform selection | 49 |
| `src/components/audit/AuditProgress.tsx` | Loading state | - |

---

## 9. Next Steps

### Immediate (Do Now)
1. ✅ **Filter undefined values** - Applied via `.filter(Boolean)`
2. ✅ **Add defensive coding for moves** - Applied
3. ⚠️ **Add response logging** - NEED THIS NEXT
4. ⚠️ **Verify GPT-5 model exists** - May need fallback to gpt-4o

### Short Term (After Logging)
1. Fix GPT-5 configuration based on actual response
2. Add response validation
3. Strip $schema from schema before sending
4. Test with known-working model (gpt-4o)

### Long Term (After Working)
1. Consolidate OpenAI clients
2. Add comprehensive error boundaries
3. Improve prompt clarity
4. Add retry logic for AI calls
5. Cache successful responses

---

## 10. Success Criteria

### End-to-End Flow Should:
1. ✅ User clicks "Run Audit"
2. ✅ Instagram data fetched (5 followers, 2 posts)
3. ✅ Data aggregated (sources: ['INSTAGRAM'])
4. ✅ Snapshot built with real data
5. ⚠️ GPT-5 generates insights (currently failing)
6. ✅ Insights saved to database
7. ✅ Results displayed in UI

### GPT-5 Response Should:
- Return 100+ tokens (not 1!)
- Include all required fields
- Follow schema exactly
- Be parseable as JSON

### UI Should Display:
- Real follower count (5)
- Real engagement metrics
- AI-generated insights
- Actionable recommendations

---

## 11. Current Logs Analysis

**What's Working:**
```
✅ Aggregator: Using REAL Instagram data!
   followers: 5, avgLikes: 1
   sources: ['INSTAGRAM']

🤖 AI Event:
   provider: "openai"
   promptKey: "audit.insights"
   latencyMs: 59512
```

**What's Failing:**
```
❌ outputTokens: 1  // Should be 100+
❌ insights: [undefined]  // Should be strings
❌ Cannot read properties of undefined (reading 'map')
```

**Analysis:**
- Instagram integration: ✅ Perfect
- Data aggregation: ✅ Working
- GPT-5 call: ⚠️ Responding but returning almost nothing
- Response parsing: ❌ Failing due to undefined values

---

## 12. Conclusion

**The system is 90% working:**
- ✅ Instagram OAuth and data fetch
- ✅ Data aggregation
- ✅ Database operations
- ✅ UI components

**The 10% blocking:**
- ❌ GPT-5 response format (1 token instead of 100+)
- Need to see actual GPT-5 response
- May need to use gpt-4o instead

**Next immediate step:**
Add logging to `src/ai/client.ts` line 41 to see what GPT-5 is actually returning!

```typescript
const text = res.choices[0]?.message?.content?.trim() || '{}';
console.error('🔴🔴🔴 GPT-5 RAW RESPONSE:', text);
console.error('🔴🔴🔴 GPT-5 RESPONSE LENGTH:', text.length);
console.error('🔴🔴🔴 GPT-5 FULL RESPONSE OBJECT:', JSON.stringify(res, null, 2));
```

This will tell us exactly what's happening!

