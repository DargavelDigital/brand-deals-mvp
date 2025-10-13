# 🔍 BRAND RUN SYSTEM ANALYSIS

Complete analysis of how contacts page loads approved brands and brand run management.

---

## 1️⃣ **HOW CONTACTS PAGE LOADS APPROVED BRANDS**

### **File**: `/src/components/contacts/DiscoverContactsPage.tsx`

**Location**: Lines 316-331 (inside `useEffect`)

**API Call**:
```typescript
const res = await fetch(`/api/brand-run/current?workspaceId=${wsid}`);

if (!res.ok) {
  console.log('⚠️ No BrandRun found - user should approve brands first');
  return;
}

const runData = await res.json();
const selectedBrandIds = runData.data?.selectedBrandIds || runData.selectedBrandIds || [];

console.log('📞 Found', selectedBrandIds.length, 'approved brands');

// Get full brand objects from runSummaryJson
const brands = runData.data?.runSummaryJson?.brands || 
               runData.runSummaryJson?.brands || [];

setApprovedBrands(brands);
```

**Data Flow**:
```
1. Fetch /api/brand-run/current?workspaceId={wsid}
   ↓
2. Extract selectedBrandIds from response
   ↓
3. Extract full brand objects from runSummaryJson.brands
   ↓
4. Set approvedBrands state
   ↓
5. User can select brands for contact discovery
```

**What's stored in runSummaryJson.brands**:
```json
{
  "brands": [
    {
      "id": "ai-international-0",
      "name": "Nike",
      "domain": "nike.com",
      "industry": "Sportswear",
      "score": 91,
      "rationale": "...",
      "pitchIdea": "..."
    }
  ]
}
```

---

## 2️⃣ **BRAND RUN API ENDPOINTS**

### **Directory**: `/src/app/api/brand-run/`

**Available Endpoints**:

1. **GET /api/brand-run/current**
   - File: `current/route.ts`
   - Purpose: Get the latest BrandRun for a workspace
   - Returns: BrandRun data with selectedBrandIds and runSummaryJson
   - Auto-detects workspaceId from session if not in query params

2. **POST /api/brand-run/start**
   - File: `start/route.ts`
   - Purpose: Start a new brand run (checks if one exists first)
   - Creates: New BrandRun via upsert endpoint
   - Returns: `{ ok: true, redirect: '/brand-run' }`

3. **POST /api/brand-run/upsert**
   - File: `upsert/route.ts`
   - Purpose: Create or update BrandRun
   - Updates: step, selectedBrandIds, runSummaryJson, updatedAt
   - Returns: Updated BrandRun data

4. **POST /api/brand-run/advance**
   - File: `advance/route.ts`
   - Purpose: Advance workflow to next step
   - Updates: step field (MATCHES → CONTACTS → PACK → OUTREACH)

5. **POST /api/brand-run/one-touch**
   - File: `one-touch/route.ts`
   - Purpose: One-touch brand run workflow
   - Creates: Full workflow in one API call

**❌ MISSING**:
- **DELETE /api/brand-run/current** - Does NOT exist!
- **DELETE /api/brand-run/{id}** - Does NOT exist!

---

## 3️⃣ **HOW TO DELETE A BRAND RUN**

### **❌ NO DELETE ENDPOINT EXISTS**

**Current options**:

**Option A: Direct Database Delete (NOT RECOMMENDED)**
```sql
DELETE FROM "BrandRun" WHERE workspaceId = 'workspace-id';
```

**Option B: Upsert with Empty Data (HACK)**
```typescript
await fetch('/api/brand-run/upsert', {
  method: 'POST',
  body: JSON.stringify({
    workspaceId: wsid,
    step: 'MATCHES',
    selectedBrandIds: [],
    runSummaryJson: null
  })
});
```
This resets the run but doesn't delete it.

