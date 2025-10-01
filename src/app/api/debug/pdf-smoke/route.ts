import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteer = (await import("puppeteer-core")).default;

    const executablePath = await chromium.executablePath();
    const args = chromium.args;

    // Try launch
    const browser = await puppeteer.launch({
      args,
      executablePath,
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.setContent("<html><body><h1>PDF SMOKE</h1></body></html>", { waitUntil: "domcontentloaded" });
    const pdf = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    return NextResponse.json({
      ok: true,
      length: pdf.length,
      chromium: { headless: chromium.headless, path: !!executablePath },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, where: "pdf-smoke", error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
