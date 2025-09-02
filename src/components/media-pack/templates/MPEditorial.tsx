import React from 'react';
import { MediaPackData } from '@/lib/mediaPack/types';
import MPBase, { Page } from './MPBase';
import MPSection from './MPSection';
import MiniChart from './MiniChart';
import BrandLogo from '@/components/media/BrandLogo';

interface MPEditorialProps {
  data: MediaPackData;
}

export default function MPEditorial({ data }: MPEditorialProps) {
  const { creator, socials, audience, contentPillars, caseStudies, services, ai, cta } = data;

  return (
    <MPBase data={data}>
      <Page>
        <div className="grid md:grid-cols-4 gap-8 md:gap-12">
          {/* Left Rail - Bio */}
          <div className="md:col-span-1 space-y-8">
            <div className="sticky top-8">
              <div className="space-y-6">
                <div className="text-center">
                  <BrandLogo 
                    domain={creator.logoUrl} 
                    name={creator.name}
                    size={80}
                    className="rounded-xl mx-auto mb-4"
                  />
                  <h1 className="text-2xl font-bold text-[var(--fg)] mb-2">{creator.name}</h1>
                  {creator.tagline && (
                    <p className="text-[var(--muted)] italic">{creator.tagline}</p>
                  )}
                </div>

                {/* Pull-quotes style highlights */}
                {ai.highlights && (
                  <div className="space-y-4">
                    {ai.highlights.map((highlight, index) => (
                      <div key={index} className="relative">
                        <div className="absolute -left-2 top-0 text-4xl text-[var(--brand-600)] font-bold leading-none">
                          "
                        </div>
                        <blockquote className="text-sm text-[var(--fg)] italic pl-6 leading-relaxed">
                          {highlight}
                        </blockquote>
                      </div>
                    ))}
                  </div>
                )}

                {/* Contact Info */}
                <div className="border-t border-[var(--border)] pt-6">
                  <h3 className="font-semibold text-[var(--fg)] mb-3">Contact</h3>
                  <div className="space-y-2 text-sm text-[var(--muted)]">
                    <div>{data.contact.email}</div>
                    {data.contact.phone && <div>{data.contact.phone}</div>}
                    {data.contact.website && <div>{data.contact.website}</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="md:col-span-3 space-y-12">
            {/* Hero Section */}
            <section className="space-y-6">
              {ai.elevatorPitch && (
                <div className="text-lg text-[var(--fg)] leading-relaxed">
                  {ai.elevatorPitch}
                </div>
              )}
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
                    <MiniChart data={audience.age} type="waffle" />
                  </div>
                )}
                {audience.gender && (
                  <div>
                    <h3 className="font-medium text-[var(--fg)] mb-3">Gender Split</h3>
                    <MiniChart data={audience.gender} type="waffle" />
                  </div>
                )}
              </div>
              {audience.geo && (
                <div>
                  <h3 className="font-medium text-[var(--fg)] mb-3">Top Locations</h3>
                  <MiniChart data={audience.geo} type="waffle" />
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

            {/* Gridded Media Placeholders */}
            <MPSection title="Content Gallery">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }, (_, index) => (
                  <div key={index} className="aspect-square bg-[var(--border)] rounded-lg flex items-center justify-center">
                    <span className="text-[var(--muted)] text-sm">Media {index + 1}</span>
                  </div>
                ))}
              </div>
            </MPSection>

            {/* Case Studies */}
            {caseStudies && caseStudies.length > 0 && (
              <MPSection title="Case Studies">
                <div className="space-y-6">
                  {caseStudies.slice(0, 2).map((study, index) => (
                    <div key={index} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <BrandLogo 
                          domain={study.brand.domain} 
                          name={study.brand.name}
                          size={40}
                          className="rounded-lg"
                        />
                        <h3 className="text-lg font-semibold text-[var(--fg)]">{study.brand.name}</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-[var(--fg)] mb-2">Goal</h4>
                          <p className="text-sm text-[var(--muted)] leading-relaxed">{study.goal}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[var(--fg)] mb-2">Work</h4>
                          <p className="text-sm text-[var(--muted)] leading-relaxed">{study.work}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[var(--fg)] mb-2">Result</h4>
                          <p className="text-sm text-[var(--muted)] leading-relaxed">{study.result}</p>
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
        </div>
      </Page>
    </MPBase>
  );
}
