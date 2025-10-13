# 🗂️ Complete Demo/Mock Data Sources Inventory

**Comprehensive list of ALL files containing demo, mock, or stub data**

---

## 📋 ANSWERS TO YOUR 5 QUESTIONS

### **1. "Marketing SaaS" or "B2B SaaS"**
✅ **NOT FOUND** - No files contain these exact strings  
**Conclusion**: Old demo data has been removed or replaced

### **2. Numbers "510" or "1020"**
✅ **NOT FOUND** - No percentage calculations with these values  
**Conclusion**: These specific calculations don't exist in current code

### **3. ALL Files That Return Audit Results**

**API Routes:**
1. `/src/app/api/audit/run/route.ts` - Runs new audit, stores results
2. `/src/app/api/audit/latest/route.ts` - Returns latest audit for workspace
3. `/src/app/api/audit/get/route.ts` - Returns specific audit by ID
4. `/src/app/api/audit/status/route.ts` - Returns audit job status

**Services:**
5. `/src/services/audit/index.ts` - `runRealAudit()`, `getLatestAudit()`
6. `/src/services/audit/aggregate.ts` - Combines platform data
7. `/src/services/audit/insights.ts` - `buildAuditInsights()` (AI or fallback)
8. `/src/services/audit/stageDetection.ts` - Detects creator stage

**Components:**
9. `/src/components/audit/AuditResults.tsx` - Basic results display
10. `/src/components/audit/EnhancedAuditResults.tsx` - Full results with brandFit
11. `/src/components/audit/useAuditRunner.ts` - Fetch and run audits

**Page:**
12. `/src/app/[locale]/tools/audit/page.tsx` - Audit tool page

### **4. Where "Next Milestones" and "Immediate Actions" Come From**

**AI Prompt Template:**
- `/src/ai/promptPacks/audit.insights.v3.ts` (Lines 138-236)
- Defines JSON schema for AI to generate these fields
- AI generates them based on creator data and stage

**Output Schema:**
```typescript
nextMilestones: {
  type: 'array',
  items: {
    required: ['goal', 'timeframe', 'keyActions'],
    minItems: 2,
    maxItems: 3
  }
}

immediateActions: {
  type: 'array',
  items: {
    required: ['action', 'impact', 'timeframe', 'difficulty'],
    minItems: 3,
    maxItems: 5
  }
}
```

**Fallback Template** (when AI unavailable):
- `/src/services/audit/insights.ts` (Lines 88-103)
- Returns basic template data if AI fails

### **5. ALL Places Demo Data is Defined**

**Listed below in organized categories ↓**

---

## 🎯 DEMO DATA SOURCES (By Category)

### **A. AUDIT DEMO DATA**

#### **1. Instagram Demo Data**
**File**: `/src/services/audit/providers/instagram.ts` (Lines 27-52)
```typescript
if (workspaceId === 'demo-workspace') {
  return {
    audience: {
      size: 156000,
      topGeo: ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany'],
      topAge: ['25-34', '18-24', '35-44'],
      engagementRate: 0.051
    },
    performance: {
      avgViews: 89000,
      avgLikes: 5200,
      avgComments: 780,
      avgShares: 1200
    },
    contentSignals: [...]
  }
}
```

#### **2. Instagram Stub Provider** (Unused fallback)
**File**: `/src/services/audit/providers/instagramStub.ts`
```typescript
// Stub data if Instagram not configured
return {
  audience: { size: 156000, engagementRate: 0.051, ... },
  performance: { avgViews: 89000, avgLikes: 5200, ... },
  contentSignals: ['Visual Storytelling', 'Behind-the-Scenes', ...]
}
```

#### **3. Mock Audit Service** (Global DEMO_MODE)
**File**: `/src/services/providers/mock/audit.mock.ts`
```typescript
// Used when DEMO_MODE env var is true
async runAudit(workspaceId, socialAccounts) {
  return {
    auditId: `audit-${Date.now()}`,
    sources: ['instagram', 'tiktok', 'linkedin'],
    audience: {
      totalFollowers: 45000,
      avgEngagement: 0.038,
      avgLikes: 280,
      avgComments: 35,
      avgShares: 22
    },
    insights: [
      'Video content performs 3x better than images',
      'Best posting times: 9-11 AM and 7-9 PM',
      ...
    ],
    similarCreators: [
      { name: 'TechCreator Pro', platform: 'LinkedIn', ... },
      { name: 'Business Insights', platform: 'Instagram', ... },
      ...
    ]
  }
}
```

