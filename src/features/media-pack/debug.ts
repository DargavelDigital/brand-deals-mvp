export function debugSnapshot(label: string, obj: unknown) {
  try {
    console.log(`[MediaPack][${label}]`, JSON.stringify(obj, null, 2))
  } catch {
    console.log(`[MediaPack][${label}] (non-serializable)`)
  }
}
