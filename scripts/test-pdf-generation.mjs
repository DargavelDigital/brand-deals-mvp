#!/usr/bin/env node

/**
 * Test script for PDF generation
 * Usage: node scripts/test-pdf-generation.mjs
 */

import { createDemoMediaPackData } from '../src/lib/mediaPack/demoData.js'
import { renderMediaPackTemplate } from '../src/lib/mediaPack/renderTemplate.js'
import { getBrowser } from '../src/lib/browser.js'

async function testPDFGeneration() {
  console.log('🧪 Testing PDF generation...')
  
  try {
    // Create demo data
    console.log('📊 Creating demo media pack data...')
    const demoData = createDemoMediaPackData()
    
    // Test different variants
    const variants = ['classic', 'bold', 'editorial']
    
    for (const variant of variants) {
      console.log(`\n🎨 Testing ${variant} variant...`)
      
      const testData = {
        ...demoData,
        theme: {
          variant,
          dark: false,
          brandColor: '#3b82f6'
        }
      }
      
      // Render template
      console.log('  📝 Rendering template...')
      const html = renderMediaPackTemplate(testData)
      
      // Generate PDF
      console.log('  🖨️  Generating PDF...')
      const browser = await getBrowser()
      const page = await browser.newPage()
      
      await page.setContent(html, { waitUntil: 'networkidle' })
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        scale: 1.0,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        displayHeaderFooter: false
      })
      
      await page.close()
      
      // Save test PDF
      const fs = await import('fs/promises')
      const filename = `test-media-pack-${variant}.pdf`
      await fs.writeFile(filename, pdfBuffer)
      
      console.log(`  ✅ PDF saved as ${filename} (${pdfBuffer.length} bytes)`)
    }
    
    console.log('\n🎉 All PDF generation tests completed successfully!')
    
  } catch (error) {
    console.error('❌ PDF generation test failed:', error)
    process.exit(1)
  }
}

// Run the test
testPDFGeneration()
