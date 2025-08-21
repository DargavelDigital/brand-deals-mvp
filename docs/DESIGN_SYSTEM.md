# BrandDeals Design System v1

## Overview

The BrandDeals Design System v1 provides a comprehensive set of design tokens, components, and enforcement mechanisms to ensure consistent UI across the application.

## 🎨 Design Tokens

### Colors
- **Primary**: `#0B0E14` (bg), `#0F141B` (panel), `#111826` (card)
- **Text**: `#E6EDF3` (primary), `#8A97A6` (muted)
- **Borders**: `#1E2633`
- **Brand**: `#7C5CFF` (primary), `#22D3EE` (secondary)
- **Semantic**: `#34D399` (positive), `#F59E0B` (warning), `#F87171` (danger)

### Spacing
- **Scale**: `2px` (xxs) to `48px` (xxxl)
- **Common**: `8px` (sm), `12px` (md), `16px` (lg), `24px` (xl)

### Border Radius
- **Medium**: `12px`
- **Large**: `16px`
- **Extra Large**: `20px`

### Shadows
- **Tile**: `0 8px 24px rgba(0,0,0,.20)`

### Typography
- **Body**: Inter, ui-sans-serif, system-ui

## 🧩 Core Components

### Layout Components
- **`<AppShell>`**: Main application layout with header, sidebar, and content area
- **`<DashboardGrid>`**: 12-column responsive grid system
- **`<Col>`**: Responsive column component (12/6/3 columns based on breakpoint)

### UI Components
- **`<MetricCard>`**: KPI display with label, value, delta, and badge
- **`<BrandCard>`**: Brand information card with logo, details, and actions
- **`<DealCard>`**: Compact deal tile for CRM views

### Chart Components
- **`<MinimalAreaChart>`**: Clean area chart using Recharts
- **`<MinimalBarChart>`**: Simple bar chart variant

## 🛡️ Enforcement System

### ESLint Rules
- **`no-banned-classes`**: Prevents use of problematic CSS classes
- **Banned Classes**: `border-dashed`, `w-screen`, `flex-1`, `grow`, etc.

### CI Scripts
- **`pnpm lint:ui`**: Runs ESLint with design system rules
- **`pnpm check:ui`**: Comprehensive UI guard check (ESLint + pattern scanning)

### Testing
- **Playwright Tests**: Enforce layout consistency and design system compliance
- **Responsive Testing**: Verify grid behavior at different breakpoints

## 📱 Responsive Behavior

### Grid System
- **Desktop (1440px+)**: 4 columns per row
- **Tablet (1024px)**: 2 columns per row  
- **Mobile (375px)**: 1 column per row

### Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px

## 🚀 Usage Examples

### Basic Layout
```tsx
import { AppShell, DashboardGrid, Col } from '@/ui/containers';
import { MetricCard } from '@/components/dashboard/MetricCard';

export default function Dashboard() {
  return (
    <AppShell>
      <DashboardGrid>
        <Col>
          <MetricCard label="Total Deals" value="24" />
        </Col>
        <Col>
          <MetricCard label="Active" value="8" />
        </Col>
      </DashboardGrid>
    </AppShell>
  );
}
```

### Brand Card
```tsx
import { BrandCard } from '@/components/swipe/BrandCard';

<BrandCard
  brand={{
    name: "Nike",
    logoUrl: "https://logo.clearbit.com/nike.com",
    categories: ["Sports", "Fashion"]
  }}
  matchReasons={[
    "High audience overlap",
    "Brand values alignment"
  ]}
  onApprove={() => {}}
  onStartOutreach={() => {}}
/>
```

## 🔧 Development

### Adding New Components
1. Create component in appropriate directory
2. Use design system tokens (`var(--bg)`, `var(--card)`, etc.)
3. Follow responsive patterns
4. Add to ESLint rules if needed

### Testing Components
1. Run `pnpm lint:ui` for code quality
2. Run `pnpm check:ui` for comprehensive check
3. Test responsive behavior with Playwright

### Updating Tokens
1. Modify `src/ui/tokens.ts`
2. Update `tailwind.config.ts`
3. Update `src/app/globals.css`
4. Test all components

## 📋 Scripts

```bash
# Lint UI components
pnpm lint:ui

# Comprehensive UI check
pnpm check:ui

# Build application
pnpm build

# Development server
pnpm dev
```

## 🎯 Best Practices

1. **Always use design system tokens** instead of hardcoded values
2. **Follow responsive patterns** with the grid system
3. **Avoid banned classes** that break layout consistency
4. **Test at multiple breakpoints** to ensure responsive behavior
5. **Use semantic colors** for different states and meanings

## 🔍 Troubleshooting

### Common Issues
- **Build failures**: Check for banned classes or TypeScript errors
- **Layout breaks**: Verify grid usage and responsive classes
- **Color mismatches**: Ensure CSS variables are properly set

### Debug Commands
```bash
# Check for banned patterns
pnpm check:ui

# Verify build
pnpm build

# Test specific component
pnpm lint:ui -- src/components/dashboard/MetricCard.tsx
```

## 📚 References

- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [ESLint](https://eslint.org/)
