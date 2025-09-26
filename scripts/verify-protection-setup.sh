#!/bin/bash

# Verify that branch protection setup is working correctly

set -e

echo "🔍 Verifying Branch Protection Setup"
echo "===================================="

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "   Install with: brew install gh (macOS) or visit https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub"
    echo "   Run: gh auth login"
    exit 1
fi

# Get repository name
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "📦 Repository: $REPO"

# Check if main branch protection exists
echo ""
echo "🛡️  Checking branch protection rules..."

PROTECTION_STATUS=$(gh api repos/$REPO/branches/main/protection 2>/dev/null || echo "null")

if [[ "$PROTECTION_STATUS" == "null" ]]; then
    echo "❌ No branch protection rules found for main branch"
    echo "   Run: npm run setup:branch-protection"
    exit 1
fi

echo "✅ Branch protection rules found"

# Check required status checks
REQUIRED_CHECKS=$(echo "$PROTECTION_STATUS" | jq -r '.required_status_checks.contexts[]?' 2>/dev/null || echo "")
if [[ "$REQUIRED_CHECKS" == *"audit-and-test"* ]]; then
    echo "✅ Required status check 'audit-and-test' is configured"
else
    echo "❌ Required status check 'audit-and-test' is missing"
fi

# Check required reviews
REQUIRED_REVIEWS=$(echo "$PROTECTION_STATUS" | jq -r '.required_pull_request_reviews.required_approving_review_count' 2>/dev/null || echo "0")
if [[ "$REQUIRED_REVIEWS" -ge 1 ]]; then
    echo "✅ Required reviews: $REQUIRED_REVIEWS"
else
    echo "❌ Required reviews not configured"
fi

# Check force push protection
FORCE_PUSHES=$(echo "$PROTECTION_STATUS" | jq -r '.allow_force_pushes.enabled' 2>/dev/null || echo "true")
if [[ "$FORCE_PUSHES" == "false" ]]; then
    echo "✅ Force pushes are disabled"
else
    echo "❌ Force pushes are allowed (should be disabled)"
fi

# Check if branch is up-to-date required
STRICT_STATUS=$(echo "$PROTECTION_STATUS" | jq -r '.required_status_checks.strict' 2>/dev/null || echo "false")
if [[ "$STRICT_STATUS" == "true" ]]; then
    echo "✅ Up-to-date branch required before merge"
else
    echo "❌ Up-to-date branch not required"
fi

# Check conversation resolution
CONVERSATION_RESOLUTION=$(echo "$PROTECTION_STATUS" | jq -r '.required_conversation_resolution.enabled' 2>/dev/null || echo "false")
if [[ "$CONVERSATION_RESOLUTION" == "true" ]]; then
    echo "✅ Conversation resolution required"
else
    echo "❌ Conversation resolution not required"
fi

echo ""
echo "🧪 Testing required checks locally..."

# Test audit checks
echo "📊 Running audit checks..."
if pnpm audit:all > /dev/null 2>&1; then
    echo "✅ Audit checks pass"
else
    echo "❌ Audit checks fail"
    echo "   Run: pnpm audit:all"
fi

# Test idempotency tests
echo "🔄 Running idempotency tests..."
if pnpm test:idempotency > /dev/null 2>&1; then
    echo "✅ Idempotency tests pass"
else
    echo "❌ Idempotency tests fail"
    echo "   Run: pnpm test:idempotency"
fi

# Test build
echo "🏗️  Testing build..."
if pnpm run build:netlify > /dev/null 2>&1; then
    echo "✅ Build passes"
else
    echo "❌ Build fails"
    echo "   Run: pnpm run build:netlify"
fi

echo ""
echo "📋 Summary:"
echo "==========="

# Count issues
ISSUES=0

if [[ "$REQUIRED_CHECKS" != *"audit-and-test"* ]]; then
    echo "❌ Missing required status check"
    ((ISSUES++))
fi

if [[ "$REQUIRED_REVIEWS" -lt 1 ]]; then
    echo "❌ Missing required reviews"
    ((ISSUES++))
fi

if [[ "$FORCE_PUSHES" != "false" ]]; then
    echo "❌ Force pushes are allowed"
    ((ISSUES++))
fi

if [[ "$STRICT_STATUS" != "true" ]]; then
    echo "❌ Up-to-date branch not required"
    ((ISSUES++))
fi

if [[ "$CONVERSATION_RESOLUTION" != "true" ]]; then
    echo "❌ Conversation resolution not required"
    ((ISSUES++))
fi

if [[ $ISSUES -eq 0 ]]; then
    echo "🎉 All branch protection rules are properly configured!"
    echo ""
    echo "✅ Ready for production use"
    echo "✅ Main branch is protected"
    echo "✅ All required checks are configured"
else
    echo "⚠️  Found $ISSUES issue(s) with branch protection setup"
    echo ""
    echo "🔧 To fix issues:"
    echo "   1. Run: npm run setup:branch-protection"
    echo "   2. Re-run this verification script"
    exit 1
fi
