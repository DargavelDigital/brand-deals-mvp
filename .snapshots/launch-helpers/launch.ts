export function launchSocials() {
  return (process.env.NEXT_PUBLIC_LAUNCH_SOCIALS ?? "instagram")
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isEnabledSocial(s: string) {
  return launchSocials().includes(s.toLowerCase());
}
