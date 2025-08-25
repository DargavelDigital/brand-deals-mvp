'use client'

import { Section } from "@/components/ui/Section";
import BrandCard, { BrandCard as BrandCardNamed, BrandInfo } from "@/components/swipe/BrandCard";

const BrandCardComponent = BrandCard || BrandCardNamed; // safety alias

function getStubBrands(): BrandInfo[] {
  return [
    { id: 1, name: "Acme Co.", reasons: ["Fits your niche", "Active on TikTok"] },
    { id: 2, name: "Globex", reasons: ["Similar to past collabs", "Strong IG presence"] },
    { id: 3, name: "Initech", reasons: ["Audience overlap", "Product-market fit"] },
  ];
}

export default async function SwipePage() {
  // If you normally fetch brands server-side, keep that here.
  // For static export safety, fall back to stubs when data is empty/unavailable.
  let brands: BrandInfo[] | undefined;

  try {
    // Example: const res = await fetch(...);
    // brands = await res.json();
  } catch {
    // ignore; fall back below
  }

  if (!brands || !Array.isArray(brands) || !brands.length) {
    brands = getStubBrands();
  }

  return (
    <Section title="Discover Brands" description="Swipe or shortlist">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {brands.map((b) => (
          <BrandCardComponent key={b.id} brand={b} />
        ))}
      </div>
    </Section>
  );
}
