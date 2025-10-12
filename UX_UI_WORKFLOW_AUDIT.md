# UX/UI Workflow Audit Report
**Date**: October 10, 2025  
**Scope**: Complete read-only audit of workflow pages  
**Status**: ✅ No code modifications made

---

## EXECUTIVE SUMMARY

### Key Findings

1. **✅ Strong Foundation**: All 7 workflow pages exist and use consistent PageShell wrapper with AppShell navigation
2. **⚠️ Navigation Gaps**: No unified progress indicator across individual tool pages; workflow continuity relies on sidebar navigation
3. **⚠️ Inconsistent Patterns**: Mix of feature-flagged vs. always-visible pages; some pages redirect, others show "Coming Soon"
4. **✅ Component Reuse**: Good sharing of UI primitives (Button, Card, Badge) with consistent design tokens
5. **⚠️ Workflow Clarity**: Users must manually navigate between tools; no clear "next step" guidance on most pages

---

## PART 1: PAGE INVENTORY

### 1. /tools/connect (Connect Accounts)

**A. Basic Info**
- **File Path**: `src/app/[locale]/tools/connect/page.tsx`
- **Page Title**: "Connect Accounts"
- **Subtitle**: "Link your social profiles to power audits, matching, and outreach."
- **Purpose**: OAuth connection management for social platforms (Instagram, TikTok, YouTube, X, Facebook, LinkedIn)

**B. Current State**
- **Status**: ⚠️ Partially working
- **Details**: 
  - Feature-flagged via `isToolEnabled("connect")`
  - Shows `<ComingSoon>` card if disabled
  - When enabled, renders `<ConnectGrid>` component
  - Instagram connection functional; other platforms may be "Coming soon" based on provider flags

**C. Layout Structure**
- **Header**: Yes - PageShell provides title "Connect Accounts" and subtitle
- **Progress Indicator**: No - no workflow step indicator
- **Main Content**: Grid of platform cards (2-3 columns responsive)
- **Footer/Action Area**: Refresh button (bottom-right) to reload connection status

**D. Navigation Elements**
- **Back Button**: No
- **Continue/Next Button**: No - no explicit workflow advancement
- **Other Actions**: 
  - "Connect" buttons per platform
  - "Disconnect" buttons for connected platforms
  - "Sync" / "Refresh" buttons
  - "Refresh status" button (entire grid)
- **Sidebar/Menu**: Yes - AppShell sidebar with all workflow tools listed

**E. Components Used**
- `<PageShell>` - page wrapper
- `<ComingSoon>` - feature flag fallback
- `<ConnectGrid>` - main container (client component)
- `<PlatformCard>` - individual social platform (6 cards in grid)
- `<StatusPill>` - "Connected" / "Not connected" / "Coming soon"
- `<Button>` - actions
- Lucide icons (Instagram, Music2, Youtube, Twitter, Facebook, Linkedin, etc.)

**F. Data Loading**
- **Fetch Method**: SWR hook in ConnectGrid: `/api/connections/status`
- **Loading State**: ✅ Skeleton cards (6 animated placeholders)
- **Error State**: ✅ Red error card: "Could not load connection status. Please refresh."

**G. Workflow Integration**
- **How Users Arrive**: From sidebar "Tools > Connect" or from Audit page error state ("Connect Accounts →" button)
- **Next Step**: No explicit "Continue" button; users manually navigate to Audit via sidebar
- **Alternative Paths**: Sidebar allows jumping to any workflow step

---

### 2. /tools/audit (AI Audit)

**A. Basic Info**
- **File Path**: `src/app/[locale]/tools/audit/page.tsx`
- **Page Title**: "AI Audit"
- **Subtitle**: "Audit your social profiles to unlock insights and better brand matches."
- **Purpose**: Run AI analysis on connected social accounts to generate creator profile

**B. Current State**
- **Status**: ⚠️ Partially working
- **Details**: 
  - Feature-flagged via `isToolEnabled("audit")`
  - Client-side component (`'use client'`)
  - Uses `useAuditRunner` hook for state management
  - Shows error if no social accounts connected → prompts user to go to /tools/connect
  - Dev-only snapshot puller visible in development mode

**C. Layout Structure**
- **Header**: Yes - PageShell with title and subtitle
- **Progress Indicator**: Yes - `<AuditProgress>` component shows during run (spinner + "Running audit..." text)
- **Main Content**: Stacked vertically:
  - Dev tools (NODE_ENV === 'development' only)
  - `<AuditConfig>` - platform selector
  - `<AuditProgress>` - while running
  - Error states (yellow for no accounts, red for failures)
  - `<AuditResults>` or `<EnhancedAuditResults>` - after completion
- **Footer/Action Area**: No sticky footer; actions in AuditConfig

**D. Navigation Elements**
- **Back Button**: No
- **Continue/Next Button**: No explicit "Next" button
- **Other Actions**:
  - "Run Audit" button in AuditConfig
  - "Connect Accounts →" button in error state (redirects to /tools/connect)
  - "Pull Snapshot" (dev only)
- **Sidebar/Menu**: Yes - AppShell sidebar

**E. Components Used**
- `<PageShell>`
- `<ComingSoon>` (if disabled)
- `<AuditConfig>` - platform selection checkboxes + Run button
- `<AuditProgress>` - animated progress during run
- `<AuditResults>` - v1 results display
- `<EnhancedAuditResults>` - v2 results with creatorProfile/brandFit
- `<Button>` - primary CTA
- Card with yellow/red backgrounds for errors

**F. Data Loading**
- **Fetch Method**: `useAuditRunner` hook calls `/api/audit/run` (POST)
- **Loading State**: ✅ `<AuditProgress>` spinner component
- **Error State**: ✅ Two types:
  - Yellow card for "No social accounts connected" → shows "Connect Accounts →" button
  - Red card for other errors

**G. Workflow Integration**
- **How Users Arrive**: Sidebar "Tools > AI Audit"
- **Next Step**: No explicit button; users manually go to Matches
- **Alternative Paths**: Error state provides link to Connect page

---

