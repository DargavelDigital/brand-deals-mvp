import React from 'react';
import { MediaPackData } from '@/lib/mediaPack/types';
import MPBase, { Page } from './MPBase';
import MPSection from './MPSection';
import MiniChart from './MiniChart';
// import MPCTA from './MPCTA'; // Removed CTA section
import BrandLogo from '@/components/media/BrandLogo';
import { getBrandLogo } from '@/lib/brandLogo';

interface MPClassicProps {
  data: MediaPackData;
  isPublic?: boolean;
  mpId?: string;
}

export default function MPClassic({ data, isPublic = false, mpId }: MPClassicProps) {
  const { creator, socials, audience, contentPillars, caseStudies, services, ai, brandContext } = data;
  const { onePager = false } = data.theme || {};

  console.log('🎨 MPClassic Template Received Data:');
  console.log('🎨 creator:', creator);
  console.log('🎨 creator.name:', creator?.name);
  console.log('🎨 creator.tagline:', creator?.tagline);
  console.log('🎨 socials:', socials);
  console.log('🎨 socials[0]:', socials?.[0]);
  console.log('🎨 ai:', ai);
  console.log('🎨 ai.elevatorPitch:', ai?.elevatorPitch);
  console.log('🎨 ai.highlights:', ai?.highlights);
  console.log('🎨 theme:', data.theme);
  
  console.log('🎨 DEMOGRAPHICS DEBUGGING:');
  console.log('🎨 audience object:', audience);
  console.log('🎨 audience.age:', audience?.age);
  console.log('🎨 audience.gender:', audience?.gender);
  console.log('🎨 audience.geo:', audience?.geo);
  console.log('🎨 audience.interests:', audience?.interests);
  console.log('🎨 Full data object keys:', Object.keys(data));
  console.log('🎨 Does data have demographics?:', 'demographics' in data);
  console.log('🎨 Does data have brandFit?:', 'brandFit' in data);
  console.log('🎨 Does data have stats?:', 'stats' in data);
  console.log('🎨 stats object:', data.stats);
  console.log('🎨 brandFit object:', data.brandFit);
  console.log('🎨 brands array:', data.brands);

  // Format numbers with proper localization
  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);
  const formatEngagement = (rate: number) => `${(rate * 100).toFixed(1)}%`;
  const formatGrowth = (rate: number) => `${rate > 0 ? '+' : ''}${(rate * 100).toFixed(1)}%`;

  // Adjust spacing for one-pager mode
  const spacingClass = onePager ? 'space-y-3' : 'space-y-6';

  return (
    <MPBase data={data} isPublic={isPublic} mpId={mpId}>
      <Page>
        <div className={spacingClass}>
          {/* Tailored for Brand Ribbon */}
          {brandContext?.name && (
            <div className="bg-[var(--tint-accent)] border border-[var(--accent)] rounded-lg px-4 py-2 text-center">
              <span className="text-sm font-medium text-[var(--accent)]">
                🎯 Tailored for {brandContext.name}
              </span>
            </div>
          )}
          {/* Header Hero */}
          <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-6">
            <div className="grid md:grid-cols-2 gap-6 items-start">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <BrandLogo 
                    domain={creator.logoUrl} 
                    name={creator.name}
                    size={64}
                    className="rounded-lg border border-[var(--border)]"
                  />
                  <div>
                    <h1 className="text-2xl font-bold text-[var(--fg)]">{creator.name}</h1>
                    {creator.tagline && (
                      <p className="text-[var(--muted-fg)]">{creator.tagline}</p>
                    )}
                  </div>
                </div>
                {brandContext?.name && (
                  <div className="flex items-center gap-3">
                    <BrandLogo 
                      domain={brandContext.domain} 
                      name={brandContext.name}
                      size={32}
                      className="rounded border border-[var(--border)]"
                    />
                    <span className="text-sm text-[var(--muted-fg)]">Partnering with {brandContext.name}</span>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {ai.elevatorPitch ? (
                  <p className="text-[var(--fg)] leading-relaxed">{ai.elevatorPitch}</p>
                ) : (
                  <p className="text-[var(--fg)] leading-relaxed">
                    {creator.name} is a dynamic content creator specializing in {creator.niche?.join(', ') || 'engaging content'} with a proven track record of delivering results for brand partnerships.
                  </p>
                )}
                {ai.highlights && ai.highlights.length > 0 ? (
                  <ul className="space-y-2">
                    {ai.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-[var(--accent)] mt-1">•</span>
                        <span className="text-[var(--fg)]">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--accent)] mt-1">•</span>
                      <span className="text-[var(--fg)]">High-quality content creation and brand collaboration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--accent)] mt-1">•</span>
                      <span className="text-[var(--fg)]">Engaged audience across multiple platforms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--accent)] mt-1">•</span>
                      <span className="text-[var(--fg)]">Professional partnership approach</span>
                    </li>
                  </ul>
                )}
                {!ai.elevatorPitch && (
                  <span className="inline-block px-2 py-1 bg-[var(--tint-warn)] text-[var(--warn)] rounded text-xs font-medium">
                    Auto-generated content
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Social Metrics */}
          <MPSection title="Social Media Reach" className="avoid-break">
            <div className="grid md:grid-cols-3 gap-4">
              {socials.map((social, index) => (
                <div key={index} className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-[var(--tint-accent)] rounded-lg flex items-center justify-center">
                      <span className="text-sm font-medium text-[var(--accent)]">
                        {social.platform.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-[var(--fg)] capitalize">{social.platform}</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-[var(--fg)]">
                      {formatNumber(social.followers)}
                    </div>
                    <div className="text-sm text-[var(--muted-fg)]">Followers</div>
                    {social.avgViews && (
                      <div className="text-sm text-[var(--muted-fg)]">
                        Avg Views: {formatNumber(social.avgViews)}
                      </div>
                    )}
                    {social.engagementRate && (
                      <div className="text-sm text-[var(--muted-fg)]">
                        Engagement: {formatEngagement(social.engagementRate)}
                      </div>
                    )}
                    {social.growth30d && (
                      <div className={`text-sm ${social.growth30d > 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                        Growth: {formatGrowth(social.growth30d)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </MPSection>

          {/* Audience */}
          <MPSection title="Audience Demographics" className="avoid-break">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {audience.age && (
                <div>
                  <h3 className="font-medium text-[var(--fg)] mb-3">Age Distribution</h3>
                  <MiniChart data={audience.age} type="bar" />
                </div>
              )}
              {audience.gender && (
                <div>
                  <h3 className="font-medium text-[var(--fg)] mb-3">Gender Split</h3>
                  <MiniChart data={audience.gender} type="bar" />
                </div>
              )}
            </div>
            {audience.geo && (
              <div>
                <h3 className="font-medium text-[var(--fg)] mb-3">Top Locations</h3>
                <MiniChart data={audience.geo} type="bar" />
              </div>
            )}
          </MPSection>

          {/* Content Pillars */}
          {contentPillars && contentPillars.length > 0 && (
            <MPSection title="Content Pillars" className="avoid-break">
              <div className="flex flex-wrap gap-2">
                {contentPillars.map((pillar, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[var(--tint-accent)] text-[var(--brand-600)] rounded-full text-sm font-medium"
                  >
                    {pillar}
                  </span>
                ))}
              </div>
            </MPSection>
          )}

          {/* Case Studies */}
          {caseStudies && caseStudies.length > 0 && (
            <MPSection title="Case Studies" className="avoid-break">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-[var(--fg)]">Case Studies</h2>
                <span className="px-2 py-1 bg-[var(--tint-success)] text-[var(--success)] rounded-full text-xs font-medium">
                  📊 Proof of Performance
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {caseStudies.slice(0, onePager ? 1 : 2).map((study, index) => (
                  <div key={index} className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <BrandLogo 
                        domain={study.brand.domain} 
                        name={study.brand.name}
                        size={32}
                        className="rounded border border-[var(--border)]"
                      />
                      <h3 className="font-semibold text-[var(--fg)]">{study.brand.name}</h3>
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
            </MPSection>
          )}

          {/* Services & Pricing */}
          {services && services.length > 0 && (
            <MPSection title="Services & Pricing" className="avoid-break">
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
                          <td className="px-4 py-3 text-sm text-[var(--fg)]">{service.label}</td>
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
            </MPSection>
          )}

          {/* CTA section removed */}
        </div>
      </Page>
    </MPBase>
  );
}
