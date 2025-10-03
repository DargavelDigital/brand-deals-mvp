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

function esc(s: unknown) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getCreatorName(pack: any) {
  return (
    pack?.creator?.displayName ??
    pack?.creator?.name ??
    pack?.creator?.handle ??
    pack?.creator?.username ??
    "Creator"
  );
}

function getAbout(pack: any) {
  return (
    pack?.brandContext?.about ??
    pack?.creator?.bio ??
    "Professional content creator specializing in lifestyle and fashion content."
  );
}

function getPlatforms(pack: any): string[] {
  const socials = Array.isArray(pack?.socials) ? pack.socials : [];
  return socials
    .map((s: any) => s?.platform)
    .filter(Boolean);
}

function getMetric(pack: any, key: string, fallback = "—") {
  const n = pack?.audience?.metrics?.[key];
  if (n == null) return fallback;
  // pretty print (e.g. 100K)
  if (typeof n === "number") {
    if (n >= 1_000_000) return `${Math.round(n / 1_000_0) / 100}M`;
    if (n >= 1_000) return `${Math.round(n / 100) / 10}K`;
    return String(n);
  }
  return esc(n);
}

export function createSimpleMediaPackHTML(pack: any, theme: {
  brandColor: string; dark: boolean;
}) {
  const brand = theme.brandColor || "#3b82f6";
  const name = esc(getCreatorName(pack));
  const about = esc(getAbout(pack));
  const platforms = getPlatforms(pack);
  const followers = getMetric(pack, "followers", "100K");
  const engagement = getMetric(pack, "engagementRate", "5.2%");
  const reach = getMetric(pack, "monthlyReach", "50K");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${name} • Media Pack</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root { --brand: ${brand}; --fg: ${theme.dark ? "#f5f6f7" : "#0b0b0c"}; --bg: ${theme.dark ? "#0b0c0f" : "#fff"}; }
  * { box-sizing: border-box; }
  body { margin: 0; color: var(--fg); background: var(--bg); font: 15px/1.5 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial; }
  .page { width: 794px; min-height: 1123px; margin: 0 auto; padding: 48px; }
  h1 { margin: 0 0 6px; font-size: 28px; color: var(--brand); }
  h2 { margin: 28px 0 8px; font-size: 18px; }
  .muted { opacity: .7; }
  .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin: 18px 0 6px; }
  .metric { text-align: center; }
  .metric .val { font-size: 28px; font-weight: 700; color: var(--brand); }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  .chip { padding: 6px 10px; border-radius: 999px; background: color-mix(in oklab, var(--brand) 18%, transparent); color: var(--brand); font-weight: 600; }
  .about { margin-top: 8px; }
  @page { size: A4; margin: 18mm; }
  @media print { .page { width: auto; min-height: auto; padding: 0; } }
</style>
</head>
<body>
  <div class="page">
    <h1>${name}</h1>
    <div class="muted">Media Pack</div>

    <h2>Metrics</h2>
    <div class="metrics">
      <div class="metric"><div class="val">${followers}</div><div class="muted">Followers</div></div>
      <div class="metric"><div class="val">${engagement}</div><div class="muted">Engagement</div></div>
      <div class="metric"><div class="val">${reach}</div><div class="muted">Monthly Reach</div></div>
    </div>

    <h2>Platforms</h2>
    <div class="chips">
      ${platforms.map(p => `<span class="chip">${esc(p)}</span>`).join("")}
    </div>

    <h2>About</h2>
    <div class="about">${about}</div>

    <div id="mp-print-ready" hidden></div>
  </div>
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
