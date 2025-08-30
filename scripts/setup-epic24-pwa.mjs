#!/usr/bin/env node

import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'

console.log('🚀 Setting up Epic 24: Mobile-Ready Share & Light CRM')
console.log('')

// Generate VAPID keys
console.log('🔑 Generating VAPID keys for web push notifications...')
try {
  const vapidOutput = execSync('npx web-push generate-vapid-keys', { encoding: 'utf8' })
  console.log('✅ VAPID keys generated successfully')
  
  // Extract keys from output
  const publicKeyMatch = vapidOutput.match(/Public Key:\n([^\n]+)/)
  const privateKeyMatch = vapidOutput.match(/Private Key:\n([^\n]+)/)
  
  if (publicKeyMatch && privateKeyMatch) {
    const publicKey = publicKeyMatch[1].trim()
    const privateKey = privateKeyMatch[1].trim()
    
    console.log('')
    console.log('📝 Add these environment variables to your .env.local file:')
    console.log('')
    console.log('# Epic 24: Mobile-Ready Share & Light CRM')
    console.log('PWA_ENABLED=1')
    console.log('PUSH_ENABLED=1')
    console.log('CRM_LIGHT_ENABLED=1')
    console.log('')
    console.log('# Web Push VAPID')
    console.log(`VAPID_PUBLIC_KEY=${publicKey}`)
    console.log(`VAPID_PRIVATE_KEY=${privateKey}`)
    console.log('VAPID_SUBJECT=mailto:ops@yourdomain.com')
    console.log('')
    console.log('# Expose public VAPID key to client')
    console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${publicKey}`)
    console.log('')
    
    // Also add to Netlify environment variables instructions
    console.log('🌐 For Netlify deployment, add these to Site settings > Environment variables:')
    console.log(`VAPID_PUBLIC_KEY: ${publicKey}`)
    console.log(`VAPID_PRIVATE_KEY: ${privateKey}`)
    console.log('VAPID_SUBJECT: mailto:ops@yourdomain.com')
    console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY: ${publicKey}`)
    
  } else {
    console.log('⚠️  Could not parse VAPID keys from output')
  }
  
} catch (error) {
  console.error('❌ Failed to generate VAPID keys:', error.message)
}

console.log('')
console.log('📱 Next steps:')
console.log('1. Add the environment variables above to .env.local')
console.log('2. Add the same variables to Netlify environment variables')
console.log('3. Run: pnpm prisma migrate dev --name epic24_pwa_crm')
console.log('4. Test the PWA functionality locally')
console.log('')
console.log('🎯 Epic 24 setup complete!')
