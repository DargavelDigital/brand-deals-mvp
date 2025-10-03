import React from 'react'
import { renderToString } from 'react-dom/server'
import { MPClassic } from '@/app/(public)/media-pack/_components/MPClassic'
import { defaultTheme } from '@/services/mediaPack/types'

export async function generateMediaPackPDFWithHTML(data: any, theme: any, variant: string = 'classic'): Promise<Buffer> {
  try {
    console.log('Generating PDF with HTML approach...')
    console.log('Data:', data)
    console.log('Theme:', theme)
    
    // Create the exact same props that MPClassic expects
    const props = {
      theme: { ...defaultTheme, ...(theme || {}) },
      summary: data.summary || 'Your audience is primed for partnerships in tech & lifestyle. Strong US/UK base and above-average ER.',
      audience: data.audience || { followers: 156000, engagement: 0.053, topGeo: ['US','UK','CA'] },
      brands: data.brands || [{ name: 'Acme Co', reasons: ['Audience overlap', 'Content affinity'], website: 'https://acme.com' }],
      coverQR: data.coverQR,
      brand: data.brand || { name: 'Example Creator', domain: 'example.com' },
      creator: data.creator || { displayName: 'Creator Name', tagline: 'Creator • Partnerships • Storytelling' },
      metrics: data.metrics || [
        { key: 'followers', label: 'Followers', value: '1.2M' },
        { key: 'engagement', label: 'Engagement', value: '4.8%' },
        { key: 'topGeo', label: 'Top Geo', value: 'US/UK' }
      ],
      cta: data.cta || { bookUrl: '#', proposalUrl: '#' },
      preview: false // This will render the full HTML version
    }
    
    // Render the MPClassic component to HTML string
    const htmlString = renderToString(<MPClassic {...props} />)
    
    // Create a complete HTML document
    const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Media Pack — Classic</title>
  <style>
    :root{
      --brand:${props.theme.brandColor};
      --accent:${props.theme.accent || '#3b82f6'};
      --surface:${props.theme.surface || '#ffffff'};
      --text:${props.theme.text || '#000000'};
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
  </style>
</head>
<body>
  <div style="padding:28px">
    ${htmlString}
  </div>
</body>
</html>`
    
    console.log('HTML generated, length:', fullHTML.length)
    
    // For now, return the HTML as a buffer (we'll convert to PDF later)
    return Buffer.from(fullHTML, 'utf-8')
    
  } catch (error) {
    console.error('HTML generation error:', error)
    throw error
  }
}
