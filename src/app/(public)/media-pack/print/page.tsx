import { headers } from "next/headers";
import { createDemoMediaPackData } from "@/lib/mediaPack/demoData";
import { MediaPackData } from "@/lib/mediaPack/types";

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
  const { creator, socials, audience, contentPillars, caseStudies, services, brandContext } = data;
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
                  <div 
                    className="w-16 h-16 bg-[var(--tint-accent)] rounded-lg flex items-center justify-center border border-[var(--border)]"
                    style={{ backgroundColor: `${brandColor}20` }}
                  >
                    <span className="text-2xl font-bold" style={{ color: brandColor }}>
                      {creator.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-[var(--fg)]">{creator.name}</h1>
                    <p className="text-[var(--muted-fg)]">{creator.bio}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 bg-[var(--tint-accent)] rounded border border-[var(--border)] flex items-center justify-center"
                    style={{ backgroundColor: `${brandColor}20` }}
                  >
                    <span className="text-sm font-bold" style={{ color: brandColor }}>
                      {brandContext?.name?.charAt(0) || 'B'}
                    </span>
                  </div>
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

  return (
    <main id="mp-print-root" style={{ padding: 0, margin: 0 }}>
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
                🎯 Tailored for Your Brand
              </span>
            </div>

            {/* Creator Profile */}
            <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-6">
              <div className="grid md:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-16 h-16 bg-[var(--tint-accent)] rounded-lg flex items-center justify-center border border-[var(--border)]"
                      style={{ backgroundColor: `${brandColor}20` }}
                    >
                      <span className="text-2xl font-bold" style={{ color: brandColor }}>
                        S
                      </span>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-[var(--fg)]">Sarah Johnson</h1>
                      <p className="text-[var(--muted-fg)]">Lifestyle Creator • Tech Enthusiast • Storyteller</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 bg-[var(--tint-accent)] rounded border border-[var(--border)] flex items-center justify-center"
                      style={{ backgroundColor: `${brandColor}20` }}
                    >
                      <span className="text-sm font-bold" style={{ color: brandColor }}>
                        B
                      </span>
                    </div>
                    <span className="text-sm text-[var(--muted-fg)]">
                      Partnering with Your Brand
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[var(--fg)] leading-relaxed">
                    I help brands connect with engaged audiences through authentic storytelling and creative content that drives real results.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--accent)] mt-1">•</span>
                      <span className="text-[var(--fg)]">125K+ engaged followers across Instagram, TikTok, and YouTube</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--accent)] mt-1">•</span>
                      <span className="text-[var(--fg)]">Average 5.2% engagement rate (industry average: 2.1%)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--accent)] mt-1">•</span>
                      <span className="text-[var(--fg)]">Proven track record with 15+ successful brand partnerships</span>
                    </li>
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
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-8 h-8 bg-[var(--tint-accent)] rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${brandColor}20` }}
                      >
                        <span className="text-sm font-medium" style={{ color: brandColor }}>
                          I
                        </span>
                      </div>
                      <h3 className="font-semibold text-[var(--fg)] capitalize">Instagram</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-[var(--fg)]">125,000</div>
                      <div className="text-sm text-[var(--muted-fg)]">Followers</div>
                      <div className="text-sm text-[var(--muted-fg)]">Avg Views: 45,000</div>
                      <div className="text-sm text-[var(--muted-fg)]">Engagement: 4.5%</div>
                      <div className="text-sm text-[var(--success)]">Growth: +8.0%</div>
                    </div>
                  </div>
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-8 h-8 bg-[var(--tint-accent)] rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${brandColor}20` }}
                      >
                        <span className="text-sm font-medium" style={{ color: brandColor }}>
                          T
                        </span>
                      </div>
                      <h3 className="font-semibold text-[var(--fg)] capitalize">TikTok</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-[var(--fg)]">89,000</div>
                      <div className="text-sm text-[var(--muted-fg)]">Followers</div>
                      <div className="text-sm text-[var(--muted-fg)]">Avg Views: 120,000</div>
                      <div className="text-sm text-[var(--muted-fg)]">Engagement: 6.2%</div>
                      <div className="text-sm text-[var(--success)]">Growth: +15.0%</div>
                    </div>
                  </div>
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-8 h-8 bg-[var(--tint-accent)] rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${brandColor}20` }}
                      >
                        <span className="text-sm font-medium" style={{ color: brandColor }}>
                          Y
                        </span>
                      </div>
                      <h3 className="font-semibold text-[var(--fg)] capitalize">YouTube</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-[var(--fg)]">45,000</div>
                      <div className="text-sm text-[var(--muted-fg)]">Followers</div>
                      <div className="text-sm text-[var(--muted-fg)]">Avg Views: 25,000</div>
                      <div className="text-sm text-[var(--muted-fg)]">Engagement: 3.8%</div>
                      <div className="text-sm text-[var(--success)]">Growth: +5.0%</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

                {/* Audience Demographics */}
                <section className="space-y-4 md:space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-[var(--fg)]">Audience Demographics</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-[var(--fg)]">Age Distribution</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--fg)]">18-24</span>
                            <span className="text-sm font-medium text-[var(--fg)]">35%</span>
                          </div>
                          <div className="w-full bg-[var(--border)] rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: "35%",
                                backgroundColor: brandColor
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--fg)]">25-34</span>
                            <span className="text-sm font-medium text-[var(--fg)]">42%</span>
                          </div>
                          <div className="w-full bg-[var(--border)] rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: "42%",
                                backgroundColor: brandColor
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--fg)]">35-44</span>
                            <span className="text-sm font-medium text-[var(--fg)]">18%</span>
                          </div>
                          <div className="w-full bg-[var(--border)] rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: "18%",
                                backgroundColor: brandColor
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--fg)]">45-54</span>
                            <span className="text-sm font-medium text-[var(--fg)]">5%</span>
                          </div>
                          <div className="w-full bg-[var(--border)] rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: "5%",
                                backgroundColor: brandColor
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-[var(--fg)]">Gender Split</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--fg)]">Female</span>
                            <span className="text-sm font-medium text-[var(--fg)]">68%</span>
                          </div>
                          <div className="w-full bg-[var(--border)] rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: "68%",
                                backgroundColor: brandColor
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--fg)]">Male</span>
                            <span className="text-sm font-medium text-[var(--fg)]">28%</span>
                          </div>
                          <div className="w-full bg-[var(--border)] rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: "28%",
                                backgroundColor: brandColor
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--fg)]">Other</span>
                            <span className="text-sm font-medium text-[var(--fg)]">4%</span>
                          </div>
                          <div className="w-full bg-[var(--border)] rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: "4%",
                                backgroundColor: brandColor
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-[var(--fg)]">Top Locations</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[var(--fg)]">United States</span>
                          <span className="text-sm font-medium text-[var(--fg)]">45%</span>
                        </div>
                        <div className="w-full bg-[var(--border)] rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: "45%",
                              backgroundColor: brandColor
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[var(--fg)]">United Kingdom</span>
                          <span className="text-sm font-medium text-[var(--fg)]">18%</span>
                        </div>
                        <div className="w-full bg-[var(--border)] rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: "18%",
                              backgroundColor: brandColor
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[var(--fg)]">Canada</span>
                          <span className="text-sm font-medium text-[var(--fg)]">12%</span>
                        </div>
                        <div className="w-full bg-[var(--border)] rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: "12%",
                              backgroundColor: brandColor
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[var(--fg)]">Australia</span>
                          <span className="text-sm font-medium text-[var(--fg)]">8%</span>
                        </div>
                        <div className="w-full bg-[var(--border)] rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: "8%",
                              backgroundColor: brandColor
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[var(--fg)]">Germany</span>
                          <span className="text-sm font-medium text-[var(--fg)]">7%</span>
                        </div>
                        <div className="w-full bg-[var(--border)] rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: "7%",
                              backgroundColor: brandColor
                            }}
                          />
                        </div>
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
                      <span
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${brandColor}20`,
                          color: brandColor
                        }}
                      >
                        Tech Reviews & Unboxings
                      </span>
                      <span
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${brandColor}20`,
                          color: brandColor
                        }}
                      >
                        Lifestyle & Fashion
                      </span>
                      <span
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${brandColor}20`,
                          color: brandColor
                        }}
                      >
                        Travel & Adventure
                      </span>
                      <span
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${brandColor}20`,
                          color: brandColor
                        }}
                      >
                        Behind-the-Scenes
                      </span>
                      <span
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${brandColor}20`,
                          color: brandColor
                        }}
                      >
                        Product Recommendations
                      </span>
                    </div>
                  </div>
                </section>

                {/* Case Studies */}
                <section className="space-y-4 md:space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-[var(--fg)]">Case Studies</h2>
                    <p className="text-sm text-[var(--muted-fg)]">📊 Proof of Performance</p>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div
                          className="w-12 h-12 bg-[var(--tint-accent)] rounded-lg flex items-center justify-center border border-[var(--border)]"
                          style={{ backgroundColor: `${brandColor}20` }}
                        >
                          <span className="text-lg font-bold" style={{ color: brandColor }}>
                            T
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[var(--fg)]">TechGear Pro</h3>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-medium text-[var(--fg)] mb-2">Goal</h4>
                          <p className="text-sm text-[var(--muted-fg)]">Increase brand awareness among tech enthusiasts</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-[var(--fg)] mb-2">Work</h4>
                          <p className="text-sm text-[var(--muted-fg)]">Created 3 unboxing videos and 2 review posts showcasing the latest smartphone features</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-[var(--fg)] mb-2">Result</h4>
                          <p className="text-sm text-[var(--muted-fg)]">Generated 2.3M views, 45K engagement, and 12% increase in brand mentions</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div
                          className="w-12 h-12 bg-[var(--tint-accent)] rounded-lg flex items-center justify-center border border-[var(--border)]"
                          style={{ backgroundColor: `${brandColor}20` }}
                        >
                          <span className="text-lg font-bold" style={{ color: brandColor }}>
                            S
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[var(--fg)]">StyleCo</h3>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-medium text-[var(--fg)] mb-2">Goal</h4>
                          <p className="text-sm text-[var(--muted-fg)]">Drive traffic to new fashion collection</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-[var(--fg)] mb-2">Work</h4>
                          <p className="text-sm text-[var(--muted-fg)]">Styled and photographed 5 outfits from the collection with lifestyle content</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-[var(--fg)] mb-2">Result</h4>
                          <p className="text-sm text-[var(--muted-fg)]">Achieved 1.8M reach with 8.2% engagement rate and 15% click-through to website</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Services & Pricing */}
                <section className="space-y-4 md:space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-[var(--fg)]">Services & Pricing</h2>
                  </div>
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[var(--border)]">
                          <th className="text-left p-4 font-medium text-[var(--fg)]">Service</th>
                          <th className="text-left p-4 font-medium text-[var(--fg)]">Price</th>
                          <th className="text-left p-4 font-medium text-[var(--fg)]">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-[var(--border)]">
                          <td className="p-4 text-[var(--fg)]">Instagram Reel + Story</td>
                          <td className="p-4 font-medium text-[var(--fg)]">$2,500</td>
                          <td className="p-4 text-[var(--muted-fg)]">Includes 1 Reel + 3 Stories</td>
                        </tr>
                        <tr className="border-b border-[var(--border)]">
                          <td className="p-4 text-[var(--fg)]">TikTok Video</td>
                          <td className="p-4 font-medium text-[var(--fg)]">$1,800</td>
                          <td className="p-4 text-[var(--muted-fg)]">30-60 second video</td>
                        </tr>
                        <tr className="border-b border-[var(--border)]">
                          <td className="p-4 text-[var(--fg)]">YouTube Integration</td>
                          <td className="p-4 font-medium text-[var(--fg)]">$3,500</td>
                          <td className="p-4 text-[var(--muted-fg)]">Product placement in existing video</td>
                        </tr>
                        <tr>
                          <td className="p-4 text-[var(--fg)]">Multi-Platform Package</td>
                          <td className="p-4 font-medium text-[var(--fg)]">$6,500</td>
                          <td className="p-4 text-[var(--muted-fg)]">Instagram + TikTok + YouTube</td>
                        </tr>
                      </tbody>
                    </table>
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
