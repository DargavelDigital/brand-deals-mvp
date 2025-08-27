/**
 * Demo: Feature Flag Gated Provider System
 * 
 * This file demonstrates how the provider system automatically switches
 * between enhanced and mock providers based on feature flags.
 */

import { getProviders, auditProvider, discoveryProvider, emailProvider, mediaPackProvider } from './index'

export async function demonstrateFeatureFlags(workspaceId: string) {
  console.log('🚀 Feature Flag Provider Demo')
  console.log('===============================')
  
  // Get providers with feature flag gating
  const providers = getProviders(workspaceId)
  
  console.log('\n1. Audit Provider (AI_AUDIT_V2 flag)')
  console.log('----------------------------------------')
  try {
    const auditResult = await providers.audit(workspaceId, ['instagram', 'tiktok'])
    console.log('✅ Audit completed:', auditResult.auditId ? 'Real AI Audit' : 'Mock Audit')
    console.log('   Sources:', auditResult.sources?.length || 'Mock sources')
  } catch (error) {
    console.log('❌ Audit failed:', error)
  }
  
  console.log('\n2. Discovery Provider (AI_MATCH_V2 flag)')
  console.log('--------------------------------------------')
  try {
    const discoveryResult = await providers.discovery(workspaceId, { industry: 'technology' })
    console.log('✅ Discovery completed:', discoveryResult.brands?.[0]?.name === 'Real Tech Company' ? 'Real AI Discovery' : 'Mock Discovery')
    console.log('   Brands found:', discoveryResult.brands?.length || 0)
  } catch (error) {
    console.log('❌ Discovery failed:', error)
  }
  
  console.log('\n3. Email Provider (OUTREACH_TONES flag)')
  console.log('------------------------------------------')
  try {
    const emailResult = await providers.email({
      workspaceId,
      to: 'demo@example.com',
      subject: 'Feature Flag Demo',
      html: '<p>Testing enhanced email features</p>'
    })
    console.log('✅ Email sent:', emailResult.messageId?.includes('enhanced') ? 'Enhanced Email with Tones' : 'Standard Email')
  } catch (error) {
    console.log('❌ Email failed:', error)
  }
  
  console.log('\n4. Media Pack Provider (MEDIAPACK_V2 flag)')
  console.log('------------------------------------------------')
  try {
    const mediaPackResult = await providers.mediaPack({
      workspaceId,
      brandId: 'demo-brand',
      variant: 'default'
    })
    console.log('✅ Media pack generated:', mediaPackResult.htmlUrl ? 'Enhanced Media Pack' : 'Standard Media Pack')
  } catch (error) {
    console.log('❌ Media pack failed:', error)
  }
  
  console.log('\n5. Individual Provider Functions')
  console.log('-----------------------------------')
  
  // Test individual provider functions
  const audit = auditProvider(workspaceId)
  const discovery = discoveryProvider(workspaceId)
  const email = emailProvider(workspaceId)
  const mediaPack = mediaPackProvider(workspaceId)
  
  console.log('✅ Individual providers created successfully')
  console.log('   Audit type:', typeof audit)
  console.log('   Discovery type:', typeof discovery)
  console.log('   Email type:', typeof email)
  console.log('   Media Pack type:', typeof mediaPack)
  
  console.log('\n🎯 Feature Flag Status')
  console.log('=======================')
  console.log('• AI_AUDIT_V2: Controls enhanced AI audit features')
  console.log('• AI_MATCH_V2: Controls enhanced AI brand matching')
  console.log('• OUTREACH_TONES: Controls enhanced email with tone options')
  console.log('• MEDIAPACK_V2: Controls enhanced media pack generation')
  console.log('• MATCH_LOCAL_ENABLED: Controls local contact matching')
  console.log('• BRANDRUN_ONETOUCH: Controls one-touch brand run workflow')
  
  console.log('\n💡 How It Works')
  console.log('=================')
  console.log('1. When workspaceId is provided, enhanced providers are used')
  console.log('2. Each provider checks relevant feature flags')
  console.log('3. If flag is ON: Real/enhanced functionality is used')
  console.log('4. If flag is OFF: Mock/fallback functionality is used')
  console.log('5. No code changes needed - just toggle feature flags!')
  
  console.log('\n🔧 Environment Variables')
  console.log('=========================')
  console.log('Set these in .env to enable features globally:')
  console.log('AI_AUDIT_V2=true')
  console.log('AI_MATCH_V2=true')
  console.log('OUTREACH_TONES=true')
  console.log('MEDIAPACK_V2=true')
  
  console.log('\n🏢 Workspace Overrides')
  console.log('=======================')
  console.log('Override flags per workspace in the database:')
  console.log('UPDATE "Workspace" SET "featureFlags" = \'{"AI_AUDIT_V2": true}\' WHERE id = ?')
  
  console.log('\n✨ Demo Complete!')
  console.log('==================')
}

// Example usage in different scenarios
export async function demoDifferentScenarios() {
  console.log('\n🔄 Demo: Different Scenarios')
  console.log('==============================')
  
  // Scenario 1: All flags OFF (default behavior)
  console.log('\n📝 Scenario 1: All Feature Flags OFF')
  console.log('   Result: Mock providers used for all services')
  await demonstrateFeatureFlags('workspace-all-off')
  
  // Scenario 2: Some flags ON
  console.log('\n🚀 Scenario 2: Some Feature Flags ON')
  console.log('   Result: Mixed real/mock providers based on flags')
  await demonstrateFeatureFlags('workspace-mixed-flags')
  
  // Scenario 3: All flags ON
  console.log('\n🌟 Scenario 3: All Feature Flags ON')
  console.log('   Result: Enhanced providers used for all services')
  await demonstrateFeatureFlags('workspace-all-on')
}

// Export for use in other parts of the application
export { demonstrateFeatureFlags as demoFeatureFlags }
