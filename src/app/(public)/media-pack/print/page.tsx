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

export default async function Page({ searchParams }: { searchParams: Record<string,string> }) {
  try {
    // parse params
    const packId = searchParams.mp || "demo-pack-123";
    const variant = (searchParams.variant || "classic").toLowerCase();
    const dark = searchParams.dark === "1" || searchParams.dark === "true";
    const onePager = searchParams.onePager === "1" || searchParams.onePager === "true";
    const brandColor = searchParams.brandColor || "#3b82f6";

    const { ok, data, error } = await loadMediaPackById(packId);
    if (!ok || !data) {
      // render minimal error HTML that *still* sets #mp-print-ready
      return (
        <html>
          <body>
            <div style={{ padding: 24, fontFamily: "system-ui" }}>
              <h1>Media Pack not found</h1>
              <p>{String(error || "No data")}</p>
            </div>
            <div id="mp-print-ready" />
          </body>
        </html>
      );
    }

    // merge theme into data (URL params override)
    const pack = {
      ...data,
      theme: {
        ...(data.theme || {}),
        variant,
        dark,
        onePager,
        brandColor,
      },
    };

    // IMPORTANT: render server-safe template only (no client components)
    // If your MPClassic imports a client piece, guard it with isPublic/flags
    return (
      <html lang="en">
        <head>
          <style>{`
            html, body { margin:0; padding:0; }
            @page { size: A4; margin: 16mm; }
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          `}</style>
        </head>
        <body>
          <main>
            {/* pick your variant */}
            {/* If MPClassic is clean server JSX, render it directly; otherwise create a dedicated server-only PrintClassic */}
            <MPClassic data={pack} isPublic={true} />
          </main>
          <div id="mp-print-ready" />
        </body>
      </html>
    );
  } catch (err: any) {
    const show = searchParams.debug === "1";
    const msg = String(err?.message || err);
    const stack = String(err?.stack || "");
    return (
      <html><body style={{fontFamily:"ui-sans-serif, system-ui", padding:16}}>
        <h1 style={{margin:"0 0 8px"}}>Print route error</h1>
        {show ? (
          <>
            <pre style={{whiteSpace:"pre-wrap"}}>{msg}</pre>
            <pre style={{whiteSpace:"pre-wrap"}}>{stack}</pre>
          </>
        ) : (
          <p>Something went wrong. Append <code>?debug=1</code> to see details.</p>
        )}
        <div id="mp-print-ready" />
      </body></html>
    );
  }
}