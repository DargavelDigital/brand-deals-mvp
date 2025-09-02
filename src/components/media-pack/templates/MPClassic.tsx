import React from 'react';
import { MediaPackData } from '@/lib/mediaPack/types';
import MPBase, { Page } from './MPBase';
import MPSection from './MPSection';
import MiniChart from './MiniChart';
import BrandLogo from '@/components/media/BrandLogo';
import { getBrandLogo } from '@/lib/brandLogo';

interface MPClassicProps {
  data: MediaPackData;
}

export default function MPClassic({ data }: MPClassicProps) {
  const { creator, socials, audience, contentPillars, caseStudies, services, ai, cta } = data;

  return (
    <MPBase data={data}>
      <Page>
        <div className="space-y-8 md:space-y-12">
          {/* Header Hero */}
          <section className="grid md:grid-cols-2 gap-6 md:gap-8 items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <BrandLogo 
                  domain={creator.logoUrl} 
                  name={creator.name}
                  size={64}
                  className="rounded-lg"
                />
                <div>
                  <h1 className="text-2xl font-bold text-[var(--fg)]">{creator.name}</h1>
                  {creator.tagline && (
                    <p className="text-[var(--muted)]">{creator.tagline}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {ai.elevatorPitch && (
                <p className="text-[var(--fg)] leading-relaxed">{ai.elevatorPitch}</p>
              )}
              {ai.highlights && (
                <ul className="space-y-2">
                  {ai.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-[var(--brand-600)] mt-1">•</span>
                      <span className="text-sm text-[var(--fg)]">{highlight}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Social Metrics */}
          <MPSection title="Social Media Reach">
            <div className="grid md:grid-cols-3 gap-4 md:gap-6">
              {socials.map((social, index) => (
                <div key={index} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-[var(--tint-accent)] rounded-lg flex items-center justify-center">
                      <span className="text-sm font-medium text-[var(--brand-600)]">
                        {social.platform.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-[var(--fg)] capitalize">{social.platform}</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-[var(--fg)]">
                      {social.followers.toLocaleString()}
                    </div>
                    <div className="text-sm text-[var(--muted)]">Followers</div>
                    {social.avgViews && (
                      <div className="text-sm text-[var(--muted)]">
                        Avg Views: {social.avgViews.toLocaleString()}
                      </div>
                    )}
                    {social.engagementRate && (
                      <div className="text-sm text-[var(--muted)]">
                        Engagement: {(social.engagementRate * 100).toFixed(1)}%
                      </div>
                    )}
                    {social.growth30d && (
                      <div className="text-sm text-[var(--success)]">
                        Growth: +{(social.growth30d * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </MPSection>

          {/* Audience */}
          <MPSection title="Audience Demographics">
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
            <MPSection title="Content Pillars">
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
            <MPSection title="Case Studies">
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                {caseStudies.slice(0, 2).map((study, index) => (
                  <div key={index} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <BrandLogo 
                        domain={study.brand.domain} 
                        name={study.brand.name}
                        size={32}
                        className="rounded"
                      />
                      <h3 className="font-semibold text-[var(--fg)]">{study.brand.name}</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-[var(--fg)] mb-1">Goal</h4>
                        <p className="text-sm text-[var(--muted)]">{study.goal}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-[var(--fg)] mb-1">Work</h4>
                        <p className="text-sm text-[var(--muted)]">{study.work}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-[var(--fg)] mb-1">Result</h4>
                        <p className="text-sm text-[var(--muted)]">{study.result}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </MPSection>
          )}

          {/* Services & Pricing */}
          {services && services.length > 0 && (
            <MPSection title="Services & Pricing">
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

          {/* CTA Block */}
          <section className="bg-[var(--tint-accent)] rounded-lg p-6 md:p-8 text-center">
            <h2 className="text-xl font-semibold text-[var(--fg)] mb-4">Ready to Partner?</h2>
            <p className="text-[var(--muted)] mb-6">
              Let's discuss how we can work together to create amazing content for your brand.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {cta?.meetingUrl && (
                <a
                  href={cta.meetingUrl}
                  className="inline-flex items-center justify-center px-6 py-3 bg-[var(--brand-600)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Book a Call
                </a>
              )}
              {cta?.proposalUrl && (
                <a
                  href={cta.proposalUrl}
                  className="inline-flex items-center justify-center px-6 py-3 border border-[var(--brand-600)] text-[var(--brand-600)] rounded-lg font-medium hover:bg-[var(--tint-accent)] transition-colors"
                >
                  Request Proposal
                </a>
              )}
            </div>
          </section>
        </div>
      </Page>
    </MPBase>
  );
}
