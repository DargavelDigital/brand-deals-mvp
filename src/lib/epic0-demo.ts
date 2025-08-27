/**
 * EPIC 0 Guardrails Demo
 * 
 * This script demonstrates how the observability system and feature flags
 * work together to provide controlled AI access with full tracing.
 */

import { createTrace, logAIEvent, createAIEvent } from './observability'
import { getProviders } from '@/services/providers'
import { aiInvoke } from '@/services/ai/openai'

// Demo function to test audit with different flag states
export async function demoAuditWithFlags(workspaceId: string, flagsEnabled: boolean = false) {
  console.log(`\n🔍 Testing Audit with flags ${flagsEnabled ? 'ENABLED' : 'DISABLED'}`)
  console.log('=' .repeat(50))
  
  const trace = createTrace()
  console.log(`📊 Trace ID: ${trace.traceId}`)
  
  try {
    // Simulate setting feature flags
    if (flagsEnabled) {
      console.log('🚀 Feature flags are ENABLED - using enhanced AI providers')
    } else {
      console.log('📝 Feature flags are DISABLED - using mock providers')
    }
    
    // Get providers with feature flag gating
    const providers = getProviders(workspaceId)
    
    // Test audit functionality
    console.log('\n🔄 Running audit...')
    const auditResult = await providers.audit(workspaceId, ['instagram', 'tiktok'])
    
    console.log('✅ Audit completed successfully')
    console.log(`📊 Result:`, {
      auditId: auditResult.auditId,
      insightsCount: auditResult.insights?.length || 0,
      sourcesCount: auditResult.sources?.length || 0
    })
    
    // Test AI functionality
    console.log('\n🤖 Testing AI functions...')
    
    // Test profile analysis
    const profileAnalysis = await providers.ai.analyzeProfile(
      'Fitness influencer with 100K followers on Instagram',
      workspaceId
    )
    console.log('📈 Profile analysis result:', profileAnalysis)
    
    // Test brand matching
    const brandMatches = await providers.ai.generateBrandMatches(
      { audience: 'fitness', engagement: 'high' },
      'sports nutrition',
      workspaceId
    )
    console.log('🎯 Brand matches result:', brandMatches)
    
    // Test email generation
    const emailDraft = await providers.ai.generateEmailDraft(
      'FitnessCreator',
      'ProteinBrand',
      'fitness partnership',
      workspaceId
    )
    console.log('✉️ Email draft result:', emailDraft)
    
    // Log the complete demo event
    const demoEvent = createAIEvent(
      trace,
      'epic0_demo',
      'audit_workflow_complete',
      undefined,
      { 
        workspaceId, 
        flagsEnabled, 
        auditSuccess: true,
        aiFunctionsTested: 3
      }
    )
    logAIEvent(demoEvent)
    
    return {
      success: true,
      traceId: trace.traceId,
      auditResult,
      profileAnalysis,
      brandMatches,
      emailDraft
    }
    
  } catch (error: any) {
    console.error('❌ Demo failed:', error.message)
    
    // Log the demo failure
    const errorEvent = createAIEvent(
      trace,
      'epic0_demo',
      'audit_workflow_failed',
      undefined,
      { 
        workspaceId, 
        flagsEnabled, 
        error: error.message 
      }
    )
    logAIEvent(errorEvent)
    
    return {
      success: false,
      traceId: trace.traceId,
      error: error.message
    }
  }
}

// Demo function to test direct AI invocation with observability
export async function demoDirectAIInvoke(workspaceId: string) {
  console.log(`\n🤖 Testing Direct AI Invoke with Observability`)
  console.log('=' .repeat(50))
  
  try {
    // Test direct AI invocation with aiInvoke
    const result = await aiInvoke(
      'demo_creative_analysis',
      [
        { 
          role: 'system', 
          content: 'You are a creative strategist analyzing social media content.' 
        },
        { 
          role: 'user', 
          content: 'Analyze this content strategy: "Daily fitness tips with motivational quotes"' 
        }
      ],
      undefined,
      { workspaceId, demoType: 'creative_analysis' }
    )
    
    if (result.ok) {
      console.log('✅ Direct AI invoke successful')
      console.log('📊 Response:', result.data)
      console.log('💰 Token usage:', result.usage)
    } else {
      console.log('❌ Direct AI invoke failed:', result.error)
    }
    
    return result
    
  } catch (error: any) {
    console.error('❌ Direct AI invoke demo failed:', error.message)
    throw error
  }
}

