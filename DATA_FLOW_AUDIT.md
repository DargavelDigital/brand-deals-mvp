# 🔍 COMPLETE DATA FLOW AUDIT

## STEP 1: Instagram Data is FETCHED

**File**: `/src/services/social/providers/instagram.ts`

**Lines 32-42:**
```typescript
const media = await fetchIg<{ data: any[] }>(`${base}/${conn.igUserId}/media?fields=id,timestamp,caption,like_count,comments_count&limit=30`, token)
const posts: IgPost[] = (media.data ?? []).map(m => ({
  id: m.id,
  timestamp: m.timestamp,
  caption: m.caption,
  likeCount: m.like_count,
  commentsCount: m.comments_count,
}))

console.log('📸 instagramSnapshot: Posts fetched:', { count: posts.length })
```

**Lines 48-54 - Return value:**
```typescript
const snapshot = {
  igUserId: conn.igUserId,
  username: prof.username,
  followers: prof.followers_count,
  posts,  // ← THE INSTAGRAM POSTS ARE HERE!
  avgEngagementRate: avgEng,
}

return snapshot  // Returns: { posts: [...], username: "...", followers: 5, ... }
```

**Result**: `instagramSnapshot()` returns an object with `posts` array containing the 2 Instagram posts.

---

## STEP 2: Data Goes to buildSnapshot()

**File**: `/src/services/social/snapshot.aggregator.ts`

**Lines 34-56:**
```typescript
const live = await instagramSnapshot(opts.workspaceId)  // ← Calls the function from Step 1

// Only include if actually connected (live will be undefined if not connected)
if (live && live.igUserId) {
  const key = live.igUserId
  console.log('🔵 Instagram data fetched:', { 
    username: live.username, 
    followers: live.followers, 
    postsCount: live.posts?.length  // ← Posts are in 'live.posts'
  })
  const cached = await getCachedSnapshot(opts.workspaceId, 'instagram', key)
  if (!cached) {
    await setCachedSnapshot(opts.workspaceId, 'instagram', key, live)
    out.instagram = live  // ← ASSIGNS to out.instagram
    console.log('🔵 Instagram data added to snapshot (fresh)')
  } else {
    out.instagram = cached  // ← OR assigns cached version
    console.log('🔵 Instagram data added to snapshot (cached):', {
      username: cached.username,
      followers: cached.followers,
      postsCount: cached.posts?.length  // ← Cached also has posts
    })
  }
}
```

**Lines 86-104 - buildSnapshot() return:**
```typescript
// derived
const engs: number[] = []
if (out.instagram?.avgEngagementRate) engs.push(out.instagram.avgEngagementRate)
if (out.tiktok?.avgEngagementRate) engs.push(out.tiktok.avgEngagementRate)
out.derived = {
  contentThemes: out.youtube?.topKeywords ?? [],
  globalEngagementRate: engs.length ? engs.reduce((a,b)=>a+b,0)/engs.length : undefined,
}

console.log('📸 Final snapshot built:', {
  hasInstagram: !!out.instagram,
  hasYoutube: !!out.youtube,
  hasTiktok: !!out.tiktok,
  hasDerived: !!out.derived,
  instagramFollowers: out.instagram?.followers,
  instagramPosts: out.instagram?.posts?.length  // ← Logs post count
})

return out  // Returns: { instagram: { posts: [...], ... }, derived: { ... } }
```

**Result**: `buildSnapshot()` returns an object with BOTH `instagram` (containing posts) AND `derived`.

---

## STEP 3: Audit Processing Calls buildSnapshot()

**File**: `/src/services/audit/index.ts`

**Lines 39-50:**
```typescript
// Build unified social snapshot (with cache) - THIS HAS THE RAW POSTS!
const snapshot: Snapshot = await buildSnapshot({
  workspaceId,
  youtube: opts.youtubeChannelId ? { channelId: opts.youtubeChannelId } : undefined,
});

console.log('🔴🔴🔴 SNAPSHOT FROM buildSnapshot:', {
  hasInstagram: !!snapshot.instagram,
  instagramPosts: snapshot.instagram?.posts?.length || 0,
  hasTikTok: !!snapshot.tiktok,
  hasYouTube: !!snapshot.youtube
});
```

