# AUTH SYSTEM AUDIT REPORT
**Date**: October 11, 2025  
**Purpose**: Document authentication system for admin portal development  
**Status**: ✅ Auth system analysis complete

---

## EXECUTIVE SUMMARY

**Auth Provider**: NextAuth.js v4.24.11 ✅  
**Auth Strategy**: JWT-based sessions  
**User Model**: Prisma (PostgreSQL)  
**Role System**: **DUAL SYSTEM** ⚠️  
**Admin System**: ✅ Already exists with separate Admin table  

---

## PART 1: AUTH PROVIDER

### NextAuth.js Configuration

**Provider**: `next-auth@4.24.11`  
**Config File**: `src/lib/auth/nextauth-options.ts`  
**API Route**: `src/app/api/auth/[...nextauth]/route.ts`

**Auth Methods**:
1. ✅ Google OAuth
2. ✅ Credentials (email-based, no password validation - demo mode)
3. ✅ Demo user: `creator@demo.local`

**Session Strategy**: JWT (no database sessions)

---

## PART 2: USER MODEL & DATABASE SCHEMA

### User Table (Prisma)

**Location**: `prisma/schema.prisma` (lines 935-949)

```prisma
model User {
  id            String     @id
  name          String?
  email         String?    @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime
  Account       Account[]
  Session       Session[]
  Membership    Membership[]
  ActivityLog   ActivityLog[]
  AiFeedback    AiFeedback[]
}
```

**Fields**:
- `id`: String (UUID)
- `email`: String (unique, optional)
- `name`: String (optional)
- `image`: String (optional)
- ❌ **NO ROLE FIELD ON USER TABLE**

---

### Membership Table (Workspace Roles)

**Location**: `prisma/schema.prisma` (lines 667-682)

```prisma
model Membership {
  id          String    @id
  userId      String
  workspaceId String
  role        Role      @default(MEMBER)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime
  invitedById String?
  User        User      @relation(...)
  Workspace   Workspace @relation(...)
  
  @@unique([userId, workspaceId])
}

enum Role {
  OWNER
  MANAGER
  MEMBER
  VIEWER
}
```

**Key Points**:
- ✅ Roles are per-workspace (multi-tenant)
- ✅ Enum values: OWNER, MANAGER, MEMBER, VIEWER
- ✅ One membership per user per workspace

---

### Admin Table (Separate Admin System)

**Location**: `prisma/schema.prisma` (lines 47-54)

```prisma
model Admin {
  id                   String                 @id
  email                String                 @unique
  role                 AdminRole              @default(SUPPORT)
  createdAt            DateTime               @default(now())
  AuditLog             AuditLog[]
  ImpersonationSession ImpersonationSession[]
}

enum AdminRole {
  SUPER
  SUPPORT
}
```

**Key Points**:
- ✅ Separate Admin table (not in User table)
- ✅ Admin identified by email
- ✅ Two admin roles: SUPER, SUPPORT
- ✅ Tracks audit logs and impersonation

---

## PART 3: ROLE SYSTEM - DUAL IMPLEMENTATION ⚠️

### System 1: AppRole (hasRole.ts)

**File**: `src/lib/auth/hasRole.ts`

```typescript
export type AppRole = 'creator' | 'agency' | 'superuser';

export function getRole(session: any): AppRole {
  const role = session?.user?.role ?? session?.role ?? 'creator';
  if (role === 'agency' || role === 'superuser') return role;
  return 'creator';
}

export function hasRole(session: any, allowed: AppRole[] = ['creator']): boolean {
  const role = getRole(session);
  return allowed.includes(role);
}
```

**Usage**: Navigation filtering, quick role checks  
**Problem**: ⚠️ Doesn't match database schema (no role on User table)

---

### System 2: UserWorkspaceRole (types.ts)

**File**: `src/lib/auth/types.ts`

```typescript
export type UserWorkspaceRole = 'OWNER' | 'MANAGER' | 'MEMBER' | 'VIEWER';

export type AuthContext = {
  user: SessionUser;
  workspaceId: string;
  role: UserWorkspaceRole;  // ← From Membership table
  isDemo: boolean;
};
```

**Usage**: Workspace-specific permissions  
**Matches**: ✅ Prisma schema Role enum

---

### ⚠️ ISSUE: Conflicting Role Systems

**Two different AppRole definitions**:
1. `hasRole.ts`: `'creator' | 'agency' | 'superuser'`
2. `types.ts`: `'owner' | 'manager' | 'member' | 'viewer'` (legacy)

**Actual database**: `Role enum { OWNER, MANAGER, MEMBER, VIEWER }`

**Navigation currently uses**: `'creator' | 'agency' | 'superuser'` (hasRole.ts)

