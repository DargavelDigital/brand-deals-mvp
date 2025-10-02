// src/app/(public)/media-pack/print/route.ts
// Route handler for print page - returns static HTML to avoid React hydration issues

import { NextRequest } from "next/server";
import { createDemoMediaPackData } from "@/lib/mediaPack/demoData";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const packId = searchParams.get("mp") || "demo-pack-123";
  const variant = (searchParams.get("variant") || "classic").toLowerCase();
  const dark = searchParams.get("dark") === "1" || searchParams.get("dark") === "true";

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

  // Return a completely static HTML response
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
        <div class="grid md:grid-cols-2 gap-6 items-start">
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600">
                ${pack.creator?.name ? pack.creator.name.charAt(0) : '?'}
              </div>
              <div>
                <h2 class="text-2xl font-semibold text-gray-900">${pack.creator?.name || 'Creator'}</h2>
                <p class="text-gray-600">${pack.creator?.tagline || 'Content Creator'}</p>
              </div>
            </div>
            ${pack.brandContext?.name ? `
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                <span class="text-sm font-medium text-gray-600">${pack.brandContext.name.charAt(0)}</span>
              </div>
              <span class="text-sm text-gray-600">Partnering with ${pack.brandContext.name}</span>
            </div>
            ` : ''}
          </div>
          <div class="space-y-4">
            ${pack.ai?.elevatorPitch ? `
            <p class="text-gray-900 leading-relaxed">${pack.ai.elevatorPitch}</p>
            ` : ''}
            ${pack.ai?.highlights && pack.ai.highlights.length > 0 ? `
            <ul class="space-y-2">
              ${pack.ai.highlights.slice(0, 3).map(highlight => `
              <li class="flex items-start gap-2">
                <span class="text-blue-600 mt-1">•</span>
                <span class="text-gray-900 text-sm">${highlight}</span>
              </li>
              `).join('')}
            </ul>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Social Media Stats -->
      ${pack.socials && pack.socials.length > 0 ? `
      <div class="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h3 class="text-2xl font-semibold text-gray-900 mb-4">Social Media Reach</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${pack.socials.map(social => `
          <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <span class="text-sm font-medium text-blue-600">${social.platform.charAt(0).toUpperCase()}</span>
              </div>
              <h4 class="font-semibold text-gray-900 capitalize">${social.platform}</h4>
            </div>
            <div class="space-y-2">
              <div class="text-2xl font-bold text-gray-900">${social.followers ? social.followers.toLocaleString() : 'N/A'}</div>
              <div class="text-sm text-gray-600">Followers</div>
              <div class="text-sm text-gray-600">Avg Views: ${social.avgViews ? social.avgViews.toLocaleString() : 'N/A'}</div>
              <div class="text-sm text-gray-600">Engagement: ${social.engagementRate ? (social.engagementRate * 100).toFixed(1) + '%' : 'N/A'}</div>
              <div class="text-sm text-green-600">Growth: ${social.growth30d ? (social.growth30d > 0 ? '+' : '') + (social.growth30d * 100).toFixed(1) + '%' : 'N/A'}</div>
            </div>
          </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <!-- Audience Demographics -->
      ${pack.audience ? `
      <div class="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h3 class="text-2xl font-semibold text-gray-900 mb-4">Audience Demographics</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          ${pack.audience.age && pack.audience.age.length > 0 ? `
          <div>
            <h4 class="font-medium text-gray-900 mb-3">Age Distribution</h4>
            <div class="space-y-2">
              ${pack.audience.age.map(age => `
              <div class="flex items-center gap-3">
                <div class="w-16 text-sm text-gray-600 truncate">${age.label}</div>
                <div class="flex-1 bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: ${(age.value * 100).toFixed(1)}%;"></div>
                </div>
                <div class="w-12 text-sm text-gray-600 text-right">${(age.value * 100).toFixed(0)}%</div>
              </div>
              `).join('')}
            </div>
          </div>
          ` : ''}
          ${pack.audience.gender && pack.audience.gender.length > 0 ? `
          <div>
            <h4 class="font-medium text-gray-900 mb-3">Gender Split</h4>
            <div class="space-y-2">
              ${pack.audience.gender.map(gender => `
              <div class="flex items-center gap-3">
                <div class="w-16 text-sm text-gray-600 truncate">${gender.label}</div>
                <div class="flex-1 bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: ${(gender.value * 100).toFixed(1)}%;"></div>
                </div>
                <div class="w-12 text-sm text-gray-600 text-right">${(gender.value * 100).toFixed(0)}%</div>
              </div>
              `).join('')}
            </div>
          </div>
          ` : ''}
        </div>
        ${pack.audience.geo && pack.audience.geo.length > 0 ? `
        <div>
          <h4 class="font-medium text-gray-900 mb-3">Top Locations</h4>
          <div class="space-y-2">
            ${pack.audience.geo.map(geo => `
            <div class="flex items-center gap-3">
              <div class="w-16 text-sm text-gray-600 truncate">${geo.label}</div>
              <div class="flex-1 bg-gray-200 rounded-full h-2">
                <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: ${(geo.value * 100).toFixed(1)}%;"></div>
              </div>
              <div class="w-12 text-sm text-gray-600 text-right">${(geo.value * 100).toFixed(0)}%</div>
            </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
      </div>
      ` : ''}

      <!-- Content Pillars -->
      ${pack.contentPillars && pack.contentPillars.length > 0 ? `
      <div class="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h3 class="text-2xl font-semibold text-gray-900 mb-4">Content Pillars</h3>
        <div class="flex flex-wrap gap-2">
          ${pack.contentPillars.map(pillar => `
          <span class="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">${pillar}</span>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <!-- Case Studies -->
      ${pack.caseStudies && pack.caseStudies.length > 0 ? `
      <div class="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <div class="flex items-center gap-2 mb-4">
          <h3 class="text-2xl font-semibold text-gray-900">Case Studies</h3>
          <span class="px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">📊 Proof of Performance</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${pack.caseStudies.map(study => `
          <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                <span class="text-sm font-medium text-gray-600">${study.brand.name.charAt(0)}</span>
              </div>
              <h4 class="font-semibold text-gray-900">${study.brand.name}</h4>
            </div>
            <div class="space-y-3">
              <div>
                <h5 class="text-sm font-medium text-gray-900 mb-1">Goal</h5>
                <p class="text-sm text-gray-600">${study.goal}</p>
              </div>
              <div>
                <h5 class="text-sm font-medium text-gray-900 mb-1">Work</h5>
                <p class="text-sm text-gray-600">${study.work}</p>
              </div>
              <div>
                <h5 class="text-sm font-medium text-gray-900 mb-1">Result</h5>
                <p class="text-sm text-gray-600">${study.result}</p>
              </div>
            </div>
          </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <!-- Services & Pricing -->
      ${pack.services && pack.services.length > 0 ? `
      <div class="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h3 class="text-2xl font-semibold text-gray-900 mb-4">Services & Pricing</h3>
        <div class="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-100">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-900">Service</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-900">Price</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-900">Notes</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                ${pack.services.map(service => `
                <tr>
                  <td class="px-4 py-3 text-sm text-gray-900">${service.label}</td>
                  <td class="px-4 py-3 text-sm font-medium text-gray-900">$${service.price.toLocaleString()}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">${service.notes}</td>
                </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        ${pack.rateCardNote ? `
        <p class="text-sm text-gray-600 mt-3">${pack.rateCardNote}</p>
        ` : ''}
      </div>
      ` : ''}

      <!-- AI Highlights -->
      ${pack.ai && pack.ai.highlights && pack.ai.highlights.length > 0 ? `
      <div class="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h3 class="text-2xl font-semibold text-gray-900 mb-4">Why Partner With Me?</h3>
        ${pack.ai.elevatorPitch ? `
        <p class="text-gray-600 leading-relaxed mb-4">${pack.ai.elevatorPitch}</p>
        ` : ''}
        <ul class="space-y-2">
          ${pack.ai.highlights.map(highlight => `
          <li class="flex items-start gap-2">
            <span class="text-blue-600 mt-1">•</span>
            <span class="text-gray-900">${highlight}</span>
          </li>
          `).join('')}
        </ul>
      </div>
      ` : ''}

      <!-- Contact Information -->
      <div class="mt-12 pt-8 border-t border-gray-200">
        <div class="text-center space-y-6">
          <div>
            <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Ready to work together?</h2>
            <p class="text-gray-600 text-lg">Let's discuss how we can create amazing content together.</p>
          </div>
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            ${pack.cta?.meetingUrl ? `
            <a href="${pack.cta.meetingUrl}" class="bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors min-w-[200px] px-8 py-4">
              Book a Call
            </a>
            ` : ''}
            ${pack.cta?.proposalUrl ? `
            <a href="${pack.cta.proposalUrl}" class="bg-gray-100 text-gray-900 font-semibold rounded-lg border border-gray-200 hover:bg-gray-200 transition-colors min-w-[200px] px-8 py-4">
              Request Proposal
            </a>
            ` : ''}
            ${!pack.cta?.meetingUrl && !pack.cta?.proposalUrl ? `
            <a href="mailto:${pack.contact?.email || 'hello@example.com'}" class="bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors min-w-[200px] px-8 py-4">
              Get in Touch
            </a>
            <a href="https://calendly.com/demo" class="bg-gray-100 text-gray-900 font-semibold rounded-lg border border-gray-200 hover:bg-gray-200 transition-colors min-w-[200px] px-8 py-4">
              Book a Call
            </a>
            ` : ''}
          </div>
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
