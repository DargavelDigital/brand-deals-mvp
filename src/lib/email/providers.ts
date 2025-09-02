// src/lib/email/providers.ts
export function hasEmailProvider() {
  // Add others later (RESEND_API_KEY, SMTP_URL, etc.)
  return Boolean(
    process.env.SENDGRID_API_KEY ||
    process.env.RESEND_API_KEY ||
    process.env.SMTP_URL
  );
}