**Option C: Create DELETE Endpoint (RECOMMENDED)**
```typescript
// New file: /src/app/api/brand-run/delete/route.ts
export async function DELETE(request: NextRequest) {
  const workspaceId = await getWorkspaceId(request);
  
  // Delete all brand runs for workspace
  await prisma().brandRun.deleteMany({
    where: { workspaceId }
  });
  
  return NextResponse.json({ ok: true, deleted: true });
}
```

---

## 4️⃣ **BRANDRUN TABLE STRUCTURE**

### **Prisma Schema**: `prisma/schema.prisma` (Lines 215-229)

```prisma
model BrandRun {
  id               String             @id
  workspaceId      String
  step             String             // Current step: MATCHES, CONTACTS, PACK, OUTREACH
  auto             Boolean            @default(false)
  selectedBrandIds String[]           @default([])  // Array of brand IDs
  createdAt        DateTime           @default(now())
  updatedAt        DateTime
  runSummaryJson   Json?              // Stores full brand & contact data
  stepStatuses     Json?
  Workspace        Workspace          @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  RunStepExecution RunStepExecution[]

  @@index([workspaceId, step])
}
```

**Fields**:
- **id**: Unique run ID (format: `run_{workspaceId}_{timestamp}`)
- **workspaceId**: Foreign key to Workspace
- **step**: Current workflow step (`MATCHES`, `CONTACTS`, `PACK`, `OUTREACH`)
- **auto**: Boolean flag for auto-run mode
- **selectedBrandIds**: Array of approved brand IDs
- **runSummaryJson**: JSON blob with full brand and contact data
- **stepStatuses**: JSON blob tracking step completion
- **RunStepExecution**: Related execution logs

**Cascade Delete**: ✅ Yes
- `onDelete: Cascade` means deleting a Workspace deletes all BrandRuns
- Deleting a BrandRun also deletes related RunStepExecution records

---

## 🔄 **WORKFLOW DATA FLOW**

### **Step-by-Step**:

**1. Brand Matching** (Matches page):
```typescript
// User approves brands
selectedBrandIds = ['ai-international-0', 'ai-national-2', ...]

// Save to BrandRun
POST /api/brand-run/upsert
{
  step: 'MATCHES',
  selectedBrandIds: ['ai-international-0', ...],
  runSummaryJson: {
    brands: [
      { id: 'ai-international-0', name: 'Nike', ... }
    ]
  }
}
```

**2. Contact Discovery** (Contacts page):
```typescript
// Load approved brands
GET /api/brand-run/current?workspaceId={wsid}
→ Returns: { data: { selectedBrandIds: [...], runSummaryJson: { brands: [...] } } }

// Extract brands
const brands = runData.runSummaryJson.brands
setApprovedBrands(brands)

// User searches for contacts
// User selects contacts
// Save contacts and advance

POST /api/brand-run/upsert
{
  step: 'CONTACTS',
  selectedBrandIds: [...],
  runSummaryJson: {
    brands: [...],
    contacts: [
      { id: 'contact-1', name: 'Alex Patel', email: '...', brandId: '...' }
    ]
  }
}

POST /api/brand-run/advance
→ Advances step to 'PACK'
```

**3. Media Pack** (Pack page):
```typescript
// Load approved brands from BrandRun
GET /api/brand-run/current?workspaceId={wsid}
→ Returns brands for media pack generation
```

**4. Outreach** (Outreach page):
```typescript
// Load contacts and brands from BrandRun
GET /api/brand-run/current?workspaceId={wsid}
→ Returns full workflow data for outreach
```

---

## 🗑️ **SAFE DELETION METHODS**

### **Method 1: Delete by Workspace (CASCADE)**
```sql
-- Delete workspace (cascades to BrandRun)
DELETE FROM "Workspace" WHERE id = 'workspace-id';
```
**Effect**: Deletes workspace AND all brand runs

### **Method 2: Delete All Runs for Workspace**
```sql
DELETE FROM "BrandRun" WHERE workspaceId = 'workspace-id';
```
**Effect**: Deletes all brand runs but keeps workspace