**Variable**: The return value from `buildSnapshot()` is stored in `const snapshot: Snapshot`.

**Result**: `snapshot` variable contains `{ instagram: { posts: [...], ... }, derived: { ... } }`.

---

## STEP 4: Snapshot is SAVED to Database

**File**: `/src/services/audit/index.ts`

**Lines 143-169:**
```typescript
const snapshotJsonToSave = {
  // AI Analysis (for display)
  audience: auditData.audience,
  performance: auditData.performance,
  contentSignals: auditData.contentSignals,
  insights: [
    insights.headline, 
    ...(Array.isArray(insights.keyFindings) ? insights.keyFindings : [])
  ].filter(Boolean),
  similarCreators: Array.isArray(insights.moves) 
    ? insights.moves.map(move => ({ name: move.title, description: move.why }))
    : [],
  
  // Enhanced v2/v3 fields
  stageInfo,
  stageMessage: insights.stageMessage,
  creatorProfile: insights.creatorProfile,
  strengthAreas: insights.strengthAreas || [],
  growthOpportunities: insights.growthOpportunities || [],
  nextMilestones: insights.nextMilestones || [],
  brandFit: insights.brandFit,
  immediateActions: insights.immediateActions || [],
  strategicMoves: insights.strategicMoves || [],
  
  // RAW SOCIAL DATA (for brand matching!) ← THIS IS CRITICAL!
  socialSnapshot: snapshot  // ← ASSIGNS the snapshot from Step 3!
};
```

**Lines 178-186:**
```typescript
// Store audit snapshot in database
const audit = await prisma().audit.create({
  data: {
    id: nanoid(),
    workspaceId,
    sources: auditData.sources,
    snapshotJson: snapshotJsonToSave  // ← Saves the object from above
  }
});
```

**Result**: `snapshotJson` field gets `snapshotJsonToSave` which contains `socialSnapshot: snapshot`.

---

## STEP 5: COMPLETE CHAIN

```
Instagram API (returns posts array)
  ↓ (variable: media.data)
instagramSnapshot() function
  ↓ (returns: { posts: [...], username, followers })
buildSnapshot() function
  ↓ (assigns to: out.instagram = live)
  ↓ (returns: { instagram: { posts: [...] }, derived: {...} })
Audit processing
  ↓ (stored in: const snapshot)
snapshotJsonToSave object
  ↓ (field: socialSnapshot: snapshot)
prisma.audit.create()
  ↓ (field: snapshotJson: snapshotJsonToSave)
Database
  ↓ (should have: snapshotJson.socialSnapshot.instagram.posts)
```

---

## THE GAP - WHERE DOES IT BREAK?

Based on the code flow, the data SHOULD be saved correctly:

1. ✅ Instagram API returns posts
2. ✅ `instagramSnapshot()` includes posts in return value
3. ✅ `buildSnapshot()` assigns to `out.instagram` 
4. ✅ `buildSnapshot()` returns object with instagram key
5. ✅ Audit processing stores in `snapshot` variable
6. ✅ `snapshotJsonToSave` assigns `socialSnapshot: snapshot`
7. ✅ Prisma saves `snapshotJson: snapshotJsonToSave`

**BUT** the database shows:
```json
"socialSnapshot": {
  "derived": {
    "contentThemes": []
  }
}
```

**NO `instagram` KEY!**

---

## POSSIBLE CAUSES:

1. **Prisma is stripping the instagram key when saving JSON**
   - PostgreSQL/Neon might have size limits or type issues

2. **The snapshot variable is being mutated after buildSnapshot()**
   - Something between lines 40-143 is modifying it

3. **The cache is returning empty/old data**
   - Line 50 in snapshot.aggregator.ts uses cached data

4. **buildSnapshot() is returning empty in production**
   - The Instagram connection might be failing silently

5. **JSON serialization is removing the instagram key**
   - Prisma might be serializing and instagram is being lost

---

## NEXT DEBUG STEP:

The logs in commit #130 will show:
- Is `snapshot.instagram` populated after buildSnapshot()? (Line 126-140)
- Is `snapshotJsonToSave.socialSnapshot.instagram` there before save? (Line 171-176)
- Is it in the database after save? (Line 188-207)

This will pinpoint EXACTLY which step loses the data!

