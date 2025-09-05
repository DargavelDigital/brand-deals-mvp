import type { Metadata } from 'next'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: `Privacy Policy — ${SITE.NAME}`,
  description: `Privacy Policy for ${SITE.NAME}.`,
  alternates: { canonical: `${SITE.BASE_URL}/privacy` },
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 prose dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p><strong>Effective date:</strong> {SITE.EFFECTIVE_DATE}</p>

      <p>This Privacy Policy explains how {SITE.COMPANY_LEGAL_NAME} ("we", "us") collects, uses, and shares information about you when you use {SITE.NAME} (the "Services").</p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li><strong>Account & Contact Data:</strong> name, email, password hashes, workspace association.</li>
        <li><strong>Usage Data:</strong> device/browser info, pages viewed, clicks, IP address (where permitted), timestamps.</li>
        <li><strong>Content & Integrations:</strong> data you import or connect from third parties (e.g., TikTok, Google, Meta), subject to their permissions and policies.</li>
        <li><strong>Billing Data:</strong> if applicable, payment method and transaction details processed by our payments provider.</li>
      </ul>

      <h2>2. How We Use Information</h2>
      <ul>
        <li>Provide, maintain, and improve the Services.</li>
        <li>Operate integrations you authorize and honor platform permissions.</li>
        <li>Communicate with you about updates, security, and support.</li>
        <li>Analyze Service performance and prevent fraud, abuse, and security incidents.</li>
        <li>Comply with legal obligations.</li>
      </ul>

      <h2>3. AI Features</h2>
      <p>Some features use AI/ML models. Inputs and outputs may be processed to provide results, quality assurance, and safety checks. Review AI outputs carefully before use.</p>

      <h2>4. Cookies & Similar Technologies</h2>
      <p>We use cookies and local storage to keep you signed in, remember preferences, and analyze usage. You can control cookies via your browser settings. Disabling some cookies may limit functionality.</p>

      <h2>5. Sharing of Information</h2>
      <ul>
        <li><strong>Service Providers:</strong> hosting, analytics, email, customer support, payments—bound by confidentiality and data protection obligations.</li>
        <li><strong>Third-Party Integrations:</strong> with your authorization, we pass or retrieve data as necessary to deliver features.</li>
        <li><strong>Legal:</strong> to comply with law, enforce terms, or protect rights, safety, and property.</li>
        <li><strong>Business Transfers:</strong> in the event of a merger, acquisition, or asset sale with appropriate protections.</li>
      </ul>

      <h2>6. International Transfers</h2>
      <p>Your information may be transferred, stored, and processed in countries other than where you live. We take steps to ensure appropriate safeguards as required by law.</p>

      <h2>7. Data Retention</h2>
      <p>We retain data as long as necessary for the purposes described, unless a longer period is required or permitted by law. You may request deletion as described below.</p>

      <h2>8. Your Rights</h2>
      <ul>
        <li>Access, correct, update, or delete your personal information.</li>
        <li>Object to or restrict certain processing.</li>
        <li>Port your data where applicable.</li>
        <li>Withdraw consent where processing is based on consent.</li>
      </ul>
      <p>To exercise rights, contact <a href={`mailto:${SITE.CONTACT_EMAIL}`}>{SITE.CONTACT_EMAIL}</a>. We may verify your identity before responding.</p>

      <h2>9. CCPA/CPRA Disclosures (California)</h2>
      <p>We disclose the categories of data collected, purposes, and sharing as described in this Policy. We do not "sell" personal information in the traditional sense. Where applicable, we honor "Do Not Sell or Share" preferences.</p>

      <h2>10. Security</h2>
      <p>We implement reasonable technical and organizational measures to protect information. No system is completely secure; please use strong passwords and secure your devices.</p>

      <h2>11. Children's Privacy</h2>
      <p>The Services are not directed to children under 13 (or as defined by local law). If you believe a child has provided us information, contact us to request deletion.</p>

      <h2>12. Changes to This Policy</h2>
      <p>We may update this Policy. We will post changes with a new effective date. Your continued use of the Services constitutes acceptance.</p>

      <h2>13. Contact</h2>
      <p>For questions or privacy requests, contact <a href={`mailto:${SITE.CONTACT_EMAIL}`}>{SITE.CONTACT_EMAIL}</a> or write to {SITE.CONTACT_ADDRESS}.</p>
    </div>
  )
}
