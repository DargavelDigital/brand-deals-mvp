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

  // minimal print CSS to ensure predictable layout for Puppeteer
  const PrintCSS = () => (
    <style>{`
      html, body { 
        margin: 0; 
        padding: 0; 
        background: white;
        font-family: system-ui, -apple-system, sans-serif;
      }
      @page { 
        size: A4; 
        margin: 16mm; 
      }
      * { 
        -webkit-print-color-adjust: exact; 
        print-color-adjust: exact; 
        box-sizing: border-box;
      }
      .print-only {
        width: 100%;
        min-height: 100vh;
        background: white;
      }
    `}</style>
  );

  // Server-side media pack renderer (no client components)
  const Render = () => {
    try {
      console.log('Print page rendering with data:', { 
        packId, 
        variant, 
        dark, 
        hasCreator: !!pack.creator,
        hasSocials: !!pack.socials,
        theme: pack.theme
      });
      
      const { creator, socials, audience, brandContext } = pack;
      
      return (
        <div className="max-w-4xl mx-auto px-6 py-12 bg-white text-gray-900">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {creator?.name || 'Media Pack'}
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              {creator?.tagline || 'Professional Media Kit'}
            </p>
            {brandContext?.name && (
              <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <span className="text-sm font-medium text-blue-700">
                  🎯 Tailored for {brandContext.name}
                </span>
              </div>
            )}
          </div>

          {/* Creator Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600">
                {creator?.name ? creator.name.charAt(0) : '?'}
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{creator?.name || 'Creator'}</h2>
                <p className="text-gray-600">{creator?.tagline || 'Content Creator'}</p>
              </div>
            </div>
          </div>

          {/* Social Media Stats */}
          {socials && socials.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Social Media Presence</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {socials.map((social, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 capitalize">{social.platform}</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {social.followers ? (social.followers / 1000).toFixed(0) + 'K' : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {social.engagementRate ? (social.engagementRate * 100).toFixed(1) + '%' : 'N/A'} engagement
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audience Demographics */}
          {audience && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Audience Demographics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {audience.age && audience.age.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Age Distribution</h4>
                    <div className="space-y-2">
                      {audience.age.map((age, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-gray-600">{age.label}</span>
                          <span className="font-medium">{(age.value * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {audience.gender && audience.gender.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Gender Distribution</h4>
                    <div className="space-y-2">
                      {audience.gender.map((gender, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-gray-600">{gender.label}</span>
                          <span className="font-medium">{(gender.value * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Ready to Partner?</h3>
            <p className="text-gray-600 mb-4">
              Let's discuss how we can work together to create amazing content.
            </p>
            <div className="flex justify-center gap-4">
              <a 
                href="mailto:hello@example.com" 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
              >
                Get in Touch
              </a>
              <a 
                href="https://calendly.com/demo" 
                className="bg-white text-blue-600 border border-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50"
              >
                Book a Call
              </a>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error rendering media pack:', error);
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Error Rendering Media Pack</h1>
          <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
          <pre style={{ textAlign: 'left', fontSize: '12px' }}>
            {JSON.stringify({ packId, variant, dark, error: error instanceof Error ? error.stack : error }, null, 2)}
          </pre>
        </div>
      );
    }
  };

  // Note: No client interactivity, no redirects, no auth here.
  // Puppeteer will navigate to this URL and print.
  headers(); // keep headers() so Next.js knows this is server-only and dynamic

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <PrintCSS />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="/globals.css" />
      </head>
      <body>
        <div className="print-only">
          <Render />
        </div>
      </body>
    </html>
  );
}