**Recommendation**: 
- Navigation filtering works but doesn't map to actual database roles
- Need to either:
  1. Add role field to session from Membership table
  2. Or use separate admin check (existing Admin table)

---

## PART 4: CURRENT USER ACCESS

### Client-Side

**Method**: `useSession()` from `next-auth/react`

```typescript
import { useSession } from 'next-auth/react';

const { data: session } = useSession();
// session.user.email
// session.user.workspaceId
// session.user.role (may not exist!)
```

**Example**: `src/components/shell/SidebarNav.tsx` (line 22)

---

### Server-Side

**Method**: `getServerSession()` from `next-auth`

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-options';

const session = await getServerSession(authOptions);
// session.user.email
// session.user.workspaceId
```

**Examples**:
- `src/lib/auth/requireSession.ts` - Session verification
- `src/lib/auth/requireSessionOrDemo.ts` - Session or demo fallback

---

### Helper Functions

**1. requireSession(req)** - API route protection
```typescript
const { ok, session } = await requireSession(req);
if (!ok) return response;
```

**2. requireRole(req, allowedRoles)** - Role-based protection
```typescript
const { ok, session } = await requireRole(req, ['superuser']);
if (!ok) return forbidden;
```

**3. requireAdmin()** - Admin portal protection
```typescript
const admin = await requireAdmin();
// Returns Admin record from database
```

---

## PART 5: EXISTING ADMIN IMPLEMENTATION ✅

### Admin Guard System

**File**: `src/lib/admin/guards.ts`

**Method**: `requireAdmin()`

```typescript
export async function requireAdmin() {
  const h = await headers()
  const cookieStore = await cookies()
  const adminEmail = h.get('x-admin-email') || cookieStore.get('admin_email')?.value
  
  if (!adminEmail) throw new Error('ADMIN_REQUIRED')
  
  const admin = await prisma().admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, role: 'SUPER' },
  })
  
  return admin
}
```

**How It Works**:
- Checks for `x-admin-email` header OR `admin_email` cookie
- Upserts Admin record (creates if doesn't exist)
- Returns Admin object with role (SUPER or SUPPORT)

**Security**: ⚠️ Dev-friendly (auto-creates admin) - Should be hardened for production

---

### Existing Admin Pages

**Route Group**: `src/app/(admin)/admin/`  
**Layout**: `src/app/(admin)/admin/layout.tsx`

**Pages Available**:
1. ✅ `/admin` - Admin home (lists recent workspaces)
2. ✅ `/admin/workspaces/[id]` - Workspace details
3. ✅ `/admin/runs/[runId]` - Run inspection
4. ✅ `/admin/errors` - Error logs
5. ✅ `/admin/telemetry` - Telemetry data
6. ✅ `/admin/compliance` - Compliance dashboard

**All protected with**: `await requireAdmin()` at top of each page

---

### Admin API Routes

**Routes**:
1. ✅ `/api/admin/runs/[runId]/steps` - Get run steps
2. ✅ `/api/admin/runs/[runId]/steps/[stepExecId]/replay` - Replay step
3. ✅ `/api/admin/impersonate` - User impersonation

**All protected with**: `requireAdmin()` or custom admin checks

---

## PART 6: ROLE CHECKING IN NAVIGATION

### Current Implementation

**File**: `src/components/shell/SidebarNav.tsx`

```typescript
import { useSession } from 'next-auth/react';
import { getRole } from '@/lib/auth/hasRole';

const { data: session } = useSession();
const role = getRole(session); // Returns: 'creator' | 'agency' | 'superuser'

// Filter nav items by role
filterNavForRole(group.items, role)
```

**Problem**: ⚠️ `getRole()` looks for `session.user.role`, but:
- User table has NO role field
- Session JWT may not have role attached
- Defaults to 'creator' if not found

**Admin Nav Item**:
```typescript
{ 
  href: '/admin', 
  label: 'Admin Console', 
  icon: 'Shield', 
  allowedRoles: ['superuser']  // ← Won't match unless session.user.role === 'superuser'
}
```

**Issue**: Admin Console link won't show unless user has `role: 'superuser'` in their session

---

## FINDINGS SUMMARY

### ✅ What Exists

1. **NextAuth.js Setup** - Fully configured with Google + Credentials
2. **User Table** - Standard NextAuth schema (no role field)
3. **Membership Table** - Workspace roles (OWNER, MANAGER, MEMBER, VIEWER)
4. **Admin Table** - Separate admin system with AdminRole enum
5. **Admin Pages** - 6 admin pages already built in `(admin)` route group
6. **Admin Guard** - `requireAdmin()` function for server-side protection
7. **Role Helpers** - `getRole()`, `hasRole()`, `requireRole()` functions

### ⚠️ Issues & Gaps

1. **Conflicting Role Types**:
   - hasRole.ts: `'creator' | 'agency' | 'superuser'`
   - types.ts: `'owner' | 'manager' | 'member' | 'viewer'`
   - Prisma: `Role { OWNER, MANAGER, MEMBER, VIEWER }`
   - Neither matches the other

2. **Session Missing Role**:
   - User table has no role field
   - Session doesn't include workspace role from Membership
   - `getRole()` defaults to 'creator' (always)

3. **Admin Nav Visibility**:
   - Admin Console requires `allowedRoles: ['superuser']`
   - But `getRole()` never returns 'superuser' (no data source)
   - **Admin link never shows in sidebar** ⚠️

4. **Two Admin Systems**:
   - AppRole 'superuser' (theoretical, not in DB)
   - Admin table with AdminRole enum (real, in DB)
   - Not connected

---

## RECOMMENDATIONS FOR ADMIN PORTAL

### Option A: Use Existing Admin Table (Recommended) ✅

**Approach**: Check Admin table by email

**Client-Side** (Sidebar):
```typescript
// Add to session
session.user.isAdmin = await checkIfAdmin(session.user.email)

