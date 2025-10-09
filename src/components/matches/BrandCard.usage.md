# BrandCard Component - Usage Guide

## Overview

The BrandCard component now supports both **legacy selection mode** and **inline approval workflow** mode.

---

## Props

```typescript
{
  brand: UIMatchBrand              // Brand data
  selected?: boolean               // Legacy: selection state
  onSelect?: (id: string) => void  // Legacy: selection callback
  onDetails: (id: string) => void  // View details (required)
  
  // NEW: Approval workflow props (optional)
  approvalState?: 'pending' | 'approved' | 'rejected'
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  onReset?: (id: string) => void
}
```

---

## Usage Examples

### 1. **New Approval Workflow** (Recommended)

Use with `useBrandMatchFlow` hook:

```tsx
import { useBrandMatchFlow } from '@/hooks/useBrandMatchFlow'
import BrandCard from '@/components/matches/BrandCard'

export default function BrandMatchingPage() {
  const {
    matches,
    approvalStates,
    approve,
    reject,
    reset
  } = useBrandMatchFlow()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {matches.map(brand => (
        <BrandCard
          key={brand.id}
          brand={brand}
          approvalState={approvalStates[brand.id]}
          onApprove={approve}
          onReject={reject}
          onReset={reset}
          onDetails={(id) => console.log('View details:', id)}
        />
      ))}
    </div>
  )
}
```

---

### 2. **Legacy Selection Mode** (Backwards Compatible)

Existing code continues to work without changes:

```tsx
import BrandCard from '@/components/matches/BrandCard'
import useMatchGenerator from '@/components/matches/useMatchGenerator'

export default function LegacyMatchesPage() {
  const { matches, selected, toggle } = useMatchGenerator()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {matches.map(brand => (
        <BrandCard
          key={brand.id}
          brand={brand}
          selected={selected.includes(brand.id)}
          onSelect={toggle}
          onDetails={(id) => console.log('Details:', id)}
        />
      ))}
    </div>
  )
}
```

---

### 3. **Manual Approval State Management**

Without using the hook:

```tsx
import { useState } from 'react'
import BrandCard from '@/components/matches/BrandCard'

export default function ManualApprovalPage() {
  const [approvalStates, setApprovalStates] = useState({})

  const handleApprove = (id: string) => {
    setApprovalStates(prev => ({ ...prev, [id]: 'approved' }))
  }

  const handleReject = (id: string) => {
    setApprovalStates(prev => ({ ...prev, [id]: 'rejected' }))
  }

  const handleReset = (id: string) => {
    setApprovalStates(prev => ({ ...prev, [id]: 'pending' }))
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {brands.map(brand => (
        <BrandCard
          key={brand.id}
          brand={brand}
          approvalState={approvalStates[brand.id] || 'pending'}
          onApprove={handleApprove}
          onReject={handleReject}
          onReset={handleReset}
          onDetails={handleDetails}
        />
      ))}
    </div>
  )
}
```

---

## Visual States

### **Pending** (Gray Border)
```
┌─────────────────────────────────┐
│ 🏢 Nike             [95% Match] │
│                                  │
│ Leading athletic footwear...    │
│                                  │
│ [✓ Approve] [✗] [👁]            │
└─────────────────────────────────┘
```

### **Approved** (Green Border + Badge)
```
┌─────────────────────────────────┐
│ 🏢 Nike  [✓ Approved] [95% Match]│
│                                  │
│ Leading athletic footwear...    │
│                                  │
│ [↺ Reset] [👁]                  │
└─────────────────────────────────┘
↑ Shadow elevated, green border
```

### **Rejected** (Red Border + Badge, Faded)
```
┌─────────────────────────────────┐
│ 🏢 Nike  [✗ Rejected] [95% Match]│
│                                  │
│ Leading athletic footwear...    │
│                                  │
│ [↺ Reset] [👁]                  │
└─────────────────────────────────┘
↑ 60% opacity, red border
```

---

## Styling Details

### Border Colors
- **Pending:** `border-gray-200`
- **Approved:** `border-green-500` (2px border)
- **Rejected:** `border-red-300` (2px border)
- **Legacy Selected:** `ring-2 ring-[var(--brand-600)]`

### Background Colors
- **Approved:** `bg-green-50`
- **Rejected:** `bg-red-50`
- **Legacy Selected:** `bg-[var(--tint-accent)]`

### Opacity
- **Rejected:** `opacity-60` (faded)

### Shadow
- **Approved:** `shadow-md` (elevated)
- **Pending:** `hover:shadow-lg` (on hover)

---

## Button Reference

### Approve Button
```tsx
<Button 
  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
  size="sm"
>
  <Check className="w-4 h-4 mr-1" />
  Approve
</Button>
```

