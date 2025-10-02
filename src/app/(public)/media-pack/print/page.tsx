// src/app/(public)/media-pack/print/page.tsx
// This is in the (public) route group to bypass app shell and layouts
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import React from "react";

// IMPORTANT: reuse the same renderer the preview/build page uses
import MPClassic from "@/components/media-pack/templates/MPClassic";
import { createDemoMediaPackData } from "@/lib/mediaPack/demoData";

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

  // Allow simple variant switch (extend if you add more templates)
  const Render = () => {
    // Merge theme into pack data
    const packWithTheme = {
      ...pack,
      theme: {
        ...pack.theme,
        variant,
        dark
      }
    };
    
    switch (variant) {
      case "classic":
      default:
        return <MPClassic data={packWithTheme} isPublic={true} />;
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
      </head>
      <body>
        <div className="print-only">
          <Render />
        </div>
      </body>
    </html>
  );
}