// In sidebar
const isAdmin = session?.user?.isAdmin;
// Show admin items if isAdmin === true
```

**Server-Side** (Already works):
```typescript
await requireAdmin() // Already implemented!
```

**Changes Needed**:
1. Update NextAuth callbacks to check Admin table
2. Add `isAdmin` to session JWT
3. Update sidebar to check `session.user.isAdmin`

---

### Option B: Add Role to User Table

**Approach**: Add role field to User model

**Changes Needed**:
1. Add migration: `ALTER TABLE User ADD COLUMN role VARCHAR DEFAULT 'creator'`
2. Update Prisma schema: `role String @default("creator")`
3. Update NextAuth to include role in session
4. Manually set admin users to `role: 'superuser'`

**Pros**: Simpler, one role system  
**Cons**: Doesn't leverage existing Admin table, mixes app roles with admin

---

### Option C: Hybrid (Workspace Roles + Admin)

**Approach**: Use Membership roles for app, Admin table for admin

**Changes Needed**:
1. Add Membership role to session
2. Separate check for Admin table
3. Two different role systems (clean separation)

**Pros**: Clean separation of concerns  
**Cons**: More complex

---

## RECOMMENDED IMPLEMENTATION (Option A)

### Step 1: Update NextAuth Session

**File**: `src/lib/auth/nextauth-options.ts`

Add to JWT callback:
```typescript
async jwt({ token, user, trigger }) {
  if (user?.id) token.userId = user.id as string
  if ((user as any)?.workspaceId) token.workspaceId = (user as any).workspaceId as string
  
  // NEW: Check if user is admin
  if (token.email) {
    const admin = await prisma().admin.findUnique({
      where: { email: token.email as string }
    })
    token.isAdmin = !!admin
    token.adminRole = admin?.role
  }
  
  return token
},

async session({ session, token }) {
  if (token.userId) session.user.id = token.userId as string
  if (token.workspaceId) session.user.workspaceId = token.workspaceId as string
  
  // NEW: Add admin status to session
  session.user.isAdmin = token.isAdmin as boolean
  session.user.adminRole = token.adminRole as string | undefined
  
  return session
}
```

### Step 2: Update Session Type

**File**: `src/lib/auth/types.ts`

```typescript
export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  workspaceId?: string;
  isAdmin?: boolean;       // NEW
  adminRole?: 'SUPER' | 'SUPPORT';  // NEW
};
```

### Step 3: Update Sidebar Nav

**File**: `src/components/shell/SidebarNav.tsx`

```typescript
const { data: session } = useSession();
const role = getRole(session);
const isAdmin = session?.user?.isAdmin ?? false;

