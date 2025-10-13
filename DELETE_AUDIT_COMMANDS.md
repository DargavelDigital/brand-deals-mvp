# 🗑️ Delete Failed Audit & Run Fresh One

**Commands to run in browser console on /tools/audit page:**

---

## 🧪 **STEP 1: DELETE ALL AUDITS FOR YOUR WORKSPACE**

```javascript
// Delete all audits for current user's workspace
const deleteResponse = await fetch('/api/admin/delete-audits', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' }
});

const deleteResult = await deleteResponse.json();
console.log('Delete result:', deleteResult);
```

**OR use database query directly:**

```sql
-- Find your workspace ID first
SELECT id, name, slug FROM "Workspace" 
WHERE id != 'demo-workspace' 
ORDER BY "createdAt" DESC 
LIMIT 5;

-- Delete audits for your workspace (replace YOUR_WORKSPACE_ID)
DELETE FROM "Audit" 
WHERE "workspaceId" = 'YOUR_WORKSPACE_ID';
```

---

## 🚀 **STEP 2: RUN FRESH AUDIT**

```javascript
// After deleting, run a fresh audit
const runResponse = await fetch('/api/audit/run', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    socialAccounts: ['instagram'],
    provider: 'instagram'  // ← Explicitly set provider
  })
});

const runResult = await runResponse.json();
console.log('Audit run result:', runResult);

// Wait a few seconds, then fetch latest
setTimeout(async () => {
  const latestResponse = await fetch('/api/audit/latest');
  const latest = await latestResponse.json();
  console.log('Latest audit:', latest);
}, 3000);
```

---

## ✅ **RECOMMENDED: CREATE DELETE API ROUTE**

Create: `/src/app/api/audit/delete/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    const { workspaceId } = await requireSessionOrDemo(request);
    
    if (!workspaceId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get audit ID from query params (optional - delete specific audit)
    const { searchParams } = new URL(request.url);
    const auditId = searchParams.get('id');

    if (auditId) {
      // Delete specific audit
      await prisma().audit.delete({
        where: { 
          id: auditId,
          workspaceId  // Ensure user owns this audit
        }
      });
      
      return NextResponse.json({ 
        ok: true, 
        message: 'Audit deleted',
        auditId 
      });
    } else {
      // Delete ALL audits for this workspace
      const result = await prisma().audit.deleteMany({
        where: { workspaceId }
      });
      
      return NextResponse.json({ 
        ok: true, 
        message: 'All audits deleted',
        count: result.count 
      });
    }
  } catch (error) {
    console.error('Delete audit error:', error);
    return NextResponse.json(
      { error: 'Failed to delete audit' },
      { status: 500 }
    );
  }
}
```

Then use:
```javascript
// Delete all audits
await fetch('/api/audit/delete', { method: 'DELETE' });

// Delete specific audit
await fetch('/api/audit/delete?id=AUDIT_ID', { method: 'DELETE' });
```

---

## 🎯 **QUICK FIX (NO CODE NEEDED):**

**Just run this in browser console on /tools/audit:**

```javascript
// 1. Clear local state
localStorage.clear();
sessionStorage.clear();

// 2. Refresh page
window.location.reload();

// 3. After reload, run new audit with correct provider:
const run = await fetch('/api/audit/run', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    socialAccounts: ['instagram'],
    provider: 'instagram'  // ← Explicitly set
  })
});

console.log('Fresh audit:', await run.json());
```

That should give you a clean audit with correct provider! ✅

