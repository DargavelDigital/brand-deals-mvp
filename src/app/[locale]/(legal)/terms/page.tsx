import type { Metadata } from 'next'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: `Terms of Service — ${SITE.NAME}`,
  description: `Terms of Service for ${SITE.NAME}.`,
  alternates: { canonical: `${SITE.BASE_URL}/terms` },
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 prose dark:prose-invert">
      <h1>Terms of Service</h1>
      <p><strong>Effective date:</strong> {SITE.EFFECTIVE_DATE}</p>

      <p>Welcome to {SITE.NAME}. These Terms of Service ("Terms") govern your access to and use of our website, products, and services (collectively, the "Services"). By accessing or using the Services, you agree to be bound by these Terms.</p>

      <h2>1. Accounts & Eligibility</h2>
      <ul>
        <li>You must be at least 13 years old (or the age of digital consent in your jurisdiction) to use the Services.</li>
        <li>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</li>
        <li>You must provide accurate information and keep it up to date.</li>
      </ul>

      <h2>2. Acceptable Use</h2>
      <ul>
        <li>Do not use the Services for any unlawful, harmful, or abusive activity.</li>
        <li>No reverse engineering, scraping beyond permitted API usage, or interfering with the platform's integrity or security.</li>
        <li>Respect third-party platform terms when connecting external accounts (e.g., TikTok, Google, Meta).</li>
      </ul>

      <h2>3. User Content</h2>
      <p>You retain ownership of content you submit. You grant {SITE.COMPANY_LEGAL_NAME} a worldwide, non-exclusive, royalty-free license to host, process, display, and transmit your content solely to provide and improve the Services. You represent that you have the necessary rights to any content you submit.</p>

      <h2>4. Third-Party Integrations</h2>
      <p>The Services may integrate with third-party platforms and APIs (e.g., TikTok, Google, Meta, email providers). Your use of those integrations is subject to the third-party's terms and privacy policies. We are not responsible for third-party services.</p>

      <h2>5. AI Features</h2>
      <p>Some features may use AI/ML models to generate insights or content. Outputs may be inaccurate or incomplete. You are responsible for reviewing AI outputs and ensuring compliance with applicable laws and platform policies.</p>

      <h2>6. Fees & Billing (if applicable)</h2>
      <p>If you purchase paid features, you agree to the posted pricing, billing cycles, and refund rules. We may change fees on notice, subject to applicable consumer laws. Taxes may apply.</p>

      <h2>7. Confidentiality & Security</h2>
      <p>We implement reasonable administrative, technical, and physical safeguards. However, no method of transmission or storage is 100% secure. You are responsible for securing your devices and credentials.</p>

      <h2>8. Intellectual Property</h2>
      <p>The Services, including all software, designs, trademarks, and content (excluding your content), are owned by {SITE.COMPANY_LEGAL_NAME} or our licensors and are protected by law. Except as expressly permitted, you may not copy, modify, or create derivative works.</p>

      <h2>9. Disclaimers</h2>
      <p>The Services are provided "as is" and "as available" without warranties of any kind. We disclaim all implied warranties to the fullest extent permitted by law.</p>

      <h2>10. Limitation of Liability</h2>
      <p>To the maximum extent permitted by law, {SITE.COMPANY_LEGAL_NAME} will not be liable for indirect, incidental, special, consequential, or punitive damages, or any loss of profits, revenues, or data arising from your use of the Services.</p>

      <h2>11. Indemnification</h2>
      <p>You agree to indemnify and hold {SITE.COMPANY_LEGAL_NAME} harmless from claims, damages, liabilities, and expenses arising from your use of the Services or violation of these Terms.</p>

      <h2>12. Termination</h2>
      <p>We may suspend or terminate your access if you breach these Terms or to comply with law. Upon termination, your right to use the Services ceases immediately.</p>

      <h2>13. Changes to These Terms</h2>
      <p>We may update these Terms from time to time. We will post the updated Terms with a new effective date. Continued use after changes constitutes acceptance.</p>

      <h2>14. Governing Law; Disputes</h2>
      <p>These Terms are governed by the laws of the applicable jurisdiction of {SITE.COMPANY_LEGAL_NAME}. Disputes will be resolved in the courts of that jurisdiction, unless a different forum is required by law.</p>

      <h2>15. Contact</h2>
      <p>Questions about these Terms? Email <a href={`mailto:${SITE.CONTACT_EMAIL}`}>{SITE.CONTACT_EMAIL}</a> or write to {SITE.CONTACT_ADDRESS}.</p>
    </div>
  )
}
