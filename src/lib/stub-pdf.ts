import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { log } from './log'

export interface StubPDFResult {
  buffer: Buffer
  filename: string
}

/**
 * Generate a stub PDF with "DEMO / PREVIEW ONLY" watermark
 * This is used when Chromium is not available
 */
export async function generateStubPDF(
  originalFilename: string,
  metadata?: {
    brandName?: string
    creatorName?: string
    generatedAt?: string
  }
): Promise<StubPDFResult> {
  const startTime = Date.now()
  
  try {
    log.info('Generating stub PDF', {
      feature: 'mediapack-stub',
      originalFilename,
      metadata
    })

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create()
    
    // Add a page
    const page = pdfDoc.addPage([595.28, 841.89]) // A4 size in points
    const { width, height } = page.getSize()
    
    // Get fonts
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    
    // Set up colors
    const lightGray = rgb(0.9, 0.9, 0.9)
    const darkGray = rgb(0.3, 0.3, 0.3)
    const red = rgb(0.8, 0.2, 0.2)
    
    // Draw background
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(1, 1, 1) // White background
    })
    
    // Draw watermark background
    page.drawRectangle({
      x: 50,
      y: height - 150,
      width: width - 100,
      height: 100,
      color: lightGray,
      borderColor: darkGray,
      borderWidth: 2
    })
    
    // Add watermark text
    page.drawText('DEMO / PREVIEW ONLY', {
      x: width / 2 - 120,
      y: height - 100,
      size: 24,
      font: helveticaBold,
      color: red
    })
    
    page.drawText('Chromium not available - PDF generation disabled', {
      x: width / 2 - 180,
      y: height - 130,
      size: 12,
      font: helvetica,
      color: darkGray
    })
    
    // Add metadata if provided
    if (metadata?.brandName) {
      page.drawText(`Brand: ${metadata.brandName}`, {
        x: 100,
        y: height - 200,
        size: 14,
        font: helveticaBold,
        color: darkGray
      })
    }
    
    if (metadata?.creatorName) {
      page.drawText(`Creator: ${metadata.creatorName}`, {
        x: 100,
        y: height - 220,
        size: 14,
        font: helveticaBold,
        color: darkGray
      })
    }
    
    if (metadata?.generatedAt) {
      page.drawText(`Generated: ${metadata.generatedAt}`, {
        x: 100,
        y: height - 240,
        size: 12,
        font: helvetica,
        color: darkGray
      })
    }
    
    // Add instructions
    page.drawText('To enable full PDF generation:', {
      x: 100,
      y: height - 280,
      size: 12,
      font: helveticaBold,
      color: darkGray
    })
    
    page.drawText('1. Set CHROME_EXECUTABLE_PATH environment variable', {
      x: 120,
      y: height - 300,
      size: 10,
      font: helvetica,
      color: darkGray
    })
    
    page.drawText('2. Or install @sparticuz/chromium package', {
      x: 120,
      y: height - 315,
      size: 10,
      font: helvetica,
      color: darkGray
    })
    
    page.drawText('3. Or ensure system Chrome is available', {
      x: 120,
      y: height - 330,
      size: 10,
      font: helvetica,
      color: darkGray
    })
    
    // Add footer
    page.drawText('This is a preview-only PDF. Full functionality requires Chromium.', {
      x: width / 2 - 200,
      y: 50,
      size: 10,
      font: helvetica,
      color: darkGray
    })
    
    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save()
    const buffer = Buffer.from(pdfBytes)
    
    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0]
    const baseFilename = originalFilename.replace(/\.pdf$/i, '') || 'media-pack'
    const filename = `${baseFilename}-stub-${timestamp}.pdf`
    
    const renderTime = Date.now() - startTime
    
    log.info('Stub PDF generated successfully', {
      feature: 'mediapack-stub',
      filename,
      sizeBytes: buffer.length,
      renderTimeMs: renderTime
    })
    
    return {
      buffer,
      filename
    }
    
  } catch (error) {
    const renderTime = Date.now() - startTime
    
    log.error('Failed to generate stub PDF', {
      feature: 'mediapack-stub',
      error: error instanceof Error ? error.message : 'Unknown error',
      renderTimeMs: renderTime
    })
    
    throw new Error('Failed to generate stub PDF')
  }
}
