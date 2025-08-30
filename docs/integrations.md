# Integrations Guide

This document covers the setup and configuration for all external service integrations used in Brand Deals MVP.

## 🔑 Environment Variables

All integrations require environment variables to be set in your `.env.local` file. See `.env.example` for the complete list.

## 🧠 Exa (AI Search)

Exa provides AI-powered search capabilities for brand research and competitor analysis.

### Setup

1. **Get API Key**: Sign up at [exa.ai](https://exa.ai) and generate an API key
2. **Set Environment Variable**:
   ```bash
   EXA_API_KEY=your_api_key_here
   ```

### Rate Limiting

- **Free Tier**: 100 requests/month
- **Pro Tier**: 10,000 requests/month
- **Enterprise**: Custom limits

### Testing

Test your Exa integration with this curl command:

```bash
curl -X POST "https://api.exa.ai/search" \
  -H "Authorization: Bearer $EXA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "brand deals influencer marketing",
    "numResults": 5,
    "includeDomains": ["linkedin.com", "forbes.com"],
    "excludeDomains": ["spam.com"]
  }'
```

### Example Response

```json
{
  "results": [
    {
      "title": "The Complete Guide to Influencer Marketing in 2024",
      "url": "https://example.com/influencer-marketing-guide",
      "text": "Brand deals have become a cornerstone of modern marketing...",
      "score": 0.95,
      "publishedDate": "2024-01-15"
    }
  ],
  "query": "brand deals influencer marketing",
  "totalResults": 1250
}
```

### Feature Flag

Enable Exa integration:
```bash
FEATURE_EXA_ENABLED=true
```

**UI Changes**: Search results will show AI-powered insights and competitor analysis.

---

## 🏢 Google Places API

Google Places provides business information, reviews, and location data for brand research.

### Setup

1. **Enable Google Places API**: Go to [Google Cloud Console](https://console.cloud.google.com)
2. **Create Project**: Set up a new project or use existing
3. **Enable APIs**: Enable "Places API" and "Geocoding API"
4. **Create API Key**: Generate credentials → API Key
5. **Set Environment Variable**:
   ```bash
   GOOGLE_PLACES_API_KEY=your_api_key_here
   ```

### Allowed Referrers

For production, restrict your API key to specific domains:
- `https://yourdomain.com/*`
- `https://staging.yourdomain.com/*`

### Categories We Use

```typescript
const PLACE_CATEGORIES = [
  'restaurant',
  'bar',
  'cafe',
  'retail',
  'entertainment',
  'fitness',
  'beauty',
  'health',
  'education',
  'professional'
];
```

### Example Request

```bash
curl "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=40.7128,-74.0060&radius=5000&type=restaurant&key=$GOOGLE_PLACES_API_KEY"
```

### Example Response

```json
{
  "results": [
    {
      "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
      "name": "Example Restaurant",
      "rating": 4.5,
      "user_ratings_total": 1250,
      "types": ["restaurant", "food", "establishment"],
      "vicinity": "123 Main St, New York, NY"
    }
  ],
  "status": "OK"
}
```

### Feature Flag

Enable Google Places integration:
```bash
FEATURE_GOOGLE_PLACES_ENABLED=true
```

**UI Changes**: Location-based brand discovery and business information cards.

---

## 📺 YouTube Data API

YouTube Data API provides channel statistics, video analytics, and content insights.

### Authentication Options

#### Option 1: API Key (Read-only, Limited)
```bash
YOUTUBE_API_KEY=your_api_key_here
```
- **Scope**: Public data only
- **Limits**: 10,000 units/day
- **Use Case**: Basic channel stats, public video info

#### Option 2: OAuth 2.0 (Full Access)
```bash
YOUTUBE_CLIENT_ID=your_client_id
YOUTUBE_CLIENT_SECRET=your_client_secret
YOUTUBE_REDIRECT_URI=https://yourdomain.com/auth/youtube/callback
```

### Minimal Scopes

```typescript
const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl'
];
```

### Our Read-only Endpoints

```typescript
// Channel statistics
GET /youtube/v3/channels?part=statistics&id={channelId}

// Video analytics
GET /youtube/v3/videos?part=statistics,snippet&id={videoId}

// Search channels
GET /youtube/v3/search?part=snippet&type=channel&q={query}

// Channel videos
GET /youtube/v3/search?part=snippet&channelId={channelId}&type=video
```

### Example Request

```bash
curl "https://www.googleapis.com/youtube/v3/channels?part=statistics&id=UC_x5XG1OV2P6uZZ5FSM9Ttw&key=$YOUTUBE_API_KEY"
```

### Example Response

```json
{
  "items": [
    {
      "id": "UC_x5XG1OV2P6uZZ5FSM9Ttw",
      "statistics": {
        "viewCount": "1234567890",
        "subscriberCount": "50000000",
        "videoCount": "1500"
      }
    }
  ]
}
```

### Feature Flag

Enable YouTube integration:
```bash
FEATURE_YOUTUBE_ENABLED=true
```

**UI Changes**: YouTube channel cards, video analytics, and content performance metrics.

---

## 📸 Instagram Basic Display API

Instagram integration for profile data and media insights.

### Setup

1. **Create Facebook App**: Go to [Facebook Developers](https://developers.facebook.com)
2. **Add Instagram Basic Display**: Add product to your app
3. **Configure OAuth**:
   - **Valid OAuth Redirect URIs**: `https://yourdomain.com/auth/instagram/callback`
   - **Deauthorize Callback URL**: `https://yourdomain.com/auth/instagram/deauthorize`
   - **Data Deletion Request URL**: `https://yourdomain.com/auth/instagram/delete`

### Environment Variables

```bash
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_REDIRECT_URI=https://yourdomain.com/auth/instagram/callback
```

### Exact Scopes

```typescript
const INSTAGRAM_SCOPES = [
  'user_profile',
  'user_media'
];
```

### Example OAuth Flow

```typescript
const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_APP_ID}&redirect_uri=${INSTAGRAM_REDIRECT_URI}&scope=${INSTAGRAM_SCOPES.join(',')}&response_type=code`;
```

### Feature Flag

Enable Instagram integration:
```bash
FEATURE_INSTAGRAM_ENABLED=true
```

**UI Changes**: Instagram profile cards, follower counts, and engagement metrics.

---

## 🎵 TikTok for Developers

TikTok integration for creator analytics and content insights.

### Setup

1. **Create TikTok App**: Go to [TikTok for Developers](https://developers.tiktok.com)
2. **Configure OAuth**:
   - **Redirect URI**: `https://yourdomain.com/auth/tiktok/callback`
   - **Permissions**: Read user info and video data

### Environment Variables

```bash
TIKTOK_CLIENT_KEY=your_client_key
TIKTOK_CLIENT_SECRET=your_client_secret
TIKTOK_REDIRECT_URI=https://yourdomain.com/auth/tiktok/callback
```

### Exact Scopes

```typescript
const TIKTOK_SCOPES = [
  'user.info.basic',
  'user.info.stats',
  'video.list',
  'video.publish'
];
```

### Example Request

```bash
curl "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,bio_description,profile_deep_link,is_verified,follower_count,following_count,likes_count,video_count&access_token=$ACCESS_TOKEN"
```

### Feature Flag

Enable TikTok integration:
```bash
FEATURE_TIKTOK_ENABLED=true
```

**UI Changes**: TikTok creator profiles, follower analytics, and content performance.

---

## 🚀 Feature Flags Configuration

Feature flags control which integrations and features are active in your environment.

### Environment Setup

```bash
# Core Features
FEATURE_OBSERVABILITY=true          # Logging and tracing
FEATURE_DEMO_AUTH=true             # Development authentication bypass
FEATURE_BILLING_ENABLED=false      # Stripe billing integration

# AI & Search
FEATURE_EXA_ENABLED=false          # Exa AI search
FEATURE_OPENAI_ENABLED=false       # OpenAI integration

# Social Media
FEATURE_INSTAGRAM_ENABLED=false    # Instagram integration
FEATURE_TIKTOK_ENABLED=false       # TikTok integration
FEATURE_YOUTUBE_ENABLED=false      # YouTube integration
FEATURE_TWITTER_ENABLED=false      # Twitter/X integration

# Business Data
FEATURE_GOOGLE_PLACES_ENABLED=false # Google Places API
FEATURE_LINKEDIN_ENABLED=false     # LinkedIn integration

# Analytics & Tracking
FEATURE_ANALYTICS_ENABLED=false    # User analytics
FEATURE_AB_TESTING_ENABLED=false   # A/B testing framework
```

### Development vs Production

#### Development (.env.local)
```bash
FEATURE_OBSERVABILITY=true
FEATURE_DEMO_AUTH=true
FEATURE_BILLING_ENABLED=false
FEATURE_EXA_ENABLED=true
```

#### Production (.env.production)
```bash
FEATURE_OBSERVABILITY=true
FEATURE_DEMO_AUTH=false
FEATURE_BILLING_ENABLED=true
FEATURE_EXA_ENABLED=true
```

### UI Changes by Feature

| Feature Flag | UI Changes |
|--------------|------------|
| `FEATURE_EXA_ENABLED` | AI search bar, competitor analysis cards |
| `FEATURE_GOOGLE_PLACES_ENABLED` | Location-based brand discovery, business info |
| `FEATURE_INSTAGRAM_ENABLED` | Instagram profile cards, follower metrics |
| `FEATURE_TIKTOK_ENABLED` | TikTok creator profiles, engagement stats |
| `FEATURE_YOUTUBE_ENABLED` | YouTube channel analytics, video insights |
| `FEATURE_BILLING_ENABLED` | Subscription management, usage tracking |
| `FEATURE_ANALYTICS_ENABLED` | User behavior dashboards, conversion tracking |

### Testing Feature Flags

Test if a feature is enabled:

```typescript
import { env } from '@/lib/env';

if (env.FEATURE_EXA_ENABLED) {
  // Show Exa search interface
  return <ExaSearchBar />;
} else {
  // Show basic search
  return <BasicSearchBar />;
}
```

---

## 🔧 Troubleshooting

### Common Issues

#### Rate Limiting
- **Exa**: Check monthly quota in dashboard
- **Google Places**: Verify API key restrictions
- **YouTube**: Check daily quota usage

#### Authentication Errors
- **Instagram**: Verify redirect URI matches exactly
- **TikTok**: Check app permissions and scopes
- **YouTube**: Ensure OAuth consent screen is configured

#### Environment Variables
- **Not Loading**: Restart development server after changes
- **Wrong Values**: Check `.env.local` vs `.env.example`
- **Missing Variables**: Use `01_check-env.mjs` script

### Debug Mode

Enable debug logging:
```bash
DEBUG_INTEGRATIONS=true
```

This will log all API requests and responses for troubleshooting.

---

## 📚 Additional Resources

- [Exa API Documentation](https://docs.exa.ai/)
- [Google Places API Guide](https://developers.google.com/maps/documentation/places/web-service)
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
- [TikTok for Developers](https://developers.tiktok.com/)

---

## 🚀 Quick Start Checklist

- [ ] Set up environment variables in `.env.local`
- [ ] Enable required APIs in service dashboards
- [ ] Configure OAuth redirect URIs
- [ ] Test integrations with provided curl commands
- [ ] Enable feature flags for desired functionality
- [ ] Verify UI changes appear as expected
- [ ] Run smoke tests: `node scripts/release/03_smoke.mjs STAGING`
