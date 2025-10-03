// src/app/media-pack/share/[token]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    // Check if this is a request for the file download
    const url = new URL(req.url);
    if (url.searchParams.get('download') === 'true') {
      // Handle file download
      const mp = await prisma().mediaPack.findFirst({ 
        where: { shareToken: params.token },
        include: { files: { orderBy: { createdAt: 'desc' }, take: 1 } }
      });
      
      if (!mp || !mp.files[0]) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const file = mp.files[0];
      const headers = new Headers();
      headers.set("Content-Type", file.mime || "application/pdf");
      headers.set("Content-Length", String(file.size || file.data?.length || 0));
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
      headers.set("Content-Disposition", `inline; filename="media-pack-${mp.id}-${mp.variant}${mp.dark ? "-dark": ""}.pdf"`);
      return new NextResponse(file.data, { headers });
    }

    // Handle HTML view
    const mp = await prisma().mediaPack.findFirst({ where: { shareToken: params.token } });
    if (!mp) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = { ...(mp.payload as any), theme: mp.theme as any };

    // Determine which template to use
    const template = data.theme?.variant || "classic";
    const isPublic = true;

    // Return HTML response with basic structure
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Media Pack - ${data.creator?.name || 'Creator'}</title>
  <style>
    body { margin: 0; padding: 0; font-family: system-ui, sans-serif; }
    .download-bar { 
      position: fixed; top: 0; left: 0; right: 0; 
      background: #f8f9fa; border-bottom: 1px solid #e9ecef; 
      padding: 12px 24px; z-index: 1000; 
      display: flex; justify-content: space-between; align-items: center;
    }
    .download-btn { 
      background: #3b82f6; color: white; padding: 8px 16px; 
      border: none; border-radius: 6px; cursor: pointer; 
      text-decoration: none; font-weight: 500;
    }
    .download-btn:hover { background: #2563eb; }
    .content { margin-top: 60px; padding: 24px; }
    .media-pack { max-width: 800px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 32px; }
    .creator-name { font-size: 2rem; font-weight: bold; margin-bottom: 8px; }
    .creator-title { color: #666; font-size: 1.1rem; }
    .section { margin-bottom: 32px; }
    .section h2 { font-size: 1.5rem; margin-bottom: 16px; color: #333; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .metric-card { background: #f8f9fa; padding: 16px; border-radius: 8px; text-align: center; }
    .metric-value { font-size: 2rem; font-weight: bold; color: #3b82f6; }
    .metric-label { color: #666; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="download-bar">
    <span>Media Pack Preview</span>
    <a href="?download=true" class="download-btn">Download PDF</a>
  </div>
  <div class="content">
    <div class="media-pack">
      <div class="header">
        <div class="creator-name">${data.creator?.name || 'Creator Name'}</div>
        <div class="creator-title">${data.creator?.title || 'Content Creator'}</div>
      </div>
      
      <div class="section">
        <h2>Social Media Reach</h2>
        <div class="metrics">
          <div class="metric-card">
            <div class="metric-value">${data.metrics?.followers || '0'}</div>
            <div class="metric-label">Total Followers</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${data.metrics?.engagement || '0%'}</div>
            <div class="metric-label">Engagement Rate</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${data.metrics?.views || '0'}</div>
            <div class="metric-label">Average Views</div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2>About</h2>
        <p>${data.bio || 'Professional content creator with a passion for authentic storytelling and brand partnerships.'}</p>
      </div>
      
      <div class="section">
        <h2>Services</h2>
        <p>Content creation, brand partnerships, social media management, and influencer marketing.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" }
    });
  } catch (error) {
    console.error("Share route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
