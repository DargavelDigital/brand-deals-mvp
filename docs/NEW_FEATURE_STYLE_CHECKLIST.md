# New Feature Style Checklist

When creating new features, follow these styling guidelines to maintain consistency with the design system.

## Global Setup
- ✅ **Import src/styles/base.css via app layout** (already global)
- ✅ **Wrap pages in `<Section>` or `.container-1200`**

## UI Primitives
Always use these components instead of raw HTML elements:
- ✅ **`<Card>`** - For content containers and sections
- ✅ **`<Button>`** - With appropriate variants (primary, secondary, ghost)
- ✅ **`<Input>`** - For text inputs, emails, etc.
- ✅ **`<Select>`** - For dropdown selections
- ✅ **`<Badge>`** - For status indicators and tags

## Color System
- ❌ **No raw hex colors** - Only use design tokens
- ✅ **Tailwind reads CSS vars** - Use classes like `bg-accent`, `text-muted`
- ✅ **Semantic states** - Use classes backed by tokens:
  - `text-success`, `text-error`, `text-warn`, `text-info`
  - `bg-success/10`, `bg-error/10`, `bg-warn/10`, `bg-info/10`
  - `border-success/20`, `border-error/20`, etc.

## Focus & Accessibility
- ✅ **Always include focus-visible support**
- ❌ **No custom outlines** - Use the built-in focus ring system
- ✅ **Focus rings use `:focus-visible`** via the UI components

## Layout & Spacing
- ✅ **Responsive grid patterns**:
  ```css
  grid gap-6 md:grid-cols-2 lg:grid-cols-3
  ```
- ✅ **Consistent spacing**:
  - `space-y-6` for vertical rhythm
  - `gap-6` for grid spacing
  - `p-6` for card padding

## Typography
- ✅ **Use design system tokens**:
  - `text-text` for primary text
  - `text-muted` for secondary text
  - `text-sm`, `text-base`, `text-lg` for sizes
  - `font-medium`, `font-semibold`, `font-bold` for weights

## Examples

### ✅ Good - Using primitives and tokens
```tsx
<Card className="p-6">
  <h2 className="text-xl font-semibold text-text mb-4">Title</h2>
  <p className="text-muted mb-4">Description</p>
  <Button variant="primary">Action</Button>
</Card>
```

### ❌ Bad - Raw elements and hex colors
```tsx
<div className="p-6 bg-white border border-gray-300 rounded-lg">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">Title</h2>
  <p className="text-gray-600 mb-4">Description</p>
  <button className="px-4 py-2 bg-blue-500 text-white rounded">Action</button>
</div>
```

## Quick Reference

### Common Patterns
```tsx
// Page wrapper
<Section title="Page Title" description="Description">
  <div className="container-1200 space-y-6">
    {/* content */}
  </div>
</Section>

// Card grid
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  <Card className="p-6">
    {/* content */}
  </Card>
</div>

// Form layout
<div className="space-y-4">
  <div className="space-y-2">
    <label className="text-sm font-medium text-text">Label</label>
    <Input type="text" />
  </div>
</div>
```

### Status Indicators
```tsx
<Badge variant="success" size="sm">Active</Badge>
<Badge variant="error" size="sm">Failed</Badge>
<Badge variant="warn" size="sm">Pending</Badge>
<Badge variant="info" size="sm">Processing</Badge>
```

### Button Variants
```tsx
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="ghost">Subtle Action</Button>
```

Remember: Consistency is key. When in doubt, check existing components for patterns and reuse the established styling approach.
