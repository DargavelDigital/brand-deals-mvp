import { NextResponse } from 'next/server';
import { chromium } from 'playwright-core';
import { signPayload } from '@/lib/signing';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let browser = null;
  
  try {
    const { packData, theme, selectedBrandIds } = await req.json();
    
    console.log('Starting Puppeteer PDF generation for brands:', selectedBrandIds);
    
    // Launch browser
    browser = await chromium.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const results = [];
    
    // Get brand info
    const demoBrands = {
      'demo-1': { name: 'Nike', domain: 'nike.com' },
      'demo-2': { name: 'Apple', domain: 'apple.com' },
      'demo-3': { name: 'Starbucks', domain: 'starbucks.com' }
    };
    
    for (const brandId of selectedBrandIds) {
      try {
        const brand = demoBrands[brandId];
        if (!brand) continue;
        
        // Create page
        const page = await browser.newPage();
        
        // Build preview URL with brand-specific data
        const baseUrl = process.env.NEXT_PUBLIC_APP_HOST 
          ? `https://${process.env.NEXT_PUBLIC_APP_HOST}` 
          : 'http://localhost:3000';
        
        // Create token with brand-specific data
        const tokenData = {
          ...packData,
          brandContext: {
            name: brand.name,
            domain: brand.domain
          },
          theme: theme
        };
        
        const token = signPayload(tokenData, '5m'); // 5 minute expiry
        const url = `${baseUrl}/media-pack/preview?t=${token}`;
        
        console.log('Loading preview page for:', brand.name);
        
        // Navigate and wait for content
        await page.goto(url, { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });
        
        // Wait for specific content to ensure page is fully rendered
        try {
          await page.waitForSelector('text="Sarah Johnson"', { timeout: 10000 });
        } catch (error) {
          console.log('Sarah Johnson text not found, trying alternative selectors...');
          // Try alternative selectors
          try {
            await page.waitForSelector('[class*="creator"]', { timeout: 5000 });
          } catch (error2) {
            console.log('Creator element not found, proceeding anyway...');
          }
        }
        
        // Give extra time for any animations/lazy loading
        await page.waitForTimeout(2000);
        
        console.log('Generating PDF for:', brand.name);
        
        // Generate PDF
        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: { top: '0', right: '0', bottom: '0', left: '0' }
        });
        
        await page.close();
        
        // Save to database (reuse existing logic from generate-multiple)
        // For now, return the buffer
        results.push({
          brandId,
          brandName: brand.name,
          success: true,
          size: pdfBuffer.length
        });
        
        console.log('PDF generated successfully for:', brand.name, 'Size:', pdfBuffer.length);
        
      } catch (error) {
        console.error('Error generating PDF for brand:', brandId, error);
        results.push({
          brandId,
          brandName: demoBrands[brandId]?.name || 'Unknown',
          success: false,
          error: error.message
        });
      }
    }
    
    await browser.close();
    
    return NextResponse.json({ 
      ok: true, 
      results 
    });
    
  } catch (error) {
    console.error('Puppeteer PDF generation failed:', error);
    
    if (browser) {
      await browser.close();
    }
    
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
