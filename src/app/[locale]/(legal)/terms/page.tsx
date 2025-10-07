import type { Metadata } from 'next'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: `Terms of Service — ${SITE.NAME}`,
  description: `Terms of Service for ${SITE.NAME}. Comprehensive terms covering social media integrations, payment processing, and user responsibilities.`,
  alternates: { canonical: `${SITE.BASE_URL}/terms` },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <p className="text-sm text-gray-600 mb-8">
          Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <div className="prose prose-sm max-w-none space-y-8">
          
          {/* 1. Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p>
              Welcome to {SITE.NAME} ("Service," "we," "our," or "us"). By accessing or using our Service, 
              you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, 
              do not use our Service.
            </p>
            <p className="mt-4">
              These Terms constitute a legally binding agreement between you and {SITE.COMPANY_LEGAL_NAME}. 
              We reserve the right to update these Terms at any time. Your continued use of the Service 
              after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          {/* 2. Service Description */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
            <p>
              {SITE.NAME} is a platform that connects content creators with brand partnership opportunities. 
              Our Service includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Social Media Integration:</strong> Connect your social media accounts (Instagram, TikTok, YouTube, Facebook, Twitter/X, LinkedIn, and others) to analyze your content and audience</li>
              <li><strong>AI-Powered Brand Matching:</strong> Receive personalized brand partnership recommendations based on your content, audience, and engagement metrics</li>
              <li><strong>Media Pack Generation:</strong> Create professional media kits showcasing your social media performance</li>
              <li><strong>Contact Discovery:</strong> Access contact information for brand partnership managers</li>
              <li><strong>Outreach Automation:</strong> Generate and send partnership outreach communications</li>
              <li><strong>Analytics and Insights:</strong> Track your performance and partnership opportunities</li>
            </ul>
            <p className="mt-4">
              We may modify, suspend, or discontinue any aspect of the Service at any time without notice. 
              We are not liable for any modification, suspension, or discontinuation of the Service.
            </p>
          </section>

          {/* 3. Eligibility and Account Requirements */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Eligibility and Account Requirements</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.1 Age Requirement</h3>
            <p>
              You must be at least 18 years old to use our Service. By using the Service, you represent and 
              warrant that you are 18 years of age or older.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.2 Account Registration</h3>
            <p>
              To use certain features of the Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.3 Social Media Account Requirements</h3>
            <p>
              To use our Service, you must connect legitimate social media accounts that you own or have 
              authorization to access. You represent and warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You own or have permission to connect the social media accounts you link to our Service</li>
              <li>Your social media accounts comply with the terms of service of each respective platform</li>
              <li>You have the necessary permissions to share data from your social media accounts with our Service</li>
              <li>Your social media content does not violate any laws or third-party rights</li>
            </ul>
          </section>

          {/* 4. Social Media Platform Compliance */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Social Media Platform Compliance</h2>
            <p>
              Our Service integrates with various social media platforms through their official APIs. 
              By using our Service, you agree to comply with the terms of service, policies, and guidelines 
              of all connected platforms, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Meta Platforms:</strong> Meta Platform Terms, Instagram Terms of Use, Facebook Terms of Service</li>
              <li><strong>TikTok:</strong> TikTok Terms of Service, TikTok Community Guidelines</li>
              <li><strong>Google/YouTube:</strong> YouTube Terms of Service, YouTube API Services Terms</li>
              <li><strong>Twitter/X:</strong> X Terms of Service, X Developer Agreement</li>
              <li><strong>LinkedIn:</strong> LinkedIn User Agreement, LinkedIn API Terms of Use</li>
              <li><strong>Other Platforms:</strong> Terms and policies of any other social media platform you connect</li>
            </ul>
            <p className="mt-4">
              You acknowledge that our Service's availability and functionality may be affected by changes 
              to social media platform APIs, policies, or terms. We are not responsible for any disruption 
              or limitation of Service caused by third-party platforms.
            </p>
          </section>

          {/* 5. User Responsibilities and Acceptable Use */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Responsibilities and Acceptable Use</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.1 Prohibited Activities</h3>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Violate any laws, regulations, or third-party rights</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Use fake or fraudulent social media accounts</li>
              <li>Engage in spamming, harassment, or abusive behavior</li>
              <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated tools or bots to access the Service (except as explicitly permitted)</li>
              <li>Scrape, data mine, or extract data from the Service without authorization</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
              <li>Remove or modify any copyright, trademark, or proprietary notices</li>
              <li>Use the Service to send unsolicited commercial communications (spam)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.2 Content Standards</h3>
            <p>
              You are responsible for the content of your social media accounts connected to our Service. 
              Your content must not:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violate any intellectual property rights</li>
              <li>Contain hate speech, harassment, or discriminatory content</li>
              <li>Promote violence, illegal activities, or dangerous behavior</li>
              <li>Contain explicit sexual content involving minors</li>
              <li>Violate any person's privacy or publicity rights</li>
              <li>Contain malware, viruses, or malicious code</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.3 Outreach Communications</h3>
            <p>
              When using our outreach features to contact brands, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Send only legitimate partnership inquiries</li>
              <li>Comply with CAN-SPAM Act and other anti-spam laws</li>
              <li>Honor opt-out requests immediately</li>
              <li>Not misrepresent your audience, engagement, or metrics</li>
              <li>Disclose any material connections as required by FTC guidelines</li>
            </ul>
          </section>

          {/* 6. Intellectual Property Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property Rights</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6.1 Our Intellectual Property</h3>
            <p>
              The Service and its content, features, and functionality (including but not limited to software, 
              text, images, logos, and design) are owned by {SITE.COMPANY_LEGAL_NAME} and are protected by copyright, 
              trademark, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6.2 Your Content</h3>
            <p>
              You retain all rights to the content on your connected social media accounts. By using our Service, 
              you grant us a limited, non-exclusive, royalty-free license to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access and analyze your social media content for the purposes of providing the Service</li>
              <li>Display your content in media packs and marketing materials you create through the Service</li>
              <li>Use aggregated, anonymized data for service improvement and analytics</li>
            </ul>
            <p className="mt-4">
              This license terminates when you disconnect your social media accounts or delete your account, 
              except for content that has been shared or distributed through the Service.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6.3 Feedback</h3>
            <p>
              If you provide us with feedback, suggestions, or ideas about the Service, you grant us the right 
              to use that feedback without compensation or attribution.
            </p>
          </section>

          {/* 7. Payment Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Payment Terms</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7.1 Subscription Plans</h3>
            <p>
              We offer various subscription plans with different features and pricing. By subscribing, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pay all fees associated with your chosen plan</li>
              <li>Provide accurate and complete billing information</li>
              <li>Authorize us to charge your payment method for recurring subscription fees</li>
              <li>Update your payment information to avoid service interruption</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7.2 Billing and Renewals</h3>
            <p>
              Subscription fees are billed in advance on a recurring basis (monthly or annually, depending on your plan). 
              Your subscription will automatically renew unless you cancel before the renewal date. 
              You are responsible for all charges incurred through your account.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7.3 Cancellation and Refunds</h3>
            <p>
              You may cancel your subscription at any time through your account settings. Cancellation will be 
              effective at the end of your current billing period. We do not provide refunds for partial 
              subscription periods, except as required by law or at our sole discretion.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7.4 Price Changes</h3>
            <p>
              We reserve the right to change our pricing at any time. We will provide you with at least 30 days' 
              notice of any price changes. Your continued use of the Service after a price change constitutes 
              acceptance of the new price.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7.5 Payment Processing</h3>
            <p>
              Payments are processed securely through Stripe. By providing payment information, you agree to 
              Stripe's Terms of Service. We do not store your full credit card information.
            </p>
          </section>

          {/* 8. Third-Party Services and Links */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Third-Party Services and Links</h2>
            <p>
              Our Service integrates with and may contain links to third-party services, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Social media platforms (Instagram, TikTok, YouTube, Facebook, Twitter/X, LinkedIn)</li>
              <li>Payment processors (Stripe)</li>
              <li>AI services (OpenAI)</li>
              <li>Contact discovery services (Apollo, Hunter, Exa)</li>
              <li>PDF generation services (PDFShift)</li>
              <li>Email service providers</li>
              <li>Cloud hosting providers (Vercel)</li>
            </ul>
            <p className="mt-4">
              We are not responsible for the content, privacy practices, or terms of service of third-party 
              services. Your use of third-party services is at your own risk and subject to their terms.
            </p>
          </section>

          {/* 9. AI Features and Disclaimers */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. AI Features and Disclaimers</h2>
            <p>
              Our Service uses artificial intelligence and machine learning technologies, including OpenAI, to provide:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Brand matching recommendations</li>
              <li>Content analysis and insights</li>
              <li>Outreach message generation</li>
              <li>Media pack content creation</li>
              <li>Domain resolution and contact discovery</li>
            </ul>
            <p className="mt-4">
              <strong>Important Disclaimers:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>AI-generated content may be inaccurate, incomplete, or inappropriate</li>
              <li>You are responsible for reviewing and verifying all AI outputs before use</li>
              <li>AI recommendations do not guarantee successful brand partnerships</li>
              <li>We do not warrant the accuracy or reliability of AI-generated content</li>
              <li>You must ensure AI-generated outreach complies with applicable laws and platform policies</li>
            </ul>
          </section>

          {/* 10. Disclaimers and Limitations of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Disclaimers and Limitations of Liability</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">10.1 Service "As Is"</h3>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER 
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, 
              FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className="mt-4">
              We do not warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The Service will be uninterrupted, secure, or error-free</li>
              <li>The results obtained from using the Service will be accurate or reliable</li>
              <li>Any errors in the Service will be corrected</li>
              <li>Brand matches or recommendations will result in partnership agreements</li>
              <li>Contact information provided will be accurate or current</li>
              <li>Social media platform integrations will remain available or functional</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">10.2 Limitation of Liability</h3>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, {SITE.COMPANY_LEGAL_NAME} SHALL NOT BE LIABLE FOR ANY INDIRECT, 
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, 
              WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER 
              INTANGIBLE LOSSES, RESULTING FROM:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your use or inability to use the Service</li>
              <li>Any unauthorized access to or use of our servers or your personal information</li>
              <li>Any interruption or cessation of transmission to or from the Service</li>
              <li>Any bugs, viruses, or malicious code transmitted through the Service</li>
              <li>Any errors or omissions in any content or for any loss or damage incurred as a result of using any content</li>
              <li>The failure to establish or maintain brand partnerships</li>
              <li>Changes to social media platform APIs or policies</li>
              <li>Third-party service failures or interruptions</li>
            </ul>
            <p className="mt-4">
              OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING FROM OR RELATED TO THESE TERMS OR THE SERVICE 
              SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE 12 MONTHS PRECEDING THE CLAIM.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">10.3 No Guarantee of Results</h3>
            <p>
              We do not guarantee that using our Service will result in brand partnerships, income, or any 
              specific business outcomes. Success depends on many factors beyond our control, including 
              the quality of your content, audience engagement, brand budgets, and market conditions.
            </p>
          </section>

          {/* 11. Indemnification */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless {SITE.COMPANY_LEGAL_NAME}, its affiliates, officers, 
              directors, employees, and agents from and against any claims, liabilities, damages, losses, 
              and expenses (including reasonable attorneys' fees) arising out of or related to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Your content or social media accounts</li>
              <li>Your outreach communications to brands</li>
              <li>Any misrepresentation of your audience, engagement, or metrics</li>
              <li>Your violation of social media platform terms of service</li>
              <li>Your violation of applicable laws or regulations</li>
            </ul>
          </section>

          {/* 12. Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Termination</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">12.1 Termination by You</h3>
            <p>
              You may terminate your account at any time by contacting us or through your account settings. 
              Upon termination, your access to the Service will cease, and we will delete your data in 
              accordance with our Privacy Policy.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">12.2 Termination by Us</h3>
            <p>
              We may suspend or terminate your access to the Service at any time, with or without notice, for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violation of these Terms</li>
              <li>Fraudulent, abusive, or illegal activity</li>
              <li>Non-payment of fees</li>
              <li>Violation of social media platform terms of service</li>
              <li>At our sole discretion if we believe termination is necessary to protect the Service or other users</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">12.3 Effect of Termination</h3>
            <p>
              Upon termination:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your right to use the Service will immediately cease</li>
              <li>We will disconnect your social media accounts</li>
              <li>We will delete your data in accordance with our Privacy Policy</li>
              <li>You remain responsible for all fees incurred prior to termination</li>
              <li>Provisions that by their nature should survive termination will survive (including disclaimers, limitations of liability, and indemnification)</li>
            </ul>
          </section>

          {/* 13. Dispute Resolution */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Dispute Resolution</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">13.1 Informal Resolution</h3>
            <p>
              Before filing a claim, you agree to contact us at <a href={`mailto:${SITE.CONTACT_EMAIL}`} className="text-blue-600 hover:text-blue-800">{SITE.CONTACT_EMAIL}</a> to attempt to resolve 
              the dispute informally. We will attempt to resolve the dispute through good faith negotiations.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">13.2 Arbitration</h3>
            <p>
              If we cannot resolve the dispute informally, any dispute arising from these Terms or the Service 
              will be resolved through binding arbitration, except that you may assert claims in small claims 
              court if your claims qualify. The arbitration will be conducted in accordance with the rules of 
              the American Arbitration Association.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">13.3 Class Action Waiver</h3>
            <p>
              YOU AGREE THAT ANY ARBITRATION OR PROCEEDING SHALL BE LIMITED TO THE DISPUTE BETWEEN US AND YOU 
              INDIVIDUALLY. YOU WAIVE ANY RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">13.4 Governing Law</h3>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction 
              where {SITE.COMPANY_LEGAL_NAME} is incorporated, without regard to its conflict of law provisions.
            </p>
          </section>

          {/* 14. General Provisions */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. General Provisions</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">14.1 Entire Agreement</h3>
            <p>
              These Terms, together with our Privacy Policy and any other legal notices published by us, 
              constitute the entire agreement between you and {SITE.COMPANY_LEGAL_NAME} regarding the Service.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">14.2 Severability</h3>
            <p>
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions 
              will remain in full force and effect.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">14.3 Waiver</h3>
            <p>
              Our failure to enforce any right or provision of these Terms will not be considered a waiver of 
              those rights.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">14.4 Assignment</h3>
            <p>
              You may not assign or transfer these Terms without our prior written consent. We may assign or 
              transfer these Terms without restriction.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">14.5 Force Majeure</h3>
            <p>
              We shall not be liable for any failure or delay in performance due to circumstances beyond our 
              reasonable control, including acts of God, war, terrorism, riots, natural disasters, or failures 
              of third-party services.
            </p>
          </section>

          {/* 15. Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of material changes 
              by email or through a notice on the Service. Your continued use of the Service after such 
              notification constitutes acceptance of the modified Terms.
            </p>
            <p className="mt-4">
              If you do not agree to the modified Terms, you must stop using the Service and may terminate 
              your account.
            </p>
          </section>

          {/* 16. Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="mt-4 space-y-2">
              <p><strong>Email:</strong> <a href={`mailto:${SITE.CONTACT_EMAIL}`} className="text-blue-600 hover:text-blue-800">{SITE.CONTACT_EMAIL}</a></p>
              <p><strong>Legal:</strong> <a href={`mailto:legal@${SITE.CONTACT_EMAIL.split('@')[1]}`} className="text-blue-600 hover:text-blue-800">legal@{SITE.CONTACT_EMAIL.split('@')[1]}</a></p>
              <p><strong>Address:</strong> {SITE.CONTACT_ADDRESS}</p>
            </div>
          </section>

          {/* 17. Acknowledgment */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">17. Acknowledgment</h2>
            <p>
              BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE AND AGREE TO BE 
              BOUND BY THEM.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}