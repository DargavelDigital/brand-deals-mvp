/**
 * Feature Flag Usage Examples
 * 
 * This file demonstrates how to use the feature flag utility
 * throughout the application.
 */

import React from 'react'
import { isFlagEnabled, type FeatureFlag } from './flags'

// Example 1: In a component or service
export async function exampleUsage(workspaceId: string) {
  // Check if AI_MATCH_V2 is enabled for this workspace
  if (await isFlagEnabled('AI_MATCH_V2', workspaceId)) {
    // Use new AI matching logic
    console.log('Using AI_MATCH_V2 logic')
    return await runNewAIMatching()
  } else {
    // Fallback to old logic
    console.log('Using fallback matching logic')
    return await runFallbackMatching()
  }
}

// Example 2: In API routes
export async function exampleAPIRoute(workspaceId: string) {
  // Check multiple flags
  const [auditV2, mediaPackV2] = await Promise.all([
    isFlagEnabled('AI_AUDIT_V2', workspaceId),
    isFlagEnabled('MEDIAPACK_V2', workspaceId)
  ])

  if (auditV2 && mediaPackV2) {
    // Both features enabled
    return await runEnhancedWorkflow()
  } else if (auditV2) {
    // Only audit V2 enabled
    return await runAuditV2Only()
  } else {
    // Default behavior
    return await runDefaultWorkflow()
  }
}

// Example 3: In step components
export async function exampleStepComponent(workspaceId: string) {
  // Check if one-touch brand run is enabled
  if (await isFlagEnabled('BRANDRUN_ONETOUCH', workspaceId)) {
    return (
      <div>
        <h2>One-Touch Brand Run</h2>
        <button onClick={() => runOneTouchWorkflow()}>
          Start Complete Workflow
        </button>
      </div>
    )
  } else {
    return (
      <div>
        <h2>Step-by-Step Brand Run</h2>
        <StepByStepWorkflow />
      </div>
    )
  }
}

// Example 4: In outreach sequences
export async function exampleOutreachLogic(workspaceId: string) {
  // Check if advanced outreach tones are enabled
  if (await isFlagEnabled('OUTREACH_TONES', workspaceId)) {
    return await generateAdvancedOutreachSequence()
  } else {
    return await generateBasicOutreachSequence()
  }
}

// Example 5: In contact discovery
export async function exampleContactDiscovery(workspaceId: string) {
  // Check if local matching is enabled
  if (await isFlagEnabled('MATCH_LOCAL_ENABLED', workspaceId)) {
    return await runLocalContactMatching()
  } else {
    return await runRemoteContactMatching()
  }
}

// Mock functions for examples
async function runNewAIMatching() { return 'AI V2 Result' }
async function runFallbackMatching() { return 'Fallback Result' }
async function runEnhancedWorkflow() { return 'Enhanced Workflow' }
async function runAuditV2Only() { return 'Audit V2 Only' }
async function runDefaultWorkflow() { return 'Default Workflow' }
async function runOneTouchWorkflow() { return 'One Touch Started' }
async function generateAdvancedOutreachSequence() { return 'Advanced Sequence' }
async function generateBasicOutreachSequence() { return 'Basic Sequence' }
async function runLocalContactMatching() { return 'Local Matching' }
async function runRemoteContactMatching() { return 'Remote Matching' }

// Mock React components
function StepByStepWorkflow() { return <div>Step by step workflow</div> }
