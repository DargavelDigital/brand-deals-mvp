-- ═══════════════════════════════════════════════════════════
-- ADD 10 STARTER CREDITS TO NEW WORKSPACE
-- ═══════════════════════════════════════════════════════════
-- 
-- Workspace: d3d4d250-ce9f-4040-bc20-5c58939b85cc
-- Created via: Google OAuth signup
-- Issue: 0 credits (audit failing with insufficient credits)
-- 
-- Run this in Neon SQL Console: https://console.neon.tech
-- 
-- ═══════════════════════════════════════════════════════════

-- Step 1: Check current credits (should return 0 or no rows)
SELECT 
  "balanceAfter" as "current_balance",
  delta,
  kind,
  reason,
  "createdAt"
FROM "CreditLedger"
WHERE "workspaceId" = 'd3d4d250-ce9f-4040-bc20-5c58939b85cc'
ORDER BY "createdAt" DESC
LIMIT 5;

-- Step 2: Add 10 starter credits
INSERT INTO "CreditLedger" (
  id, 
  "workspaceId", 
  delta, 
  "balanceAfter", 
  kind, 
  reason, 
  ref,
  "createdAt"
) 
SELECT 
  gen_random_uuid(),
  'd3d4d250-ce9f-4040-bc20-5c58939b85cc',
  10,
  COALESCE((
    SELECT "balanceAfter" 
    FROM "CreditLedger" 
    WHERE "workspaceId" = 'd3d4d250-ce9f-4040-bc20-5c58939b85cc'
    ORDER BY "createdAt" DESC 
    LIMIT 1
  ), 0) + 10,
  'AI'::"CreditKind",
  'Welcome bonus - OAuth signup (manual addition)',
  'oauth-welcome-bonus',
  NOW()
RETURNING id, delta, "balanceAfter", reason;

-- Step 3: Verify credits were added (should return balanceAfter: 10)
SELECT 
  "balanceAfter" as "new_balance",
  delta,
  kind,
  reason,
  "createdAt"
FROM "CreditLedger"
WHERE "workspaceId" = 'd3d4d250-ce9f-4040-bc20-5c58939b85cc'
ORDER BY "createdAt" DESC
LIMIT 1;

-- Step 4: Check Instagram connection (should show connected account)
SELECT 
  id,
  platform,
  username,
  "userId",
  CASE 
    WHEN "accessToken" IS NOT NULL THEN 'Has token ✅'
    ELSE 'No token ❌'
  END as "token_status",
  "createdAt"
FROM "SocialAccount"
WHERE "workspaceId" = 'd3d4d250-ce9f-4040-bc20-5c58939b85cc'
AND platform = 'instagram';

-- ═══════════════════════════════════════════════════════════
-- EXPECTED RESULTS:
-- ═══════════════════════════════════════════════════════════
-- 
-- After Step 2:
--   ✅ balanceAfter: 10
--   ✅ delta: 10
--   ✅ kind: AI
--   ✅ reason: "Welcome bonus - OAuth signup (manual addition)"
-- 
-- After Step 3:
--   ✅ new_balance: 10
-- 
-- After Step 4:
--   ✅ Shows Instagram account with username
--   ✅ token_status: "Has token ✅"
-- 
-- ═══════════════════════════════════════════════════════════

