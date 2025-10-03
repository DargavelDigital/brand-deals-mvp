// src/app/media-pack/share/[token]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import MPClassic from "@/components/media-pack/templates/MPClassic";
import MPBold from "@/components/media-pack/templates/MPBold";
import MPEditorial from "@/components/media-pack/templates/MPEditorial";

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

    let Render: React.ReactNode;
    switch ((data.theme?.variant || "classic")) {
      case "bold": Render = <MPBold data={data} isPublic={true} />; break;
      case "editorial": Render = <MPEditorial data={data} isPublic={true} />; break;
      default: Render = <MPClassic data={data} isPublic={true} />; break;
    }

    // Return HTML response
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
    .content { margin-top: 60px; }
  </style>
</head>
<body>
  <div class="download-bar">
    <span>Media Pack Preview</span>
    <a href="?download=true" class="download-btn">Download PDF</a>
  </div>
  <div class="content">
    ${Render}
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
