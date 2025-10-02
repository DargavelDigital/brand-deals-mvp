// src/app/(public)/media-pack/print/page.tsx
// This is in the (public) route group to bypass app shell and layouts
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import React from "react";

// Server-side media pack renderer (no client components)
import { createDemoMediaPackData } from "@/lib/mediaPack/demoData";
import { MediaPackData } from "@/lib/mediaPack/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Media Pack • Print",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: {
    mp?: string;
    variant?: string; // "classic" (extend later)
    dark?: string | number; // "1" | "0"
  };
};

function coerceBool(v: unknown) {
  return v === "1" || v === 1 || v === "true" || v === true;
}

export default async function PrintPage({ searchParams }: Props) {
  const packId = searchParams.mp || "demo-pack-123";
  const variant = (searchParams.variant || "classic").toLowerCase();
  const dark = coerceBool(searchParams.dark);

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

  if (!pack) return notFound();

  // Return a completely static response to avoid any React hydration
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
      background: white;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #111827;
    }
    
    @page { 
      size: A4; 
      margin: 16mm; 
    }
    
    * { 
      -webkit-print-color-adjust: exact; 
      print-color-adjust: exact; 
    }
    
    .print-only {
      width: 100%;
      min-height: 100vh;
      background: white;
      color: #111827;
    }
    
    .max-w-4xl { max-width: 56rem; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
    .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
    .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
    .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .mb-8 { margin-bottom: 2rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mt-8 { margin-top: 2rem; }
    .mt-6 { margin-top: 1.5rem; }
    .mt-4 { margin-top: 1rem; }
    .mt-2 { margin-top: 0.5rem; }
    
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .text-right { text-align: right; }
    
    .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .font-medium { font-weight: 500; }
    
    .text-gray-900 { color: #111827; }
    .text-gray-600 { color: #4b5563; }
    .text-blue-600 { color: #2563eb; }
    .text-blue-700 { color: #1d4ed8; }
    .text-white { color: #ffffff; }
    
    .bg-white { background-color: #ffffff; }
    .bg-gray-50 { background-color: #f9fafb; }
    .bg-gray-100 { background-color: #f3f4f6; }
    .bg-gray-200 { background-color: #e5e7eb; }
    .bg-blue-50 { background-color: #eff6ff; }
    .bg-blue-600 { background-color: #2563eb; }
    
    .border { border-width: 1px; }
    .border-gray-200 { border-color: #e5e7eb; }
    .border-blue-200 { border-color: #bfdbfe; }
    .border-blue-600 { border-color: #2563eb; }
    
    .rounded { border-radius: 0.25rem; }
    .rounded-lg { border-radius: 0.5rem; }
    .rounded-xl { border-radius: 0.75rem; }
    .rounded-full { border-radius: 9999px; }
    
    .flex { display: flex; }
    .grid { display: grid; }
    .hidden { display: none; }
    
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .justify-between { justify-content: space-between; }
    
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    
    .space-y-2 > * + * { margin-top: 0.5rem; }
    .space-y-4 > * + * { margin-top: 1rem; }
    .space-y-6 > * + * { margin-top: 1.5rem; }
    
    .divide-y > * + * { border-top-width: 1px; }
    .divide-gray-200 > * + * { border-color: #e5e7eb; }
    
    .overflow-hidden { overflow: hidden; }
    .overflow-x-auto { overflow-x: auto; }
    
    .w-full { width: 100%; }
    .w-16 { width: 4rem; }
    .h-16 { height: 4rem; }
    
    .min-w-0 { min-width: 0; }
    
    .capitalize { text-transform: capitalize; }
    
    .hover\\:bg-blue-700:hover { background-color: #1d4ed8; }
    .hover\\:bg-blue-50:hover { background-color: #eff6ff; }
    
    @media (min-width: 768px) {
      .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
  </style>
</head>
<body>
  <div class="print-only">
    <div class="max-w-4xl mx-auto px-6 py-12 bg-white text-gray-900">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">
          ${pack.creator?.name || 'Media Pack'}
        </h1>
        <p class="text-xl text-gray-600 mb-4">
          ${pack.creator?.tagline || 'Professional Media Kit'}
        </p>
        ${pack.brandContext?.name ? `
        <div class="inline-block bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          <span class="text-sm font-medium text-blue-700">
            🎯 Tailored for ${pack.brandContext.name}
          </span>
        </div>
        ` : ''}
      </div>

      <!-- Creator Info -->
      <div class="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600">
            ${pack.creator?.name ? pack.creator.name.charAt(0) : '?'}
          </div>
          <div>
            <h2 class="text-2xl font-semibold text-gray-900">${pack.creator?.name || 'Creator'}</h2>
            <p class="text-gray-600">${pack.creator?.tagline || 'Content Creator'}</p>
          </div>
        </div>
      </div>

      <!-- Social Media Stats -->
      ${pack.socials && pack.socials.length > 0 ? `
      <div class="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h3 class="text-2xl font-semibold text-gray-900 mb-4">Social Media Presence</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${pack.socials.map(social => `
          <div class="text-center p-4 bg-gray-50 rounded-lg">
            <h4 class="font-semibold text-gray-900 capitalize">${social.platform}</h4>
            <p class="text-2xl font-bold text-blue-600">
              ${social.followers ? (social.followers / 1000).toFixed(0) + 'K' : 'N/A'}
            </p>
            <p class="text-sm text-gray-600">
              ${social.engagementRate ? (social.engagementRate * 100).toFixed(1) + '%' : 'N/A'} engagement
            </p>
          </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <!-- Audience Demographics -->
      ${pack.audience ? `
      <div class="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h3 class="text-2xl font-semibold text-gray-900 mb-4">Audience Demographics</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${pack.audience.age && pack.audience.age.length > 0 ? `
          <div>
            <h4 class="font-semibold text-gray-900 mb-2">Age Distribution</h4>
            <div class="space-y-2">
              ${pack.audience.age.map(age => `
              <div class="flex justify-between">
                <span class="text-gray-600">${age.label}</span>
                <span class="font-medium">${(age.value * 100).toFixed(1)}%</span>
              </div>
              `).join('')}
            </div>
          </div>
          ` : ''}
          ${pack.audience.gender && pack.audience.gender.length > 0 ? `
          <div>
            <h4 class="font-semibold text-gray-900 mb-2">Gender Distribution</h4>
            <div class="space-y-2">
              ${pack.audience.gender.map(gender => `
              <div class="flex justify-between">
                <span class="text-gray-600">${gender.label}</span>
                <span class="font-medium">${(gender.value * 100).toFixed(1)}%</span>
              </div>
              `).join('')}
            </div>
          </div>
          ` : ''}
        </div>
      </div>
      ` : ''}

      <!-- Contact Information -->
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
        <h3 class="text-2xl font-semibold text-gray-900 mb-2">Ready to Partner?</h3>
        <p class="text-gray-600 mb-4">
          Let's discuss how we can work together to create amazing content.
        </p>
        <div class="flex justify-center gap-4">
          <a href="mailto:hello@example.com" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
            Get in Touch
          </a>
          <a href="https://calendly.com/demo" class="bg-white text-blue-600 border border-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50">
            Book a Call
          </a>
        </div>
      </div>
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