// When filtering nav groups
{NAV.map((group) => {
  // Hide Admin group if not admin
  if (group.title === 'Admin' && !isAdmin) return null;
  
  return (
    <div key={group.title}>
      {/* render group */}
    </div>
  );
})}
```

---

## CURRENT ADMIN ACCESS METHOD

### How to Access Admin Portal Now

**Method 1: Set Cookie**
```bash
# In browser console on localhost:
document.cookie = "admin_email=your@email.com; path=/";
```

**Method 2: Set Header** (programmatic)
```typescript
fetch('/api/admin/...', {
  headers: { 'x-admin-email': 'your@email.com' }
})
```

**Then visit**: `/admin`

---

## ADMIN AUDIT LOG SYSTEM

**Function**: `auditLog()` from `src/lib/admin/guards.ts`

**Features**:
- ✅ Automatic PII masking
- ✅ Logs action, workspace, user, admin, metadata
- ✅ TraceId support
- ✅ IP and User-Agent tracking

**Usage**:
```typescript
await auditLog({
  action: 'USER_CREATED',
  workspaceId: 'ws-123',
  adminId: admin.id,
  metadata: { ... }
})
```

---

## EXISTING ADMIN FEATURES

### Admin Dashboard (`/admin`)
- ✅ Lists recent 20 workspaces
- ✅ Links to workspace detail pages

### Workspace Management (`/admin/workspaces/[id]`)
- ✅ View workspace details
- ✅ Inspect workspace data

### Run Inspection (`/admin/runs/[runId]`)
- ✅ View run details
- ✅ Replay steps

### Error Monitoring (`/admin/errors`)
- ✅ View error logs

### Telemetry (`/admin/telemetry`)
- ✅ Usage analytics

### Compliance (`/admin/compliance`)
- ✅ Compliance dashboard

### Impersonation API (`/api/admin/impersonate`)
- ✅ Impersonate users for support

---

## WHAT'S NEEDED FOR PRODUCTION-READY ADMIN

### 1. Hardcode Admin Emails (Quick Fix)

**File**: `src/lib/admin/guards.ts`

```typescript
const ADMIN_EMAILS = [
  'paul@yourdomain.com',
  'admin@yourdomain.com',
  // Add your admin emails here
];

export async function requireAdmin() {
  const h = await headers()
  const cookieStore = await cookies()
  const adminEmail = h.get('x-admin-email') || cookieStore.get('admin_email')?.value
  
  if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail)) {
    throw new Error('ADMIN_REQUIRED')
  }
  
  const admin = await prisma().admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, role: 'SUPER' },
  })
  
  return admin
}
```

### 2. Add Admin Check to Session (Better)

Follow Option A recommendation above to:
- Check Admin table during JWT callback
- Add `isAdmin` to session
- Show/hide Admin nav based on session

### 3. Add Admin Login Flow (Best)

- Separate admin login page
- Set admin cookie on successful admin login
- Clear cookie on logout
- Middleware to protect `/admin/*` routes

---

## MIDDLEWARE PROTECTION

**File**: `src/middleware.ts`

Currently protects auth routes. Can extend to protect admin:

```typescript
export function middleware(request: NextRequest) {
  // ... existing code ...
  
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const adminEmail = request.cookies.get('admin_email')?.value;
    if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail)) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}
```

---

## ANSWER TO YOUR AUDIT QUESTIONS

### Auth Provider
✅ **NextAuth.js v4.24.11**

### User Model Location
✅ **`prisma/schema.prisma` lines 935-949**

### User Fields
- `id` (String, UUID)
- `email` (String, unique, optional)
- `name` (String, optional)
- `image` (String, optional)
- `emailVerified` (DateTime, optional)
- `createdAt`, `updatedAt` (DateTime)
- ❌ **NO ROLE FIELD**

### Role Field
- **On User**: ❌ NO
- **On Membership**: ✅ YES (workspace roles: OWNER, MANAGER, MEMBER, VIEWER)
- **On Admin**: ✅ YES (admin roles: SUPER, SUPPORT)

### Get Current User
- **Client**: `useSession()` from `next-auth/react`
- **Server**: `getServerSession(authOptions)` from `next-auth`
- **Helpers**: `requireSession()`, `requireRole()`, `requireAdmin()`

### Existing Admin Checks
✅ **YES** - Extensive admin system exists:
- `requireAdmin()` function
- 6 admin pages in `/admin`
- Admin table in database
- Audit logging
- Impersonation support

---

## NEXT STEPS FOR ADMIN PORTAL

### Quick Win (5 mins)
1. Add your email to `ADMIN_EMAILS` array
2. Set cookie: `document.cookie = "admin_email=your@email.com"`
3. Access `/admin` - it works!

### Proper Implementation (30 mins)
1. Update NextAuth callbacks to check Admin table
2. Add `isAdmin` to session
3. Update SidebarNav to show/hide Admin section
4. Add middleware protection for `/admin/*` routes
5. Create admin login page

### Production Hardening (1 hour)
1. Hardcode authorized admin emails
2. Add proper admin authentication flow
3. Add session timeout for admin
4. Add audit logging to all admin actions
5. Add IP whitelisting (optional)

---

## RECOMMENDATION FOR YOUR WORKFLOW

**For now (Development)**:
- ✅ Admin system works with cookie method
- ✅ Admin pages exist and functional
- ✅ Just need to show Admin link in sidebar

**To show Admin in sidebar now**:
- Update SidebarNav to check for admin cookie
- OR just hardcode `isAdmin = true` for testing

**For production**:
- Implement Option A (Add isAdmin to session)
- Hardcode admin email list
- Add middleware protection

---

**Ready to implement admin visibility in sidebar?** 🚀