#### **4. Other Platform Stubs**
- `/src/services/audit/providers/youtube.ts` - Returns mock YouTube data (125K followers)
- `/src/services/audit/providers/tiktok.ts` - TikTok provider (real only, no stub)
- `/src/services/audit/providers/x.ts` - Returns mock X data (67K followers)
- `/src/services/audit/providers/linkedin.ts` - Returns mock LinkedIn data (8.9K followers)
- `/src/services/audit/providers/facebook.ts` - Returns mock Facebook data (12.5K followers)

---

### **B. BRAND MATCHING DEMO DATA**

#### **5. Demo Brands Database** (NEW - workspace-specific)
**File**: `/src/services/brands/demo-brands.ts`
```typescript
// 22 real brands for demo-workspace
export const DEMO_BRANDS = [
  { id: 'demo-nike', name: 'Nike', score: 92, ... },
  { id: 'demo-glossier', name: 'Glossier', score: 87, ... },
  { id: 'demo-lululemon', name: 'Lululemon', score: 90, ... },
  // ... 19 more
];
```

#### **6. Mock Brands Service** (Global DEMO_MODE)
**File**: `/src/services/providers/mock/brands.mock.ts`
```typescript
// Used when DEMO_MODE env var is true
async getBrandSuggestions() {
  return [
    { id: 'brand-1', name: 'TechFlow Pro', matchScore: 92, ... },
    { id: 'brand-2', name: 'InnovateCorp', matchScore: 88, ... },
    { id: 'brand-3', name: 'Digital Solutions Inc', matchScore: 85, ... }
  ];
}
```

#### **7. Mock Discovery Service** (Global DEMO_MODE)
**File**: `/src/services/providers/mock/discovery.mock.ts`
```typescript
async discoverBrands() {
  return {
    brands: [
      { name: 'TechFlow Pro', matchScore: 92, ... },
      { name: 'FitLife Wellness', matchScore: 88, ... },
      { name: 'Creative Studio Co', matchScore: 85, ... }
    ]
  };
}
```

#### **8. Known Brands Placeholder**
**File**: `/src/services/brands/searchBroker.ts` (Lines 136-148)
```typescript
// Creates "Fashion Co." style brands from keywords
export async function searchKnown(input: BrandSearchInput) {
  return keywords.map((k, i) => ({
    id: `seed:${i}-${k}`,
    name: `${k} Co.`,  // ← "Fashion Co.", "Beauty Co."
    domain: `${k.toLowerCase()}.com`,
    source: 'seed'
  }));
}
```

#### **9. Local Brands Mock** (No external APIs)
**File**: `/src/services/brands/searchBroker.ts` (Lines 106-130)
```typescript
// Fallback if no Google/Yelp API keys
const mock: BrandCandidate[] = [
  { name: 'Bean Orbit Coffee', domain: 'beanorbit.local', ... },
  { name: 'PulseFit Gym', domain: 'pulsefit.local', ... }
];
```

---

### **C. CONTACT DISCOVERY DEMO DATA**

#### **10. Mock Contacts**
**File**: `/src/app/api/contacts/discover/route.ts` (Lines 202-223)
```typescript
function mockContacts(params: any) {
  const base = [
    ['Alex Patel', 'Head of Influencer Marketing', 'Head', 'VALID', 98, ...],
    ['Morgan Lee', 'Brand Partnerships Manager', 'Manager', 'VALID', 92, ...],
    ['Jamie Chen', 'Social Media Lead', 'Lead', 'RISKY', 80, ...],
    ['Taylor Kim', 'Director, Brand', 'Director', 'VALID', 90, ...],
    ['Jordan Fox', 'VP Growth', 'VP', 'INVALID', 60, ...]
  ];
  
  return base.map((b, i) => ({
    id: `${params.domain}-${i}`,
    name: b[0],
    title: b[1],
    email: `${b[0].toLowerCase().replace(' ','')}@${params.domain}`,
    ...
  }));
}
```

---

### **D. DASHBOARD DEMO DATA**

#### **11. Dashboard Summary Demo**
**File**: `/src/app/api/dashboard/summary/route.ts` (Lines 18-30)
```typescript
if (workspaceId === 'demo-workspace') {
  return {
    totalDeals: 24,
    activeOutreach: 8,
    responseRate: 0.68,
    avgDealValue: 2400,
    deltas: { deals: 0.12, outreach: 0.03, response: -0.05, adv: 0.18 }
  };
}
```

---

### **E. EMAIL DEMO DATA**

