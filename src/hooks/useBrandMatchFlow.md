# useBrandMatchFlow Hook

## Overview

Unified hook that combines brand match generation and approval workflows into a single, streamlined interface.

## Features

✅ **Real API Integration** - Uses `/api/match/search` (not mock data)  
✅ **Auto-Save** - Debounced auto-save (500ms) when approving/rejecting  
✅ **Append Matches** - New matches append to existing list (not replace)  
✅ **Auto-Generate** - Automatically generates matches on first mount  
✅ **Type-Safe** - Full TypeScript support with proper types  
✅ **Error Handling** - Graceful error handling throughout  

---

## Usage

### Basic Example

```tsx
'use client'
import { useBrandMatchFlow } from '@/hooks/useBrandMatchFlow'

export default function BrandMatchingPage() {
  const {
    // State
    matches,
    approvalStates,
    generating,
    saving,
    error,
    
    // Actions
    generate,
    approve,
    reject,
    reset,
    saveAndAdvance,
    
    // Computed
    stats,
    approvedBrandIds,
    rejectedBrands,
    canContinue
  } = useBrandMatchFlow()

  return (
    <div>
      {/* Stats */}
      <div>
        <p>Total: {stats.total}</p>
        <p>Approved: {stats.approved}</p>
        <p>Rejected: {stats.rejected}</p>
        <p>Pending: {stats.pending}</p>
      </div>

      {/* Actions */}
      <button onClick={() => generate()} disabled={generating}>
        {generating ? 'Generating...' : 'Generate More Matches'}
      </button>

      {/* Matches Grid */}
      {matches.map(brand => (
        <div key={brand.id}>
          <h3>{brand.name}</h3>
          <p>Score: {brand.score}%</p>
          <p>State: {approvalStates[brand.id]}</p>
          
          <button onClick={() => approve(brand.id)}>Approve</button>
          <button onClick={() => reject(brand.id)}>Reject</button>
          <button onClick={() => reset(brand.id)}>Reset</button>
        </div>
      ))}

      {/* Continue */}
      <button 
        onClick={saveAndAdvance} 
        disabled={!canContinue || saving}
      >
        {saving ? 'Saving...' : 'Continue to Media Pack'}
      </button>
    </div>
  )
}
```

---

## API Reference

### State

#### `matches: RankedBrand[]`
Array of all generated brand matches.

```typescript
type RankedBrand = BrandCandidate & {
  score: number              // 0-100
  rationale: string          // Why it fits
  pitchIdea: string          // What to pitch
  factors: string[]          // AI reasoning
  whyNow?: string           // Timing/readiness
  competitorsMentioned?: string[]
  readiness?: {
    score: number
    signals: { jobs: number; press: boolean; ads: number }
  }
}
```

#### `approvalStates: Record<string, 'pending' | 'approved' | 'rejected'>`
Approval state for each brand by ID.

#### `generating: boolean`
True when generating matches from API.

#### `saving: boolean`
True when saving to backend (auto-save or manual save).

#### `error: string | null`
Current error message, or null if no error.

---

### Actions

#### `generate(options?: BrandMatchFlowOptions): Promise<void>`

Generate new brand matches and append to existing list.

**Options:**
```typescript
interface BrandMatchFlowOptions {
  includeLocal?: boolean    // Include local businesses (default: true)
  keywords?: string[]       // Search keywords
  limit?: number           // Max results (default: 24)
}
```

**Example:**
```tsx
// Default options
await generate()

// Local businesses only
await generate({ includeLocal: true, limit: 12 })

// Search by keywords
await generate({ keywords: ['nike', 'adidas'], includeLocal: false })

// National brands, more results
await generate({ includeLocal: false, limit: 50 })
```

#### `approve(id: string): void`

Approve a brand. Triggers auto-save after 500ms debounce.

```tsx
approve('brand-123')
```

#### `reject(id: string): void`

Reject a brand. Triggers auto-save after 500ms debounce.

```tsx
reject('brand-456')
```

#### `reset(id: string): void`

Reset brand to pending state. Triggers auto-save after 500ms debounce.

```tsx
reset('brand-789')
```

#### `saveAndAdvance(): Promise<boolean>`

Save approved brands and advance to next workflow step (Media Pack).

- Validates at least 1 brand is approved
- Saves to `/api/brand-run/upsert`
- Calls `/api/brand-run/advance`
- Redirects to `/tools/pack`
- Returns `true` on success, `false` on error

```tsx
const success = await saveAndAdvance()
if (success) {
  console.log('Advanced to media pack!')
}
```

---

### Computed Values

#### `stats: BrandMatchFlowStats`

Statistics about current approval state.

```typescript
interface BrandMatchFlowStats {
  approved: number
  rejected: number
  pending: number
  total: number
}
```

#### `approvedBrandIds: string[]`

Array of all approved brand IDs.

```tsx
console.log(approvedBrandIds) // ['brand-1', 'brand-5', 'brand-12']
```

#### `rejectedBrands: RankedBrand[]`

Array of all rejected brands (full objects, not just IDs).

