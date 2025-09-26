/**
 * Demo: Feature Flag Gated Provider System
 * 
 * This file demonstrates how the provider system automatically switches
 * between enhanced and mock providers based on feature flags.
 */

import { getProviders, auditProvider, discoveryProvider, emailProvider, mediaPackProvider } from './index'
import { log } from '@/lib/log';

export async function demonstrateFeatureFlags(workspaceId: string) {
  log.info('🚀 Feature Flag Provider Demo')
  log.info('===============================')
  
  // Get providers with feature flag gating
  const providers = getProviders(workspaceId)
  
  log.info('\n1. Audit Provider (AI_AUDIT_V2 flag)')
  log.info('----------------------------------------')
  try {
    const auditResult = await providers.audit(workspaceId, ['instagram', 'tiktok'])
    log.info('✅ Audit completed:', auditResult.auditId ? 'Real AI Audit' : 'Mock Audit')
    log.info('   Sources:', auditResult.sources?.length || 'Mock sources')
  } catch (error) {
    log.info('❌ Audit failed:', error)
  }
  
  log.info('\n2. Discovery Provider (AI_MATCH_V2 flag)')
  log.info('--------------------------------------------')
  try {
    const discoveryResult = await providers.discovery(workspaceId, { industry: 'technology' })
    log.info('✅ Discovery completed:', discoveryResult.brands?.[0]?.name === 'Real Tech Company' ? 'Real AI Discovery' : 'Mock Discovery')
    log.info('   Brands found:', discoveryResult.brands?.length || 0)
  } catch (error) {
    log.info('❌ Discovery failed:', error)
  }
  
  log.info('\n3. Email Provider (OUTREACH_TONES flag)')
  log.info('------------------------------------------')
  try {
    const emailResult = await providers.email({
      workspaceId,
      to: 'demo@example.com',
      subject: 'Feature Flag Demo',
      html: '<p>Testing enhanced email features</p>'
    })
    log.info('✅ Email sent:', emailResult.messageId?.includes('enhanced') ? 'Enhanced Email with Tones' : 'Standard Email')
  } catch (error) {
    log.info('❌ Email failed:', error)
  }
  
  log.info('\n4. Media Pack Provider (MEDIAPACK_V2 flag)')
  log.info('------------------------------------------------')
  try {
    const mediaPackResult = await providers.mediaPack({
      workspaceId,
      brandId: 'demo-brand',
      variant: 'default'
    })
    log.info('✅ Media pack generated:', mediaPackResult.htmlUrl ? 'Enhanced Media Pack' : 'Standard Media Pack')
  } catch (error) {
    log.info('❌ Media pack failed:', error)
  }
  
  log.info('\n5. Individual Provider Functions')
  log.info('-----------------------------------')
  
  // Test individual provider functions
  const audit = auditProvider(workspaceId)
  const discovery = discoveryProvider(workspaceId)
  const email = emailProvider(workspaceId)
  const mediaPack = mediaPackProvider(workspaceId)
  
  log.info('✅ Individual providers created successfully')
  log.info('   Audit type:', typeof audit)
  log.info('   Discovery type:', typeof discovery)
  log.info('   Email type:', typeof email)
  log.info('   Media Pack type:', typeof mediaPack)
  
  log.info('\n🎯 Feature Flag Status')
  log.info('=======================')
  log.info('• AI_AUDIT_V2: Controls enhanced AI audit features')
  log.info('• AI_MATCH_V2: Controls enhanced AI brand matching')
  log.info('• OUTREACH_TONES: Controls enhanced email with tone options')
  log.info('• MEDIAPACK_V2: Controls enhanced media pack generation')
  log.info('• MATCH_LOCAL_ENABLED: Controls local contact matching')
  log.info('• BRANDRUN_ONETOUCH: Controls one-touch brand run workflow')
  
  log.info('\n💡 How It Works')
  log.info('=================')
  log.info('1. When workspaceId is provided, enhanced providers are used')
  log.info('2. Each provider checks relevant feature flags')
  log.info('3. If flag is ON: Real/enhanced functionality is used')
  log.info('4. If flag is OFF: Mock/fallback functionality is used')
  log.info('5. No code changes needed - just toggle feature flags!')
  
  log.info('\n🔧 Environment Variables')
  log.info('=========================')
  log.info('Set these in .env to enable features globally:')
  log.info('AI_AUDIT_V2=true')
  log.info('AI_MATCH_V2=true')
  log.info('OUTREACH_TONES=true')
  log.info('MEDIAPACK_V2=true')
  
  log.info('\n🏢 Workspace Overrides')
  log.info('=======================')
  log.info('Override flags per workspace in the database:')
  log.info('UPDATE "Workspace" SET "featureFlags" = \'{"AI_AUDIT_V2": true}\' WHERE id = ?')
  
  log.info('\n✨ Demo Complete!')
  log.info('==================')
}

// Example usage in different scenarios
export async function demoDifferentScenarios() {
  log.info('\n🔄 Demo: Different Scenarios')
  log.info('==============================')
  
  // Scenario 1: All flags OFF (default behavior)
  log.info('\n📝 Scenario 1: All Feature Flags OFF')
  log.info('   Result: Mock providers used for all services')
  await demonstrateFeatureFlags('workspace-all-off')
  
  // Scenario 2: Some flags ON
  log.info('\n🚀 Scenario 2: Some Feature Flags ON')
  log.info('   Result: Mixed real/mock providers based on flags')
  await demonstrateFeatureFlags('workspace-mixed-flags')
  
  // Scenario 3: All flags ON
  log.info('\n🌟 Scenario 3: All Feature Flags ON')
  log.info('   Result: Enhanced providers used for all services')
  await demonstrateFeatureFlags('workspace-all-on')
}

// Export for use in other parts of the application
export { demonstrateFeatureFlags as demoFeatureFlags }
