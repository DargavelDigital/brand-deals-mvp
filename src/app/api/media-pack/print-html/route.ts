import { NextResponse } from "next/server";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadMediaPackById } from "@/lib/mediaPack/loader"; // your safe loader (returns payload or demo)
import MPClassic from "@/components/media-pack/templates/MPClassic";
import MPBold from "@/components/media-pack/templates/MPBold";
import MPEditorial from "@/components/media-pack/templates/MPEditorial";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

function pickTemplate(variant: string) {
  switch ((variant || "classic").toLowerCase()) {
    case "bold": return MPBold;
    case "editorial": return MPEditorial;
    default: return MPClassic;
  }
}

function normalizeTheme(q: URLSearchParams) {
  return {
    variant: (q.get("variant") || "classic") as "classic"|"bold"|"editorial",
    dark: q.get("dark") === "1" || q.get("dark") === "true" || q.get("dark") === "on",
    onePager: q.get("onePager") === "1" || q.get("onePager") === "true" || q.get("onePager") === "on",
    brandColor: q.get("brandColor") || "#3b82f6",
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams;
  const packId = q.get("mp") || q.get("packId") || "demo-pack-123";
  const theme = normalizeTheme(q);
  const jsonMode = q.get("json") === "1";   // optional diag mode

  try {
    const loaded = await loadMediaPackById(packId, theme);
    if (!loaded?.data) {
      const html = `<!doctype html><html><body>
        <h1>No data</h1><div id="mp-print-ready"></div></body></html>`;
      return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    const Template = pickTemplate(theme.variant);
    // Render the same tree your preview uses; ensure these templates are server-safe.
    const app = React.createElement(
      "html",
      { lang: "en" },
      React.createElement(
        "body",
        { style: { margin: 0, background: theme.dark ? "#0b0c0f" : "#ffffff" } },
        React.createElement(Template as any, { data: loaded.data, isPublic: true }),
        React.createElement("div", { id: "mp-print-ready" })
      )
    );

    const html = "<!doctype html>" + renderToStaticMarkup(app);

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
