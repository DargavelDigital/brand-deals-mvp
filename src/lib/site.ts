// src/lib/site.ts
export const SITE = {
  NAME: process.env.NEXT_PUBLIC_SITE_NAME || 'Hyper',
  COMPANY_LEGAL_NAME:
    process.env.NEXT_PUBLIC_COMPANY_LEGAL_NAME || 'Hype & Swagger.',
  CONTACT_EMAIL:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@hypeandswagger.com',
  CONTACT_ADDRESS:
    process.env.NEXT_PUBLIC_CONTACT_ADDRESS || '123 Example Street, London, UK',
  BASE_URL:
    process.env.NEXT_PUBLIC_SITE_URL || 'https://hyperprod.netlify.app',
  EFFECTIVE_DATE:
    process.env.NEXT_PUBLIC_LEGAL_EFFECTIVE_DATE || '2025-09-05',
};
