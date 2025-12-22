import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { FileText, Scale, AlertTriangle, Gavel, Ban, Shield, Mail } from 'lucide-react';

export function TermsOfServicePage() {
  const lastUpdated = 'December 22, 2025';
  const effectiveDate = 'December 22, 2025';

  return (
    <MarketingLayout>
      <div className="min-h-screen bg-navy-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-500/20 mb-6">
              <FileText className="w-8 h-8 text-gold-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-slate-400 text-lg">
              Last Updated: {lastUpdated} | Effective Date: {effectiveDate}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            {/* Important Notice */}
            <div className="bg-gold-500/10 border border-gold-500/30 rounded-xl p-6 mb-10">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-gold-400 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-bold text-gold-400 mt-0 mb-2">Important: Please Read Carefully</h2>
                  <p className="text-slate-300 mb-0">
                    These Terms of Service ("Terms") constitute a legally binding agreement between you and Crave Optimal Health LLC. By accessing or using The Metabolic Reset Project, you agree to be bound by these Terms. <strong>These Terms contain a mandatory arbitration provision and class action waiver that affect your legal rights.</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">1</span>
                Acceptance of Terms
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <p className="text-slate-300">
                  By creating an account, making a payment, or otherwise using The Metabolic Reset Project platform ("Platform"), operated by Crave Optimal Health LLC ("Company," "we," "us," or "our"), you ("User," "you," or "your") agree to be bound by these Terms of Service, our Privacy Policy, Medical Disclaimer, and all other policies referenced herein.
                </p>
                <p className="text-slate-300 mb-0">
                  If you do not agree to these Terms, you must not access or use the Platform.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">2</span>
                Eligibility
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <p className="text-slate-300">To use the Platform, you must:</p>
                <ul className="text-slate-300 space-y-2">
                  <li>Be at least <strong className="text-white">18 years of age</strong></li>
                  <li>Have the legal capacity to enter into a binding agreement</li>
                  <li>Not be prohibited from using the Platform under applicable law</li>
                  <li>Provide accurate and complete registration information</li>
                </ul>
                <p className="text-slate-300 mt-4 mb-0">
                  By using the Platform, you represent and warrant that you meet all eligibility requirements.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">3</span>
                Description of Services
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <p className="text-slate-300">
                  The Metabolic Reset Project is a 28-day wellness education and habit-tracking program designed to help users improve their metabolic health. The Platform provides:
                </p>
                <ul className="text-slate-300 space-y-2">
                  <li>Daily habit tracking tools (water, sleep, steps, educational lessons)</li>
                  <li>Weekly biometric data submission and tracking</li>
                  <li>Metabolic age calculations and progress visualization</li>
                  <li>Educational content and wellness resources</li>
                  <li>Access to independent OPTAVIA coaches for guidance and support</li>
                  <li>Team-based accountability features</li>
                </ul>
                <p className="text-slate-300 mt-4 mb-0">
                  <strong className="text-gold-400">The Platform does not provide medical advice, diagnosis, or treatment.</strong> See our Medical Disclaimer for important health-related information.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">4</span>
                Account Registration & Security
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <p className="text-slate-300">When creating an account, you agree to:</p>
                <ul className="text-slate-300 space-y-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Keep your login credentials secure and confidential</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
                <p className="text-slate-300 mt-4 mb-0">
                  We reserve the right to suspend or terminate accounts that contain inaccurate information or violate these Terms.
                </p>
              </div>
            </section>

            {/* Section 5 - Payments */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">5</span>
                Payments & Fees
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <h3 className="text-lg font-bold text-white mt-0 mb-3">Program Fees</h3>
                <ul className="text-slate-300 space-y-2">
                  <li><strong className="text-white">Challenger:</strong> $28.00 USD (one-time payment per Reset Project)</li>
                  <li><strong className="text-white">Coach:</strong> $49.00 USD (one-time payment per Reset Project)</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-6 mb-3">Payment Processing</h3>
                <p className="text-slate-300">
                  All payments are processed securely through Stripe. By providing payment information, you authorize us to charge the applicable fees. All fees are in US dollars and are non-recurring (one-time per project enrollment).
                </p>

                <h3 className="text-lg font-bold text-white mt-6 mb-3">Refund Policy</h3>
                <p className="text-slate-300">
                  <strong>Duplicate Charges:</strong> If you are accidentally charged more than once for the same enrollment, contact us immediately for a full refund of the duplicate charge(s).
                </p>
                <p className="text-slate-300">
                  <strong>General Refunds:</strong> Due to the nature of digital content and immediate access to the Platform upon payment, we generally do not offer refunds for change of mind. However, we may consider refund requests on a case-by-case basis within 7 days of purchase if you have not substantially used the Platform.
                </p>
                <p className="text-slate-300 mb-0">
                  To request a refund, contact us with your purchase details and reason for the request.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">6</span>
                User Conduct
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <div className="flex items-start gap-4 mb-4">
                  <Ban className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <p className="text-slate-300 mb-0">
                    <strong className="text-white">You agree NOT to:</strong>
                  </p>
                </div>
                <ul className="text-slate-300 space-y-2 ml-10">
                  <li>Use the Platform for any unlawful purpose</li>
                  <li>Impersonate any person or entity</li>
                  <li>Share your account credentials with others</li>
                  <li>Upload false, misleading, or fraudulent information</li>
                  <li>Harass, abuse, or harm other users or coaches</li>
                  <li>Attempt to gain unauthorized access to the Platform or its systems</li>
                  <li>Use automated tools to access the Platform (bots, scrapers, etc.)</li>
                  <li>Reproduce, distribute, or create derivative works from Platform content</li>
                  <li>Interfere with or disrupt the Platform's operation</li>
                  <li>Provide medical advice to other users unless appropriately licensed</li>
                </ul>
              </div>
            </section>

            {/* Section 7 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">7</span>
                Intellectual Property
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <p className="text-slate-300">
                  All content on the Platform—including but not limited to text, graphics, logos, images, videos, software, and educational materials—is owned by or licensed to Crave Optimal Health LLC and is protected by copyright, trademark, and other intellectual property laws.
                </p>
                <p className="text-slate-300">
                  You are granted a limited, non-exclusive, non-transferable license to access and use the Platform for personal, non-commercial purposes during your active enrollment.
                </p>
                <p className="text-slate-300 mb-0">
                  <strong className="text-white">You may not:</strong> Copy, modify, distribute, sell, or lease any part of the Platform or its content without our express written permission.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">8</span>
                User Content
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <p className="text-slate-300">
                  You retain ownership of content you submit to the Platform (such as biometric screenshots, profile photos, and progress data). By submitting content, you grant us a non-exclusive, royalty-free, worldwide license to use, store, and process your content to provide our services.
                </p>
                <p className="text-slate-300 mb-0">
                  You represent that you have the right to submit any content you provide and that it does not violate any third party's rights.
                </p>
              </div>
            </section>

            {/* Section 9 - Disclaimer */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">9</span>
                Disclaimers
              </h2>
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                <p className="text-slate-300 uppercase font-semibold">
                  THE PLATFORM AND ALL CONTENT, SERVICES, AND FEATURES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
                </p>
                <p className="text-slate-300">
                  TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:
                </p>
                <ul className="text-slate-300 space-y-2">
                  <li>WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT</li>
                  <li>WARRANTIES REGARDING THE ACCURACY, RELIABILITY, OR COMPLETENESS OF CONTENT</li>
                  <li>WARRANTIES THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE</li>
                  <li>WARRANTIES REGARDING ANY HEALTH OUTCOMES OR RESULTS</li>
                </ul>
                <p className="text-slate-300 mb-0">
                  YOUR USE OF THE PLATFORM IS AT YOUR SOLE RISK.
                </p>
              </div>
            </section>

            {/* Section 10 - Limitation of Liability */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">10</span>
                Limitation of Liability
              </h2>
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                <p className="text-slate-300 uppercase font-semibold">
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL CRAVE OPTIMAL HEALTH LLC, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR COACHES BE LIABLE FOR:
                </p>
                <ul className="text-slate-300 space-y-2">
                  <li>ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
                  <li>ANY LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES</li>
                  <li>ANY DAMAGES RESULTING FROM YOUR USE OF OR INABILITY TO USE THE PLATFORM</li>
                  <li>ANY HEALTH-RELATED INJURIES, CONDITIONS, OR OUTCOMES</li>
                  <li>ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE PLATFORM</li>
                </ul>
                <p className="text-slate-300 mt-4 mb-0">
                  <strong>OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.</strong>
                </p>
              </div>
            </section>

            {/* Section 11 - Indemnification */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">11</span>
                Indemnification
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <p className="text-slate-300 mb-0">
                  You agree to indemnify, defend, and hold harmless Crave Optimal Health LLC, its officers, directors, employees, agents, and coaches from and against any claims, liabilities, damages, losses, costs, or expenses (including reasonable attorneys' fees) arising from or relating to: (a) your use of the Platform; (b) your violation of these Terms; (c) your violation of any rights of another; or (d) any content you submit to the Platform.
                </p>
              </div>
            </section>

            {/* Section 12 - Arbitration */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">12</span>
                Dispute Resolution & Arbitration
              </h2>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Gavel className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                  <p className="text-yellow-300 font-semibold mb-0">
                    PLEASE READ THIS SECTION CAREFULLY – IT AFFECTS YOUR LEGAL RIGHTS
                  </p>
                </div>

                <h3 className="text-lg font-bold text-white mt-4 mb-3">Binding Arbitration</h3>
                <p className="text-slate-300">
                  Any dispute, controversy, or claim arising out of or relating to these Terms or your use of the Platform shall be resolved by <strong className="text-white">binding arbitration</strong> administered by the American Arbitration Association (AAA) in accordance with its Consumer Arbitration Rules.
                </p>

                <h3 className="text-lg font-bold text-white mt-4 mb-3">Class Action Waiver</h3>
                <p className="text-slate-300">
                  <strong className="text-yellow-400">YOU AND WE AGREE THAT ANY DISPUTES WILL BE RESOLVED ON AN INDIVIDUAL BASIS ONLY, AND NOT AS A CLASS ACTION, COLLECTIVE ACTION, OR REPRESENTATIVE ACTION.</strong> You waive any right to participate in a class action lawsuit or class-wide arbitration.
                </p>

                <h3 className="text-lg font-bold text-white mt-4 mb-3">Jury Trial Waiver</h3>
                <p className="text-slate-300">
                  <strong className="text-yellow-400">YOU AND WE WAIVE ANY RIGHT TO A JURY TRIAL.</strong>
                </p>

                <h3 className="text-lg font-bold text-white mt-4 mb-3">Location & Governing Law</h3>
                <p className="text-slate-300 mb-0">
                  Arbitration shall take place in Kootenai County, Idaho, or at another mutually agreed location. These Terms and any disputes shall be governed by and construed in accordance with the laws of the <strong className="text-white">State of Idaho</strong>, without regard to its conflict of law principles.
                </p>
              </div>
            </section>

            {/* Section 13 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">13</span>
                Termination
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <p className="text-slate-300">
                  We reserve the right to suspend or terminate your account and access to the Platform at any time, with or without cause, and with or without notice. Reasons for termination may include:
                </p>
                <ul className="text-slate-300 space-y-2">
                  <li>Violation of these Terms</li>
                  <li>Fraudulent or illegal activity</li>
                  <li>Abusive behavior toward other users or staff</li>
                  <li>Extended period of inactivity</li>
                  <li>Request by law enforcement</li>
                </ul>
                <p className="text-slate-300 mt-4 mb-0">
                  Upon termination, your right to use the Platform ceases immediately. Sections that by their nature should survive termination shall survive (including Disclaimers, Limitation of Liability, Indemnification, and Arbitration).
                </p>
              </div>
            </section>

            {/* Section 14 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">14</span>
                Modifications to Terms
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <p className="text-slate-300 mb-0">
                  We reserve the right to modify these Terms at any time. If we make material changes, we will notify you by posting the updated Terms on the Platform and updating the "Last Updated" date. Your continued use of the Platform after such changes constitutes acceptance of the modified Terms.
                </p>
              </div>
            </section>

            {/* Section 15 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">15</span>
                Miscellaneous
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <ul className="text-slate-300 space-y-3">
                  <li><strong className="text-white">Entire Agreement:</strong> These Terms, together with the Privacy Policy and other referenced policies, constitute the entire agreement between you and us.</li>
                  <li><strong className="text-white">Severability:</strong> If any provision is found unenforceable, the remaining provisions remain in effect.</li>
                  <li><strong className="text-white">Waiver:</strong> Our failure to enforce any right does not waive that right.</li>
                  <li><strong className="text-white">Assignment:</strong> You may not assign your rights under these Terms without our consent. We may assign our rights without restriction.</li>
                  <li><strong className="text-white">Force Majeure:</strong> We are not liable for delays or failures due to circumstances beyond our reasonable control.</li>
                </ul>
              </div>
            </section>

            {/* Contact Section */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">16</span>
                Contact Us
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-gold-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-slate-300">
                      If you have questions about these Terms of Service, please contact us:
                    </p>
                    <div className="text-gold-400 font-semibold mt-4">
                      <p className="mb-1">Crave Optimal Health LLC</p>
                      <p className="mb-1">12648 W Vatland Dr</p>
                      <p className="mb-1">Post Falls, Idaho 83854</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}

export default TermsOfServicePage;
