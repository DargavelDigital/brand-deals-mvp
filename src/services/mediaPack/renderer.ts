import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { log } from '@/lib/logger';

export async function renderPdf(html: string): Promise<Buffer> {
  let browser: any = null;
  
  try {
    log.info('mp.generate.start', { htmlLength: html.length });
    
    // Netlify functions: 1024MB + 120s timeouts are already set in netlify.toml
    const execPath = await chromium.executablePath();
    log.info('mp.generate.chromium', { execPath });

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      headless: chromium.headless,
      executablePath: execPath,
      // slower cold starts on Netlify; give it some room
      timeout: 90_000,
    });

    log.info('mp.generate.browser', { launched: true });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: ['domcontentloaded', 'networkidle0'] });
    
    log.info('mp.generate.content', { loaded: true });
    
    const pdf = await page.pdf({
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
      displayHeaderFooter: false,
      tagged: false,
      outline: false
    });
    
    log.info('mp.generate.pdf', { size: pdf.length });
    
    return pdf;
  } catch (error: any) {
    log.error('mp.generate.error', { 
      message: error?.message,
      stack: error?.stack,
      name: error?.name 
    });
    
    // Provide helpful error message for Netlify debugging
    if (error?.message?.includes('timeout') || error?.message?.includes('launch')) {
      throw new Error(`PDF generation failed: ${error.message}. Check Netlify function memory/timeouts.`);
    }
    
    throw new Error(`PDF generation failed: ${error?.message || 'Unknown error'}`);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        log.warn('mp.generate.cleanup', { error: closeError?.message });
      }
    }
  }
}

export async function renderPdfFromUrl(url: string): Promise<Buffer> {
  let browser: any = null;
  
  try {
    log.info('mp.generate.start', { url });
    
    // Netlify functions: 1024MB + 120s timeouts are already set in netlify.toml
    const execPath = await chromium.executablePath();
    log.info('mp.generate.chromium', { execPath });

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      headless: chromium.headless,
      executablePath: execPath,
      // slower cold starts on Netlify; give it some room
      timeout: 90_000,
    });

    log.info('mp.generate.browser', { launched: true });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    
    log.info('mp.generate.content', { loaded: true });
    
    const pdf = await page.pdf({
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
      displayHeaderFooter: false,
      tagged: false,
      outline: false
    });
    
    log.info('mp.generate.pdf', { size: pdf.length });
    
    return pdf;
  } catch (error: any) {
    log.error('mp.generate.error', { 
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      url 
    });
    
    // Provide helpful error message for Netlify debugging
    if (error?.message?.includes('timeout') || error?.message?.includes('launch')) {
      throw new Error(`PDF generation failed: ${error.message}. Check Netlify function memory/timeouts.`);
    }
    
    throw new Error(`PDF generation failed: ${error?.message || 'Unknown error'}`);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        log.warn('mp.generate.cleanup', { error: closeError?.message });
      }
    }
  }
}
