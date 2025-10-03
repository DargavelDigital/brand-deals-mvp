import { NextResponse } from "next/server";
import { loadMediaPackById } from "@/lib/mediaPack/loader";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

function normalizeTheme(q: URLSearchParams) {
  return {
    variant: (q.get("variant") || "classic").toLowerCase(),
    dark: q.get("dark") === "1" || q.get("dark") === "true" || q.get("dark") === "on",
    onePager: q.get("onePager") === "1" || q.get("onePager") === "true" || q.get("onePager") === "on",
    brandColor: q.get("brandColor") || "#3b82f6",
  };
}

function createSimpleMediaPackHTML(data: any, theme: any) {
  const { variant, dark, brandColor } = theme;
  const bgColor = dark ? "#0b0c0f" : "#ffffff";
  const textColor = dark ? "#ffffff" : "#000000";
  
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Media Pack</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: system-ui, -apple-system, sans-serif; 
      background: ${bgColor}; 
      color: ${textColor};
      line-height: 1.6;
    }
    .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 40px; }
    .title { font-size: 2.5rem; font-weight: bold; margin-bottom: 10px; color: ${brandColor}; }
    .subtitle { font-size: 1.2rem; opacity: 0.8; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 1.5rem; font-weight: bold; margin-bottom: 15px; color: ${brandColor}; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
    .metric { text-align: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px; }
    .metric-value { font-size: 2rem; font-weight: bold; color: ${brandColor}; }
    .metric-label { font-size: 0.9rem; opacity: 0.8; }
    .platforms { display: flex; flex-wrap: wrap; gap: 10px; }
    .platform { padding: 8px 16px; background: ${brandColor}; color: white; border-radius: 20px; font-size: 0.9rem; }
    @media print { 
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .container { max-width: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">${data.creator || 'Creator Name'}</h1>
      <p class="subtitle">Media Pack</p>
    </div>
    
    <div class="section">
      <h2 class="section-title">Metrics</h2>
      <div class="metrics">
        <div class="metric">
          <div class="metric-value">${data.metrics?.followers || '100K'}</div>
          <div class="metric-label">Followers</div>
        </div>
        <div class="metric">
          <div class="metric-value">${data.metrics?.engagement || '5.2%'}</div>
          <div class="metric-label">Engagement</div>
        </div>
        <div class="metric">
          <div class="metric-value">${data.metrics?.reach || '50K'}</div>
          <div class="metric-label">Monthly Reach</div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <h2 class="section-title">Platforms</h2>
      <div class="platforms">
        ${(data.platforms || ['Instagram', 'TikTok', 'YouTube']).map((p: string) => 
          `<span class="platform">${p}</span>`
        ).join('')}
      </div>
    </div>
    
    <div class="section">
      <h2 class="section-title">About</h2>
      <p>${data.bio || 'Professional content creator specializing in lifestyle and fashion content.'}</p>
    </div>
  </div>
  
  <div id="mp-print-ready"></div>
</body>
</html>`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams;
  const packId = q.get("mp") || q.get("packId") || "demo-pack-123";
  const theme = normalizeTheme(q);
  const jsonMode = q.get("json") === "1";

  try {
    const loaded = await loadMediaPackById(packId, theme);
    if (!loaded?.data) {
      const html = `<!doctype html><html><body>
        <h1>No data</h1><div id="mp-print-ready"></div></body></html>`;
      return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    const html = createSimpleMediaPackHTML(loaded.data, theme);

    if (jsonMode) {
      return NextResponse.json({ ok: true, bytes: html.length });
    }

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    const msg = String(err?.message || err);
    const stack = String(err?.stack || "");
    const html = `<!doctype html><html><body style="font:14px system-ui;padding:16px">
      <h1>print-html error</h1>
      <pre>${escapeHtml(msg)}</pre>
      <pre>${escapeHtml(stack)}</pre>
      <div id="mp-print-ready"></div>
    </body></html>`;
    return new NextResponse(html, {
      status: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}
