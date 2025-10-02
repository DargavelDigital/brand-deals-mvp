export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
          html, body { margin: 0; padding: 0; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          /* match renderer margins (16/12/16/12mm); A4 */
          @page { size: A4; margin: 16mm 12mm; }
          /* hide any inherited app shell just in case */
          [data-app-shell], nav, header, aside, footer { display: none !important; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
