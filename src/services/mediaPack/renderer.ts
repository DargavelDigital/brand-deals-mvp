import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

const PAGE_TIMEOUT_MS = 60_000; // 60s so we don't hit Netlify function cap
const WAIT_UNTIL: puppeteer.PuppeteerLifeCycleEvent[] = ["domcontentloaded", "networkidle0"];

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
    console.log("renderer.goto.start", { url });
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await page.emulateMediaType("print");
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "16mm", right: "12mm", bottom: "16mm", left: "12mm" },
    });
    if (logs.length) console.log("renderer.logs", logs.slice(-8));
    return pdf;
  } catch (e) {
    console.error("renderer.renderPdfFromUrl.error", e);
    throw e;
  } finally {
    if (browser) await browser.close();
  }
}
