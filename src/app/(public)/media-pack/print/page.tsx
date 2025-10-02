import { headers } from "next/headers";
import MPClassic from "@/components/media-pack/templates/MPClassic";
import MPBold from "@/components/media-pack/templates/MPBold";
import MPEditorial from "@/components/media-pack/templates/MPEditorial";
import { createDemoMediaPackData } from "@/lib/mediaPack/demoData";

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

export default async function Page({ searchParams }: { searchParams?: Search }) {
  headers(); // keep this so Next treats it server-only

  const packId     = searchParams?.mp || "demo-pack-123";
  const variant    = normVariant(searchParams?.variant);
  const dark       = toBool(searchParams?.dark);
  const onePager   = toBool(searchParams?.onePager);
  const brandColor = searchParams?.brandColor || "#3b82f6";

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

  let content: React.ReactNode = null;
  try {
    switch (variant) {
      case "bold":      content = <MPBold data={data} isPublic={true} />; break;
      case "editorial": content = <MPEditorial data={data} isPublic={true} />; break;
      default:          content = <MPClassic data={data} isPublic={true} />; break;
    }
  } catch (err) {
    // Render a lightweight error box but DO NOT block readiness
    content = (
      <div style={{
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
        padding: 24, border: "1px solid #eee", borderRadius: 8, color: "#b91c1c"
      }}>
        <strong>Template Error</strong>
        <div style={{ marginTop: 8, color: "#111" }}>
          There was a problem rendering the print template.
        </div>
      </div>
    );
  }

  return (
    <main id="mp-print-root" style={{ padding: 0, margin: 0 }}>
      {content}

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
