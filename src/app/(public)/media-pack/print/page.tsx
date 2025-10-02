import { headers } from "next/headers";
import MPClassic from "@/components/media-pack/templates/MPClassic";
import MPBold from "@/components/media-pack/templates/MPBold";
import MPEditorial from "@/components/media-pack/templates/MPEditorial";
import { createDemoMediaPackData } from "@/lib/mediaPack/demoData";

// Helpers
function toBool(v?: string) { return v === "1" || v === "true"; }
function normalizeVariant(v?: string) {
  const s = (v || "classic").toLowerCase();
  return s === "bold" ? "bold" : s === "editorial" ? "editorial" : "classic";
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  searchParams?: {
    mp?: string;
    variant?: string;
    dark?: string;
    onePager?: string;
    brandColor?: string;
  };
};

export default async function Page({ searchParams }: Props) {
  // keeps it as a server-render only page
  headers();

  const packId = searchParams?.mp || "demo-pack-123";
  const variant = normalizeVariant(searchParams?.variant);
  const dark = toBool(searchParams?.dark);
  const onePager = toBool(searchParams?.onePager);
  const brandColor = searchParams?.brandColor || "#3b82f6";

  // TODO: replace with real fetch by packId; demo fallback is fine for now
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

  const Render = () => {
    switch (variant) {
      case "bold": return <MPBold data={data} isPublic />;
      case "editorial": return <MPEditorial data={data} isPublic />;
      default: return <MPClassic data={data} isPublic />;
    }
  };

  return (
    <main id="mp-print-root" data-print-ready="1">
      <Render />
      {/* sentinel for Puppeteer */}
      <div id="mp-print-ready" />
    </main>
  );
}