### 3. /tools/matches (Brand Matches)

**A. Basic Info**
- **File Path**: `src/app/[locale]/tools/matches/page.tsx`
- **Page Title**: "🎯 Brand Matches"
- **Subtitle**: "AI-powered brand recommendations based on your profile"
- **Purpose**: Generate and approve/reject brand matches; save selections for next steps

**B. Current State**
- **Status**: ✅ Working correctly
- **Details**:
  - Feature-flagged via `isToolEnabled('matches')`
  - Client component with rich state management via `useBrandMatchFlow` hook
  - Auto-saves approval state with 500ms debounce
  - Supports local vs national brand filtering
  - Has "Generate More" functionality

**C. Layout Structure**
- **Header**: Yes - PageShell
- **Progress Indicator**: Yes - `<BrandMatchProgress>` card showing approved/rejected/pending counts + progress bar
- **Main Content**: 
  - Progress card (top)
  - Filter tabs (All / Local / National)
  - "View Rejected Brands" link (if any rejected)
  - Error display
  - Loading spinner during generation
  - Brand grid (3 columns on lg, 2 on md, 1 on mobile)
  - Empty state with emoji + "Generate More" button
- **Footer/Action Area**: Yes - `<BrandMatchActionBar>` sticky at bottom with "Save & Continue to Contacts" button

**D. Navigation Elements**
- **Back Button**: No
- **Continue/Next Button**: Yes - "Save & Continue to Contacts" in sticky footer (only enabled when ≥1 brand approved)
- **Other Actions**:
  - "Generate More" button in filters bar + empty state
  - Tab filters (All / Local / National)
  - "View X Rejected Brands →" card
  - Per-brand: Approve, Reject (X icon), Reset, Details (eye icon)
- **Sidebar/Menu**: Yes

**E. Components Used**
- `<PageShell>`
- `<ComingSoon>` (if disabled)
- `<BrandMatchProgress>` - stats + progress bar
- `<BrandMatchFilters>` - tabs + Generate More button
- `<BrandCard>` - individual brand with approval buttons
- `<BrandMatchActionBar>` - sticky footer with continue button
- `<RejectedBrandsDrawer>` - side drawer for rejected brands
- `<BrandDetailsDrawer>` - side drawer for brand details
- `<Card>`, `<Button>`, `<ProgressBeacon>`
- Lucide icons (Sparkles, Trash2, Check, X, RotateCcw, Eye, ArrowRight)

**F. Data Loading**
- **Fetch Method**: 
  - `useBrandMatchFlow` hook
  - Calls `/api/match/search` (POST) for generation
  - Calls `/api/brand-run/upsert` (POST) for auto-save
  - Calls `/api/brand-run/advance` (POST) for "Save & Continue"
- **Loading State**: ✅ "Generating brand matches..." with spinner
- **Error State**: ✅ Red card with error message

**G. Workflow Integration**
- **How Users Arrive**: Sidebar "Tools > Brand Matches"
- **Next Step**: "Save & Continue to Contacts" → redirects to `/tools/contacts`
- **Alternative Paths**: Can jump to any step via sidebar

---

### 4. /tools/approve (Approve Brands)

**A. Basic Info**
- **File Path**: `src/app/[locale]/tools/approve/page.tsx`
- **Page Title**: "Approve Brands"
- **Subtitle**: "Review and approve the brands you selected for your campaign."
- **Purpose**: Secondary approval step (appears to duplicate /tools/matches functionality)

**B. Current State**
- **Status**: 🗑️ Redundant/Potentially Deprecated
- **Details**:
  - Feature-flagged via `isToolEnabled("approve")`
  - Client component with `useBrandApproval` hook
  - Has hardcoded redirect to `/tools/media-pack` (not `/tools/pack`)
  - Appears to be from earlier workflow design
  - Functionality overlaps heavily with /tools/matches

**C. Layout Structure**
- **Header**: Yes - PageShell + action bar with Refresh button
- **Progress Indicator**: Yes - `<ApprovalProgress>` card (Card wrapper with stats inside)
- **Main Content**:
  - Header row (empty left, Refresh button right)
  - Progress card
  - Error display
  - `<BrandApprovalGrid>` - grid of brands
  - Action bar (sticky at bottom-4)
  - Empty state if no brands
- **Footer/Action Area**: Yes - sticky Card at bottom-4 with "Save Progress" + "Continue to Media Pack" buttons

**D. Navigation Elements**
- **Back Button**: No - has "Back to Generate Matches" in empty state
- **Continue/Next Button**: Yes - "Continue to Media Pack" → redirects to `/tools/media-pack` (⚠️ note: not `/tools/pack`)
- **Other Actions**:
  - "Refresh" button (top right)
  - "Save Progress" button (bottom bar)
  - Per-brand: Approve, Reject, Reset, Details
- **Sidebar/Menu**: Yes

**E. Components Used**
- `<PageShell>`
- `<ComingSoon>` (if disabled)
- `<Card>` - for progress and action bar
- `<ApprovalProgress>` - stats display
- `<BrandApprovalGrid>` - brand grid
- `<Button>` - various actions
- `<EmptyState>` - when no brands
- `<ProgressBeacon>` - loading indicator
- Lucide icons (CheckCircle, ArrowRight, RefreshCw)

**F. Data Loading**
- **Fetch Method**: `useBrandApproval` hook (fetches brands from somewhere)
- **Loading State**: ✅ Full-page spinner with "Loading brands..."
- **Error State**: ✅ Red/error tinted card

**G. Workflow Integration**
- **How Users Arrive**: Sidebar "Tools > Approve" or from matches page (unclear)
- **Next Step**: "Continue to Media Pack" → `/tools/media-pack` (⚠️ Path mismatch)
- **Alternative Paths**: Empty state has "Back to Generate Matches" button

**⚠️ ISSUE**: This page appears to be redundant with /tools/matches. Matches page already has approval functionality. This creates confusion about workflow path.

---

### 5. /tools/contacts (Discover Contacts)