#### **12. Mock Email Service**
**File**: `/src/services/providers/mock/email.mock.ts`
```typescript
async sendEmail(to, subject, html) {
  return {
    messageId: `mock-${Date.now()}`,
    status: 'sent',
    to: [to],
    timestamp: new Date().toISOString()
  };
}
```

---

### **F. MEDIA PACK DEMO DATA**

#### **13. Mock Media Pack Service**
**File**: `/src/services/providers/mock/mediaPack.mock.ts`
- Generates mock media pack URLs
- Returns demo PDF data

#### **14. Demo Media Pack Data**
**File**: `/src/lib/mediaPack/demoData.ts`
- Creator demo data
- Brand demo data
- Stats demo data

---

### **G. AGENCY DEMO DATA**

#### **15. Agency List Demo**
**File**: `/src/app/api/agency/list/route.ts` (Lines 55-73, 152-159, 235-241)
```typescript
if (workspaceId === 'demo-workspace') {
  return {
    items: [{
      id: 'demo-agency-1',
      email: 'demo@agency.example.com',
      role: 'VIEWER',
      grantedAt: new Date().toISOString()
    }]
  };
}
```

---

### **H. CREDITS DEMO DATA**

#### **16. Credits Bypass**
**File**: `/src/services/credits.ts` (Lines 7-10, 47-50)
```typescript
// Bypass for demo workspace
if (workspaceId === 'demo-workspace') {
  return; // Skip deduction
}

// Unlimited credits
if (workspaceId === 'demo-workspace') {
  return 999999;
}
```

---

## 📊 DEMO DATA CONTROL MECHANISMS

### **Workspace-Specific (Recommended Pattern):**
✅ Uses `workspaceId === 'demo-workspace'` check  
✅ Only affects demo user  
✅ Real users completely isolated  

**Used by:**
1. ✅ Instagram audit provider
2. ✅ Dashboard summary
3. ✅ Credits system
4. ✅ Agency list API
5. ✅ Brand match search (NEW)

### **Global Feature Flag (DEMO_MODE env var):**
⚠️ Affects ALL users when enabled  
⚠️ Should only be used in development  

**Used by:**
1. ⚠️ Provider selection (`/src/services/providers/index.ts`)
   - If `DEMO_MODE=true`: ALL users get mock providers
   - If `DEMO_MODE=false`: ALL users get real providers

### **Global Feature Flag (Per-feature):**
⚠️ Feature-specific demo modes  

**Used by:**
1. ⚠️ `NEXT_PUBLIC_CONTACTS_DEMO_MODE` - Contact discovery mock data

---

## 🎯 WHERE "NEXT MILESTONES" & "IMMEDIATE ACTIONS" COME FROM

### **Source: AI Generation (GPT-5)**

**Template Defined In**:
- `/src/ai/promptPacks/audit.insights.v3.ts` (Lines 138-236)

**How It Works**:
1. AI receives: Creator stage info + social snapshot
2. AI generates: JSON matching output schema
3. Schema requires:
   - `nextMilestones` array (2-3 items)
   - `immediateActions` array (3-5 items)
4. AI creates stage-appropriate content

**Example AI Output**:
```json
{
  "nextMilestones": [
    {
      "goal": "Reach 200K followers",
      "timeframe": "6 months",
      "keyActions": [
        "Post 5x per week consistently",
        "Collaborate with 2-3 similar creators",
        "Launch signature content series"
      ]
    }
  ],
  "immediateActions": [
    {
      "action": "Optimize posting times to 9-11 AM",
      "impact": "High - 30% engagement boost potential",
      "timeframe": "This week",
      "difficulty": "Easy"
    }
  ]
}
```

**Fallback Template** (if AI unavailable):
- `/src/services/audit/insights.ts` (Lines 90-103)
- Returns generic template without these fields

---

## 📂 COMPLETE FILE LIST

### **Demo Data Files (20 total):**

**Workspace-Specific (Correct Pattern):**
1. `/src/services/audit/providers/instagram.ts` - Demo Instagram data
2. `/src/services/brands/demo-brands.ts` - Demo brand database (22 brands)
3. `/src/app/api/dashboard/summary/route.ts` - Demo dashboard stats
4. `/src/app/api/agency/list/route.ts` - Demo agency data
5. `/src/services/credits.ts` - Demo credit bypass

**Global Mock Services (DEMO_MODE flag):**
6. `/src/services/providers/mock/audit.mock.ts`
7. `/src/services/providers/mock/brands.mock.ts`
8. `/src/services/providers/mock/discovery.mock.ts`
9. `/src/services/providers/mock/ai.mock.ts`
10. `/src/services/providers/mock/email.mock.ts`
11. `/src/services/providers/mock/mediaPack.mock.ts`
12. `/src/services/providers/index.ts` - Provider selection logic

