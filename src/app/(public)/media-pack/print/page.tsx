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
  headers();

  const packId     = searchParams?.mp;
  const qVariant   = normVariant(searchParams?.variant);
  const qDark      = toBool(searchParams?.dark);
  const qOnePager  = toBool(searchParams?.onePager);
  const qBrand     = searchParams?.brandColor;

  // load from DB if provided, else demo
  let pack: any;
  let theme: any;

  if (packId) {
    pack = await loadMediaPackById(packId);
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
    pack = await loadMediaPackById("demo");
    theme = { ...pack.theme, variant: qVariant, dark: qDark, onePager: qOnePager, brandColor: qBrand || pack.theme.brandColor };
  }

  const data = { ...pack, theme };

  let Render: React.ReactNode;
  switch (theme.variant) {
    case "bold": Render = <MPBold data={data} isPublic={true} />; break;
    case "editorial": Render = <MPEditorial data={data} isPublic={true} />; break;
    default: Render = <MPClassic data={data} isPublic={true} />; break;
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
}