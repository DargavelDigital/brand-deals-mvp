import type { Metadata } from 'next'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: `Privacy Policy — ${SITE.NAME}`,
  description: `Privacy Policy for ${SITE.NAME}. Learn how we collect, use, and protect your information across all social media platforms.`,
  alternates: { canonical: `${SITE.BASE_URL}/privacy` },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <p className="text-sm text-gray-600 mb-8">
          Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <div className="prose prose-sm max-w-none space-y-8">
          
          {/* 1. Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p>
              {SITE.COMPANY_LEGAL_NAME} ("we," "our," or "us") operates {SITE.NAME}, a platform that helps content creators connect with brands for partnership opportunities. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service, including data from social media platforms you choose to connect.
            </p>
            <p className="mt-4">
              By using our service, you agree to the collection and use of information in accordance with this Privacy Policy. 
              If you do not agree with our policies and practices, do not use our service.
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.1 Social Media Account Information</h3>
            <p>When you connect your social media accounts (including but not limited to Instagram, TikTok, YouTube, Facebook, Twitter/X, LinkedIn, and any future platforms we may support), we collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Profile Information:</strong> Username, display name, profile picture, bio/description, account type (business/creator/personal), verification status</li>
              <li><strong>Content Data:</strong> Posts, videos, images, captions, hashtags, publication dates, content performance metrics</li>
              <li><strong>Engagement Metrics:</strong> Follower count, following count, likes, comments, shares, views, engagement rates, reach, impressions</li>
              <li><strong>Audience Data:</strong> Demographics, interests, geographic locations (aggregated and anonymized), audience insights</li>
              <li><strong>Account Insights:</strong> Performance analytics, best posting times, content recommendations, growth trends</li>
              <li><strong>Business Account Data:</strong> Business contact information, business category, location data (for business accounts)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.2 Account and Profile Data</h3>
            <p>Information you provide directly:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email address, name, and contact information</li>
              <li>Workspace and team information</li>
              <li>Profile preferences and settings</li>
              <li>Payment and billing information (processed securely through Stripe)</li>
              <li>Communication preferences and marketing consent</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.3 Usage Data</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>How you interact with our service and features</li>
              <li>Pages visited, features used, and actions taken</li>
              <li>Device information (browser type, operating system, IP address)</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Session data and user preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.4 Third-Party Data</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Brand contact information obtained through our partners (Apollo, Hunter.io, Exa)</li>
              <li>AI-generated insights and recommendations</li>
              <li>Email communication data and outreach tracking</li>
              <li>Media pack generation and download analytics</li>
            </ul>
          </section>

          {/* 3. How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>AI-Powered Brand Matching:</strong> Analyze your content, audience, and engagement across all connected platforms to recommend relevant brand partnerships using OpenAI and proprietary algorithms</li>
              <li><strong>Media Pack Generation:</strong> Create professional media kits showcasing your social media performance, audience demographics, and content examples using PDFShift and our proprietary templates</li>
              <li><strong>Brand Contact Discovery:</strong> Find and verify contact information for brand partnership managers using third-party services (Apollo, Hunter.io, Exa) to facilitate outreach</li>
              <li><strong>Outreach Automation:</strong> Generate personalized outreach emails and track communication with potential brand partners</li>
              <li><strong>Performance Analytics:</strong> Provide comprehensive insights into your social media performance across all connected platforms</li>
              <li><strong>Service Improvement:</strong> Enhance our features, user experience, and recommendation algorithms based on usage patterns</li>
              <li><strong>Customer Support:</strong> Respond to your questions, provide technical assistance, and resolve issues</li>
              <li><strong>Security and Fraud Prevention:</strong> Protect against unauthorized access, fraud, and other security threats</li>
              <li><strong>Legal Compliance:</strong> Comply with applicable laws, regulations, and platform terms of service</li>
              <li><strong>Communication:</strong> Send you service updates, marketing communications (with consent), and important notices</li>
            </ul>
          </section>

          {/* 4. Social Media Platform Data Usage */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Social Media Platform Data Usage</h2>
            <p>
              We comply with the terms of service and data usage policies of all social media platforms we integrate with. 
              Your social media data is used solely to provide our service and is never sold to third parties.
            </p>
            
            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.1 Platform-Specific Data Handling</h3>
            
            <h4 className="text-base font-semibold text-gray-700 mt-4 mb-2">Instagram</h4>
            <p>We access your Instagram Business or Creator account data through Meta's official Instagram API with Instagram Login. We collect:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Profile information (username, bio, follower count, profile picture)</li>
              <li>Media content (posts, stories, reels) and performance metrics</li>
              <li>Business insights and audience demographics</li>
              <li>We do not access personal Instagram accounts that are not Business or Creator accounts</li>
            </ul>

            <h4 className="text-base font-semibold text-gray-700 mt-4 mb-2">TikTok</h4>
            <p>We use TikTok's official API to access business account data:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Creator profile and statistics</li>
              <li>Video performance metrics and engagement data</li>
              <li>Audience insights and demographics</li>
            </ul>

            <h4 className="text-base font-semibold text-gray-700 mt-4 mb-2">YouTube</h4>
            <p>We access YouTube channel data through Google's official YouTube Data API:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Channel information and subscriber count</li>
              <li>Video metadata and performance analytics</li>
              <li>Audience demographics and engagement metrics</li>
            </ul>

            <h4 className="text-base font-semibold text-gray-700 mt-4 mb-2">Other Platforms</h4>
            <p>For Twitter/X, LinkedIn, Facebook, and any future platforms:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>We use official APIs provided by each platform</li>
              <li>We comply with their respective data policies and terms of service</li>
              <li>We collect only the data necessary for our service functionality</li>
              <li>We respect platform-specific data usage limitations</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.2 Data Disconnection and Deletion</h3>
            <p>
              You can disconnect any social media account at any time through your account settings. 
              When you disconnect an account, we will delete the associated data within 30 days, except where we are required to retain it for legal or security purposes.
            </p>
          </section>

          {/* 5. Third-Party Services */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Third-Party Services</h2>
            <p>We use the following third-party services to provide our features:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>OpenAI:</strong> For AI-powered content analysis, brand matching, and text generation. Your content may be processed to improve our AI models.</li>
              <li><strong>PDFShift:</strong> For generating professional PDF media packs from your social media data</li>
              <li><strong>Apollo.io:</strong> For discovering brand contact information and company data</li>
              <li><strong>Hunter.io:</strong> For email verification and discovery services</li>
              <li><strong>Exa:</strong> For brand research and contact discovery using AI search</li>
              <li><strong>Stripe:</strong> For secure payment processing and subscription management</li>
              <li><strong>Vercel:</strong> For hosting, infrastructure, and performance monitoring</li>
              <li><strong>Email Service Providers:</strong> For sending outreach emails, notifications, and marketing communications</li>
              <li><strong>Analytics Providers:</strong> For understanding usage patterns and improving our service</li>
            </ul>
            <p className="mt-4">
              These services may process your data according to their own privacy policies. We carefully select service providers that maintain high security and privacy standards and require them to implement appropriate safeguards.
            </p>
          </section>

          {/* 6. Legal Basis for Processing */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Legal Basis for Processing</h2>
            <p>We process your personal data based on the following legal grounds:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Contract Performance:</strong> To provide the services you have requested and to fulfill our contractual obligations</li>
              <li><strong>Legitimate Interests:</strong> To improve our services, prevent fraud, ensure security, and conduct business analytics</li>
              <li><strong>Consent:</strong> For marketing communications, optional features, and processing of sensitive data</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
              <li><strong>Vital Interests:</strong> To protect your safety and the safety of others</li>
            </ul>
          </section>

          {/* 7. Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
            <p>We retain your information for as long as necessary to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide our services to you</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes and enforce our agreements</li>
              <li>Protect against fraud and abuse</li>
              <li>Maintain business records as required by law</li>
            </ul>
            <p className="mt-4">
              <strong>Retention Periods:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Data:</strong> Retained until account deletion plus 30 days</li>
              <li><strong>Social Media Data:</strong> Refreshed periodically; historical data retained for up to 2 years for analytics</li>
              <li><strong>Usage Data:</strong> Retained for up to 3 years for service improvement</li>
              <li><strong>Communication Records:</strong> Retained for up to 7 years for legal compliance</li>
              <li><strong>Payment Data:</strong> Retained as required by payment processors and tax authorities</li>
            </ul>
            <p className="mt-4">
              When you delete your account, we will delete or anonymize your personal information within 30 days, except where retention is required by law or for legitimate business purposes (such as fraud prevention).
            </p>
          </section>

          {/* 8. Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Your Rights</h2>
            <p>Depending on your location, you may have the following rights:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information ("right to be forgotten")</li>
              <li><strong>Data Portability:</strong> Request your data in a structured, machine-readable format</li>
              <li><strong>Objection:</strong> Object to our processing of your personal information</li>
              <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing at any time</li>
              <li><strong>Disconnect Accounts:</strong> Disconnect any social media account from your profile</li>
              <li><strong>Opt-out of Marketing:</strong> Unsubscribe from marketing communications</li>
            </ul>
            
            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">8.1 California Privacy Rights (CCPA/CPRA)</h3>
            <p>If you are a California resident, you have additional rights:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Right to know what personal information is collected and how it's used</li>
              <li>Right to delete personal information</li>
              <li>Right to correct inaccurate personal information</li>
              <li>Right to opt-out of the sale or sharing of personal information</li>
              <li>Right to limit the use of sensitive personal information</li>
              <li>Right to non-discrimination for exercising privacy rights</li>
            </ul>
            <p className="mt-4">
              We do not "sell" personal information in the traditional sense. However, we may share information with service providers as described in this policy.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">8.2 Exercising Your Rights</h3>
            <p>
              To exercise these rights, please contact us at <a href={`mailto:${SITE.CONTACT_EMAIL}`} className="text-blue-600 hover:text-blue-800">{SITE.CONTACT_EMAIL}</a> or through your account settings. 
              We may verify your identity before responding to protect your privacy and security.
            </p>
          </section>

          {/* 9. Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Encryption:</strong> Data encrypted in transit and at rest using industry-standard protocols</li>
              <li><strong>Access Controls:</strong> Role-based access controls and multi-factor authentication</li>
              <li><strong>Regular Security Assessments:</strong> Ongoing security audits and vulnerability assessments</li>
              <li><strong>Secure Infrastructure:</strong> Hosting with reputable cloud providers with SOC 2 compliance</li>
              <li><strong>Employee Training:</strong> Regular training on data protection and security best practices</li>
              <li><strong>Incident Response:</strong> Procedures for detecting, responding to, and recovering from security incidents</li>
            </ul>
            <p className="mt-4">
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security. 
              We encourage you to use strong passwords and keep your devices secure.
            </p>
          </section>

          {/* 10. International Data Transfers */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own, including the United States where our servers are located. 
              We ensure that such transfers comply with applicable data protection laws through:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Standard Contractual Clauses approved by the European Commission</li>
              <li>Adequacy decisions by relevant data protection authorities</li>
              <li>Certification schemes and codes of conduct</li>
              <li>Other appropriate safeguards as required by law</li>
            </ul>
            <p className="mt-4">
              By using our service, you consent to the transfer of your information to countries that may not have the same data protection laws as your country.
            </p>
          </section>

          {/* 11. Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to enhance your experience:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for basic functionality and security</li>
              <li><strong>Performance Cookies:</strong> Help us understand how you use our service</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Marketing Cookies:</strong> Used for targeted advertising (with your consent)</li>
            </ul>
            <p className="mt-4">
              You can control cookies through your browser settings, but disabling certain cookies may limit functionality. 
              We also use local storage and session storage for temporary data and user preferences.
            </p>
          </section>

          {/* 12. Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Children's Privacy</h2>
            <p>
              Our service is not intended for individuals under 18 years of age. 
              We do not knowingly collect personal information from children under 18. 
              If you believe we have collected information from a child under 18, please contact us immediately at <a href={`mailto:${SITE.CONTACT_EMAIL}`} className="text-blue-600 hover:text-blue-800">{SITE.CONTACT_EMAIL}</a> and we will take steps to delete such information.
            </p>
            <p className="mt-4">
              If you are under 18, please do not use our service or provide any personal information to us.
            </p>
          </section>

          {/* 13. Changes to This Privacy Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. 
              When we make material changes, we will:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Post the updated policy on our website with a new "Last Updated" date</li>
              <li>Notify you by email or through a notice on our service</li>
              <li>Obtain your consent where required by law</li>
              <li>Provide a summary of material changes</li>
            </ul>
            <p className="mt-4">
              Your continued use of the service after changes constitutes acceptance of the updated policy. 
              If you do not agree with the changes, you should discontinue use of our service.
            </p>
          </section>

          {/* 14. Contact Us */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, our data practices, or want to exercise your rights, please contact us:</p>
            <div className="mt-4 space-y-2">
              <p><strong>Email:</strong> <a href={`mailto:${SITE.CONTACT_EMAIL}`} className="text-blue-600 hover:text-blue-800">{SITE.CONTACT_EMAIL}</a></p>
              <p><strong>Privacy Officer:</strong> <a href={`mailto:privacy@${SITE.CONTACT_EMAIL.split('@')[1]}`} className="text-blue-600 hover:text-blue-800">privacy@{SITE.CONTACT_EMAIL.split('@')[1]}</a></p>
              <p><strong>Address:</strong> {SITE.CONTACT_ADDRESS}</p>
              <p><strong>Response Time:</strong> We will respond to privacy inquiries within 30 days</p>
            </div>
            <p className="mt-4">
              For users in the European Union, you also have the right to lodge a complaint with your local data protection authority if you believe we have not addressed your concerns adequately.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}