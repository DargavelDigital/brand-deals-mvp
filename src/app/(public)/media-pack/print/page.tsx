import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import MPClassic from "@/components/media-pack/templates/MPClassic";
import MPBold from "@/components/media-pack/templates/MPBold";
import MPEditorial from "@/components/media-pack/templates/MPEditorial";
import { loadMediaPackById } from "@/lib/mediaPack/loader";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function toBool(v?: string) { return v === "1" || v === "true"; }
function normVariant(v?: string) {
  const s = (v||"classic").toLowerCase();
  return s === "bold" ? "bold" : s === "editorial" ? "editorial" : "classic";
}

export default async function Page({ searchParams }: { searchParams?: Record<string, string> }) {
  try {
    headers();

    const packId     = searchParams?.mp;
    const qVariant   = normVariant(searchParams?.variant);
    const qDark      = toBool(searchParams?.dark);
    const qOnePager  = toBool(searchParams?.onePager);
    const qBrand     = searchParams?.brandColor;

    console.log("Print page params:", { packId, qVariant, qDark, qOnePager, qBrand });

    // load from DB if provided, else demo
    let pack: any;
    let theme: any;

    if (packId) {
      console.log("Loading pack by ID:", packId);
      pack = await loadMediaPackById(packId);
      console.log("Loaded pack:", { hasPayload: !!pack?.payload, hasTheme: !!pack?.theme, packId: pack?.packId });
      const baseTheme = pack.theme || {};
      theme = {
        ...baseTheme,
        // URL overrides last
        variant: qVariant ?? baseTheme.variant ?? "classic",
        dark: (searchParams?.dark ? qDark : baseTheme.dark) ?? false,
        onePager: (searchParams?.onePager ? qOnePager : baseTheme.onePager) ?? false,
        brandColor: qBrand || baseTheme.brandColor || "#3b82f6",
      };
    } else {
      console.log("Loading demo pack");
      pack = await loadMediaPackById("demo");
      console.log("Loaded demo pack:", { hasPayload: !!pack?.payload, hasTheme: !!pack?.theme, packId: pack?.packId });
      theme = { ...pack.theme, variant: qVariant, dark: qDark, onePager: qOnePager, brandColor: qBrand || pack.theme.brandColor };
    }

    const data = { ...pack, theme };
    console.log("Final data for rendering:", { 
      hasCreator: !!data?.creator, 
      hasMetrics: !!data?.metrics, 
      theme: data?.theme,
      variant: theme.variant 
    });

    let Render: React.ReactNode;
    switch (theme.variant) {
      case "bold": 
        console.log("Rendering MPBold");
        Render = <MPBold data={data} isPublic={true} />; 
        break;
      case "editorial": 
        console.log("Rendering MPEditorial");
        Render = <MPEditorial data={data} isPublic={true} />; 
        break;
      default: 
        console.log("Rendering MPClassic");
        Render = <MPClassic data={data} isPublic={true} />; 
        break;
    }

    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <style>{`
            html, body { margin: 0; padding: 0; }
            @page { size: A4; margin: 16mm 12mm; }
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          `}</style>
        </head>
        <body>
          <main id="mp-print-root">{Render}</main>
          <div id="mp-print-ready"></div>
          <script dangerouslySetInnerHTML={{ __html: `
            (function(){
              function done(){ window.__MP_READY__ = true; document.documentElement.setAttribute('data-mp-ready','1'); }
              var p=[]; if (document.fonts && document.fonts.ready) p.push(document.fonts.ready.catch(function(){}));
              if (document.readyState==='complete'){ Promise.all(p).then(done); } else {
                  window.addEventListener('load', function(){ Promise.all(p).then(done); });
                }
                setTimeout(done, 4000);
              })();
          `}} />
        </body>
      </html>
    );
  } catch (e) {
    console.error("Print page error:", e);
    return (
      <html>
        <body>
          <h1>Print render error</h1>
          <pre>{String(e)}</pre>
          <div id="mp-print-ready"></div>
        </body>
      </html>
    );
  }
}