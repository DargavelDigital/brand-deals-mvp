#!/bin/bash

# Branch Protection Setup Script
# This script provides guidance for setting up GitHub branch protection

set -e

echo "🔒 Branch Protection Setup Guide"
echo "================================"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Get repository information
REPO_URL=$(git remote get-url origin 2>/dev/null || echo "unknown")
echo "📁 Repository: $REPO_URL"
echo ""

# Check if this is a GitHub repository
if [[ $REPO_URL == *"github.com"* ]]; then
    echo "✅ GitHub repository detected"
    
    # Extract owner and repo name
    if [[ $REPO_URL =~ github\.com[:/]([^/]+)/([^/]+)\.git$ ]]; then
        OWNER="${BASH_REMATCH[1]}"
        REPO="${BASH_REMATCH[2]}"
        echo "👤 Owner: $OWNER"
        echo "📦 Repository: $REPO"
        echo ""
        
        # Generate GitHub URLs
        SETTINGS_URL="https://github.com/$OWNER/$REPO/settings/branches"
        ACTIONS_URL="https://github.com/$OWNER/$REPO/actions"
        
        echo "🔗 Quick Links:"
        echo "  - Branch Protection Settings: $SETTINGS_URL"
        echo "  - Actions (CI): $ACTIONS_URL"
        echo ""
    fi
else
    echo "⚠️  Not a GitHub repository - branch protection setup may vary"
    echo ""
fi

echo "📋 Manual Setup Steps:"
echo "====================="
echo ""
echo "1. Go to repository Settings → Branches"
echo "2. Click 'Add rule' or 'Add branch protection rule'"
echo "3. Set branch name pattern: main (and optionally prod, staging)"
echo "4. Configure the following settings:"
echo ""
echo "   ✅ Require a pull request before merging"
echo "      - Required number of reviewers: 1"
echo "      - Dismiss stale reviews when new commits are pushed"
echo "      - Require review from code owners"
echo ""
echo "   ✅ Require status checks to pass before merging"
echo "      - Require branches to be up to date before merging"
echo "      - Add these required status checks:"
echo "        - audit-pack"
echo "        - idempotency-tests" 
echo "        - build-verification"
echo ""
echo "   ✅ Restrict pushes that create files"
echo "   ✅ Require conversation resolution before merging"
echo "   ✅ Require linear history (optional)"
echo ""
echo "5. Click 'Create' or 'Save changes'"
echo ""

echo "🧪 Testing Branch Protection:"
echo "============================"
echo ""
echo "1. Create a test branch:"
echo "   git checkout -b test-branch-protection"
echo ""
echo "2. Make a small change and commit:"
echo "   echo '# Test' >> README.md"
echo "   git add README.md"
echo "   git commit -m 'test: branch protection'"
echo ""
echo "3. Push the branch:"
echo "   git push origin test-branch-protection"
echo ""
echo "4. Create a pull request to main"
echo "5. Verify that:"
echo "   - CI checks are required"
echo "   - Direct push to main is blocked"
echo "   - PR review is required"
echo ""

echo "🔍 Verification Commands:"
echo "========================"
echo ""
echo "# Check current branch protection status"
echo "gh api repos/$OWNER/$REPO/branches/main/protection 2>/dev/null || echo 'No protection configured'"
echo ""
echo "# Check CI workflow status"
echo "gh run list --branch main --limit 5"
echo ""

echo "📚 Documentation:"
echo "================="
echo "- Branch Protection Guide: docs/ops/branch-protection.md"
echo "- CI Workflow: .github/workflows/ci.yml"
echo "- Code Owners: .github/CODEOWNERS"
echo ""

echo "✅ Setup complete! Follow the manual steps above to configure branch protection."
