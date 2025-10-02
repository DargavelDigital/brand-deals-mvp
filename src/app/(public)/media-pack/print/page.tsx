import { headers } from "next/headers";
import { createDemoMediaPackData } from "@/lib/mediaPack/demoData";
import { MediaPackData } from "@/lib/mediaPack/types";
import BrandLogoServer from "@/components/media/BrandLogoServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Search = {
  mp?: string;
  variant?: "classic" | "bold" | "editorial" | string;
  dark?: string;
  onePager?: string;
  brandColor?: string;
};

function toBool(v?: string) {
  return v === "1" || v === "true";
}
function normVariant(v?: string) {
  const s = (v || "classic").toLowerCase();
  return s === "bold" ? "bold" : s === "editorial" ? "editorial" : "classic";
}

function renderMediaPackHTML(data: MediaPackData, variant: string) {
  const { creator, socials, audience, contentPillars, caseStudies, services, ai, cta, brandContext } = data;
  const { onePager = false, dark = false, brandColor = "#3b82f6" } = data.theme || {};

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: dark ? '#0b0c0f' : '#ffffff',
        color: dark ? '#f5f6f7' : '#0b0b0c',
        '--brand-600': brandColor,
        '--bg': dark ? '#0b0c0f' : '#ffffff',
        '--fg': dark ? '#f5f6f7' : '#0b0b0c',
        '--surface': dark ? '#121419' : '#f7f7f8',
        '--card': dark ? '#121419' : '#ffffff',
        '--border': dark ? '#2a2f39' : '#e6e7ea',
        '--muted-fg': dark ? '#a6adbb' : '#666a71',
        '--muted': dark ? '#a6adbb' : '#666a71',
        '--accent': brandColor,
        '--tint-accent': `${brandColor}20`,
        '--success': '#10b981',
        '--tint-success': '#10b98120',
        '--error': '#ef4444',
        '--warn': '#f59e0b',
        '--tint-warn': '#f59e0b20',
      } as React.CSSProperties}
    >
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-[var(--tint-accent)] border border-[var(--accent)] rounded-lg px-4 py-2 text-center">
            <span className="text-sm font-medium text-[var(--accent)]">
              🎯 Tailored for {brandContext?.name || 'Your Brand'}
            </span>
          </div>

          {/* Creator Profile */}
          <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-6">
            <div className="grid md:grid-cols-2 gap-6 items-start">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <BrandLogoServer
                    domain={creator.avatar}
                    name={creator.name}
                    size={64}
                    className="rounded-lg border border-[var(--border)]"
                  />
                  <div>
                    <h1 className="text-2xl font-bold text-[var(--fg)]">{creator.name}</h1>
                    <p className="text-[var(--muted-fg)]">{creator.bio}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BrandLogoServer
                    domain={brandContext?.domain}
                    name={brandContext?.name}
                    size={32}
                    className="rounded border border-[var(--border)]"
                  />
                  <span className="text-sm text-[var(--muted-fg)]">
                    Partnering with {brandContext?.name || 'Your Brand'}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[var(--fg)] leading-relaxed">{creator.description}</p>
                <ul className="space-y-2">
                  {creator.highlights?.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-[var(--accent)] mt-1">•</span>
                      <span className="text-[var(--fg)]">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Social Media Reach */}
          <section className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[var(--fg)]">Social Media Reach</h2>
            </div>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                {socials.map((social, index) => (
                  <div key={index} className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-8 h-8 bg-[var(--tint-accent)] rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${brandColor}20` }}
                      >
                        <span className="text-sm font-medium" style={{ color: brandColor }}>
                          {social.platform.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <h3 className="font-semibold text-[var(--fg)] capitalize">{social.platform}</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-[var(--fg)]">
                        {social.followers.toLocaleString()}
                      </div>
                      <div className="text-sm text-[var(--muted-fg)]">Followers</div>
                      <div className="text-sm text-[var(--muted-fg)]">
                        Avg Views: {social.avgViews?.toLocaleString() || 'N/A'}
                      </div>
                      <div className="text-sm text-[var(--muted-fg)]">
                        Engagement: {social.engagement}%
                      </div>
                      <div className="text-sm text-[var(--success)]">
                        Growth: +{social.growth}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Audience Demographics */}
          <section className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[var(--fg)]">Audience Demographics</h2>
            </div>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                {/* Age Distribution */}
                <div>
                  <h3 className="font-medium text-[var(--fg)] mb-3">Age Distribution</h3>
                  <div className="space-y-2">
                    {audience.ageDistribution.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-16 text-sm text-[var(--muted)] truncate">{item.range}</div>
                        <div className="flex-1 bg-[var(--border)] rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${(item.percentage / 100) * 100}%`,
                              backgroundColor: brandColor
                            }}
                          />
                        </div>
                        <div className="w-12 text-sm text-[var(--muted)] text-right">{item.percentage}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gender Split */}
                <div>
                  <h3 className="font-medium text-[var(--fg)] mb-3">Gender Split</h3>
                  <div className="space-y-2">
                    {audience.genderSplit.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-16 text-sm text-[var(--muted)] truncate">{item.gender}</div>
                        <div className="flex-1 bg-[var(--border)] rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${(item.percentage / 100) * 100}%`,
                              backgroundColor: brandColor
                            }}
                          />
                        </div>
                        <div className="w-12 text-sm text-[var(--muted)] text-right">{item.percentage}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Locations */}
              <div>
                <h3 className="font-medium text-[var(--fg)] mb-3">Top Locations</h3>
                <div className="space-y-2">
                  {audience.topLocations.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-16 text-sm text-[var(--muted)] truncate">{item.location}</div>
                      <div className="flex-1 bg-[var(--border)] rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(item.percentage / 100) * 100}%`,
                            backgroundColor: brandColor
                          }}
                        />
                      </div>
                      <div className="w-12 text-sm text-[var(--muted)] text-right">{item.percentage}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Content Pillars */}
          <section className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[var(--fg)]">Content Pillars</h2>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {contentPillars.map((pillar, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: `${brandColor}20`,
                      color: brandColor
                    }}
                  >
                    {pillar}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Case Studies */}
          <section className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[var(--fg)]">Case Studies</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-[var(--fg)]">Case Studies</h2>
                <span 
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: '#10b98120',
                    color: '#10b981'
                  }}
                >
                  📊 Proof of Performance
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {caseStudies.map((study, index) => (
                  <div key={index} className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <BrandLogoServer
                        domain={study.brand?.domain}
                        name={study.brand?.name}
                        size={32}
                        className="rounded border border-[var(--border)]"
                      />
                      <h3 className="font-semibold text-[var(--fg)]">{study.brand?.name}</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-[var(--fg)] mb-1">Goal</h4>
                        <p className="text-sm text-[var(--muted-fg)]">{study.goal}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-[var(--fg)] mb-1">Work</h4>
                        <p className="text-sm text-[var(--muted-fg)]">{study.work}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-[var(--fg)] mb-1">Result</h4>
                        <p className="text-sm text-[var(--muted-fg)]">{study.result}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Services & Pricing */}
          <section className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[var(--fg)]">Services & Pricing</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--surface)]">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-[var(--fg)]">Service</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-[var(--fg)]">Price</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-[var(--fg)]">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {services.map((service, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-[var(--fg)]">{service.name}</td>
                          <td className="px-4 py-3 text-sm font-medium text-[var(--fg)]">
                            ${service.price.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-[var(--muted)]">{service.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="mt-12 pt-8 border-t border-[var(--border)]">
            <div className="text-center space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--fg)] mb-2">
                  Ready to work together?
                </h2>
                <p className="text-[var(--muted-fg)] text-lg">
                  Let's discuss how we can create amazing content together.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  className="px-8 py-4 font-semibold rounded-lg transition-colors min-w-[200px] text-white"
                  style={{ backgroundColor: brandColor }}
                >
                  Book a Call
                </button>
                <button 
                  className="px-8 py-4 font-semibold rounded-lg border transition-colors min-w-[200px]"
                  style={{
                    backgroundColor: dark ? '#121419' : '#f7f7f8',
                    color: dark ? '#f5f6f7' : '#0b0b0c',
                    borderColor: dark ? '#2a2f39' : '#e6e7ea'
                  }}
                >
                  Request Proposal
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default async function Page({ searchParams }: { searchParams?: Search }) {
  headers(); // keep this so Next treats it server-only

  const packId     = searchParams?.mp || "demo-pack-123";
  const variant    = normVariant(searchParams?.variant);
  const dark       = toBool(searchParams?.dark);
  const onePager   = toBool(searchParams?.onePager);
  const brandColor = searchParams?.brandColor || "#3b82f6";

  const base = createDemoMediaPackData();
  const data = {
    ...base,
    packId,
    theme: {
      ...base.theme,
      variant,
      dark,
      onePager,
      brandColor,
    },
  };

  // Render a simple HTML structure that matches the MPClassic component
  const content = renderMediaPackHTML(data, variant);

  return (
    <main id="mp-print-root" style={{ padding: 0, margin: 0 }}>
      {content}

      {/* The sentinel exists unconditionally */}
      <div id="mp-print-ready" />

      {/* This script flips a flag after fonts & images have settled */}
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: simple inline script for ready flag
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              function done() {
                document.documentElement.setAttribute('data-mp-ready', '1');
                window.__MP_READY__ = true;
              }
              // Wait for layout + fonts + images to be as stable as we can.
              var p = [];
              if (document.fonts && document.fonts.ready) { p.push(document.fonts.ready.catch(function(){})); }
              if (document.readyState === 'complete') {
                Promise.all(p).then(done);
              } else {
                window.addEventListener('load', function(){ Promise.all(p).then(done); });
              }
              // Safety timeout in case fonts API not supported
              setTimeout(done, 4000);
            })();
          `,
        }}
      />
    </main>
  );
}
