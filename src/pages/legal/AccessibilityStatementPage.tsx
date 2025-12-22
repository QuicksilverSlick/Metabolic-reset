import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { Accessibility, Eye, Hand, Navigation, MessageSquare, Code, Monitor, AlertCircle, Headphones, Lightbulb, Mail, RefreshCw, Scale } from 'lucide-react';

export default function AccessibilityStatementPage() {
  const lastUpdated = 'December 22, 2025';
  const effectiveDate = 'December 22, 2025';

  return (
    <MarketingLayout>
      <div className="min-h-screen bg-navy-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-6">
              <Accessibility className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Accessibility Statement
            </h1>
            <p className="text-slate-400 text-lg">
              Last Updated: {lastUpdated} | Effective Date: {effectiveDate}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            {/* Commitment */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">Our Commitment to Accessibility</h2>
              <p className="text-slate-300">
                Crave Optimal Health LLC is committed to ensuring digital
                accessibility for people with disabilities. We continually improve
                the user experience for everyone and apply the relevant
                accessibility standards to ensure we provide equal access to all
                users.
              </p>
              <p className="text-slate-300 mt-4">
                The 28 Day Reset platform is designed specifically with our core
                demographic—adults aged 50 and older—in mind. We recognize that
                this user group may have varying levels of technical proficiency
                and visual, motor, or cognitive considerations. Our design
                philosophy prioritizes clarity, ease of use, and accessibility.
              </p>
            </section>

            {/* Standards */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">Accessibility Standards</h2>
              <p className="text-slate-300">
                We strive to conform to the{" "}
                <a
                  href="https://www.w3.org/WAI/standards-guidelines/wcag/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-400 hover:text-gold-300 underline"
                >
                  Web Content Accessibility Guidelines (WCAG) 2.1
                </a>{" "}
                at Level AA. These guidelines explain how to make web content more
                accessible for people with disabilities and more user-friendly for
                everyone.
              </p>
              <p className="text-slate-300 mt-4">
                WCAG 2.1 Level AA covers a wide range of recommendations for
                making content accessible, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-300">
                <li>Providing text alternatives for non-text content</li>
                <li>Creating content that can be presented in different ways</li>
                <li>Making it easier for users to see and hear content</li>
                <li>Providing enough time to read and use content</li>
                <li>Not designing content in a way that causes seizures</li>
                <li>Helping users navigate and find content</li>
                <li>Making text content readable and understandable</li>
                <li>Making content appear and operate in predictable ways</li>
                <li>Helping users avoid and correct mistakes</li>
                <li>Maximizing compatibility with assistive technologies</li>
              </ul>
            </section>

            {/* Features */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">Accessibility Features</h2>
              <p className="text-slate-300">
                Our platform includes the following accessibility features designed
                especially for users aged 50 and older:
              </p>

              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-5 h-5 text-purple-400" />
                  <h3 className="text-xl font-bold text-white mb-0">Visual Design</h3>
                </div>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>
                    <strong className="text-white">High Contrast Color Scheme:</strong> Our navy and gold
                    color palette provides strong contrast ratios for easy reading
                  </li>
                  <li>
                    <strong className="text-white">Large, Readable Fonts:</strong> Base font sizes are
                    larger than typical websites to improve readability
                  </li>
                  <li>
                    <strong className="text-white">Scalable Text:</strong> All text can be resized using
                    browser zoom without loss of functionality (up to 200%)
                  </li>
                  <li>
                    <strong className="text-white">Clear Visual Hierarchy:</strong> Content is organized
                    with clear headings and sections
                  </li>
                  <li>
                    <strong className="text-white">Minimal Visual Clutter:</strong> Clean, uncluttered
                    interface reduces cognitive load
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <Hand className="w-5 h-5 text-green-400" />
                  <h3 className="text-xl font-bold text-white mb-0">Touch and Motor Accessibility</h3>
                </div>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>
                    <strong className="text-white">Large Touch Targets:</strong> Buttons and interactive
                    elements are sized at 48x48 pixels minimum for easy tapping
                  </li>
                  <li>
                    <strong className="text-white">Generous Spacing:</strong> Adequate space between
                    clickable elements to prevent accidental taps
                  </li>
                  <li>
                    <strong className="text-white">Simple Navigation:</strong> Straightforward navigation
                    with minimal steps to complete tasks
                  </li>
                  <li>
                    <strong className="text-white">Forgiving Inputs:</strong> Forms accept various input
                    formats and provide clear error messages
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <Navigation className="w-5 h-5 text-blue-400" />
                  <h3 className="text-xl font-bold text-white mb-0">Navigation and Structure</h3>
                </div>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>
                    <strong className="text-white">Keyboard Navigation:</strong> All functionality is
                    accessible using a keyboard alone
                  </li>
                  <li>
                    <strong className="text-white">Focus Indicators:</strong> Clear visual indicators show
                    which element is currently focused
                  </li>
                  <li>
                    <strong className="text-white">Skip Links:</strong> Skip to main content links for
                    keyboard users
                  </li>
                  <li>
                    <strong className="text-white">Consistent Layout:</strong> Pages follow a consistent
                    layout pattern for predictable navigation
                  </li>
                  <li>
                    <strong className="text-white">Breadcrumbs:</strong> Clear indication of where you are
                    in the application
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-5 h-5 text-orange-400" />
                  <h3 className="text-xl font-bold text-white mb-0">Content and Communication</h3>
                </div>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>
                    <strong className="text-white">Plain Language:</strong> Content is written in clear,
                    simple language avoiding unnecessary jargon
                  </li>
                  <li>
                    <strong className="text-white">Descriptive Labels:</strong> All form fields and buttons
                    have clear, descriptive labels
                  </li>
                  <li>
                    <strong className="text-white">Error Prevention:</strong> Confirmation prompts for
                    important actions
                  </li>
                  <li>
                    <strong className="text-white">Helpful Error Messages:</strong> When errors occur,
                    messages explain what went wrong and how to fix it
                  </li>
                  <li>
                    <strong className="text-white">Alternative Text:</strong> Images include descriptive
                    alt text for screen reader users
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <Code className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-xl font-bold text-white mb-0">Technical Features</h3>
                </div>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>
                    <strong className="text-white">Semantic HTML:</strong> Proper HTML elements are used
                    for their intended purpose
                  </li>
                  <li>
                    <strong className="text-white">ARIA Labels:</strong> Accessible Rich Internet
                    Applications (ARIA) labels provide context where needed
                  </li>
                  <li>
                    <strong className="text-white">Screen Reader Compatible:</strong> Tested with popular
                    screen readers including NVDA and VoiceOver
                  </li>
                  <li>
                    <strong className="text-white">Responsive Design:</strong> Works on devices of all
                    sizes from mobile to desktop
                  </li>
                  <li>
                    <strong className="text-white">Progressive Web App:</strong> Can be installed on your
                    home screen for easier access
                  </li>
                </ul>
              </div>
            </section>

            {/* Browser Support */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Monitor className="w-6 h-6 text-slate-400" />
                <h2 className="text-2xl font-bold text-white mb-0">Supported Browsers and Devices</h2>
              </div>
              <p className="text-slate-300">
                Our platform is designed to work with the following browsers and
                their built-in accessibility features:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-300">
                <li>Google Chrome (desktop and mobile)</li>
                <li>Safari (macOS and iOS)</li>
                <li>Microsoft Edge</li>
                <li>Mozilla Firefox</li>
              </ul>
              <p className="text-slate-300 mt-4">
                For the best experience, we recommend using the latest version of
                your preferred browser.
              </p>
            </section>

            {/* Known Limitations */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-amber-400" />
                <h2 className="text-2xl font-bold text-white mb-0">Known Limitations</h2>
              </div>
              <p className="text-slate-300">
                While we strive for full accessibility, some limitations may exist:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-300">
                <li>
                  <strong className="text-white">Uploaded Images:</strong> User-uploaded smart scale
                  screenshots cannot have programmatically generated alt text.
                  These images are primarily for coach verification purposes.
                </li>
                <li>
                  <strong className="text-white">Third-Party Content:</strong> Some linked external
                  resources (such as educational materials) may not meet our
                  accessibility standards.
                </li>
                <li>
                  <strong className="text-white">PDF Documents:</strong> Some downloadable documents may
                  have limited accessibility features.
                </li>
              </ul>
              <p className="text-slate-300 mt-4">
                We are actively working to address these limitations and improve
                accessibility across all aspects of our platform.
              </p>
            </section>

            {/* Assistive Technology */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Headphones className="w-6 h-6 text-green-400" />
                <h2 className="text-2xl font-bold text-white mb-0">Using Assistive Technology</h2>
              </div>
              <p className="text-slate-300">
                Our platform is designed to work with a variety of assistive
                technologies:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-300">
                <li>
                  <strong className="text-white">Screen Readers:</strong> Compatible with NVDA, JAWS,
                  VoiceOver (iOS/macOS), and TalkBack (Android)
                </li>
                <li>
                  <strong className="text-white">Screen Magnification:</strong> Works with browser zoom
                  and system magnification tools
                </li>
                <li>
                  <strong className="text-white">Voice Control:</strong> Compatible with voice navigation
                  software
                </li>
                <li>
                  <strong className="text-white">Alternative Input Devices:</strong> Supports keyboard-only
                  navigation and switch control
                </li>
              </ul>
              <p className="text-slate-300 mt-4">
                If you experience any difficulties using assistive technology with
                our platform, please contact us so we can assist you.
              </p>
            </section>

            {/* Tips for Users */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-6 h-6 text-gold-400" />
                <h2 className="text-2xl font-bold text-white mb-0">Tips for Users</h2>
              </div>
              <p className="text-slate-300">
                Here are some tips to optimize your experience on our platform:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-300">
                <li>
                  <strong className="text-white">Increase Text Size:</strong> Use your browser's zoom
                  feature (Ctrl/Cmd + Plus) to make text larger
                </li>
                <li>
                  <strong className="text-white">High Contrast Mode:</strong> Enable your device's high
                  contrast mode for enhanced visibility
                </li>
                <li>
                  <strong className="text-white">Install as App:</strong> Use the "Add to Home Screen"
                  feature for a simplified, app-like experience
                </li>
                <li>
                  <strong className="text-white">Reduce Motion:</strong> If animations are distracting,
                  enable "Reduce Motion" in your device settings
                </li>
                <li>
                  <strong className="text-white">Use a Larger Screen:</strong> If using a mobile device,
                  consider using a tablet for a larger display
                </li>
              </ul>
            </section>

            {/* Feedback */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-6 h-6 text-gold-400" />
                <h2 className="text-2xl font-bold text-white mb-0">Feedback and Assistance</h2>
              </div>
              <p className="text-slate-300">
                We welcome your feedback on the accessibility of the 28 Day Reset
                platform. Please let us know if you encounter accessibility
                barriers or have suggestions for improvement:
              </p>
              <div className="bg-navy-800/50 border border-navy-700 p-6 rounded-xl mt-4">
                <p className="font-semibold text-white text-lg">
                  Accessibility Feedback
                </p>
                <p className="text-slate-300 mt-3">
                  <strong className="text-white">Email:</strong>{" "}
                  <a
                    href="mailto:accessibility@craveoptimalhealth.com"
                    className="text-gold-400 hover:text-gold-300 underline"
                  >
                    accessibility@craveoptimalhealth.com
                  </a>
                </p>
                <p className="text-slate-300 mt-2">
                  <strong className="text-white">Phone:</strong> Contact us through your coach for
                  immediate assistance
                </p>
                <p className="text-slate-300 mt-2">
                  <strong className="text-white">Mailing Address:</strong><br />
                  Crave Optimal Health LLC<br />
                  12648 W Vatland Dr<br />
                  Post Falls, Idaho 83854
                </p>
              </div>
              <p className="text-slate-300 mt-4">
                When contacting us about accessibility issues, please include:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-300">
                <li>The web page address (URL) where you encountered the issue</li>
                <li>A description of the problem you experienced</li>
                <li>The browser and device you were using</li>
                <li>Any assistive technology you were using</li>
              </ul>
              <p className="text-slate-300 mt-4">
                We will make every effort to respond within 5 business days and
                work with you to resolve any accessibility barriers you encounter.
              </p>
            </section>

            {/* Continuous Improvement */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <RefreshCw className="w-6 h-6 text-green-400" />
                <h2 className="text-2xl font-bold text-white mb-0">Continuous Improvement</h2>
              </div>
              <p className="text-slate-300">
                We are committed to ongoing accessibility improvements. Our efforts
                include:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-300">
                <li>Regular accessibility audits of our platform</li>
                <li>User testing with individuals who use assistive technology</li>
                <li>Training our development team on accessibility best practices</li>
                <li>Incorporating accessibility into our design and development processes</li>
                <li>Monitoring and addressing accessibility feedback promptly</li>
              </ul>
            </section>

            {/* Legal */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Scale className="w-6 h-6 text-slate-400" />
                <h2 className="text-2xl font-bold text-white mb-0">Compliance</h2>
              </div>
              <p className="text-slate-300">
                This accessibility statement was last reviewed on December 22, 2025.
                We aim to comply with:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-300">
                <li>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</li>
                <li>Americans with Disabilities Act (ADA) Title III guidelines</li>
                <li>Section 508 of the Rehabilitation Act (where applicable)</li>
              </ul>
              <p className="text-slate-300 mt-4">
                While we strive for compliance, we acknowledge that achieving full
                accessibility is an ongoing process. We are committed to making
                continuous improvements to ensure our platform is accessible to all
                users.
              </p>
            </section>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