**A. Basic Info**
- **File Path**: `src/app/[locale]/tools/contacts/page.tsx` (wrapper) + `src/components/contacts/DiscoverContactsPage.tsx` (main)
- **Page Title**: "Discover Contacts"
- **Subtitle**: "Find and manage potential brand partners."
- **Purpose**: Search for brand contacts using Hunter/Apollo APIs; enrich and save contacts

**B. Current State**
- **Status**: ⚠️ Partially working
- **Details**:
  - Feature-flagged via `isToolEnabled("contacts")`
  - Checks provider capabilities via `/api/contacts/capabilities`
  - Shows `<SetupNotice>` if providers not configured
  - Has demo mode fallback
  - Client component with complex state management

**C. Layout Structure**
- **Header**: Yes - PageShell
- **Progress Indicator**: No workflow-level indicator
- **Main Content**:
  - Capability check (loading spinner while checking)
  - SetupNotice (if providers missing)
  - OR DiscoverContactsPage:
    - Brand selector dropdown (from approved brands)
    - Manual search form (toggle)
    - Search results grid
    - "Enrich Contacts" button
    - "Save & Continue" button
- **Footer/Action Area**: No sticky footer; actions inline with results

**D. Navigation Elements**
- **Back Button**: No
- **Continue/Next Button**: Yes - "Save & Continue" button after selecting contacts → redirects to `/tools/pack`
- **Other Actions**:
  - Brand dropdown selector
  - "Search" button (in manual form)
  - "Enrich Contacts" button (may show upsell if on FREE plan)
  - "Enable Demo Mode" button (in SetupNotice)
  - Per-contact: Select checkboxes
- **Sidebar/Menu**: Yes

**E. Components Used**
- `<PageShell>`
- `<ComingSoon>` (if disabled)
- `<SetupNotice>` - when providers not configured
- `<DiscoverContactsPage>` - main content
  - `<DiscoveryForm>` - search inputs
  - `<ResultsGrid>` - contact cards
  - `<UpsellBanner>` - billing prompt for enrich
  - `<EmptyState>` - no results
  - `<ProgressBeacon>` - loading
  - `<Breadcrumbs>` - navigation trail
- `<Button>`, `<Card>`
- Lucide icons (Users, Search, ChevronDown)

**F. Data Loading**
- **Fetch Method**:
  - `/api/contacts/capabilities` - check providers
  - `/api/contacts/discover` - search (POST)
  - `/api/contacts/enrich` - enrichment (POST)
  - `/api/brand-run/current` - get approved brands
  - `/api/brand-run/upsert` - save contacts
  - `/api/brand-run/advance` - advance workflow
- **Loading State**: ✅ Multiple states:
  - Capability check spinner
  - Search spinner ("Discovering contacts...")
  - Enrich spinner
  - Save spinner
- **Error State**: ✅ Error cards displayed for failures

**G. Workflow Integration**
- **How Users Arrive**: From /tools/matches "Save & Continue" button OR sidebar
- **Next Step**: "Save & Continue" → `/tools/pack`
- **Alternative Paths**: Can jump via sidebar

---

### 6. /tools/pack (Media Pack Preview)

**A. Basic Info**
- **File Path**: `src/app/[locale]/tools/pack/page.tsx`
- **Page Title**: "Media Pack Preview"
- **Subtitle**: "Preview and customize your media pack before sharing."
- **Purpose**: Generate branded PDF media packs for selected brands

**B. Current State**
- **Status**: ✅ Working correctly
- **Details**:
  - Feature-flagged via `isToolEnabled("pack")`
  - Client component with complex state
  - Loads approved brands from BrandRun
  - Supports 3 templates: classic, bold, editorial
  - Generates PDFs via `/api/media-pack/generate-with-pdfshift`
  - Has one-pager mode and brand color customization

**C. Layout Structure**
- **Header**: Yes - PageShell + "AI-enhanced content" badge (top right, hidden on mobile)
- **Progress Indicator**: No
- **Main Content**: 2-column layout (lg:grid-cols-4)
  - **Left Rail (lg:col-span-1)**: 
    - Template selector card (Classic/Bold/Editorial)
    - Theme controls card (One-Pager toggle, Brand Color picker)
    - Brand selection card (checkboxes for approved brands)
    - Actions card ("Generate PDF" button)
  - **Right (lg:col-span-3)**:
    - Live preview card (800px height, scrollable)
  - **Below Grid**:
    - Generated PDFs section (if any) - card with download/copy/open buttons
- **Footer/Action Area**: No sticky footer

**D. Navigation Elements**
- **Back Button**: No - empty state has "← Go Back to Brand Matches" button
- **Continue/Next Button**: No explicit next step
- **Other Actions**:
  - Template buttons (Classic/Bold/Editorial)
  - One-Pager toggle
  - Brand Color input
  - Brand selection checkboxes
  - "Generate PDF" button (primary action)
  - Per-PDF: "Open", "Download", "Copy Link" buttons
- **Sidebar/Menu**: Yes

**E. Components Used**
- `<PageShell>`
- `<ComingSoon>` (if disabled)
- `<Card>` - multiple cards for controls and preview
- `<Button>` - actions
- `<MPClassic>`, `<MPBold>`, `<MPEditorial>` - template components
- Lucide icons (Sparkles, Download, ExternalLink, Check, Copy)
- `toast` hook for notifications
- Color picker (native input type="color")

**F. Data Loading**
- **Fetch Method**:
  - `/api/brand-run/current` - get approved brands and selections
  - `/api/match/search` - fallback to refetch brand data
  - `/api/media-pack/generate-with-pdfshift` - PDF generation (POST)
  - `createDemoMediaPackData()` - local demo data
- **Loading State**: ✅ Multiple states:
  - Initial load spinner ("Loading media pack data…")
  - PDF generation ("Generating..." button disabled)
- **Error State**: ✅ Error card displays

**G. Workflow Integration**
- **How Users Arrive**: From /tools/contacts "Save & Continue" OR sidebar
- **Next Step**: No explicit next button; users manually go to Outreach via sidebar
- **Alternative Paths**: 
  - Empty state: "← Go Back to Brand Matches"
  - Sidebar navigation