### **Method 3: Delete Specific Run**
```sql
DELETE FROM "BrandRun" WHERE id = 'run_workspace_timestamp';
```
**Effect**: Deletes one specific brand run

### **Method 4: Prisma (Recommended)**
```typescript
// Delete all runs for workspace
await prisma().brandRun.deleteMany({
  where: { workspaceId: 'workspace-id' }
});

// Or delete specific run
await prisma().brandRun.delete({
  where: { id: 'run_id' }
});
```

---

## 📋 **RECOMMENDED: CREATE DELETE ENDPOINT**

### **Missing Endpoint**: `DELETE /api/brand-run/current`

**Should**:
1. Get workspaceId from session
2. Delete all BrandRuns for that workspace
3. Return success confirmation

**Implementation**:
```typescript
// File: /src/app/api/brand-run/current/route.ts
export async function DELETE(request: NextRequest) {
  const auth = await requireSessionOrDemo(request);
  const workspaceId = auth?.workspaceId || (typeof auth === 'string' ? auth : null);
  
  if (!workspaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Delete all brand runs for this workspace
  const result = await prisma().brandRun.deleteMany({
    where: { workspaceId }
  });
  
  return NextResponse.json({ 
    ok: true, 
    deleted: result.count,
    message: `Deleted ${result.count} brand run(s)`
  });
}
```

**Usage**:
```typescript
// In UI:
const resetBrandRun = async () => {
  const res = await fetch('/api/brand-run/current', {
    method: 'DELETE'
  });
  
  if (res.ok) {
    console.log('Brand run deleted');
    // Redirect to matches page to start over
    router.push('/tools/matches');
  }
};
```

---

## 🚨 **CURRENT ISSUES**

### **Issue 1: No Delete Endpoint**
- Users can't reset their brand run
- Old runs accumulate in database
- No way to start fresh from UI

### **Issue 2: Demo Workspace Fallback**
```typescript
// In current/route.ts (lines 22-36)
// In upsert/route.ts (lines 31-45)

// Creates 'demo-workspace' as fallback
const demoWorkspace = await prisma().workspace.upsert({
  where: { slug: 'demo-workspace' },
  update: {},
  create: { 
    name: 'Demo Workspace', 
    slug: 'demo-workspace' 
  }
});
```
**Problem**: This recreates demo workspace even though we deleted demo mode!

### **Issue 3: Mock Contact Data**
```typescript
// In useContactDiscovery.ts (lines 7-27)
function mockContacts(p: DiscoveryParams): ContactHit[] {
  const base = [
    ['Alex Patel','Head of Influencer Marketing','Head','VALID',98,'LinkedIn + Email Verification'],
    ['Morgan Lee','Brand Partnerships Manager','Manager','VALID',92,'Company + Verify'],
    ['Jamie Chen','Social Media Lead','Lead','RISKY',80,'LinkedIn'],
    ['Taylor Kim','Director, Brand','Director','VALID',90,'LinkedIn'],
    ['Jordan Fox','VP Growth','VP','INVALID',60,'Guess'],
  ] // ❌ FAKE CONTACTS!
}

// Lines 58-59, 66, 71
// Fallback to mock data if API fails
setResults(mockContacts(params))
```
**Problem**: Still returns fake contacts if API fails!

---

## 🎯 **RECOMMENDED FIXES**

**1. Create DELETE endpoint** for brand-run/current

**2. Remove demo workspace fallback** from current/route.ts and upsert/route.ts

**3. Remove mockContacts() fallback** from useContactDiscovery.ts
   - Return empty array with error message instead
   - Never show fake contacts (Alex Patel, Morgan Lee, etc.)

**4. Add "Reset Brand Run" button** in UI
   - Calls DELETE endpoint
   - Redirects to /tools/matches to start fresh

---

**Would you like me to implement these fixes?** 🔧