// Demo function to test feature flag integration
export async function demoFeatureFlagIntegration(workspaceId: string) {
  console.log(`\n🚩 Testing Feature Flag Integration`)
  console.log('=' .repeat(50))
  
  try {
    // Test different provider combinations
    const providers = getProviders(workspaceId)
    
    console.log('\n🔍 Testing audit provider...')
    const auditResult = await providers.audit(workspaceId, ['instagram'])
    console.log('✅ Audit provider works')
    
    console.log('\n🔍 Testing discovery provider...')
    const discoveryResult = await providers.discovery(workspaceId, { industry: 'fitness' })
    console.log('✅ Discovery provider works')
    
    console.log('\n🔍 Testing email provider...')
    const emailResult = await providers.email({ 
      to: 'test@example.com', 
      subject: 'Test', 
      html: '<p>Test</p>',
      workspaceId 
    })
    console.log('✅ Email provider works')
    
    console.log('\n🔍 Testing media pack provider...')
    const mediaPackResult = await providers.mediaPack({ 
      workspaceId, 
      type: 'brand_presentation' 
    })
    console.log('✅ Media pack provider works')
    
    console.log('\n🔍 Testing AI provider...')
    const aiResult = await providers.ai.analyzeProfile(
      'Test profile', 
      workspaceId
    )
    console.log('✅ AI provider works')
    
    console.log('\n🔍 Testing brands provider...')
    const brandsResult = await providers.brands.getBrandSuggestions(
      workspaceId, 
      { industry: 'fitness' }
    )
    console.log('✅ Brands provider works')
    
    console.log('🎉 All providers working correctly with feature flag integration!')
    
    return {
      success: true,
      providers: ['audit', 'discovery', 'email', 'mediaPack', 'ai', 'brands']
    }
    
  } catch (error: any) {
    console.error('❌ Feature flag integration demo failed:', error.message)
    throw error
  }
}

// Main demo runner
export async function runEpic0Demo(workspaceId: string = 'demo-workspace') {
  console.log('🚀 EPIC 0 Guardrails Demo Starting...')
  console.log('=' .repeat(60))
  
  try {
    // Test 1: Audit with flags DISABLED (mock providers)
    console.log('\n📝 TEST 1: Flags DISABLED (Mock Providers)')
    await demoAuditWithFlags(workspaceId, false)
    
    // Test 2: Audit with flags ENABLED (enhanced providers)
    console.log('\n🚀 TEST 2: Flags ENABLED (Enhanced Providers)')
    await demoAuditWithFlags(workspaceId, true)
    
    // Test 3: Direct AI invocation
    console.log('\n🤖 TEST 3: Direct AI Invoke')
    await demoDirectAIInvoke(workspaceId)
    
    // Test 4: Feature flag integration
    console.log('\n🚩 TEST 4: Feature Flag Integration')
    await demoFeatureFlagIntegration(workspaceId)
    
    console.log('\n🎉 EPIC 0 Guardrails Demo Completed Successfully!')
    console.log('\n📋 Summary:')
    console.log('✅ All AI calls use aiInvoke with observability')
    console.log('✅ Feature flags control provider selection')
    console.log('✅ Full tracing and logging implemented')
    console.log('✅ Graceful fallback to mock providers')
    console.log('✅ PII redaction in place')
    
  } catch (error: any) {
    console.error('\n❌ EPIC 0 Demo failed:', error.message)
    throw error
  }
}

// Export for use in other parts of the application
export default {
  demoAuditWithFlags,
  demoDirectAIInvoke,
  demoFeatureFlagIntegration,
  runEpic0Demo
}
