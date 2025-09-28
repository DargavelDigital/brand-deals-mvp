export function launchSocials() {
  return (process.env.NEXT_PUBLIC_LAUNCH_SOCIALS ?? "instagram")
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isEnabledSocial(s: string) {
  return launchSocials().includes(s.toLowerCase());
}

// A) Keep the old helper but make it a thin reader of an env var so we can override safely
export function isInstagramOnlyLaunch() {
  return process.env.NEXT_PUBLIC_LAUNCH_INSTAGRAM_ONLY === "true";
}

// B) Add a new, granular feature switch helper
export function isToolEnabled(tool: "connect"|"audit"|"matches"|"approve"|"contacts"|"pack"|"outreach"|"inbox"|"import"|"dealdesk"|"crm") {
  // default ON for all pages; flip off only if env explicitly disables
  const key = `NEXT_PUBLIC_TOOL_${tool.toUpperCase()}_ENABLED`;
  const val = process.env[key] ?? "true";
  return val === "true";
}

// C) Add a convenience that returns true for dev/test to guarantee all pages render
export function showAllTools() {
  return process.env.NEXT_PUBLIC_SHOW_ALL_TOOLS === "true";
}
