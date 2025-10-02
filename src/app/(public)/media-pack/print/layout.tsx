export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
          html, body { margin: 0; padding: 0; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          /* A4 with margins that match your renderer.pdf() */
          @page { size: A4; margin: 16mm 12mm; }
          /* Never show app chrome even if inherited */
          [data-app-shell], nav, header, aside, footer { display: none !important; }
          /* Keep our printable root constrained and centered */
          #mp-print-root { width: 100%; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
