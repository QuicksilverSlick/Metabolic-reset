import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { Cookie, Settings, BarChart3, Megaphone, Database, Smartphone, Mail } from 'lucide-react';

export default function CookiePolicyPage() {
  const lastUpdated = 'December 22, 2025';
  const effectiveDate = 'December 22, 2025';

  return (
    <MarketingLayout>
      <div className="min-h-screen bg-navy-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-500/20 mb-6">
              <Cookie className="w-8 h-8 text-gold-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Cookie Policy
            </h1>
            <p className="text-slate-400 text-lg">
              Last Updated: {lastUpdated} | Effective Date: {effectiveDate}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            {/* Introduction */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">About This Policy</h2>
              <p className="text-slate-300">
                This Cookie Policy explains how Crave Optimal Health LLC
                ("Company," "we," "us," or "our") uses cookies and similar tracking
                technologies on the 28 Day Reset platform. This policy should be
                read alongside our{" "}
                <a href="/legal/privacy" className="text-gold-400 hover:text-gold-300 underline">
                  Privacy Policy
                </a>
                .
              </p>
            </section>

            {/* What Are Cookies */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">What Are Cookies?</h2>
              <p className="text-slate-300">
                Cookies are small text files that are stored on your device
                (computer, tablet, or mobile phone) when you visit a website. They
                are widely used to make websites work more efficiently and provide
                information to website owners.
              </p>
              <p className="text-slate-300 mt-4">
                Cookies can be "persistent" (remaining on your device until deleted)
                or "session" cookies (deleted when you close your browser).
              </p>
            </section>

            {/* How We Use Cookies */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">
                How We Use Cookies and Tracking Technologies
              </h2>
              <p className="text-slate-300">
                We use cookies and similar technologies for the following purposes:
              </p>

              {/* Essential Cookies */}
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="w-5 h-5 text-green-400" />
                  <h3 className="text-xl font-bold text-white mb-0">1. Essential Cookies (Strictly Necessary)</h3>
                </div>
                <p className="text-slate-300">
                  These cookies are necessary for the website to function properly.
                  They cannot be disabled.
                </p>
                <div className="bg-navy-800/50 border border-navy-700 rounded-xl p-4 mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-navy-600">
                        <th className="text-left py-2 text-white font-semibold">Cookie/Technology</th>
                        <th className="text-left py-2 text-white font-semibold">Purpose</th>
                        <th className="text-left py-2 text-white font-semibold">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      <tr className="border-b border-navy-700">
                        <td className="py-2">Authentication Token</td>
                        <td className="py-2">Keeps you logged in during your session</td>
                        <td className="py-2">Session / 30 days</td>
                      </tr>
                      <tr className="border-b border-navy-700">
                        <td className="py-2">Session ID</td>
                        <td className="py-2">Maintains your session state</td>
                        <td className="py-2">Session</td>
                      </tr>
                      <tr className="border-b border-navy-700">
                        <td className="py-2">CSRF Token</td>
                        <td className="py-2">Security protection against cross-site request forgery</td>
                        <td className="py-2">Session</td>
                      </tr>
                      <tr>
                        <td className="py-2">Cloudflare (__cf_bm)</td>
                        <td className="py-2">Bot detection and security</td>
                        <td className="py-2">30 minutes</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="w-5 h-5 text-blue-400" />
                  <h3 className="text-xl font-bold text-white mb-0">2. Functional Cookies</h3>
                </div>
                <p className="text-slate-300">
                  These cookies enable enhanced functionality and personalization.
                </p>
                <div className="bg-navy-800/50 border border-navy-700 rounded-xl p-4 mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-navy-600">
                        <th className="text-left py-2 text-white font-semibold">Cookie/Technology</th>
                        <th className="text-left py-2 text-white font-semibold">Purpose</th>
                        <th className="text-left py-2 text-white font-semibold">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      <tr className="border-b border-navy-700">
                        <td className="py-2">Timezone Preference</td>
                        <td className="py-2">Stores your timezone for accurate daily resets</td>
                        <td className="py-2">Persistent</td>
                      </tr>
                      <tr className="border-b border-navy-700">
                        <td className="py-2">PWA Install State</td>
                        <td className="py-2">Tracks if you've installed or dismissed the app prompt</td>
                        <td className="py-2">Persistent</td>
                      </tr>
                      <tr>
                        <td className="py-2">UI Preferences</td>
                        <td className="py-2">Remembers your display preferences</td>
                        <td className="py-2">Persistent</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <h3 className="text-xl font-bold text-white mb-0">3. Analytics Cookies</h3>
                </div>
                <p className="text-slate-300">
                  These cookies help us understand how visitors interact with our
                  website by collecting and reporting information anonymously.
                </p>
                <div className="bg-navy-800/50 border border-navy-700 rounded-xl p-4 mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-navy-600">
                        <th className="text-left py-2 text-white font-semibold">Provider</th>
                        <th className="text-left py-2 text-white font-semibold">Purpose</th>
                        <th className="text-left py-2 text-white font-semibold">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      <tr className="border-b border-navy-700">
                        <td className="py-2">Google Analytics (_ga, _gid)</td>
                        <td className="py-2">
                          Tracks page views, session duration, user flow, and
                          demographics to improve our service
                        </td>
                        <td className="py-2">Up to 2 years</td>
                      </tr>
                      <tr>
                        <td className="py-2">Google Analytics (_gat)</td>
                        <td className="py-2">Rate limiting requests</td>
                        <td className="py-2">1 minute</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-slate-400 mt-4 text-sm">
                  Google Analytics data is anonymized and aggregated. For more
                  information, see{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-400 hover:text-gold-300 underline"
                  >
                    Google's Privacy Policy
                  </a>
                  .
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <Megaphone className="w-5 h-5 text-orange-400" />
                  <h3 className="text-xl font-bold text-white mb-0">4. Marketing and Advertising Cookies</h3>
                </div>
                <p className="text-slate-300">
                  These cookies are used to track visitors across websites and
                  display ads that are relevant to you.
                </p>
                <div className="bg-navy-800/50 border border-navy-700 rounded-xl p-4 mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-navy-600">
                        <th className="text-left py-2 text-white font-semibold">Provider</th>
                        <th className="text-left py-2 text-white font-semibold">Purpose</th>
                        <th className="text-left py-2 text-white font-semibold">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      <tr>
                        <td className="py-2">Facebook Pixel (_fbp, fr)</td>
                        <td className="py-2">
                          Tracks conversions, builds audiences for ads, and
                          measures ad effectiveness
                        </td>
                        <td className="py-2">90 days - 2 years</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-slate-400 mt-4 text-sm">
                  For more information about Facebook's data practices, see{" "}
                  <a
                    href="https://www.facebook.com/privacy/policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-400 hover:text-gold-300 underline"
                  >
                    Facebook's Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </section>

            {/* Local Storage */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white mb-0">Local Storage and Session Storage</h2>
              </div>
              <p className="text-slate-300">
                In addition to cookies, we use browser storage technologies:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-300">
                <li>
                  <strong className="text-white">Local Storage:</strong> Stores persistent data like your
                  authentication state, app preferences, and cached program data
                  to improve performance
                </li>
                <li>
                  <strong className="text-white">Session Storage:</strong> Stores temporary data during
                  your browsing session, such as payment idempotency keys to
                  prevent duplicate charges
                </li>
              </ul>
              <p className="text-slate-300 mt-4">
                These technologies function similarly to cookies but can store
                larger amounts of data and remain on your device until cleared.
              </p>
            </section>

            {/* PWA Tracking */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Smartphone className="w-6 h-6 text-green-400" />
                <h2 className="text-2xl font-bold text-white mb-0">Progressive Web App (PWA) Data</h2>
              </div>
              <p className="text-slate-300">
                If you install our app on your device using the "Add to Home Screen"
                feature, additional data may be stored locally:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-300">
                <li>Service worker cache for offline functionality</li>
                <li>App manifest data for the installed application</li>
                <li>Push notification preferences (if enabled)</li>
              </ul>
              <p className="text-slate-300 mt-4">
                This data is stored entirely on your device and can be removed by
                uninstalling the app.
              </p>
            </section>

            {/* Managing Cookies */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">Managing Your Cookie Preferences</h2>

              <h3 className="text-xl font-bold text-white mt-6 mb-3">Browser Settings</h3>
              <p className="text-slate-300">
                Most web browsers allow you to control cookies through their
                settings. You can typically:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-300">
                <li>View cookies stored on your device</li>
                <li>Delete all or specific cookies</li>
                <li>Block all cookies or only third-party cookies</li>
                <li>Set preferences for specific websites</li>
              </ul>

              <p className="text-slate-300 mt-4">
                Here are links to cookie management instructions for popular browsers:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-300">
                <li>
                  <a
                    href="https://support.google.com/chrome/answer/95647"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-400 hover:text-gold-300 underline"
                  >
                    Google Chrome
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-400 hover:text-gold-300 underline"
                  >
                    Mozilla Firefox
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-400 hover:text-gold-300 underline"
                  >
                    Safari
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-400 hover:text-gold-300 underline"
                  >
                    Microsoft Edge
                  </a>
                </li>
              </ul>

              <h3 className="text-xl font-bold text-white mt-6 mb-3">Opt-Out of Analytics and Advertising</h3>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-300">
                <li>
                  <strong className="text-white">Google Analytics:</strong> Install the{" "}
                  <a
                    href="https://tools.google.com/dlpage/gaoptout"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-400 hover:text-gold-300 underline"
                  >
                    Google Analytics Opt-out Browser Add-on
                  </a>
                </li>
                <li>
                  <strong className="text-white">Facebook:</strong> Adjust your ad preferences in your{" "}
                  <a
                    href="https://www.facebook.com/adpreferences"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-400 hover:text-gold-300 underline"
                  >
                    Facebook Ad Settings
                  </a>
                </li>
                <li>
                  <strong className="text-white">General Opt-out:</strong> Visit the{" "}
                  <a
                    href="https://optout.networkadvertising.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-400 hover:text-gold-300 underline"
                  >
                    Network Advertising Initiative Opt-out Page
                  </a>
                </li>
              </ul>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 my-6">
                <p className="text-amber-200">
                  <strong>Important:</strong> Disabling essential cookies may
                  prevent you from accessing certain features of our platform,
                  including logging in and tracking your daily habits.
                </p>
              </div>
            </section>

            {/* Do Not Track */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">"Do Not Track" Signals</h2>
              <p className="text-slate-300">
                Some browsers offer a "Do Not Track" (DNT) setting. Currently,
                there is no universally accepted standard for how websites should
                respond to DNT signals. Our website does not currently respond
                differently to DNT signals.
              </p>
              <p className="text-slate-300 mt-4">
                If you wish to limit tracking, we recommend using the opt-out
                methods described above or adjusting your browser's cookie
                settings.
              </p>
            </section>

            {/* California Residents */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">California Residents</h2>
              <p className="text-slate-300">
                Under the California Consumer Privacy Act (CCPA), you have the
                right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-300">
                <li>Know what personal information is being collected</li>
                <li>Know if your personal information is being sold or shared</li>
                <li>Opt-out of the sale of your personal information</li>
                <li>Request deletion of your personal information</li>
              </ul>
              <p className="text-slate-300 mt-4">
                We do not sell your personal information. For more details on your
                CCPA rights, please see our{" "}
                <a href="/legal/privacy" className="text-gold-400 hover:text-gold-300 underline">
                  Privacy Policy
                </a>
                .
              </p>
            </section>

            {/* Updates */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">Updates to This Policy</h2>
              <p className="text-slate-300">
                We may update this Cookie Policy periodically to reflect changes
                in our practices or for legal, operational, or regulatory reasons.
                We will update the "Last Updated" date at the top of this page.
              </p>
              <p className="text-slate-300 mt-4">
                We encourage you to review this policy periodically for the latest
                information about our cookie practices.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-6 h-6 text-gold-400" />
                <h2 className="text-2xl font-bold text-white mb-0">Contact Us</h2>
              </div>
              <p className="text-slate-300">
                If you have questions about our use of cookies or this policy,
                please contact us:
              </p>
              <div className="bg-navy-800/50 border border-navy-700 p-6 rounded-xl mt-4">
                <p className="font-semibold text-white text-lg">
                  Crave Optimal Health LLC
                </p>
                <p className="text-slate-300 mt-3">
                  <strong className="text-white">Email:</strong>{" "}
                  <a
                    href="mailto:privacy@craveoptimalhealth.com"
                    className="text-gold-400 hover:text-gold-300 underline"
                  >
                    privacy@craveoptimalhealth.com
                  </a>
                </p>
                <p className="text-slate-300 mt-2">
                  <strong className="text-white">Mailing Address:</strong><br />
                  12648 W Vatland Dr<br />
                  Post Falls, Idaho 83854
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
