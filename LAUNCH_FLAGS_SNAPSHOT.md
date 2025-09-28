# Launch Flags Snapshot - Before Enabling All Tools

## Current Configuration (2025-01-28)

### Social Media Launch Configuration
- `NEXT_PUBLIC_LAUNCH_SOCIALS="instagram"` - Only Instagram enabled
- Other platforms (TikTok, YouTube, X, LinkedIn) are disabled

### Feature Flags Status
All feature flags are currently set to `false`:

#### Core Features
- `FEATURE_BILLING_ENABLED="false"`
- `NEXT_PUBLIC_CRM_LIGHT_ENABLED="false"`
- `FEATURE_OBSERVABILITY="false"`
- `FEATURE_DEMO_AUTH="false"`
- `FEATURE_REALTIME="false"`
- `FEATURE_PUSH_NOTIFICATIONS="false"`

#### AI Features
- `FEATURE_AI_AUDIT_V2="false"`
- `FEATURE_AI_MATCH_V2="false"`
- `FEATURE_MEDIA_PACK_V2="false"`
- `FEATURE_BRAND_RUN_ONETOUCH="false"`
- `FEATURE_OUTREACH_TONES="false"`

#### Social Media Features
- `FEATURE_INSTAGRAM_ENABLED="false"`
- `FEATURE_TIKTOK_ENABLED="false"`
- `FEATURE_YOUTUBE_ENABLED="false"`
- `FEATURE_TWITTER_ENABLED="false"`
- `FEATURE_LINKEDIN_ENABLED="false"`

#### Business Data & Location
- `FEATURE_GOOGLE_PLACES_ENABLED="false"`
- `FEATURE_YELP_ENABLED="false"`
- `FEATURE_SERPAPI_ENABLED="false"`

#### Analytics & Tracking
- `FEATURE_ANALYTICS_ENABLED="false"`
- `FEATURE_AB_TESTING_ENABLED="false"`

#### Data Network Effects
- `FEATURE_NETFX="false"`
- `FEATURE_NETFX_AB="false"`

#### Compliance & Safety
- `FEATURE_COMPLIANCE_MODE="false"`
- `FEATURE_SAFETY_MODERATION="false"`
- `FEATURE_EXPORTS_ENABLED="false"`
- `FEATURE_RETENTION_ENABLED="false"`

#### Import & Integration Features
- `FEATURE_IMPORT_CSV="false"`
- `FEATURE_IMPORT_SHEETS="false"`
- `FEATURE_CRM_HUBSPOT="false"`
- `FEATURE_CRM_PIPEDRIVE="false"`
- `FEATURE_CALENDAR_GOOGLE="false"`
- `FEATURE_CALENDAR_MICROSOFT="false"`

#### Advanced Matching
- `FEATURE_MATCH_INTELLIGENCE_V3="false"`
- `FEATURE_MATCH_READINESS_SIGNALS="false"`
- `FEATURE_MATCH_CONTINUOUS_DISCOVERY="false"`

#### Media Pack Features
- `FEATURE_MEDIAPACK_LIVE="false"`
- `FEATURE_MEDIAPACK_AB="false"`
- `FEATURE_MEDIAPACK_ANALYTICS="false"`
- `FEATURE_MEDIAPACK_CONVERSIONS="false"`
- `FEATURE_MP_TRACKING="false"`
- `FEATURE_MP_CONVERSION_DASHBOARD="false"`

### Launch Logic Files
- `src/lib/launch.ts` - Controls social platform visibility
- `src/lib/flags.ts` - Controls feature flag system

### Current State
- Instagram-only launch mode active
- All other platforms show "Coming soon" status
- All advanced features disabled
- Demo mode enabled for development

### Next Steps
This snapshot was taken before enabling all tools in the `feat/show-all-tools` branch.
