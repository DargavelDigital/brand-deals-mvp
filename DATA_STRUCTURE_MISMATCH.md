# 🔍 DATA STRUCTURE MISMATCH FOUND

## AUDIT SAVES TO:
```typescript
// File: src/services/audit/index.ts (line 124)
snapshotJson: {
  audience: auditData.audience,          // Aggregated metrics
  performance: auditData.performance,    // Aggregated metrics  
  contentSignals: auditData.contentSignals,
  insights: [...],
  similarCreators: [...],
  stageInfo,
  stageMessage,
  creatorProfile,
  strengthAreas: [...],
  growthOpportunities: [...],
  nextMilestones: [...],
  brandFit: insights.brandFit,
  immediateActions: [...],
  strategicMoves: [...],
  
  socialSnapshot: snapshot  // ← RAW SOCIAL DATA IS HERE!
}
```

## BRAND MATCHING READS FROM:
```typescript
// File: src/app/api/match/search/route.ts (line 127)
const snapshot = auditRecord?.snapshotJson || {};

// WRONG - Looking at root level:
const instagramMedia = snapshot.instagram?.media || [];

// SHOULD BE - Looking in socialSnapshot:
const instagramMedia = snapshot.socialSnapshot?.instagram?.posts || [];
```

## THE FIX:
Brand matching should read from `snapshotJson.socialSnapshot.instagram.posts`
NOT from `snapshotJson.instagram.posts`

## POST COUNT LOCATIONS:
✅ CORRECT: `snapshotJson.socialSnapshot.instagram.posts` (array of posts)
❌ WRONG: `snapshotJson.instagram.posts` (doesn't exist)
❌ WRONG: `snapshotJson.performance.totalPosts` (might not exist)

## ENGAGEMENT LOCATIONS:
Each post in `socialSnapshot.instagram.posts` has:
- `like_count`
- `comments_count`
- `engagement_rate`

