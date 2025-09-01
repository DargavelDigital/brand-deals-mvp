# Feature Flags Documentation

This document lists all feature flags used in the application, their defaults, and where they are used.

## Client-Side Flags (NEXT_PUBLIC_*)

These flags are available in both client and server code and are embedded at build time.

### Core Application Flags

| Flag | Default | Used By | Description |
|------|---------|---------|-------------|
| `NEXT_PUBLIC_CRM_LIGHT_ENABLED` | `false` | CRM page, DealCard component | Enables lightweight CRM mode with simplified UI |
| `NEXT_PUBLIC_FEATURE_CONTACTS_DEDUPE` | `false` | Contacts page | Enables contact deduplication features |
| `NEXT_PUBLIC_FEATURE_CONTACTS_BULK` | `false` | Contacts page | Enables bulk contact operations |
| `NEXT_PUBLIC_ENABLE_DEMO_AUTH` | `false` | Sign-in page | Enables demo authentication mode |
| `NEXT_PUBLIC_DEMO_MODE` | `false` | WorkflowOrchestrator | Enables demo mode for workflow operations |
| `NEXT_PUBLIC_REALTIME` | `false` | useEventStream hook | Enables real-time event streaming |

### Development & Debug Flags

| Flag | Default | Used By | Description |
|------|---------|---------|-------------|
| `NEXT_PUBLIC_CRM_DEBUG` | `false` | CRM page | Shows debug information in CRM interface |
| `NEXT_PUBLIC_DEV_DEMO_AUTH` | `false` | Various components | Development-only demo authentication |

### PWA & Push Notification Flags

| Flag | Default | Used By | Description |
|------|---------|---------|-------------|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | `undefined` | ClientBoot component | VAPID public key for push notifications |
| `NEXT_PUBLIC_PWA_ENABLED` | `false` | ClientBoot component | Enables Progressive Web App features |
| `NEXT_PUBLIC_PUSH_ENABLED` | `false` | ClientBoot component | Enables push notification features |

### AI & Analytics Flags

| Flag | Default | Used By | Description |
|------|---------|---------|-------------|
| `NEXT_PUBLIC_AI_ADAPT_FEEDBACK` | `false` | AI feedback systems | Enables adaptive AI feedback learning |
| `NEXT_PUBLIC_FEATURE_BRANDRUN_PROGRESS_VIZ` | `false` | Brand run components | Enables progress visualization in brand runs |
| `NEXT_PUBLIC_FEATURE_OBSERVABILITY` | `false` | Observability systems | Enables enhanced observability features |

### Security Flags

| Flag | Default | Used By | Description |
|------|---------|---------|-------------|
| `NEXT_PUBLIC_SAFETY_MODERATION` | `false` | Content moderation | Enables AI-powered content safety moderation |

### Network Effects & Privacy Flags

| Flag | Default | Used By | Description |
|------|---------|---------|-------------|
| `NEXT_PUBLIC_NETFX_ENABLED` | `false` | Network effects systems | Enables network effects features |
| `NEXT_PUBLIC_NETFX_AB_ENABLED` | `false` | A/B testing systems | Enables A/B testing for network effects |
| `NEXT_PUBLIC_NETFX_KMIN` | `undefined` | Privacy systems | Minimum k-anonymity threshold |
| `NEXT_PUBLIC_NETFX_DP_EPSILON` | `undefined` | Privacy systems | Differential privacy epsilon parameter |
| `NEXT_PUBLIC_NETFX_PLAYBOOKS` | `false` | Playbook systems | Enables network effects playbooks |

## Server-Side Flags

These flags are only available on the server and are defined in `src/lib/env.ts`.

### Core Server Flags

| Flag | Default | Used By | Description |
|------|---------|---------|-------------|
| `MEDIAPACK_V2` | `undefined` | Media pack generation | Enables v2 media pack generation |
| `ENABLE_DEMO_AUTH` | `false` | Authentication systems | Enables demo authentication on server |
| `FEATURE_OBSERVABILITY` | `false` | Observability systems | Server-side observability features |
| `FEATURE_BILLING_ENABLED` | `false` | Billing systems | Enables billing functionality |
| `FEATURE_MATCH_LOCAL_ENABLED` | `false` | Matching systems | Enables local matching algorithms |
| `FEATURE_ONE_TOUCH` | `false` | One-touch features | Enables one-touch operations |
| `FEATURE_REALTIME` | `false` | Real-time systems | Enables real-time features |
| `FEATURE_CONTACTS_DEDUPE` | `false` | Contact systems | Server-side contact deduplication |
| `FEATURE_CONTACTS_BULK` | `false` | Contact systems | Server-side bulk contact operations |
| `FEATURE_BRANDRUN_PROGRESS_VIZ` | `false` | Brand run systems | Server-side progress visualization |

## Usage Guidelines

### Client-Side Usage

Use the `clientEnv` helper for consistent access:

```typescript
import { getBoolean, get } from '@/lib/clientEnv';

// For boolean flags
const isEnabled = getBoolean('NEXT_PUBLIC_CRM_LIGHT_ENABLED');

// For string values with defaults
const vapidKey = get('NEXT_PUBLIC_VAPID_PUBLIC_KEY', 'default-value');
```

### Server-Side Usage

Use the `env` object from `src/lib/env.ts`:

```typescript
import { env } from '@/lib/env';

// For boolean flags
const isEnabled = env.FEATURE_BILLING_ENABLED === 'true';

// For string values
const mediaPackV2 = env.MEDIAPACK_V2;
```

## Flag Management

### Adding New Flags

1. Add the flag to `src/lib/env.ts` (server-side) or `src/lib/clientEnv.ts` (client-side)
2. Update this documentation
3. Set appropriate defaults
4. Test in development environment

### Removing Flags

1. Remove from environment schema
2. Remove from clientEnv defaults
3. Update all usage locations
4. Remove from this documentation

### Recently Removed Flags

The following flags were removed as they were unused:

- `NEXT_PUBLIC_COMPLIANCE_MODE` - No active usage found
- `NEXT_PUBLIC_EXPORTS_ENABLED` - No active usage found  
- `NEXT_PUBLIC_RETENTION_ENABLED` - No active usage found

### Safe-to-Remove Flags

The following flags are candidates for removal as they appear to be unused or have minimal impact:

- `NEXT_PUBLIC_NETFX_*` - All network effects flags appear unused

## Environment Configuration

Flags are configured in `.env.local` for development:

```bash
# Core flags
NEXT_PUBLIC_CRM_LIGHT_ENABLED=true
NEXT_PUBLIC_ENABLE_DEMO_AUTH=true
ENABLE_DEMO_AUTH=true
MEDIAPACK_V2=1

# Development flags
NEXT_PUBLIC_CRM_DEBUG=true
NEXT_PUBLIC_DEMO_MODE=true
```

## Testing

To test flag behavior:

1. Set flags in `.env.local`
2. Restart the development server
3. Use the debug endpoint: `GET /api/debug/flags`
4. Check browser console for flag values in development mode
