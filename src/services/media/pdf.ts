import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

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
 * Export HTML content to PDF using Puppeteer
 */
export async function exportPdf(html: string): Promise<Buffer> {
  try {
    // Launch browser with appropriate executable path
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || 
                          (process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' :
                           process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' :
                           '/usr/bin/google-chrome');
    
    const browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
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
    
    return pdfBuffer;
  } catch (error) {
    console.error('PDF generation failed:', error);
    
    // Fallback: try to use system Chrome if puppeteer fails
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        }
      });

      await browser.close();
      return pdfBuffer;
    } catch (fallbackError) {
      console.error('PDF fallback also failed:', fallbackError);
      throw new Error('Failed to generate PDF - no compatible browser found');
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
