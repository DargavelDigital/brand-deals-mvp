export const systemBrandRun = `You are an assistant for creators. Be concise, factual, and action-oriented.`

export const promptAudit = (profileSummary: string) => `
Given this creator summary:

${profileSummary}

Return a JSON object with:
- niche (string)
- tone (string)
- audience (array of short tags)
- strengths (array of short bullets)
- risks (array of short bullets)
`

export const promptMatch = (auditJson: string, brandHints?: string) => `
You are matching brands for a creator. Use the AUDIT JSON and optional brand hints.

AUDIT JSON:
${auditJson}

BRAND HINTS (optional):
${brandHints ?? 'none'}

Return a JSON array of 5 matches with objects containing:
- brand (string)
- score (0-100)
- why (<= 220 chars)
`

export const promptEmail = (creator: string, brand: string, angle: string) => `
Write a short cold email to ${brand}.
Creator context: ${creator}
Angle: ${angle}

Return a JSON object with:
- subject
- body (max ~140 words, 2 short paragraphs, include Calendly placeholder)
`