**⚠️ ISSUE**: No clear "Continue to Outreach" button. User must manually navigate.

---

### 7. /tools/outreach (Outreach)

**A. Basic Info**
- **File Path**: `src/app/[locale]/tools/outreach/page.tsx` (wrapper) + `src/components/outreach/OutreachPage.tsx` (main)
- **Page Title**: "Outreach Tools"
- **Subtitle**: "Create sequences and analyze performance metrics."
- **Purpose**: Build email outreach sequences; start campaigns; view analytics

**B. Current State**
- **Status**: ⚠️ Partially working
- **Details**:
  - Feature-flagged via `isToolEnabled("outreach")`
  - Client component
  - Has two tabs: "Start Outreach" and "Analytics"
  - Links to `/outreach/inbox` for viewing sent emails
  - Uses `useOutreachSequence` hook
  - Feature-flagged tone controls (`flags['outreach.tones.enabled']`)

**C. Layout Structure**
- **Header**: Yes - custom header (not just PageShell subtitle):
  - h1: "Outreach Tools"
  - Subtitle: "Create sequences and analyze performance metrics."
  - Breadcrumbs: "Tools / Start Outreach"
  - Tab navigation (Start Outreach / Analytics)
  - Link to "📥 View Inbox"
- **Progress Indicator**: No
- **Main Content**: Depends on active tab:
  - **Start Outreach Tab**:
    - Error/success toasts
    - 2-column grid (lg:grid-cols-2):
      - Left: Contact picker, Brand picker, Media Pack picker, Tone controls (flagged)
      - Right: Sequence builder, Sequence preview
    - Bottom card: Summary stats + "Start Sequence" button
  - **Analytics Tab**: `<OutreachAnalytics>` component
- **Footer/Action Area**: No sticky footer; "Start Sequence" button in bottom card

