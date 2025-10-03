import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

// Use this for PDFs from HTML string (no navigation)
export async function renderPdfFromHtml(html: string) {
  const executablePath = await chromium.executablePath();
  const browser = await puppeteer.launch({
    args: [
      ...chromium.args,
      // keep it lean
      "--disable-dev-shm-usage",
      "--no-sandbox",
      "--disable-gpu",
    ],
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless,
  });

  try {
    const page = await browser.newPage();
    // Load the HTML directly; no network round-trips or RSC
    await page.setContent(html, { waitUntil: "load", timeout: 60000 });
    await Promise.race([
      page.waitForSelector("#mp-print-ready", { timeout: 15000 }),
      page.waitForTimeout(8000),
    ]);
    await page.emulateMediaType("screen");
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "18mm", right: "18mm", bottom: "18mm", left: "18mm" },
      preferCSSPageSize: false,
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close().catch(() => {});
  }
}

export async function renderPdfFromUrl(url: string) {
  const executablePath = await chromium.executablePath(); // NOTE: function in v131+
  const browser = await puppeteer.launch({
    args: [
      ...chromium.args,
      // keep it lean
      "--disable-dev-shm-usage",
      "--no-sandbox",
      "--disable-gpu",
    ],
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless,
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: ["load", "networkidle0"], timeout: 60_000 });

    // Wait for our sentinel from the HTML
    await page.waitForSelector("#mp-print-ready", { timeout: 15_000 });

    // Print
    const pdf = await page.pdf({
      printBackground: true,
      format: "A4",
      margin: { top: "18mm", bottom: "18mm", left: "18mm", right: "18mm" },
      preferCSSPageSize: false,
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close().catch(() => {});
  }
}