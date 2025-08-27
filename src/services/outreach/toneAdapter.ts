import { OutreachTone } from '@/types/outreach'

export const toneDirectives: Record<OutreachTone, string> = {
  professional: "Concise, respectful, jargon-lite, no emojis. Avoid hype. Clear CTA.",
  relaxed: "Friendly, approachable, conversational. Contractions OK. Polite CTA.",
  fun: "Energetic, playful, 0-1 tasteful emoji per paragraph. Keep it clear."
}

export function toneToOptions(tone: OutreachTone) {
  return { tone: tone }
}
