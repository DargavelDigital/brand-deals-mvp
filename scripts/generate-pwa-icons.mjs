#!/usr/bin/env node

import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

console.log('🎨 Generating basic PWA icons...')

// Create icons directory if it doesn't exist
const iconsDir = join(process.cwd(), 'public', 'icons')
try {
  mkdirSync(iconsDir, { recursive: true })
} catch (error) {
  // Directory might already exist
}

// Create a simple SVG icon as placeholder
const svgIcon = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#3b82f6"/>
  <text x="256" y="256" font-family="Arial, sans-serif" font-size="120" font-weight="bold" text-anchor="middle" dy=".3em" fill="white">H</text>
</svg>`

// Write SVG icon
writeFileSync(join(iconsDir, 'icon.svg'), svgIcon)

console.log('✅ Generated basic PWA icons')
console.log('')
console.log('📱 Note: For production, replace these with proper PNG icons:')
console.log('   - public/icons/icon-192.png (192x192)')
console.log('   - public/icons/icon-512.png (512x512)')
console.log('')
console.log('🎨 You can use tools like:')
console.log('   - https://realfavicongenerator.net/')
console.log('   - https://www.favicon-generator.org/')
console.log('   - Or design your own in Figma/Sketch')
