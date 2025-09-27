export const socialsLaunch = (process.env.NEXT_PUBLIC_LAUNCH_SOCIALS || "instagram")
  .split(",")
  .map((s) => s.trim().toLowerCase());
export const isSocialEnabled = (p: string) => socialsLaunch.includes(p);