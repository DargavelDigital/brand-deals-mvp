import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { env } from '@/lib/env';
import { getChromium } from '@/lib/chromium';
import { generateStubPDF } from '@/lib/stub-pdf';
import { log } from '@/lib/log';

export interface MediaPackVariables {
  creatorName: string;
  brandName: string;
  insightOne: string;
  insightTwo: string;
  audienceSize: string;
  topGeo: string;
  topAge: string;
  avgViews: string;
  engagementRate: string;
  formatA: string;
  formatB: string;
  generatedAt: string;
  brandLogoUrl?: string;
  brandPrimaryColor?: string;
  brandSecondaryColor?: string;
}

export interface MediaPackResult {
  pdfBuffer: Buffer;
  suggestedFilename: string;
}

/**
 * Export HTML content to PDF using Puppeteer with Chromium resolver
 */
export async function exportPdf(html: string): Promise<Buffer> {
  const startTime = Date.now()
  
  try {
    log.info('Starting PDF export', { feature: 'mediapack-pdf' })
    
    // Get Chromium configuration
    const chromiumConfig = getChromium()
    const isAvailable = chromiumConfig.executablePath !== undefined
    
    if (!isAvailable) {
      log.warn('Chromium not available, generating stub PDF', {
        feature: 'mediapack-pdf',
        executablePath: chromiumConfig.executablePath
      })
      
      const stubResult = await generateStubPDF('media-pack.pdf', {
        generatedAt: new Date().toISOString()
      })
      
      return stubResult.buffer
    }
    
    log.info('Launching Chromium for PDF generation', {
      feature: 'mediapack-pdf',
      executablePath: chromiumConfig.executablePath
    })
    
    const browser = await puppeteer.launch({
      executablePath: chromiumConfig.executablePath || undefined,
      headless: chromiumConfig.headless,
      args: chromiumConfig.args,
      timeout: chromiumConfig.timeoutMs
    });

    const page = await browser.newPage();
    
    // Set content and wait for it to load
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generate PDF with professional settings
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      displayHeaderFooter: false,
      preferCSSPageSize: true
    });

    await browser.close();
    
    const renderTime = Date.now() - startTime
    
    log.info('PDF generated successfully', {
      feature: 'mediapack-pdf',
      sizeBytes: pdfBuffer.length,
      renderTimeMs: renderTime
    })
    
    return pdfBuffer;
  } catch (error) {
    const renderTime = Date.now() - startTime
    
    log.error('PDF generation failed, falling back to stub', {
      feature: 'mediapack-pdf',
      error: error instanceof Error ? error.message : 'Unknown error',
      renderTimeMs: renderTime
    });
    
    // Fallback to stub PDF
    try {
      const stubResult = await generateStubPDF('media-pack.pdf', {
        generatedAt: new Date().toISOString()
      })
      
      return stubResult.buffer
    } catch (stubError) {
      log.error('Stub PDF generation also failed', {
        feature: 'mediapack-pdf',
        error: stubError instanceof Error ? stubError.message : 'Unknown error'
      })
      
      throw new Error('Failed to generate PDF - no compatible browser found and stub generation failed');
    }
  }
}

/**
 * Generate a media pack PDF from template and variables
 */
export async function generateMediaPackPDF(
  variables: MediaPackVariables,
  variant: 'default' | 'brand' = 'default'
): Promise<MediaPackResult> {
  // Load the appropriate template
  const templatePath = path.join(
    process.cwd(),
    'src/services/media/templates',
    variant === 'brand' ? 'mediaPackBrand.html' : 'mediaPackDefault.html'
  );

  let template = fs.readFileSync(templatePath, 'utf-8');

  // Replace template variables
  Object.entries(variables).forEach(([key, value]) => {
    if (value) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, value);
    }
  });

  // Generate PDF
  const pdfBuffer = await exportPdf(template);

  // Generate filename
  const timestamp = new Date().toISOString().split('T')[0];
  const suggestedFilename = `media-pack-${variables.brandName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.pdf`;

  return {
    pdfBuffer,
    suggestedFilename
  };
}

/**
 * Generate a media pack PDF with brand theming if brand colors are available
 */
export async function generateBrandedMediaPackPDF(
  variables: MediaPackVariables
): Promise<MediaPackResult> {
  // Use brand variant if we have brand colors or logo
  const variant = (variables.brandPrimaryColor || variables.brandLogoUrl) ? 'brand' : 'default';
  return generateMediaPackPDF(variables, variant);
}
