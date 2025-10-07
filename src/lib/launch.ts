export function launchSocials() {
  return (process.env.NEXT_PUBLIC_LAUNCH_SOCIALS ?? "instagram")
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isEnabledSocial(s: string) {
  return launchSocials().includes(s.toLowerCase());
}

export function isInstagramOnlyLaunch() {
  // Keep this for compatibility but don't use it to hide pages.
  return process.env.NEXT_PUBLIC_LAUNCH_INSTAGRAM_ONLY === "true";
}

// Providers (connection tiles)
type Provider = "instagram" | "tiktok" | "youtube" | "x" | "facebook" | "linkedin";
export function isProviderEnabled(p: Provider) {
  if (p === "instagram") {
    console.log('Instagram provider enabled check: true (default)'); // Debug log
    return true; // Instagram live by default
  }
  const key = `NEXT_PUBLIC_PROVIDER_${p.toUpperCase()}_ENABLED`;
  const val = process.env[key];
  const result = val === "true";
  console.log(`Provider ${p} enabled check:`, { key, val, result }); // Debug log
  // default false for non-IG providers to show "Coming soon"
  return result;
}

// Tools (pages in Tools section). We default to true (visible)
// Even if a tool is "disabled" we still render the page, just show a Coming Soon card.
type Tool =
  | "connect" | "audit" | "matches" | "approve" | "contacts"
  | "pack" | "outreach" | "inbox" | "import" | "dealdesk" | "crm";

export function isToolEnabled(t: Tool) {
  const key = `NEXT_PUBLIC_TOOL_${t.toUpperCase()}_ENABLED`;
  const val = process.env[key];
  return val === undefined ? true : val === "true";
}