**Platform Stubs (No API keys):**
13. `/src/services/audit/providers/instagramStub.ts`
14. `/src/services/audit/providers/youtube.ts`
15. `/src/services/audit/providers/x.ts`
16. `/src/services/audit/providers/linkedin.ts`
17. `/src/services/audit/providers/facebook.ts`

**Utility/Placeholders:**
18. `/src/services/brands/searchBroker.ts` - "Fashion Co." generation
19. `/src/app/api/contacts/discover/route.ts` - mockContacts() function
20. `/src/lib/mediaPack/demoData.ts` - Media pack demo data

---

## 🔍 DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────┐
│ User runs audit/matches/etc.            │
└──────────────┬──────────────────────────┘
               │
               ↓
       ┌───────────────┐
       │ Check workspace│
       │ ID             │
       └───┬───────┬───┘
           │       │
    'demo- │       │ UUID
 workspace'│       │
           │       │
           ↓       ↓
   ┌───────────┐ ┌──────────────┐
   │ Return    │ │ Check global │
   │ demo data │ │ DEMO_MODE    │
   │ (156K,    │ │ flag         │
   │ Nike,     │ └──┬────────┬──┘
   │ etc.)     │    │        │
   └───────────┘    │ TRUE   │ FALSE
        ↓           │        │
       END          ↓        ↓
              ┌─────────┐ ┌────────┐
              │ Return  │ │ Return │
              │ mock    │ │ real   │
              │ data    │ │ data   │
              │ (45K,   │ │ (user's│
              │ TechFlow│ │ actual)│
              │ Pro)    │ └────────┘
              └─────────┘      ↓
                   ↓          END
                  END
```

---

## ✅ CURRENT STATUS (After Our Fixes)

### **Demo Workspace (`'demo-workspace'`):**
- ✅ Audit: 156K followers (impressive)
- ✅ Brands: Nike, Glossier, Lululemon (22 real brands)
- ✅ Dashboard: 24 deals, 8 outreach
- ✅ Credits: Unlimited
- ✅ Agency: Mock agency access

### **Real Users (UUID workspace):**
- ✅ Audit: Their actual Instagram data
- ✅ Brands: Real search results OR empty state with guidance
- ✅ Dashboard: Their actual deal count (0 initially)
- ✅ Credits: 10 starter credits, then actual balance
- ✅ Agency: Real agency queries

### **Global DEMO_MODE (Environment Variable):**
- ⚠️ Should be FALSE in production
- ⚠️ If TRUE: All users get mock data (not workspace-specific)
- ⚠️ Only use in development/testing

---

## 🎯 RECOMMENDATION

**Current implementation is CORRECT!** ✅

**Demo data hierarchy**:
1. ✅ **Best**: Workspace-specific (`workspaceId === 'demo-workspace'`)
2. ⚠️ **OK**: Global flag (DEMO_MODE) - dev only
3. ✅ **Acceptable**: Fallback stubs (when APIs unavailable)

**No old "Marketing SaaS" or "B2B SaaS" data found** - likely cleaned up already!

---

## 📋 FILES INVOLVED IN AUDIT DISPLAY

**Complete audit display chain:**

1. **Page**: `/src/app/[locale]/tools/audit/page.tsx`
   - Renders audit UI
   - Chooses Enhanced vs Basic results

2. **Hook**: `/src/components/audit/useAuditRunner.ts`
   - Fetches audit data
   - Manages run state
   - Calls `/api/audit/run` and `/api/audit/latest`

3. **Components**:
   - `/src/components/audit/AuditResults.tsx` - Basic display
   - `/src/components/audit/EnhancedAuditResults.tsx` - Full display with brandFit

4. **API Routes**:
   - `/src/app/api/audit/run/route.ts` - Run audit
   - `/src/app/api/audit/latest/route.ts` - Get latest
   - `/src/app/api/audit/get/route.ts` - Get by ID

5. **Services**:
   - `/src/services/audit/index.ts` - Main audit orchestration
   - `/src/services/audit/aggregate.ts` - Combine platform data
   - `/src/services/audit/insights.ts` - Generate insights
   - `/src/services/audit/stageDetection.ts` - Detect stage

6. **AI**:
   - `/src/ai/promptPacks/audit.insights.v3.ts` - AI prompt template
   - `/src/ai/invoke.ts` - Call AI

7. **Providers**:
   - `/src/services/audit/providers/instagram.ts` - Instagram data

---

**All demo data sources documented!** Complete inventory above! ✅

