import chromium from "@sparticuz/chromium"
import puppeteer from "puppeteer-core"

const PAGE_TIMEOUT_MS = 30_000 // fail fast
const PDF_TIMEOUT_MS = 45_000

export async function renderPdfFromUrl(url: string): Promise<Buffer> {
  let browser: puppeteer.Browser | null = null
  const stages: string[] = []
  try {
    stages.push(`launch`)
    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
      ],
      defaultViewport: { width: 1080, height: 1600, deviceScaleFactor: 1 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    })

    const page = await browser.newPage()

    // Block heavy resources (images, fonts, media, 3rd-party)
    await page.setRequestInterception(true)
    page.on("request", (req) => {
      const rType = req.resourceType()
      const url = req.url()
      if (
        rType === "image" ||
        rType === "media" ||
        rType === "font" ||
        rType === "stylesheet" ||
        url.includes("analytics") ||
        url.includes("googletagmanager") ||
        url.includes("facebook") ||
        url.includes("tiktok")
      ) {
        return req.abort()
      }
      req.continue()
    })

    stages.push(`goto:${url}`)
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: PAGE_TIMEOUT_MS })

    // Ensure print CSS
    await page.emulateMediaType("print")

    // Wait only for the sentinel your print page emits
    stages.push(`waitFor:#mp-print-ready`)
    await page.waitForSelector("#mp-print-ready", { timeout: PAGE_TIMEOUT_MS })

    // Small settle to finish layout
    await page.waitForTimeout(200)

    stages.push(`pdf`)
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "14mm", right: "12mm", bottom: "14mm", left: "12mm" },
      timeout: PDF_TIMEOUT_MS as any, // puppeteer 24 supports timeout on pdf; harmless if ignored
    })

    return pdf
  } catch (err: any) {
    const e = new Error(`renderer failed @ ${stages.join(" > ")} :: ${err?.message || String(err)}`)
    ;(e as any).stages = stages
    throw e
  } finally {
    if (browser) {
      try { await browser.close() } catch {}
    }
  }
}
