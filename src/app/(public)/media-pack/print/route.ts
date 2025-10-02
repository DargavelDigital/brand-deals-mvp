// src/app/(public)/media-pack/print/route.ts
// Route handler for print page - returns static HTML that exactly matches the preview

import { NextRequest } from "next/server";
import { createDemoMediaPackData } from "@/lib/mediaPack/demoData";
import { getBrandLogo } from "@/lib/brandLogo";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const packId = searchParams.get("mp") || "demo-pack-123";
  const variant = (searchParams.get("variant") || "classic").toLowerCase();
  const dark = searchParams.get("dark") === "1" || searchParams.get("dark") === "true";
  const onePager = searchParams.get("onePager") === "1" || searchParams.get("onePager") === "true";
  const brandColor = searchParams.get("brandColor") || searchParams.get("brand") || '#3b82f6';

  // Load media pack data
  let pack = null;
  try {
    pack = createDemoMediaPackData();
    if (packId !== "demo-pack-123") {
      pack.packId = packId;
    }
  } catch (error) {
    console.error('Failed to load media pack data:', error);
    pack = createDemoMediaPackData();
  }

  if (!pack) {
    return new Response("Media pack not found", { status: 404 });
  }

  // Apply theme tokens exactly like MPBase does
  const theme = {
    ...pack.theme, // pack theme as fallback
    variant: variant as 'classic' | 'bold' | 'editorial',
    dark: dark,
    brandColor: brandColor,
    onePager: onePager,
  };
  const isDark = theme.dark || false;
  
  // Helper functions for formatting (exactly like MPClassic)
  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);
  const formatEngagement = (rate: number) => `${(rate * 100).toFixed(1)}%`;
  const formatGrowth = (rate: number) => `${rate > 0 ? '+' : ''}${(rate * 100).toFixed(1)}%`;

  // BrandLogo helper function
  const renderBrandLogo = (domain: string | undefined, name: string, size: number, className: string = '') => {
    if (domain) {
      return `<img src="${getBrandLogo(domain, size)}" width="${size}" height="${size}" alt="${name} logo" class="${className}" />`;
    }
    const initials = name ? name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2) : '?';
    return `<div class="flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] font-medium ${className}" style="width: ${size}px; height: ${size}px; min-width: ${size}px; min-height: ${size}px; font-size: ${Math.max(size * 0.4, 12)}px;">${initials}</div>`;
  };

  // MiniChart helper function (exactly like MiniChart component)
  const renderMiniChart = (data: Array<{label: string, value: number}>, type: 'bar' | 'waffle' = 'bar') => {
    const displayData = data.slice(0, 5);
    const maxValue = Math.max(...displayData.map(d => d.value));

    if (type === 'waffle') {
      return displayData.map((item, index) => `
        <div class="flex items-center gap-3">
          <div class="w-16 text-sm text-[var(--muted)] truncate">${item.label}</div>
          <div class="flex-1 flex gap-1">
            ${Array.from({ length: 10 }, (_, i) => `
              <div class="w-2 h-2 rounded-sm ${i < Math.round(item.value * 10) ? 'bg-[var(--brand-600)]' : 'bg-[var(--border)]'}"></div>
            `).join('')}
          </div>
          <div class="w-12 text-sm text-[var(--muted)] text-right">${Math.round(item.value * 100)}%</div>
        </div>
      `).join('');
    }

    // Bar chart
    return displayData.map((item, index) => `
      <div class="flex items-center gap-3">
        <div class="w-16 text-sm text-[var(--muted)] truncate">${item.label}</div>
        <div class="flex-1 bg-[var(--border)] rounded-full h-2">
          <div class="bg-[var(--brand-600)] h-2 rounded-full transition-all duration-300" style="width: ${(item.value / maxValue) * 100}%;"></div>
        </div>
        <div class="w-12 text-sm text-[var(--muted)] text-right">${Math.round(item.value * 100)}%</div>
      </div>
    `).join('');
  };

  // MPSection helper function
  const renderMPSection = (title: string, content: string, subtitle?: string) => `
    <section class="space-y-4 md:space-y-6">
      <div class="space-y-2">
        <h2 class="text-xl font-semibold text-[var(--fg)]">${title}</h2>
        ${subtitle ? `<p class="text-sm text-[var(--muted)]">${subtitle}</p>` : ''}
      </div>
      <div class="space-y-4">
        ${content}
      </div>
    </section>
  `;

  // Adjust spacing for one-pager mode (exactly like MPClassic)
  const spacingClass = theme.onePager ? 'space-y-3' : 'space-y-6';

  // Render Classic variant (exactly like MPClassic component)
  const renderClassicVariant = () => `
    <div class="${spacingClass}">
      <!-- Tailored for Brand Ribbon -->
      ${pack.brandContext?.name ? `
      <div class="bg-[var(--tint-accent)] border border-[var(--accent)] rounded-lg px-4 py-2 text-center">
        <span class="text-sm font-medium text-[var(--accent)]">
          🎯 Tailored for ${pack.brandContext.name}
        </span>
      </div>
      ` : ''}
      
      <!-- Header Hero -->
      <section class="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-6">
        <div class="grid md:grid-cols-2 gap-6 items-start">
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              ${renderBrandLogo(pack.creator?.logoUrl, pack.creator?.name || 'Creator', 64, 'rounded-lg border border-[var(--border)]')}
              <div>
                <h1 class="text-2xl font-bold text-[var(--fg)]">${pack.creator?.name || 'Creator'}</h1>
                ${pack.creator?.tagline ? `
                <p class="text-[var(--muted-fg)]">${pack.creator.tagline}</p>
                ` : ''}
              </div>
            </div>
            ${pack.brandContext?.name ? `
            <div class="flex items-center gap-3">
              ${renderBrandLogo(pack.brandContext.domain, pack.brandContext.name, 32, 'rounded border border-[var(--border)]')}
              <span class="text-sm text-[var(--muted-fg)]">Partnering with ${pack.brandContext.name}</span>
            </div>
            ` : ''}
          </div>
          <div class="space-y-4">
            ${pack.ai?.elevatorPitch ? `
            <p class="text-[var(--fg)] leading-relaxed">${pack.ai.elevatorPitch}</p>
            ` : `
            <p class="text-[var(--fg)] leading-relaxed">
              ${pack.creator?.name || 'This creator'} is a dynamic content creator specializing in ${pack.creator?.niche?.join(', ') || 'engaging content'} with a proven track record of delivering results for brand partnerships.
            </p>
            `}
            ${pack.ai?.highlights && pack.ai.highlights.length > 0 ? `
            <ul class="space-y-2">
              ${pack.ai.highlights.map((highlight, index) => `
              <li class="flex items-start gap-2">
                <span class="text-[var(--accent)] mt-1">•</span>
                <span class="text-[var(--fg)]">${highlight}</span>
              </li>
              `).join('')}
            </ul>
            ` : `
            <ul class="space-y-2">
              <li class="flex items-start gap-2">
                <span class="text-[var(--accent)] mt-1">•</span>
                <span class="text-[var(--fg)]">High-quality content creation and brand collaboration</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-[var(--accent)] mt-1">•</span>
                <span class="text-[var(--fg)]">Engaged audience across multiple platforms</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-[var(--accent)] mt-1">•</span>
                <span class="text-[var(--fg)]">Professional partnership approach</span>
              </li>
            </ul>
            `}
            ${!pack.ai?.elevatorPitch ? `
            <span class="inline-block px-2 py-1 bg-[var(--tint-warn)] text-[var(--warn)] rounded text-xs font-medium">
              Auto-generated content
            </span>
            ` : ''}
          </div>
        </div>
      </section>

      <!-- Social Media Reach -->
      ${pack.socials && pack.socials.length > 0 ? renderMPSection('Social Media Reach', `
        <div class="grid md:grid-cols-3 gap-4">
          ${pack.socials.map((social, index) => `
          <div class="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-4">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-8 h-8 bg-[var(--tint-accent)] rounded-lg flex items-center justify-center">
                <span class="text-sm font-medium text-[var(--accent)]">
                  ${social.platform.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 class="font-semibold text-[var(--fg)] capitalize">${social.platform}</h3>
            </div>
            <div class="space-y-2">
              <div class="text-2xl font-bold text-[var(--fg)]">
                ${formatNumber(social.followers)}
              </div>
              <div class="text-sm text-[var(--muted-fg)]">Followers</div>
              ${social.avgViews ? `
              <div class="text-sm text-[var(--muted-fg)]">
                Avg Views: ${formatNumber(social.avgViews)}
              </div>
              ` : ''}
              ${social.engagementRate ? `
              <div class="text-sm text-[var(--muted-fg)]">
                Engagement: ${formatEngagement(social.engagementRate)}
              </div>
              ` : ''}
              ${social.growth30d ? `
              <div class="text-sm ${social.growth30d > 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}">
                Growth: ${formatGrowth(social.growth30d)}
              </div>
              ` : ''}
            </div>
          </div>
          `).join('')}
        </div>
      `) : ''}

      <!-- Audience Demographics -->
      ${pack.audience ? renderMPSection('Audience Demographics', `
        <div class="grid md:grid-cols-2 gap-6 md:gap-8">
          ${pack.audience.age && pack.audience.age.length > 0 ? `
          <div>
            <h3 class="font-medium text-[var(--fg)] mb-3">Age Distribution</h3>
            <div class="space-y-2">
              ${renderMiniChart(pack.audience.age, 'bar')}
            </div>
          </div>
          ` : ''}
          ${pack.audience.gender && pack.audience.gender.length > 0 ? `
          <div>
            <h3 class="font-medium text-[var(--fg)] mb-3">Gender Split</h3>
            <div class="space-y-2">
              ${renderMiniChart(pack.audience.gender, 'bar')}
            </div>
          </div>
          ` : ''}
        </div>
        ${pack.audience.geo && pack.audience.geo.length > 0 ? `
        <div>
          <h3 class="font-medium text-[var(--fg)] mb-3">Top Locations</h3>
          <div class="space-y-2">
            ${renderMiniChart(pack.audience.geo, 'bar')}
          </div>
        </div>
        ` : ''}
      `) : ''}

      <!-- Content Pillars -->
      ${pack.contentPillars && pack.contentPillars.length > 0 ? renderMPSection('Content Pillars', `
        <div class="flex flex-wrap gap-2">
          ${pack.contentPillars.map((pillar, index) => `
          <span class="px-3 py-1 bg-[var(--tint-accent)] text-[var(--brand-600)] rounded-full text-sm font-medium">
            ${pillar}
          </span>
          `).join('')}
        </div>
      `) : ''}

      <!-- Case Studies -->
      ${pack.caseStudies && pack.caseStudies.length > 0 ? renderMPSection('Case Studies', `
        <div class="flex items-center gap-2 mb-4">
          <h2 class="text-lg font-semibold text-[var(--fg)]">Case Studies</h2>
          <span class="px-2 py-1 bg-[var(--tint-success)] text-[var(--success)] rounded-full text-xs font-medium">
            📊 Proof of Performance
          </span>
        </div>
        <div class="grid md:grid-cols-2 gap-4">
          ${pack.caseStudies.slice(0, theme.onePager ? 1 : 2).map((study, index) => `
          <div class="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-4">
            <div class="flex items-center gap-3 mb-3">
              ${renderBrandLogo(study.brand.domain, study.brand.name, 32, 'rounded border border-[var(--border)]')}
              <h3 class="font-semibold text-[var(--fg)]">${study.brand.name}</h3>
            </div>
            <div class="space-y-3">
              <div>
                <h4 class="text-sm font-medium text-[var(--fg)] mb-1">Goal</h4>
                <p class="text-sm text-[var(--muted-fg)]">${study.goal}</p>
              </div>
              <div>
                <h4 class="text-sm font-medium text-[var(--fg)] mb-1">Work</h4>
                <p class="text-sm text-[var(--muted-fg)]">${study.work}</p>
              </div>
              <div>
                <h4 class="text-sm font-medium text-[var(--fg)] mb-1">Result</h4>
                <p class="text-sm text-[var(--muted-fg)]">${study.result}</p>
              </div>
            </div>
          </div>
          `).join('')}
        </div>
      `) : ''}

      <!-- Services & Pricing -->
      ${pack.services && pack.services.length > 0 ? renderMPSection('Services & Pricing', `
        <div class="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-[var(--surface)]">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium text-[var(--fg)]">Service</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-[var(--fg)]">Price</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-[var(--fg)]">Notes</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[var(--border)]">
                ${pack.services.map((service, index) => `
                <tr>
                  <td class="px-4 py-3 text-sm text-[var(--fg)]">${service.label}</td>
                  <td class="px-4 py-3 text-sm font-medium text-[var(--fg)]">
                    $${service.price.toLocaleString()}
                  </td>
                  <td class="px-4 py-3 text-sm text-[var(--muted)]">${service.notes}</td>
                </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        ${pack.rateCardNote ? `
        <p class="text-sm text-[var(--muted-fg)]">${pack.rateCardNote}</p>
        ` : ''}
      `) : ''}

      <!-- CTA Section (exactly like MPCTA) -->
      <section class="mt-12 pt-8 border-t border-[var(--border)]">
        <div class="text-center space-y-6">
          <div>
            <h2 class="text-2xl md:text-3xl font-bold text-[var(--fg)] mb-2">Ready to work together?</h2>
            <p class="text-[var(--muted-fg)] text-lg">Let's discuss how we can create amazing content together.</p>
          </div>
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            ${pack.cta?.meetingUrl ? `
            <a href="${pack.cta.meetingUrl}" class="px-8 py-4 bg-[var(--brand-600)] text-white font-semibold rounded-lg hover:bg-[var(--brand-700)] transition-colors min-w-[200px]">
              Book a Call
            </a>
            ` : `
            <button disabled class="px-8 py-4 bg-[var(--surface)] text-[var(--muted-fg)] font-semibold rounded-lg cursor-not-allowed min-w-[200px]">
              Book a Call
            </button>
            `}
            ${pack.cta?.proposalUrl ? `
            <a href="${pack.cta.proposalUrl}" class="px-8 py-4 bg-[var(--surface)] text-[var(--fg)] font-semibold rounded-lg border border-[var(--border)] hover:bg-[var(--tint-accent)] transition-colors min-w-[200px]">
              Request Proposal
            </a>
            ` : `
            <button disabled class="px-8 py-4 bg-[var(--surface)] text-[var(--muted-fg)] font-semibold rounded-lg border border-[var(--border)] cursor-not-allowed min-w-[200px]">
              Request Proposal
            </button>
            `}
          </div>
          ${(!pack.cta?.meetingUrl || !pack.cta?.proposalUrl) ? `
          <p class="text-sm text-[var(--muted-fg)]">Connect scheduling in Settings</p>
          ` : ''}
        </div>
      </section>
    </div>
  `;

  // Render Bold variant (placeholder for now)
  const renderBoldVariant = () => renderClassicVariant();
  
  // Render Editorial variant (placeholder for now)
  const renderEditorialVariant = () => renderClassicVariant();

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
    .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
    .px-8 { padding-left: 2rem; padding-right: 2rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
    .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
    .mb-8 { margin-bottom: 2rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-1 { margin-bottom: 0.25rem; }
    .mt-12 { margin-top: 3rem; }
    .mt-8 { margin-top: 2rem; }
    .mt-6 { margin-top: 1.5rem; }
    .mt-4 { margin-top: 1rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mt-1 { margin-top: 0.25rem; }
    .pt-8 { padding-top: 2rem; }
    
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .text-right { text-align: right; }
    
    .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
    .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
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
    .text-white { color: white; }
    
    .bg-\\[var\\(--bg\\)\\] { background-color: var(--bg); }
    .bg-\\[var\\(--card\\)\\] { background-color: var(--card); }
    .bg-\\[var\\(--surface\\)\\] { background-color: var(--surface); }
    .bg-\\[var\\(--tint-accent\\)\\] { background-color: var(--tint-accent); }
    .bg-\\[var\\(--tint-success\\)\\] { background-color: var(--tint-success); }
    .bg-\\[var\\(--tint-warn\\)\\] { background-color: var(--tint-warn); }
    .bg-\\[var\\(--brand-600\\)\\] { background-color: var(--brand-600); }
    
    .border { border-width: 1px; }
    .border-\\[var\\(--border\\)\\] { border-color: var(--border); }
    .border-\\[var\\(--accent\\)\\] { border-color: var(--accent); }
    
    .rounded { border-radius: 0.25rem; }
    .rounded-lg { border-radius: 0.5rem; }
    .rounded-xl { border-radius: 0.75rem; }
    .rounded-full { border-radius: 9999px; }
    .rounded-sm { border-radius: 0.125rem; }
    
    .flex { display: flex; }
    .grid { display: grid; }
    .hidden { display: none; }
    .inline-block { display: inline-block; }
    
    .items-center { align-items: center; }
    .items-start { align-items: flex-start; }
    .justify-center { justify-content: center; }
    .justify-between { justify-content: space-between; }
    
    .gap-1 { gap: 0.25rem; }
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
    .w-2 { width: 0.5rem; }
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
    
    .hover\\:bg-\\[var\\(--brand-700\\)\\]:hover { background-color: ${theme.brandColor}dd; }
    .hover\\:bg-\\[var\\(--tint-accent\\)\\]:hover { background-color: var(--tint-accent); }
    
    .cursor-not-allowed { cursor: not-allowed; }
    
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