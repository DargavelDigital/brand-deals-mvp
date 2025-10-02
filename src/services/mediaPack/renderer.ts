import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { dlog } from '@/lib/dlog';

const PAGE_TIMEOUT_MS = 60_000; // 60s so we don't hit Netlify function cap
const WAIT_UNTIL: puppeteer.PuppeteerLifeCycleEvent[] = ["domcontentloaded", "networkidle0"];

// Log chromium meta when in debug mode
dlog('mp.renderer.bootstrap', {
  chromiumHeadless: (chromium as any)?.headless,
  chromiumPlatform: process.platform,
  chromiumArch: process.arch,
  nodeVersion: process.version,
});

export async function renderPdf(html: string): Promise<Buffer> {
  if (!html || typeof html !== "string" || html.trim().length < 40) {
    throw new Error("renderPdf: empty or too-short HTML input");
  }
  let browser: puppeteer.Browser | null = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();
    const logs: string[] = [];
    page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`));
    page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
    console.log("renderer.setContent.start", { length: html.length });
    await page.setContent(html, {
      waitUntil: WAIT_UNTIL,
      timeout: PAGE_TIMEOUT_MS,
    });
    await page.emulateMediaType("print");
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "16mm", right: "12mm", bottom: "16mm", left: "12mm" },
    });
    if (logs.length) console.log("renderer.logs", logs.slice(-8)); // last few lines
    return pdf;
  } catch (e) {
    console.error("renderer.renderPdf.error", e);
    throw e;
  } finally {
    if (browser) await browser.close();
  }
}

export async function renderPdfFromUrl(url: string): Promise<Buffer> {
  try {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) throw new Error(`renderPdfFromUrl: unsupported protocol ${u.protocol}`);
  } catch {
    throw new Error("renderPdfFromUrl: invalid URL");
  }
  
  dlog('mp.renderer.launch.start', {});
  const execPath = await chromium.executablePath().catch(() => null);
  dlog('mp.renderer.launch.meta', { execPath });

  const tLaunch = Date.now();
  let browser: puppeteer.Browser | null = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    }).catch((e) => {
      dlog('mp.renderer.launch.error', { err: String(e?.message || e) });
      throw e;
    });
    dlog('mp.renderer.launch.ok', { ms: Date.now() - tLaunch });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60_000);

    dlog('mp.renderer.goto.start', { url });
    const tGoto = Date.now();
    let resp: any = null;
    try {
      resp = await page.goto(url, { waitUntil: ['domcontentloaded', 'networkidle0'] });
    } catch (e: any) {
      dlog('mp.renderer.goto.throw', { err: String(e?.message || e) });
      await browser.close();
      throw e;
    }
    const status = resp?.status?.();
    const ct = resp?.headers?.()['content-type'];
    dlog('mp.renderer.goto.ok', { ms: Date.now() - tGoto, status, contentType: ct });

    // If non-200, capture a small snippet of the HTML for diagnostics
    if (status && status >= 400) {
      const html = await page.content();
      dlog('mp.renderer.goto.bad', { status, snippet: html?.slice?.(0, 400) });
      
      // TEMP DEBUG: Save full HTML for debugging
      try {
        const fs = require("fs");
        const path = require("path");
        const debugDir = "/tmp";
        if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });
        fs.writeFileSync(path.join(debugDir, "puppeteer-404.html"), html);
        console.log("PDF Generate: Debug - 404 HTML saved to /tmp/puppeteer-404.html");
      } catch (debugErr) {
        console.log("PDF Generate: Debug save failed:", debugErr);
      }
    }

    // Optionally check CSP / blocked resources
    page.on('requestfailed', (request) => {
      dlog('mp.renderer.reqfail', {
        url: request.url().slice(0, 200),
        failure: request.failure()?.errorText,
        resourceType: request.resourceType(),
      });
    });

    // Match Tailwind/screen styles
    await page.emulateMediaType("screen");

    // Wait for the sentinel element to be present
    try {
      await page.waitForSelector("#mp-print-ready", { timeout: 20_000 });
    } catch {
      // Grab a quick snapshot of the DOM for debugging (visible in logs)
      const title = await page.title().catch(() => "");
      const hasSentinel = await page.evaluate(
        "!!document.getElementById('mp-print-ready')"
      ).catch(() => false);
      console.error("print readiness wait timed out", { title, hasSentinel, url });
      // continue anyway; often the page is ready enough
    }
    
    // TEMP DEBUG: Always save HTML content for debugging
    try {
      const html = await page.content();
      const fs = require("fs");
      const path = require("path");
      const debugDir = "/tmp";
      if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });
      fs.writeFileSync(path.join(debugDir, "puppeteer-content.html"), html);
      console.log("PDF Generate: Debug - HTML content saved to /tmp/puppeteer-content.html");
      
      // Also check if it contains "Not found"
      if (html.includes("Not found") || html.includes("404")) {
        console.log("PDF Generate: Debug - WARNING: HTML contains 'Not found' or '404'");
      }
    } catch (debugErr) {
      console.log("PDF Generate: Debug save failed:", debugErr);
    }
    
    dlog('mp.renderer.pdf.start', {});
    const tPdf = Date.now();
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '16mm', right: '12mm', bottom: '16mm', left: '12mm' },
    }).catch(async (e) => {
      dlog('mp.renderer.pdf.error', { err: String(e?.message || e) });
      try { await browser.close(); } catch {}
      throw e;
    });
    dlog('mp.renderer.pdf.ok', { ms: Date.now() - tPdf, size: pdf.length });

    await browser.close();
    dlog('mp.renderer.done', {});
    return pdf;
  } catch (e) {
    console.error("renderer.renderPdfFromUrl.error", e);
    throw e;
  } finally {
    if (browser) await browser.close();
  }
}
