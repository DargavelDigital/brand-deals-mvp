import os from "node:os";
import { existsSync } from "node:fs";

export type ChromiumSpec = {
  executablePath: string | undefined;
  args: string[];
  headless: "new" | boolean;
  timeoutMs: number;
};

export function getChromium(): ChromiumSpec {
  const timeoutMs = 120_000;
  const baseArgs = [
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-tools",
    "--single-process",
  ];
  
  // 1) Explicit env
  const fromEnv = process.env.CHROME_EXECUTABLE_PATH;
  if (fromEnv && existsSync(fromEnv)) {
    return { executablePath: fromEnv, args: baseArgs, headless: "new", timeoutMs };
  }
  
  // 2) Sparticuz/chromium (if installed)
  try {
    // @ts-ignore optional dep
    const chromium = require("@sparticuz/chromium");
    const p = chromium.executablePath;
    if (p) {
      return { executablePath: p, args: [...baseArgs, ...(chromium.args ?? [])], headless: "new", timeoutMs };
    }
  } catch {}
  
  // 3) System Chrome (dev)
  const candidates = os.platform() === "darwin"
    ? ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Chromium.app/Contents/MacOS/Chromium"]
    : ["/usr/bin/google-chrome", "/usr/bin/chromium-browser", "/usr/bin/chromium"];
  
  for (const p of candidates) {
    if (existsSync(p)) {
      return { executablePath: p, args: baseArgs, headless: "new", timeoutMs };
    }
  }
  
  // 4) Puppeteer bundled (fallback; works only with full puppeteer, not puppeteer-core)
  try {
    const puppeteer = require("puppeteer");
    // @ts-ignore
    const exec = puppeteer.executablePath?.() || puppeteer.executablePath;
    if (exec && existsSync(exec)) {
      return { executablePath: exec, args: baseArgs, headless: "new", timeoutMs };
    }
  } catch {}
  
  // Last resort: undefined → caller must stub PDF
  return { executablePath: undefined, args: baseArgs, headless: "new", timeoutMs };
}