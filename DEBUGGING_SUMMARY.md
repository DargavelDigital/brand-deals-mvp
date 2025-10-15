# 🔍 POST COUNT DEBUGGING SUMMARY

## WHAT WE KNOW:

### 1. Data Structure (from _debug output):
```
snapshotKeys: [
  "audience",
  "brandFit", 
  "insights",
  "socialSnapshot",    ← Posts should be here
  "contentSignals",
  "creatorProfile"
]
```

### 2. Both Audit Page AND Brand Matching Read From Same Place:
```typescript
// Both use this:
const audit = await prisma().audit.findFirst({
  where: { workspaceId },
  orderBy: { createdAt: 'desc' }
});

const snapshot = audit.snapshotJson;
```

### 3. Audit Saves To:
```typescript
// /src/services/audit/index.ts line 124
snapshotJson: {
  audience: {...},
  performance: {...},
  contentSignals: [...],
  insights: [...],
  ...
  socialSnapshot: snapshot  // ← Instagram posts saved HERE
}
```

### 4. socialSnapshot Structure:
```typescript
{
  instagram: {
    posts: [...]  // ← 2 posts are HERE
  },
  tiktok: {
    videos: [...]
  },
  youtube: {
    videos: [...]
  }
}
```

## CURRENT CODE (Commit #126):
```typescript
const socialSnapshot = snapshot.socialSnapshot || {};
const socialData = socialSnapshot.derived || socialSnapshot;

// Try multiple locations:
if (socialData.instagram?.posts) {
  // Found!
}
```

## EXPECTED CONSOLE OUTPUT:
```
🔍 Snapshot keys: ["audience", "brandFit", "socialSnapshot", ...]
🔍 SocialSnapshot exists: true
🔍 SocialSnapshot keys: ["instagram", "tiktok", "youtube"]
🔍 Using socialData from derived: false
✅ Found Instagram posts: 2 in socialData
```

## IF STILL 0 POSTS:
Posts might be in one of these locations:
- `socialSnapshot.instagram.media` (not .posts)
- `socialSnapshot.data.instagram.posts`
- `contentSignals` has post info
- `creatorProfile` has post info

The console logs will reveal the exact location!