```tsx
rejectedBrands.forEach(brand => {
  console.log(`Rejected: ${brand.name}`)
})
```

#### `canContinue: boolean`

True if at least one brand is approved. Use this to enable/disable the Continue button.

```tsx
<button disabled={!canContinue}>
  Continue to Media Pack
</button>
```

---

## Advanced Patterns

### Filter by Approval State

```tsx
const { matches, approvalStates } = useBrandMatchFlow()

const pendingBrands = matches.filter(m => approvalStates[m.id] === 'pending')
const approvedBrands = matches.filter(m => approvalStates[m.id] === 'approved')
const rejectedBrands = matches.filter(m => approvalStates[m.id] === 'rejected')
```

### Approve Multiple Brands

```tsx
const approveAll = (ids: string[]) => {
  ids.forEach(id => approve(id))
  // Auto-save will debounce and save once after 500ms
}

approveAll(['brand-1', 'brand-2', 'brand-3'])
```

### Conditional Generation

```tsx
const { matches, generate, generating } = useBrandMatchFlow()

// Only generate if we have fewer than 10 matches
React.useEffect(() => {
  if (matches.length < 10 && !generating) {
    generate({ limit: 20 })
  }
}, [matches.length, generating])
```

### Local vs National Toggle

```tsx
const [showLocal, setShowLocal] = React.useState(true)

const handleGenerate = () => {
  generate({
    includeLocal: showLocal,
    categories: showLocal 
      ? ['cafe', 'gym', 'salon', 'retail']
      : [],
    limit: 24
  })
}
```

---

## Migration Guide

### From useMatchGenerator

**Before:**
```tsx
const { generating, matches, selected, toggle } = useMatchGenerator()
```

**After:**
```tsx
const { generating, matches, approvalStates, approve } = useBrandMatchFlow()

// Instead of toggle(id), use approve(id)
// Instead of selected array, use approvedBrandIds
```

### From useBrandApproval

**Before:**
```tsx
const { 
  brands, 
  approvalStates, 
  approve, 
  saveApprovals, 
  advanceToNext 
} = useBrandApproval()
```

**After:**
```tsx
const {
  matches,           // replaces 'brands'
  approvalStates,
  approve,
  saveAndAdvance    // replaces saveApprovals + advanceToNext
} = useBrandMatchFlow()

// Auto-save is built-in, no need to call saveApprovals manually
```

---

## Error Handling

```tsx
const { error, generate } = useBrandMatchFlow()

// Display errors
{error && (
  <div className="text-red-600">
    {error}
  </div>
)}

// Retry on error
const handleRetry = () => {
  if (error) {
    generate()
  }
}
```

---

## Performance Notes

- **Auto-Save Debounce:** 500ms delay prevents API spam when rapidly approving/rejecting
- **Append vs Replace:** New matches append to list for better UX (no flash/re-render)
- **Auto-Generate:** Only runs on mount if `matches.length === 0`
- **Cleanup:** Debounce timers are properly cleaned up on unmount

---

## API Endpoints Used

### `POST /api/match/search`
Generate brand matches using real discovery + AI ranking.

### `POST /api/brand-run/upsert`
Save approved brand IDs to current brand run.

### `POST /api/brand-run/advance`
Advance workflow to next step.

---

## TypeScript Types

```typescript
import type { 
  RankedBrand, 
  BrandSearchInput, 
  BrandCandidate 
} from '@/types/match'

type ApprovalState = 'pending' | 'approved' | 'rejected'

interface BrandMatchFlowOptions {
  includeLocal?: boolean
  keywords?: string[]
  limit?: number
}

interface BrandMatchFlowStats {
  approved: number
  rejected: number
  pending: number
  total: number
}
```

---

## Testing

```tsx
import { renderHook, act } from '@testing-library/react'
import { useBrandMatchFlow } from './useBrandMatchFlow'

test('approves brand and triggers auto-save', async () => {
  const { result } = renderHook(() => useBrandMatchFlow())
  
  // Wait for initial generation
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
  })
  
  // Approve a brand
  act(() => {
    result.current.approve('brand-1')
  })
  
  expect(result.current.approvalStates['brand-1']).toBe('approved')
  expect(result.current.stats.approved).toBe(1)
})
```

---

## Common Issues

### "No workspace ID found"
Ensure user is authenticated and `wsid` cookie is set.

### Matches not appending
Check that brand IDs are unique. Duplicates are filtered out.

### Auto-save not working
Check console for API errors. Auto-save failures are logged but not shown to user.

### Can't continue
Ensure at least one brand is approved (`canContinue === true`).

---

## Future Enhancements

- [ ] Undo/redo approval actions
- [ ] Bulk approve/reject
- [ ] Export approved brands as CSV
- [ ] Match history/versioning
- [ ] Custom approval workflows
- [ ] Integration with CRM systems

---

## Support

For issues or questions, check:
- `/src/types/match.ts` - Type definitions
- `/src/app/api/match/search/route.ts` - API implementation
- `/docs/brand-matching.md` - Full system documentation

