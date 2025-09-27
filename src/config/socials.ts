export type SocialKey = "instagram" | "tiktok" | "youtube" | "x" | "facebook" | "linkedin";

// If env is unset, default to "instagram"
const raw = (process.env.NEXT_PUBLIC_LAUNCH_SOCIALS || "instagram")
  .split(",")
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

const enabledSet = new Set<SocialKey>(raw as SocialKey[]);

export const socials = {
  enabled: (k: SocialKey) => enabledSet.has(k),
  listEnabled: () => Array.from(enabledSet) as SocialKey[],
  isInstagramOnly: () =>
    enabledSet.size === 1 && enabledSet.has("instagram"),
};

export const COMING_SOON_MSG =
  "This network is coming soon. For launch, we support Instagram first.";
