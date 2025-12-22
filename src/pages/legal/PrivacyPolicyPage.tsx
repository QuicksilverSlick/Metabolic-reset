import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { Lock, Database, Users, Globe, Shield, Mail, Trash2, Eye } from 'lucide-react';

export function PrivacyPolicyPage() {
  const lastUpdated = 'December 22, 2025';
  const effectiveDate = 'December 22, 2025';

  return (
    <MarketingLayout>
      <div className="min-h-screen bg-navy-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-6">
              <Lock className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-slate-400 text-lg">
              Last Updated: {lastUpdated} | Effective Date: {effectiveDate}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            {/* Introduction */}
            <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700 mb-10">
              <p className="text-slate-300 mb-0">
                Crave Optimal Health LLC ("we," "us," or "our") operates The Metabolic Reset Project platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and mobile application (collectively, the "Platform"). Please read this Privacy Policy carefully. By using the Platform, you consent to the practices described herein.
              </p>
            </div>

            {/* Section 1 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">1</span>
                Information We Collect
              </h2>

              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700 mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 mt-0">
                  <Database className="w-5 h-5 text-gold-400" />
                  Personal Information You Provide
                </h3>
                <p className="text-slate-300">When you register for an account or use our services, we collect:</p>
                <ul className="text-slate-300 space-y-2">
                  <li><strong className="text-white">Contact Information:</strong> Full name, phone number, email address</li>
                  <li><strong className="text-white">Account Information:</strong> Username, password (if applicable), timezone preferences</li>
                  <li><strong className="text-white">Demographic Information:</strong> Age, biological sex (for metabolic calculations)</li>
                  <li><strong className="text-white">Profile Information:</strong> Profile photo, role (challenger/coach), referral codes</li>
                  <li><strong className="text-white">Payment Information:</strong> Processed securely by Stripe; we do not store credit card numbers</li>
                </ul>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-4">
                <h3 className="text-xl font-bold text-red-400 flex items-center gap-2 mt-0">
                  <Shield className="w-5 h-5" />
                  Sensitive Health & Biometric Information
                </h3>
                <p className="text-slate-300">
                  <strong>Important:</strong> We collect sensitive health-related information that may be classified as "biometric data" or "health information" under various privacy laws:
                </p>
                <ul className="text-slate-300 space-y-2">
                  <li><strong className="text-white">Body Composition Metrics:</strong> Weight, body fat percentage, visceral fat, lean mass, metabolic age</li>
                  <li><strong className="text-white">Biometric Screenshots:</strong> Images from your smart scale displaying health metrics</li>
                  <li><strong className="text-white">Health Quiz Responses:</strong> Answers to metabolic health assessment questions</li>
                  <li><strong className="text-white">Daily Habit Data:</strong> Water intake, sleep patterns, physical activity, lesson completion</li>
                </ul>
                <p className="text-slate-300 mt-4 mb-0">
                  This information is collected with your explicit consent when you voluntarily submit it through our Platform. You may choose not to submit biometric data while still accessing educational content.
                </p>
              </div>

              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 mt-0">
                  <Eye className="w-5 h-5 text-gold-400" />
                  Automatically Collected Information
                </h3>
                <p className="text-slate-300">When you access the Platform, we automatically collect:</p>
                <ul className="text-slate-300 space-y-2">
                  <li><strong className="text-white">Device Information:</strong> Browser type, operating system, device type</li>
                  <li><strong className="text-white">Usage Data:</strong> Pages visited, features used, time spent on Platform</li>
                  <li><strong className="text-white">Log Data:</strong> IP address, access times, referring URLs</li>
                  <li><strong className="text-white">Cookies & Similar Technologies:</strong> See our Cookie Policy for details</li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">2</span>
                How We Use Your Information
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <p className="text-slate-300">We use the information we collect to:</p>
                <ul className="text-slate-300 space-y-2">
                  <li>Provide, maintain, and improve our Platform and services</li>
                  <li>Create and manage your account</li>
                  <li>Process payments and prevent fraud</li>
                  <li>Track your progress through the 28-day program</li>
                  <li>Calculate and display your metabolic age and health metrics</li>
                  <li>Enable coaches to support their team members</li>
                  <li>Send you program updates, reminders, and educational content</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Analyze usage patterns to improve user experience</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">3</span>
                How We Share Your Information
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <div className="flex items-start gap-4 mb-4">
                  <Users className="w-6 h-6 text-gold-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-white mt-0 mb-2">With Your Coach and Team</h3>
                    <p className="text-slate-300 mb-0">
                      If you are assigned to a coach or team, your coach may view your progress data including daily habits, biometric submissions, and point totals. This sharing is essential to provide you with coaching support and accountability.
                    </p>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mt-6 mb-3">Third-Party Service Providers</h3>
                <p className="text-slate-300">We share information with trusted third parties who assist in operating our Platform:</p>
                <ul className="text-slate-300 space-y-2">
                  <li><strong className="text-white">Cloudflare:</strong> Hosting, content delivery, and data storage (US-based)</li>
                  <li><strong className="text-white">Stripe:</strong> Payment processing (PCI-DSS compliant)</li>
                  <li><strong className="text-white">Google Analytics:</strong> Website analytics and usage tracking</li>
                  <li><strong className="text-white">Meta (Facebook) Pixel:</strong> Advertising measurement and optimization</li>
                  <li><strong className="text-white">Twilio:</strong> SMS verification and notifications</li>
                </ul>

                <h3 className="text-lg font-bold text-white mt-6 mb-3">We Do Not Sell Your Personal Information</h3>
                <p className="text-slate-300">
                  We do not sell, rent, or trade your personal information to third parties for their marketing purposes.
                </p>

                <h3 className="text-lg font-bold text-white mt-6 mb-3">Legal Requirements</h3>
                <p className="text-slate-300 mb-0">
                  We may disclose your information if required by law, subpoena, court order, or government request, or to protect our rights, property, or safety.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">4</span>
                Data Storage & Security
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <div className="flex items-start gap-4 mb-4">
                  <Globe className="w-6 h-6 text-gold-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-white mt-0 mb-2">Where Your Data Is Stored</h3>
                    <p className="text-slate-300 mb-0">
                      Your data is stored on Cloudflare's infrastructure in the United States. By using our Platform, you consent to the transfer and storage of your information in the United States.
                    </p>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mt-6 mb-3">Security Measures</h3>
                <p className="text-slate-300">
                  We implement reasonable administrative, technical, and physical safeguards to protect your information, including:
                </p>
                <ul className="text-slate-300 space-y-2">
                  <li>Encryption of data in transit (HTTPS/TLS)</li>
                  <li>Secure authentication mechanisms</li>
                  <li>Access controls limiting who can view your data</li>
                  <li>Regular security assessments</li>
                </ul>
                <p className="text-slate-300 mt-4 mb-0">
                  However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security of your data.
                </p>
              </div>
            </section>

            {/* Section 5 - CCPA Rights */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">5</span>
                Your Privacy Rights (California Residents - CCPA)
              </h2>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                <p className="text-slate-300">
                  If you are a California resident, the California Consumer Privacy Act (CCPA) provides you with specific rights:
                </p>
                <ul className="text-slate-300 space-y-3 mt-4">
                  <li>
                    <strong className="text-white">Right to Know:</strong> You can request information about the categories and specific pieces of personal information we have collected about you.
                  </li>
                  <li>
                    <strong className="text-white">Right to Delete:</strong> You can request deletion of your personal information, subject to certain exceptions.
                  </li>
                  <li>
                    <strong className="text-white">Right to Opt-Out of Sale:</strong> We do not sell personal information, so this right does not apply.
                  </li>
                  <li>
                    <strong className="text-white">Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your privacy rights.
                  </li>
                  <li>
                    <strong className="text-white">Right to Correct:</strong> You can request correction of inaccurate personal information.
                  </li>
                </ul>
                <p className="text-slate-300 mt-4 mb-0">
                  To exercise these rights, contact us using the information provided below. We will respond within 45 days.
                </p>
              </div>
            </section>

            {/* Section 6 - Data Retention */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">6</span>
                Data Retention
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <p className="text-slate-300">
                  We retain your personal information for as long as your account is active or as needed to provide you services. If you request account deletion:
                </p>
                <ul className="text-slate-300 space-y-2">
                  <li>Your account will be marked for deletion</li>
                  <li>Data will be retained for 30 days to allow for recovery if requested</li>
                  <li>After 30 days, data will be permanently deleted or anonymized</li>
                  <li>Some data may be retained longer if required by law or for legitimate business purposes (e.g., fraud prevention, dispute resolution)</li>
                </ul>
              </div>
            </section>

            {/* Section 7 - Account Deletion */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">7</span>
                Deleting Your Account
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <div className="flex items-start gap-4">
                  <Trash2 className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-slate-300">
                      You may request deletion of your account and associated data by contacting us. Upon deletion:
                    </p>
                    <ul className="text-slate-300 space-y-2 mt-3">
                      <li>Your profile and personal information will be removed</li>
                      <li>Your biometric data and screenshots will be deleted</li>
                      <li>Your progress and habit data will be erased</li>
                      <li>Any referral relationships may be reassigned or removed</li>
                    </ul>
                    <p className="text-slate-300 mt-3 mb-0">
                      Note: We cannot delete data that has already been shared with third parties prior to your deletion request, though we will cease further sharing.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8 - Children */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">8</span>
                Children's Privacy
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <p className="text-slate-300 mb-0">
                  Our Platform is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children under 18. If we discover that we have collected information from a child under 18, we will promptly delete it. If you believe a child has provided us with personal information, please contact us immediately.
                </p>
              </div>
            </section>

            {/* Section 9 - International Users */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">9</span>
                International Users
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <p className="text-slate-300">
                  Our Platform is primarily intended for users in the United States. If you access our Platform from outside the United States, please be aware that your information will be transferred to, stored, and processed in the United States where our servers are located.
                </p>
                <p className="text-slate-300 mb-0">
                  By using our Platform, you consent to this transfer. If you are located in the European Economic Area (EEA) or United Kingdom, we will ensure appropriate safeguards are in place for any data transfers.
                </p>
              </div>
            </section>

            {/* Section 10 - Updates */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">10</span>
                Changes to This Privacy Policy
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <p className="text-slate-300 mb-0">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. For significant changes, we may also send you a notification via email or through the Platform. Your continued use of the Platform after any changes constitutes acceptance of the updated Privacy Policy.
                </p>
              </div>
            </section>

            {/* Contact Section */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">11</span>
                Contact Us
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-gold-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-slate-300">
                      If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:
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

export default PrivacyPolicyPage;
