export function packSignature(input: {
  packId: string
  variant?: string
  dark?: boolean
  onePager?: boolean
  brandColor?: string
}) {
  const { packId, variant = "classic", dark = false, onePager = false, brandColor = "" } = input
  return `${packId}::${variant}::${dark ? 1 : 0}::${onePager ? 1 : 0}::${(brandColor || "").toLowerCase()}`
}