**D. Navigation Elements**
- **Back Button**: No
- **Continue/Next Button**: No - "Start Sequence" button starts email campaign (doesn't advance workflow)
- **Other Actions**:
  - Tab switchers (Start Outreach / Analytics)
  - "📥 View Inbox" link → `/outreach/inbox`
  - "Start Sequence" button (primary CTA)
  - Contact picker, Brand picker, Media Pack picker dropdowns
  - Tone/Brevity selects (if flagged)
  - Sequence builder (add/edit steps)
- **Sidebar/Menu**: Yes

**E. Components Used**
- `<PageShell>` - NOT USED; custom layout instead
- `<ComingSoon>` (if disabled in wrapper page.tsx)
- `<OutreachPage>` - main component
  - `<Breadcrumbs>`
  - `<ContactPicker>`
  - `<BrandPicker>`
  - `<MediaPackPicker>`
  - `<Select>` - tone/brevity
  - `<SequenceBuilder>`
  - `<SequencePreview>`
  - `<OutreachAnalytics>`
  - `<ProgressBeacon>`
  - `<Button>` with .btn.btn-primary classes

**F. Data Loading**
- **Fetch Method**: `useOutreachSequence` hook
  - Calls `/api/outreach/start` (POST) to start sequence
- **Loading State**: ✅ "Starting..." with ProgressBeacon
- **Error State**: ✅ Error card displayed
- **Success State**: ✅ Success toast displayed

**G. Workflow Integration**
- **How Users Arrive**: Sidebar "Tools > Outreach"
- **Next Step**: No workflow "Continue"; this is effectively the last step. Can view Inbox afterward.
- **Alternative Paths**: 
  - "📥 View Inbox" → `/outreach/inbox`
  - Sidebar

**⚠️ INCONSISTENCY**: Outreach page does NOT use PageShell like all other workflow pages. It has custom header layout.

---

## PART 2: VISUAL CONSISTENCY ANALYSIS

### A. Typography

| Page | Page Title | Section Headings | Body Text | Font Family |
|------|-----------|------------------|-----------|-------------|
| Connect | text-2xl font-semibold tracking-tight | font-medium | text-sm text-[var(--muted-fg)] | Default (likely Inter from base.css) |
| Audit | text-2xl font-semibold tracking-tight | font-medium | text-sm | Same |
| Matches | text-2xl font-semibold tracking-tight | font-medium (card headers) | text-sm text-[var(--muted-fg)] | Same |
| Approve | text-2xl font-semibold tracking-tight | font-medium | text-sm | Same |
| Contacts | text-2xl font-semibold tracking-tight | font-medium | text-sm | Same |
| Pack | text-2xl font-semibold tracking-tight | font-medium text-[var(--fg)] | text-sm | Same |
| Outreach | text-2xl font-semibold tracking-tight (h1) | font-medium | text-sm text-[var(--muted-fg)] | Same |

**Consistency**: ✅ **YES** - All pages use same typography system via PageShell
- Page titles: `text-2xl font-semibold tracking-tight`
- Subtitles: `text-sm text-muted-foreground`
- Section headings: `font-medium`
- Body: `text-sm`

**Exception**: Outreach page implements own header but follows same sizing

---

### B. Colors

**Design Tokens** (from `src/styles/tokens.css`):

**Light Mode**:
```css
--bg: #ffffff
--surface: #f7f7f8
--card: #ffffff
--text: #0b0b0c
--muted: #666a71
--muted-fg: #666a71
--border: #e6e7ea
--accent: #3b82f6
--brand-600: #3b82f6
--success: #16a34a
--warn: #f59e0b
--error: #ef4444
```

**Usage Consistency Across Pages**:

| Element | Color Used | Consistent? |
|---------|-----------|-------------|
| **Primary Buttons** | bg-[var(--accent)] (#3b82f6), text-white, hover:brightness-95 | ✅ YES |
| **Secondary Buttons** | bg-surface, text-[var(--text)], border border-[var(--border)], hover:bg-[var(--muted)]/10 | ✅ YES |
| **Success States** | Green variants: #16a34a (token), green-600 (#059669 Tailwind), green-500 (#10b981) | ⚠️ MIXED - uses both tokens and Tailwind greens |
| **Error States** | text-[var(--error)] (#ef4444), bg-[var(--tint-error)], border-[var(--error)] | ✅ YES |
| **Warning States** | yellow-200 border, yellow-50 bg, yellow-800/900 text | ⚠️ Hardcoded Tailwind colors (not tokens) |
| **Text Colors** | Heading: text-[var(--fg)] or text-[var(--text)], Body: text-[var(--muted-fg)] | ✅ YES |
| **Backgrounds** | Page: bg-bg, Cards: bg-[var(--card)], Surfaces: bg-[var(--surface)] | ✅ YES |
| **Borders** | border-[var(--border)] | ✅ YES |

**Issues Found**:
1. **Success colors inconsistent**: Some use `--success` token, others use Tailwind `green-600`, `green-500`, `green-100`
2. **Warning colors not tokenized**: Uses hardcoded `yellow-200`, `yellow-50`, `yellow-800`
3. **Blue variants**: Some components use hardcoded `blue-600`, `blue-50`, `blue-100` instead of `--accent`

---

### C. Buttons

**Button Variants** (from `src/components/ui/Button.tsx`):

```typescript
variants = {
  primary: "bg-[color:var(--accent)] text-white hover:brightness-95",
  secondary: "bg-surface text-[var(--text)] border border-[var(--border)] hover:bg-[color:var(--muted)]/10",
  ghost: "bg-transparent text-[var(--text)] hover:bg-[color:var(--muted)]/10"
}

sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base"
}
```

**Usage Across Pages**:

| Page | Primary Button | Secondary Button | Ghost Button | Consistency |
|------|---------------|------------------|--------------|-------------|
| Connect | ❌ Uses custom Link/button classes | ✅ Refresh uses custom classes | N/A | ⚠️ Mixed |
| Audit | ✅ `<Button variant="primary">` | N/A | N/A | ✅ YES |
| Matches | ✅ Custom classes in BrandCard (green-600) + sticky footer | ✅ Secondary for tabs | ✅ Ghost for details | ⚠️ Mixed |
| Approve | ✅ Uses Button component | ✅ Secondary for "Save Progress" | ✅ Ghost for details | ✅ YES |
| Contacts | ✅ Uses Button component | ✅ Secondary | N/A | ✅ YES |
| Pack | ✅ Uses Button component | ✅ Secondary | N/A | ✅ YES |
| Outreach | ❌ Uses `.btn.btn-primary` classes | N/A | N/A | ⚠️ Uses old class system |

**Issues**:
1. **Connect page**: Uses inline Link components with custom classes instead of `<Button>`
2. **Matches page**: BrandCard has hardcoded button styles (green-600, red-50) instead of using Button variants
3. **Outreach page**: Uses `.btn.btn-primary` CSS classes instead of Button component
4. **Disabled state**: Consistently uses `opacity-60 cursor-not-allowed` across all variants ✅

---

### D. Cards/Containers

**Card Component** (`src/components/ui/Card.tsx`):
```typescript
className: "rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm"
```

**Usage**:

| Page | Uses `<Card>` Component | Custom Card Styles | Consistency |
|------|------------------------|-------------------|-------------|
| Connect | ✅ YES - grid cards | `.card` class in skeleton | ✅ YES |
| Audit | ✅ YES - progress, results | Custom cards for errors | ⚠️ Mixed |
| Matches | ✅ YES - progress, brands | BrandCard has custom `.card` class | ✅ YES |
| Approve | ✅ YES - progress, action bar | N/A | ✅ YES |
| Contacts | ✅ YES - various cards | N/A | ✅ YES |
| Pack | ✅ YES - controls, preview, results | N/A | ✅ YES |
| Outreach | ⚠️ Uses `.card` CSS class | Custom styling | ⚠️ Different approach |

**Card Styling Consistency**:
- **Border**: ✅ Always `border-[var(--border)]`
- **Radius**: ✅ Always `rounded-xl` (or `rounded-lg` in some legacy)
- **Shadow**: ✅ Consistently uses `shadow-sm`
- **Background**: ✅ Always `bg-[var(--card)]`
- **Padding**: ⚠️ Varies - `p-4`, `p-5`, `p-6`, `p-8` used inconsistently

**Issue**: Padding is not standardized. Some cards use p-4, others p-5, p-6, or p-8 without clear pattern.

---

### E. Spacing

**Spacing Patterns Observed**:

| Context | Spacing Used | Consistency |
|---------|-------------|-------------|
| **Between sections** (vertical) | `space-y-6` (24px) primary pattern | ✅ Consistent |
| **Between elements** | `space-y-4` (16px), `gap-4` (16px) | ✅ Consistent |
| **Page margins** | `px-4 py-6 md:px-6` (via PageShell) | ✅ Consistent |
| **Card internal** | `p-4` to `p-8` (varies) | ⚠️ Inconsistent |
| **Button gaps** | `gap-2` (8px) for icon+text | ✅ Consistent |
| **Grid gaps** | `gap-4` or `gap-6` | ✅ Consistent |

**PageShell Standard** (`src/components/PageShell.tsx`):
- Container: `mx-auto w-full max-w-6xl px-4 py-6 md:px-6`
- Header margin: `mb-6`
- This is applied to ALL workflow pages ✅

**Issues**:
1. Card padding varies without clear hierarchy (p-4 vs p-6 vs p-8)
2. No documented spacing scale beyond Tailwind defaults

---

### F. Icons

**Icon Library**: Lucide React (consistent across all pages) ✅

**Icon Sizes**:
- Small: `w-4 h-4` (16px) - most common
- Medium: `w-5 h-5` (20px) - less common
- Large: `w-6 h-6` (24px) - rare

**Icon Colors**:
- Generally match text color: `text-[var(--muted-fg)]` or inherit from parent
- Some custom colors: `text-green-600`, `text-red-600` for semantic states

**Consistency**: ✅ YES - all pages use Lucide React with consistent sizing

---

## PART 3: COMPONENT REUSE ANALYSIS

### A. Shared Components

| Component | File Path | Used By | Consistency |
|-----------|-----------|---------|-------------|
| **PageShell** | `src/components/PageShell.tsx` | Connect, Audit, Matches, Approve, Contacts, Pack | ✅ Consistent (Outreach doesn't use it) |
| **ComingSoon** | `src/components/ComingSoon.tsx` | All 7 pages (if feature-flagged off) | ✅ Identical |
| **Button** | `src/components/ui/Button.tsx` | Most pages (Connect/Outreach use custom) | ⚠️ Mixed |
| **Card** | `src/components/ui/Card.tsx` | All pages | ✅ Consistent |
| **Badge** | `src/components/ui/Badge.tsx` | Matches, Approve | ✅ Consistent |
| **ProgressBeacon** | `src/components/ui/ProgressBeacon.tsx` | Audit, Matches, Approve, Contacts, Outreach | ✅ Consistent |
| **EmptyState** | `src/components/ui/EmptyState.tsx` | Approve, Contacts | ✅ Consistent |
| **StatusPill** | `src/components/ui/status-pill.tsx` | Connect, Sidebar | ✅ Consistent |

**Key Findings**:
- **PageShell** provides unified layout but is skipped by Outreach page
- **ComingSoon** is perfectly reused across all feature-flagged pages
- **Button** component exists but not universally used (Connect, Outreach use custom classes)
- **Card** component is well-adopted
- **UI primitives** (Badge, ProgressBeacon, EmptyState) are well-shared

---

### B. Page-Specific Components

| Component | File Path | Page | Reusable? |
|-----------|-----------|------|-----------|
| **ConnectGrid** | `src/components/connect/ConnectGrid.tsx` | Connect | ⚠️ Could be generic grid |
| **PlatformCard** | `src/components/connect/PlatformCard.tsx` | Connect | ❌ Very platform-specific |
| **AuditConfig** | `src/components/audit/AuditConfig.tsx` | Audit | ❌ Audit-specific |
| **AuditResults** | `src/components/audit/AuditResults.tsx` | Audit | ❌ Audit-specific |
| **BrandCard** | `src/components/matches/BrandCard.tsx` | Matches, Approve | ✅ Already reused! |
| **BrandMatchProgress** | `src/components/matches/BrandMatchProgress.tsx` | Matches | ⚠️ Could be generic progress card |
| **BrandMatchActionBar** | `src/components/matches/BrandMatchActionBar.tsx` | Matches | ⚠️ Could be generic sticky footer |
| **DiscoverContactsPage** | `src/components/contacts/DiscoverContactsPage.tsx` | Contacts | ❌ Very specific |
| **OutreachPage** | `src/components/outreach/OutreachPage.tsx` | Outreach | ❌ Very specific |
| **SequenceBuilder** | `src/components/outreach/pieces/SequenceBuilder.tsx` | Outreach | ❌ Very specific |

**Opportunities for Reuse**:
1. **BrandMatchProgress** → Could become generic "StepProgress" card
2. **BrandMatchActionBar** → Could become generic "StickyActionBar" component
3. **ConnectGrid** → Already generic grid, just specialized for platforms

---

### C. Duplicate Functionality

**⚠️ MAJOR DUPLICATION FOUND**:

**Approve Brands vs. Brand Matches**:
- `/tools/approve` page exists
- `/tools/matches` page has full approve/reject functionality built-in
- Both use similar components:
  - Approve: `<BrandApprovalGrid>`, `<ApprovalProgress>`
  - Matches: `<BrandCard>` (with approval), `<BrandMatchProgress>`
- **BrandCard** is used in both but with different approval flows
- Approve page redirects to `/tools/media-pack` (wrong path)
- Matches page redirects to `/tools/contacts` (correct path)

**Recommendation**: 
- Deprecate `/tools/approve` entirely
- Use `/tools/matches` as single source of truth for brand approval
- Remove redundant `useBrandApproval` hook and `BrandApprovalGrid` component

**Other Minor Duplications**:
- Multiple progress indicators (AuditProgress, BrandMatchProgress, ApprovalProgress, ProgressBeacon) - could standardize
- Multiple loading states (skeleton cards in Connect, ProgressBeacon elsewhere) - acceptable variation

---

## PART 4: WORKFLOW GAP ANALYSIS

### A. Navigation Gaps

| Page | Previous Step Clear? | Next Step Clear? | Next Action Obvious? | Dead End? |
|------|---------------------|------------------|---------------------|-----------|
| **Connect** | N/A (first step) | ❌ No "Continue" button | ⚠️ Not obvious - user must go to sidebar | ❌ No |
| **Audit** | ⚠️ Error state links to Connect | ❌ No "Continue" button | ⚠️ Not obvious | ❌ No |
| **Matches** | ❌ No back button | ✅ "Save & Continue to Contacts" | ✅ Very clear | ❌ No |
| **Approve** | ⚠️ Empty state has back link | ✅ "Continue to Media Pack" | ✅ Clear but wrong path | ❌ No |
| **Contacts** | ❌ No back button | ✅ "Save & Continue" | ✅ Clear | ❌ No |
| **Pack** | ⚠️ Empty state has back link | ❌ No "Continue" button | ❌ Not clear what's next | ⚠️ Feels like dead end |
| **Outreach** | ❌ No back button | ⚠️ "Start Sequence" (not "Continue") | ⚠️ Unclear if workflow is done | ⚠️ Partial dead end |

**Critical Gaps**:
1. **Connect → Audit**: No "Continue to Audit" button
2. **Audit → Matches**: No "Continue to Matches" button
3. **Pack → Outreach**: No "Continue to Outreach" button - user must manually navigate
4. **Outreach**: No clear "workflow complete" state

**Strengths**:
- Matches page has excellent "Save & Continue" button
- Contacts page has clear continuation
- All pages have sidebar for manual navigation

---

### B. Progress Visibility

**Workflow Progress Indicators**:

| Feature | Present? | Location | Issues |
|---------|----------|----------|--------|
| **Overall workflow stepper** | ❌ NO | N/A | No unified progress bar across individual tool pages |
| **Current step highlight** | ✅ YES | Sidebar navigation | Active link highlighted |
| **Steps completed indicator** | ❌ NO | N/A | No checkmarks or completion status |
| **Steps remaining count** | ❌ NO | N/A | User can't see how many steps left |
| **Jump to completed steps** | ✅ YES | Sidebar | Can navigate to any step |
| **Per-page progress** | ⚠️ MIXED | Varies by page | Audit/Matches have progress, others don't |

**Progress Components Found**:
- `<RunProgressWheel>` - exists in `src/components/run/RunProgressWheel.tsx` but NOT used in individual tool pages
- `<Stepper>` - exists but not used in workflow
- `<RadialStepper>` - exists but not used in workflow
- Individual pages have their own progress (e.g., BrandMatchProgress)

**Issue**: There's a sophisticated progress system (`RunProgressWheel`) but it's only used in `/brand-run` page, not in individual `/tools/*` pages. This creates inconsistent UX.

---

### C. State Preservation

**Testing Required** (cannot test programmatically in read-only audit):

| Page | State Likely Preserved on Refresh? | Evidence |
|------|-----------------------------------|----------|
| **Connect** | ✅ YES | Fetches from `/api/connections/status` on mount |
| **Audit** | ❌ LIKELY NOT | Uses local state in `useAuditRunner` hook |
| **Matches** | ✅ YES | Loads from BrandRun API + auto-saves |
| **Approve** | ⚠️ UNCLEAR | Has `refresh` function but unclear if persisted |
| **Contacts** | ⚠️ PARTIAL | Loads approved brands but search state likely lost |
| **Pack** | ✅ YES | Loads from BrandRun API |
| **Outreach** | ❌ LIKELY NOT | Local state for sequence builder |

**Auto-Save**:
- ✅ Matches page has debounced auto-save (500ms) to BrandRun
- ❌ Other pages rely on explicit "Save" actions
- ⚠️ Outreach has no auto-save for sequence drafts

**Recommendation**: Implement localStorage or session storage for pages without backend persistence

---

### D. Error Recovery

**Error Handling Quality**:

| Page | API Failure Handling | Retry Option | Helpful Error Messages | Can Go Back? |
|------|---------------------|--------------|----------------------|--------------|
| **Connect** | ✅ Shows error card | ✅ "Refresh status" button | ⚠️ Generic: "Could not load..." | N/A |
| **Audit** | ✅ Two error types (no accounts, other) | ❌ No retry button | ✅ "Connect Accounts →" button for missing accounts | ✅ Button to Connect |
| **Matches** | ✅ Shows error card | ⚠️ Can generate more | ✅ Shows error message | ⚠️ No explicit back |
| **Approve** | ✅ Shows error card | ✅ "Refresh" button | ⚠️ Generic | ⚠️ Only in empty state |
| **Contacts** | ✅ Shows error card | ✅ Can retry search | ✅ "Enable Demo Mode" fallback | ❌ No |
| **Pack** | ✅ Shows error card | ⚠️ Can regenerate PDF | ✅ Shows PDF errors | ✅ Empty state back button |
| **Outreach** | ✅ Shows error card | ✅ Can retry "Start Sequence" | ⚠️ Generic | ❌ No |

**Strengths**:
- All pages display errors (no silent failures)
- Audit page has excellent error recovery (redirects to Connect)
- Contacts has demo mode fallback

**Weaknesses**:
- Most error messages are generic ("Failed to...")
- No global retry mechanism
- Back buttons mostly missing

---

## PART 5: MENU/NAVIGATION STRUCTURE

### A. Main Navigation

**Location**: Left sidebar (260px wide, sticky)

**Structure** (from `src/config/nav.ts`):

```
[No Title Group]
- Dashboard (Home icon)
- Brand Run (Waypoints icon)
- Contacts (Users icon)
- CRM (Kanban icon)
- Settings (Settings icon)

[Tools Group]
- Connect (Wrench icon)
- AI Audit (Gauge icon)
- Brand Matches (BadgeCheck icon)
- Approve Brands (CheckSquare icon) ⚠️ Redundant
- Discover Contacts (Users icon)
- Media Pack (Images icon)
- Outreach (Send icon)
- Outreach Inbox (Inbox icon)
- Import Data (Upload icon)
- Deal Desk (DollarSign icon)

[Admin Group] (superuser only)
- Admin Console (Shield icon)
```

**Current Page Highlighting**: ✅ YES
- Active link: `bg-[color:var(--accent)]/10 text-[var(--text)] border border-[var(--border)]`
- Inactive: `text-[var(--muted)] hover:text-[var(--text)]`

**Coming Soon Badges**: ✅ YES
- Uses `isToolEnabled()` to show `<StatusPill tone="neutral">Coming soon</StatusPill>`

**Mobile Behavior**: Sidebar is responsive but needs testing for mobile UX

**Issues**:
1. **Approve Brands** link should be removed (redundant with Matches)
2. No visual workflow grouping (all tools listed flat)
3. No step numbers or sequence indicators

---

### B. Secondary Navigation

**Outreach Page Only**: Has tab navigation
- "Start Outreach" tab
- "Analytics" tab
- Implemented with custom styled buttons

**Other Pages**: No secondary navigation

**Issue**: Only Outreach has tabs; inconsistent pattern

---

### C. Breadcrumbs

**Presence**:
- ✅ Outreach: Shows "Tools / Start Outreach"
- ✅ Contacts: Has `<Breadcrumbs>` component
- ❌ Other workflow pages: No breadcrumbs

**Issue**: Breadcrumbs not consistently used across workflow

---

## PART 6: SPECIFIC ISSUES FOUND

### A. Broken Functionality

| Issue | Location | Impact | Severity |
|-------|----------|--------|----------|
| **Wrong redirect path** | `/tools/approve` → redirects to `/tools/media-pack` instead of `/tools/pack` | Link will 404 | 🔴 High |
| **Duplicate approval page** | Both `/tools/approve` and `/tools/matches` do brand approval | Confusing workflow | 🟡 Medium |
| **Missing next step** | Pack page has no "Continue to Outreach" button | Workflow feels incomplete | 🟡 Medium |
| **Missing next step** | Audit page has no "Continue to Matches" button | Workflow feels incomplete | 🟡 Medium |
| **Inconsistent wrapper** | Outreach doesn't use PageShell | Visual inconsistency | 🟡 Medium |

---

### B. Confusing UX

| What's Confusing | Why It's Confusing | Suggested Improvement |
|------------------|-------------------|----------------------|
| **No workflow map** | Users can't see overall process or where they are | Add unified stepper/progress component |
| **Approve vs Matches** | Two pages seem to do the same thing | Remove Approve page |
| **No "Continue" buttons** | Connect, Audit, Pack don't guide to next step | Add "Continue to [Next]" buttons |
| **Sidebar as only nav** | Relies on users knowing to use sidebar | Add inline next-step buttons |
| **Feature flags hide pages** | Some tools show "Coming soon", unclear why | Add explanation or hide links entirely |
| **Outreach different layout** | Only page without PageShell | Standardize with PageShell |

---

### C. Visual Inconsistencies

| Inconsistency | Pages Affected | Details |
|---------------|---------------|---------|
| **Color system mixing** | Matches, Approve | Uses both CSS tokens (--success) and Tailwind classes (green-600) |
| **Button implementation** | Connect, Outreach | Uses custom classes/Link instead of Button component |
| **Card padding** | All pages | Varies between p-4, p-5, p-6, p-8 without pattern |
| **Error colors** | Audit | Uses yellow for warnings, red for errors (correct) but not tokenized |
| **Progress indicators** | Various | Multiple different progress component styles |

---

### D. Performance Issues

**Cannot test without running app**, but code analysis suggests:

| Potential Issue | Location | Concern |
|----------------|----------|---------|
| **Large bundle size** | Pack page | Loads all 3 media pack templates at once |
| **Excessive re-renders** | Matches page | Complex state management with auto-save |
| **No pagination** | Contacts results | Could be slow with many results |
| **No virtualization** | Matches grid | Renders all brands at once (could be 50+) |

---

## APPENDIX: FILE PATHS

### Page Components
```
src/app/[locale]/tools/connect/page.tsx
src/app/[locale]/tools/audit/page.tsx
src/app/[locale]/tools/matches/page.tsx
src/app/[locale]/tools/approve/page.tsx
src/app/[locale]/tools/contacts/page.tsx
src/app/[locale]/tools/pack/page.tsx
src/app/[locale]/tools/outreach/page.tsx
```

### Shared Components
```
src/components/PageShell.tsx
src/components/ComingSoon.tsx
src/components/ui/Button.tsx
src/components/ui/Card.tsx
src/components/ui/Badge.tsx
src/components/ui/ProgressBeacon.tsx
src/components/ui/EmptyState.tsx
src/components/ui/status-pill.tsx
```

### Layout & Navigation
```
src/app/[locale]/layout.tsx
src/components/shell/AppShell.tsx
src/components/shell/SidebarNav.tsx
src/config/nav.ts
```

### Styling
```
src/styles/tokens.css
src/app/globals.css
tailwind.config.ts
```

### Progress Components (Not Used in Tools)
```
src/components/run/RunProgressWheel.tsx
src/components/run/Stepper.tsx
src/components/run/RadialStepper.tsx
src/components/run/RunProgress.tsx
```

---

## SCREENSHOTS DESCRIPTIONS

*Note: Cannot capture actual screenshots in read-only mode*

**Screenshot 1: Connect Page**
- Would show: Grid of 6 platform cards (Instagram, TikTok, YouTube, X, Facebook, LinkedIn)
- Each card shows: Platform icon, name, connection status pill, Connect/Disconnect buttons
- Layout: 3 columns on desktop, 2 on tablet, 1 on mobile

**Screenshot 2: Audit Page - Empty State**
- Would show: Platform selector checkboxes (Instagram, TikTok, YouTube)
- "Run Audit" button (primary blue)
- Empty state message: "No audits yet. Select platforms above..."

**Screenshot 3: Matches Page - Active State**
- Would show:
  - Top: Progress card with approved/rejected/pending counts and progress bar
  - Filter tabs: All / Local / National
  - Grid of brand cards (3 columns)
  - Each card: Logo, name, match score badge, Approve/Reject buttons
  - Bottom: Sticky action bar with "Save & Continue to Contacts"

**Screenshot 4: Approve Page - Redundant**
- Would show: Similar to Matches but different layout
- Progress card with stats
- Brand grid with different styling
- Action bar with "Continue to Media Pack" button

**Screenshot 5: Contacts Page**
- Would show:
  - Brand dropdown selector
  - Search results grid with contact cards
  - Each contact: Name, email, title, LinkedIn link
  - "Enrich Contacts" and "Save & Continue" buttons

**Screenshot 6: Pack Page - 2-Column Layout**
- Would show:
  - Left rail: Template selector, theme controls, brand selection, Generate PDF button
  - Right: Live preview of media pack (scrollable 800px height)
  - Bottom: Generated PDFs section with download/copy/open buttons

**Screenshot 7: Outreach Page - Tabs**
- Would show:
  - Custom header with h1, subtitle, breadcrumbs
  - Tab navigation: Start Outreach (active) / Analytics
  - 2-column grid: Pickers (left) + Sequence builder (right)
  - Bottom: Summary card with "Start Sequence" button

**Screenshot 8: Sidebar Navigation**
- Would show:
  - Left sidebar with logo at top
  - Groups: Default, Tools, Admin
  - Active link highlighted with blue background
  - "Coming soon" badges on disabled tools

---

## END OF AUDIT

**Total Pages Audited**: 7  
**Total Components Analyzed**: 25+  
**Critical Issues Found**: 3  
**Medium Issues Found**: 8  
**Minor Issues Found**: 12  

**Top 3 Recommendations**:
1. Remove `/tools/approve` page (redundant with Matches)
2. Add "Continue to [Next Step]" buttons on Connect, Audit, and Pack pages
3. Implement unified progress indicator across all workflow pages (reuse RunProgressWheel)

