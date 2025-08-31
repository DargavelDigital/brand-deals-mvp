import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const ENV_LOCAL_PATH = '.env.local'
const FEATURE_FLAGS = {
  'FEATURE_CONTACTS_DEDUPE': 'true',
  'FEATURE_CONTACTS_BULK': 'true',
  'FEATURE_BRANDRUN_PROGRESS_VIZ': 'true'
}

function main() {
  try {
    console.log('🚀 Enabling P1 feature flags for local development...')
    
    // Read existing .env.local or create empty content
    let envContent = ''
    if (existsSync(ENV_LOCAL_PATH)) {
      envContent = readFileSync(ENV_LOCAL_PATH, 'utf8')
      console.log(`📖 Found existing ${ENV_LOCAL_PATH}`)
    } else {
      console.log(`📝 Creating new ${ENV_LOCAL_PATH}`)
    }
    
    // Parse existing content to avoid duplicates
    const existingLines = envContent.split('\n').filter(line => line.trim())
    const existingFlags = new Set()
    
    existingLines.forEach(line => {
      const [key] = line.split('=')
      if (key && key.startsWith('FEATURE_')) {
        existingFlags.add(key)
      }
    })
    
    // Prepare new flag lines
    const newFlagLines = []
    const updatedFlagLines = []
    
    Object.entries(FEATURE_FLAGS).forEach(([flag, value]) => {
      if (existingFlags.has(flag)) {
        // Update existing flag
        const lineIndex = existingLines.findIndex(line => line.startsWith(`${flag}=`))
        if (lineIndex !== -1) {
          existingLines[lineIndex] = `${flag}=${value}`
          updatedFlagLines.push(flag)
        }
      } else {
        // Add new flag
        newFlagLines.push(`${flag}=${value}`)
      }
    })
    
    // Build final content
    let finalContent = existingLines.join('\n')
    
    if (newFlagLines.length > 0) {
      if (finalContent && !finalContent.endsWith('\n')) {
        finalContent += '\n'
      }
      finalContent += newFlagLines.join('\n')
    }
    
    // Write to .env.local
    writeFileSync(ENV_LOCAL_PATH, finalContent, 'utf8')
    
    // Report changes
    console.log('\n✅ Feature flags updated:')
    
    if (newFlagLines.length > 0) {
      console.log(`   ➕ Added: ${newFlagLines.join(', ')}`)
    }
    
    if (updatedFlagLines.length > 0) {
      console.log(`   🔄 Updated: ${updatedFlagLines.join(', ')}`)
    }
    
    if (newFlagLines.length === 0 && updatedFlagLines.length === 0) {
      console.log('   ℹ️  All flags already set correctly')
    }
    
    console.log(`\n📁 Updated ${ENV_LOCAL_PATH}`)
    console.log('🔄 Restart your dev server to apply changes')
    console.log('\n🎯 P1 Features now enabled:')
    console.log('   • Contacts deduplication banner')
    console.log('   • Contacts bulk actions (checkboxes, bulk bar)')
    console.log('   • Brand Run progress visualization')
    
  } catch (error) {
    console.error('❌ Error updating feature flags:', error.message)
    process.exit(1)
  }
}

main()
