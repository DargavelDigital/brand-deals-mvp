import React from 'react';
import { MediaPackData } from '@/lib/mediaPack/types';
import MPBase, { Page } from './MPBase';
import MPSection from './MPSection';
import MiniChart from './MiniChart';
// import MPCTA from './MPCTA'; // Removed CTA section
import BrandLogo from '@/components/media/BrandLogo';

interface MPBoldProps {
  data: MediaPackData;
  isPublic?: boolean;
  mpId?: string;
}

export default function MPBold({ data, isPublic = false, mpId }: MPBoldProps) {
  const { creator, socials, audience, contentPillars, caseStudies, services, ai } = data;

  return (
    <MPBase data={data} isPublic={isPublic} mpId={mpId}>
      <Page>
        <div className="space-y-12 md:space-y-16">
          {/* Big Hero */}
          <section className="relative">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-[var(--brand-600)] to-[var(--brand-500)] opacity-10 rounded-2xl"
              style={{
                background: `linear-gradient(135deg, var(--brand-600) 0%, var(--brand-500) 100%)`
              }}
            />
            <div className="relative p-8 md:p-12 text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-[var(--fg)] mb-4">
                {creator.name}
              </h1>
              {creator.tagline && (
                <p className="text-xl text-[var(--muted)] mb-6">{creator.tagline}</p>
              )}
              {ai.elevatorPitch && (
                <p className="text-lg text-[var(--fg)] max-w-3xl mx-auto leading-relaxed">
                  {ai.elevatorPitch}
                </p>
              )}
            </div>
          </section>

          {/* Social Stat Tiles */}
          <MPSection title="Social Media Performance" className="avoid-break">
            <div className="grid md:grid-cols-3 gap-4 md:gap-6">
              {socials.map((social, index) => (
                <div key={index} className="bg-[var(--card)] border-2 border-[var(--border)] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--tint-accent)] rounded-xl flex items-center justify-center">
                        <span className="text-lg font-bold text-[var(--brand-600)]">
                          {social.platform.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[var(--fg)] capitalize">{social.platform}</h3>
                    </div>
                    {social.growth30d && (
                      <div className={`flex items-center gap-1 text-sm font-medium ${
                        social.growth30d > 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'
                      }`}>
                        {social.growth30d > 0 ? '▲' : '▼'} {Math.abs(social.growth30d * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-[var(--fg)]">
                      {social.followers.toLocaleString()}
                    </div>
                    <div className="text-sm text-[var(--muted)] font-medium">Followers</div>
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
                  </div>
                </div>
              ))}
            </div>
          </MPSection>

          {/* Signature Content */}
          <MPSection title="Signature Content" className="avoid-break">
            <div className="bg-gradient-to-r from-[var(--tint-accent)] to-[var(--tint-accent)] rounded-xl p-8">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-[var(--fg)] mb-4">Content That Converts</h3>
                  {ai.highlights && (
                    <ul className="space-y-3">
                      {ai.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="text-[var(--brand-600)] mt-1 font-bold">→</span>
                          <span className="text-[var(--fg)] font-medium">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-square bg-[var(--border)] rounded-lg flex items-center justify-center">
                    <span className="text-[var(--muted)] text-sm">Content Image</span>
                  </div>
                  <div className="aspect-square bg-[var(--border)] rounded-lg flex items-center justify-center">
                    <span className="text-[var(--muted)] text-sm">Content Image</span>
                  </div>
                  <div className="aspect-square bg-[var(--border)] rounded-lg flex items-center justify-center">
                    <span className="text-[var(--muted)] text-sm">Content Image</span>
                  </div>
                  <div className="aspect-square bg-[var(--border)] rounded-lg flex items-center justify-center">
                    <span className="text-[var(--muted)] text-sm">Content Image</span>
                  </div>
                </div>
              </div>
            </div>
          </MPSection>

          {/* Audience */}
          <MPSection title="Audience Demographics" className="avoid-break">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {audience.age && (
                <div>
                  <h3 className="text-lg font-bold text-[var(--fg)] mb-4">Age Distribution</h3>
                  <MiniChart data={audience.age} type="bar" />
                </div>
              )}
              {audience.gender && (
                <div>
                  <h3 className="text-lg font-bold text-[var(--fg)] mb-4">Gender Split</h3>
                  <MiniChart data={audience.gender} type="bar" />
                </div>
              )}
            </div>
            {audience.geo && (
              <div>
                <h3 className="text-lg font-bold text-[var(--fg)] mb-4">Top Locations</h3>
                <MiniChart data={audience.geo} type="bar" />
              </div>
            )}
          </MPSection>

          {/* Content Pillars */}
          {contentPillars && contentPillars.length > 0 && (
            <MPSection title="Content Pillars" className="avoid-break">
              <div className="flex flex-wrap gap-3">
                {contentPillars.map((pillar, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-[var(--brand-600)] text-white rounded-full text-sm font-bold"
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
              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                {caseStudies.slice(0, 2).map((study, index) => (
                  <div key={index} className="bg-[var(--card)] border-2 border-[var(--border)] rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <BrandLogo 
                        domain={study.brand.domain} 
                        name={study.brand.name}
                        size={40}
                        className="rounded-lg"
                      />
                      <h3 className="text-lg font-bold text-[var(--fg)]">{study.brand.name}</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-[var(--fg)] mb-2">Goal</h4>
                        <p className="text-sm text-[var(--muted)]">{study.goal}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[var(--fg)] mb-2">Work</h4>
                        <p className="text-sm text-[var(--muted)]">{study.work}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[var(--fg)] mb-2">Result</h4>
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
            <MPSection title="Services & Pricing" className="avoid-break">
              <div className="bg-[var(--card)] border-2 border-[var(--border)] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--surface)]">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-[var(--fg)]">Service</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-[var(--fg)]">Price</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-[var(--fg)]">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {services.map((service, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 text-sm font-medium text-[var(--fg)]">{service.label}</td>
                          <td className="px-6 py-4 text-lg font-bold text-[var(--fg)]">
                            ${service.price.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-[var(--muted)]">{service.notes}</td>
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
