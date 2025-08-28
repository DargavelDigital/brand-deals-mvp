import React from 'react'
import { ThemeTokens } from '@/src/services/mediaPack/types'

export function MPBase({
  theme, children, title,
}: { theme: ThemeTokens; title: string; children: React.ReactNode }) {
  const { brandColor, accent, surface, text } = theme
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>{title}</title>
        <style>{`
          :root{
            --brand:${brandColor};
            --accent:${accent};
            --surface:${surface};
            --text:${text};
          }
          body{margin:0;background:var(--surface);color:var(--text);font-family:ui-sans-serif, system-ui;}
          .pill{display:inline-block;padding:4px 10px;border-radius:999px;border:1px solid #e5e7eb}
          .h1{font-size:32px;font-weight:700;margin:0}
          .h2{font-size:18px;font-weight:600;margin:0 0 8px}
          .card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:16px}
          .grid{display:grid;gap:12px}
          @page { size: A4; margin: 10mm }
          @media print {
            .card { box-shadow: none }
          }
        `}</style>
      </head>
      <body>
        <div style={{padding:'28px'}}>
          {children}
        </div>
      </body>
    </html>
  )
}
