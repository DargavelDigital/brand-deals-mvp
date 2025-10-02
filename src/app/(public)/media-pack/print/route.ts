// src/app/(public)/media-pack/print/route.ts
// Route handler for print page - returns static HTML to avoid React hydration issues

import { NextRequest } from "next/server";
import { createDemoMediaPackData } from "@/lib/mediaPack/demoData";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const packId = searchParams.get("mp") || "demo-pack-123";
  const variant = (searchParams.get("variant") || "classic").toLowerCase();
  const dark = searchParams.get("dark") === "1" || searchParams.get("dark") === "true";
  const onePager = searchParams.get("onePager") === "1" || searchParams.get("onePager") === "true";
  const brandColor = searchParams.get("brandColor") || searchParams.get("brand") || '#3b82f6';

  // fetch server-side (no client fetches)
  let pack = null;
  try {
    // For now, use demo data as fallback since we don't have getMediaPackById yet
    pack = createDemoMediaPackData();
    // Override packId if provided
    if (packId !== "demo-pack-123") {
      pack.packId = packId;
    }
  } catch (error) {
    console.error('Failed to load media pack data:', error);
    pack = createDemoMediaPackData(); // safe fallback for demo/preview
  }

  if (!pack) {
    return new Response("Media pack not found", { status: 404 });
  }

  // Apply theme tokens like MPBase does, with URL parameter overrides
  const theme = {
    variant: variant as 'classic' | 'bold' | 'editorial',
    dark: dark,
    brandColor: brandColor,
    onePager: onePager,
    ...pack.theme // pack theme as fallback
  };
  const isDark = theme.dark || false;
  
  // Helper functions for formatting
  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);
  const formatEngagement = (rate: number) => `${(rate * 100).toFixed(1)}%`;
  const formatGrowth = (rate: number) => `${rate > 0 ? '+' : ''}${(rate * 100).toFixed(1)}%`;
  
  // Return a completely static HTML response that matches MPClassic exactly
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Media Pack - ${pack.creator?.name || 'Demo Creator'}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html, body { 
      margin: 0; 
      padding: 0; 
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
    }
    
    @page { 
      size: A4; 
      margin: 16mm; 
    }
    
    * { 
      -webkit-print-color-adjust: exact; 
      print-color-adjust: exact; 
    }
    
    .min-h-screen {
      min-height: 100vh;
      background-color: ${isDark ? '#0b0c0f' : '#ffffff'};
      color: ${isDark ? '#f5f6f7' : '#0b0b0c'};
      --brand-600: ${theme.brandColor};
      --bg: ${isDark ? '#0b0c0f' : '#ffffff'};
      --fg: ${isDark ? '#f5f6f7' : '#0b0b0c'};
      --surface: ${isDark ? '#121419' : '#f7f7f8'};
      --card: ${isDark ? '#121419' : '#ffffff'};
      --border: ${isDark ? '#2a2f39' : '#e6e7ea'};
      --muted-fg: ${isDark ? '#a6adbb' : '#666a71'};
      --muted: ${isDark ? '#a6adbb' : '#666a71'};
      --accent: ${theme.brandColor};
      --tint-accent: ${theme.brandColor}20;
      --brand-600: ${theme.brandColor};
      --success: #10b981;
      --tint-success: #10b98120;
      --error: #ef4444;
      --warn: #f59e0b;
      --tint-warn: #f59e0b20;
    }
    
    /* One-pager mode spacing */
    .one-pager .space-y-6 > * + * { margin-top: 0.75rem; }
    .one-pager .space-y-4 > * + * { margin-top: 0.5rem; }
    .one-pager .space-y-3 > * + * { margin-top: 0.75rem; }
    .one-pager .md\\:space-y-6 > * + * { margin-top: 0.75rem; }
    .one-pager .py-12 { padding-top: 2rem; padding-bottom: 2rem; }
    .one-pager .py-8 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
    .one-pager .py-6 { padding-top: 1rem; padding-bottom: 1rem; }
    
    .max-w-4xl { max-width: 56rem; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
    .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
    .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
    .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
    .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
    .mb-8 { margin-bottom: 2rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-1 { margin-bottom: 0.25rem; }
    .mt-8 { margin-top: 2rem; }
    .mt-6 { margin-top: 1.5rem; }
    .mt-4 { margin-top: 1rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mt-1 { margin-top: 0.25rem; }
    
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .text-right { text-align: right; }
    
    .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
    .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-xs { font-size: 0.75rem; line-height: 1rem; }
    
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .font-medium { font-weight: 500; }
    
    .text-\\[var\\(--fg\\)\\] { color: var(--fg); }
    .text-\\[var\\(--muted-fg\\)\\] { color: var(--muted-fg); }
    .text-\\[var\\(--muted\\)\\] { color: var(--muted); }
    .text-\\[var\\(--accent\\)\\] { color: var(--accent); }
    .text-\\[var\\(--brand-600\\)\\] { color: var(--brand-600); }
    .text-\\[var\\(--success\\)\\] { color: var(--success); }
    .text-\\[var\\(--error\\)\\] { color: var(--error); }
    .text-\\[var\\(--warn\\)\\] { color: var(--warn); }
    
    .bg-\\[var\\(--bg\\)\\] { background-color: var(--bg); }
    .bg-\\[var\\(--card\\)\\] { background-color: var(--card); }
    .bg-\\[var\\(--surface\\)\\] { background-color: var(--surface); }
    .bg-\\[var\\(--tint-accent\\)\\] { background-color: var(--tint-accent); }
    .bg-\\[var\\(--tint-success\\)\\] { background-color: var(--tint-success); }
    .bg-\\[var\\(--tint-warn\\)\\] { background-color: var(--tint-warn); }
    
    .border { border-width: 1px; }
    .border-\\[var\\(--border\\)\\] { border-color: var(--border); }
    .border-\\[var\\(--accent\\)\\] { border-color: var(--accent); }
    
    .rounded { border-radius: 0.25rem; }
    .rounded-lg { border-radius: 0.5rem; }
    .rounded-xl { border-radius: 0.75rem; }
    .rounded-full { border-radius: 9999px; }
    
    .flex { display: flex; }
    .grid { display: grid; }
    .hidden { display: none; }
    
    .items-center { align-items: center; }
    .items-start { align-items: flex-start; }
    .justify-center { justify-content: center; }
    .justify-between { justify-content: space-between; }
    
    .gap-2 { gap: 0.5rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    .gap-8 { gap: 2rem; }
    
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    
    .space-y-2 > * + * { margin-top: 0.5rem; }
    .space-y-3 > * + * { margin-top: 0.75rem; }
    .space-y-4 > * + * { margin-top: 1rem; }
    .space-y-6 > * + * { margin-top: 1.5rem; }
    
    .divide-y > * + * { border-top-width: 1px; }
    .divide-\\[var\\(--border\\)\\] > * + * { border-color: var(--border); }
    
    .overflow-hidden { overflow: hidden; }
    .overflow-x-auto { overflow-x: auto; }
    
    .w-full { width: 100%; }
    .w-8 { width: 2rem; }
    .w-16 { width: 4rem; }
    .w-12 { width: 3rem; }
    .h-8 { height: 2rem; }
    .h-16 { height: 4rem; }
    .h-2 { height: 0.5rem; }
    
    .min-w-0 { min-width: 0; }
    .min-w-\\[200px\\] { min-width: 200px; }
    
    .capitalize { text-transform: capitalize; }
    .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    
    .shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
    
    .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .duration-300 { transition-duration: 300ms; }
    
    .hover\\:bg-\\[var\\(--brand-700\\)\\]:hover { background-color: ${brandColor}dd; }
    .hover\\:bg-\\[var\\(--tint-accent\\)\\]:hover { background-color: var(--tint-accent); }
    
    @media (min-width: 768px) {
      .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .md\\:space-y-6 > * + * { margin-top: 1.5rem; }
      .md\\:gap-8 { gap: 2rem; }
      .md\\:text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
    }
    
    @media (min-width: 640px) {
      .sm\\:flex-row { flex-direction: row; }
    }
  </style>
</head>
<body>
  <div class="min-h-screen ${theme.onePager ? 'one-pager' : ''}">
    <div class="max-w-4xl mx-auto px-6 py-12">
      ${theme.variant === 'bold' ? renderBoldVariant() : theme.variant === 'editorial' ? renderEditorialVariant() : renderClassicVariant()}
    </div>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
