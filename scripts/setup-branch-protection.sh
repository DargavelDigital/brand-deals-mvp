#!/bin/bash

# Setup GitHub Branch Protection for main branch
# Requires GitHub CLI (gh) to be installed and authenticated

set -e

echo "🛡️  Setting up GitHub Branch Protection for main branch..."

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first:"
    echo "   https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub. Please run: gh auth login"
    exit 1
fi

# Get repository name
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "📦 Repository: $REPO"

# Set up branch protection rules
echo "🔒 Configuring branch protection rules..."

gh api repos/$REPO/branches/main/protection \
  --method PUT \
  -f required_status_checks='{"strict":true,"contexts":["audit-and-test"]}' \
  -f enforce_admins=false \
  -f required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":false}' \
  -f restrictions=null \
  -f allow_force_pushes=false \
  -f allow_deletions=false \
  -f required_conversation_resolution=true

echo "✅ Branch protection rules configured successfully!"

# Display the protection rules
echo ""
echo "📋 Current protection rules for main branch:"
gh api repos/$REPO/branches/main/protection --jq '{
  required_status_checks: .required_status_checks.contexts,
  required_pull_request_reviews: .required_pull_request_reviews.required_approving_review_count,
  enforce_admins: .enforce_admins.enabled,
  allow_force_pushes: .allow_force_pushes.enabled,
  allow_deletions: .allow_deletions.enabled,
  required_conversation_resolution: .required_conversation_resolution.enabled
}'

echo ""
echo "🎉 Branch protection setup complete!"
echo ""
echo "📝 Summary:"
echo "   • Requires 1+ review before merging"
echo "   • Requires 'audit-and-test' check to pass"
echo "   • Disallows force pushes"
echo "   • Disallows branch deletion"
echo "   • Requires up-to-date branch before merge"
echo "   • Requires conversation resolution"
echo ""
echo "🔧 To update protection rules, run this script again."