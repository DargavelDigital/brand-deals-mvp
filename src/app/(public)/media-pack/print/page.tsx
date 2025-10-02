import { headers } from "next/headers";
import MPClassic from "@/components/media-pack/templates/MPClassic";
import MPBold from "@/components/media-pack/templates/MPBold";
import MPEditorial from "@/components/media-pack/templates/MPEditorial";
// Replace with your real data loader later:
import { createDemoMediaPackData } from "@/lib/mediaPack/demoData";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Search = {
  mp?: string;
  variant?: "classic" | "bold" | "editorial" | string;
  dark?: string;        // "1" | "0" | "true" | "false"
  onePager?: string;    // same
  brandColor?: string;  // "#rrggbb"
};

function toBool(v?: string) {
  return v === "1" || v === "true";
}
function normVariant(v?: string) {
  const s = (v || "classic").toLowerCase();
  return s === "bold" ? "bold" : s === "editorial" ? "editorial" : "classic";
}

export default async function Page({ searchParams }: { searchParams?: Search }) {
  // keep as server component (prevents client hydration)
  headers();

  const packId    = searchParams?.mp || "demo-pack-123";
  const variant   = normVariant(searchParams?.variant);
  const dark      = toBool(searchParams?.dark);
  const onePager  = toBool(searchParams?.onePager);
  const brandColor= searchParams?.brandColor || "#3b82f6";

  // TODO: load actual media-pack data by id; demo fallback ok
  const base = createDemoMediaPackData();

  // Build the props EXACTLY like the preview uses
  const data = {
    ...base,
    packId,
    theme: {
      ...base.theme,      // base defaults first
      variant,            // then URL overrides
      dark,
      onePager,
      brandColor,
    },
  };

  const Render = () => {
    switch (variant) {
      case "bold":       return <MPBold data={data} isPublic={true} />;
      case "editorial":  return <MPEditorial data={data} isPublic={true} />;
      default:           return <MPClassic data={data} isPublic={true} />;
    }
  };

  return (
    <main id="mp-print-root" data-print-ready="1">
      {/* IMPORTANT: do not render dashboard shell here */}
      <Render />
      {/* Sentinel for Puppeteer */}
      <div id="mp-print-ready" />
    </main>
  );
}
