import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ width: string; height: string }> }
) {
  const { width, height } = await params;
  
  const w = parseInt(width, 10) || 40;
  const h = parseInt(height, 10) || 40;
  
  // Create a simple SVG placeholder
  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6" stroke="#d1d5db" stroke-width="1"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="system-ui, sans-serif" font-size="${Math.min(w, h) * 0.3}" fill="#6b7280">?</text>
    </svg>
  `.trim();

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