### Reject Button
```tsx
<Button 
  variant="outline"
  className="bg-red-50 hover:bg-red-100 text-red-700 border-red-300"
  size="sm"
>
  <X className="w-4 h-4" />
</Button>
```

### Reset Button
```tsx
<Button 
  variant="ghost"
  className="flex-1 text-gray-600 hover:text-gray-800"
  size="sm"
>
  <RotateCcw className="w-4 h-4 mr-1" />
  Reset
</Button>
```

### Details Button (Icon Only)
```tsx
<Button variant="ghost" size="sm">
  <Eye className="w-4 h-4" />
</Button>
```

---

## Status Badges

### Approved Badge
```tsx
<Badge className="bg-green-600 text-white border-green-600">
  <Check className="w-3 h-3 mr-1" />
  Approved
</Badge>
```

### Rejected Badge
```tsx
<Badge className="bg-red-600 text-white border-red-600">
  <X className="w-3 h-3 mr-1" />
  Rejected
</Badge>
```

---

## Icons Used

```tsx
import { Check, X, RotateCcw, Eye } from 'lucide-react'
```

- **Check** (✓) - Approve button, Approved badge
- **X** (✗) - Reject button, Rejected badge
- **RotateCcw** (↺) - Reset button
- **Eye** (👁) - Details button

---

## Backwards Compatibility

✅ **Legacy mode is automatically detected:**
- If `approvalState` is undefined → Legacy mode
- Shows "Select Brand" / "Selected" button
- Works with existing `useMatchGenerator` hook

✅ **No breaking changes:**
- All existing code continues to work
- Optional props don't affect old usage
- Same component, two modes

---

## Migration Path

### From Old to New

**Before:**
```tsx
<BrandCard
  brand={brand}
  selected={selected.includes(brand.id)}
  onSelect={toggle}
  onDetails={handleDetails}
/>
```

**After:**
```tsx
<BrandCard
  brand={brand}
  approvalState={approvalStates[brand.id]}
  onApprove={approve}
  onReject={reject}
  onReset={reset}
  onDetails={handleDetails}
/>
```

**Benefits:**
- ✅ Inline approval (no page transition)
- ✅ Visual feedback (colors, badges)
- ✅ Auto-save integration
- ✅ Better UX flow

---

## Common Patterns

### Filter by State

```tsx
const pendingBrands = matches.filter(m => 
  approvalStates[m.id] === 'pending'
)

const approvedBrands = matches.filter(m => 
  approvalStates[m.id] === 'approved'
)
```

### Bulk Actions

```tsx
const approveAll = () => {
  matches.forEach(brand => approve(brand.id))
}

const rejectAll = () => {
  matches.forEach(brand => reject(brand.id))
}
```

### Conditional Rendering

```tsx
{matches.map(brand => {
  const state = approvalStates[brand.id]
  
  // Only show pending brands
  if (state !== 'pending') return null
  
  return (
    <BrandCard
      key={brand.id}
      brand={brand}
      approvalState={state}
      onApprove={approve}
      onReject={reject}
      onDetails={handleDetails}
    />
  )
})}
```

---

## Accessibility

- ✅ All buttons have clear labels or icons
- ✅ Color is not the only indicator (badges + icons)
- ✅ Keyboard accessible (button elements)
- ✅ Hover states for all interactive elements

---

## Performance Notes

- Component re-renders only when props change
- Icons are tree-shakeable from lucide-react
- No heavy computations in render
- Efficient conditional rendering

---

## TypeScript Support

Full type safety with exported types:

```typescript
import type { UIMatchBrand } from '@/components/matches/BrandCard'

const brand: UIMatchBrand = {
  id: '1',
  name: 'Nike',
  matchScore: 95,
  // ... other fields
}
```

---

## Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import BrandCard from './BrandCard'

test('calls onApprove when approve button clicked', () => {
  const onApprove = jest.fn()
  
  render(
    <BrandCard
      brand={mockBrand}
      approvalState="pending"
      onApprove={onApprove}
      onDetails={jest.fn()}
    />
  )
  
  fireEvent.click(screen.getByText('Approve'))
  expect(onApprove).toHaveBeenCalledWith(mockBrand.id)
})
```

---

## Related Components

- `BrandDetailsDrawer` - Shows full brand details
- `BrandApprovalGrid` - Grid container for approval cards
- `BrandLogo` - Brand logo with Clearbit fallback

---

## Related Hooks

- `useBrandMatchFlow` - Unified matching + approval workflow
- `useMatchGenerator` - Legacy match generation (still supported)
- `useBrandApproval` - Legacy approval (still supported)

