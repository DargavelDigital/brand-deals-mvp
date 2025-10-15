# 🚨 CRITICAL BUG FOUND - POSTS NOT BEING SAVED!

## DATABASE SHOWS:
```json
"socialSnapshot": {
  "derived": {
    "contentThemes": []  // ❌ WRONG STRUCTURE!
  }
}
```

## EXPECTED:
```json
"socialSnapshot": {
  "instagram": {
    "posts": [...],  // ← SHOULD BE HERE!
    "username": "...",
    "followers": 5
  }
}
```

## THE PROBLEM:

The database has `socialSnapshot.derived.contentThemes` but NO `instagram` key!

## ROOT CAUSE:

Looking at `/src/services/social/providers/instagram.ts`:
- ✅ Instagram data IS being fetched (posts, followers, etc.)
- ✅ `instagramSnapshot()` returns: `{ posts, username, followers, ... }`
- ✅ `buildSnapshot()` should set `out.instagram = snapshot`

But the database shows `socialSnapshot.derived` instead of `socialSnapshot.instagram`!

## POSSIBLE CAUSES:

1. **AI is transforming the snapshot**: GPT-4o might be receiving the raw snapshot and returning a transformed version with `derived.contentThemes` instead of preserving the raw `instagram` data.

2. **Snapshot is being overwritten**: Something between `buildSnapshot()` and database save is transforming the structure.

3. **Cache is stale**: The cached snapshot might be returning old/empty data.

## NEXT STEPS:

1. Run a NEW audit AFTER commit #128
2. Check Vercel logs for:
   ```
   🔴 SNAPSHOT FROM buildSnapshot:
     instagramPosts: 2
   ```
3. If that shows 2 posts but database still shows 0, then something is transforming the snapshot AFTER buildSnapshot but BEFORE save.

## THE FIX NEEDED:

Ensure that when saving to database, we preserve the RAW instagram data from buildSnapshot(), not a transformed/derived version!

