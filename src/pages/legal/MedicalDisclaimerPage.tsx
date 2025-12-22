import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { Shield, AlertTriangle, Heart, Stethoscope, Scale, Phone } from 'lucide-react';

export function MedicalDisclaimerPage() {
  const lastUpdated = 'December 22, 2025';

  return (
    <MarketingLayout>
      <div className="min-h-screen bg-navy-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-6">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Medical Disclaimer
            </h1>
            <p className="text-slate-400 text-lg">
              Last Updated: {lastUpdated}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            {/* Important Notice Banner */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-10">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-bold text-red-400 mt-0 mb-2">Important Notice</h2>
                  <p className="text-slate-300 mb-0">
                    The information provided through The Metabolic Reset Project is for <strong>educational and informational purposes only</strong> and is not intended as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified healthcare provider before beginning any new health program.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">1</span>
                Not Medical Advice
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <p className="text-slate-300">
                  The Metabolic Reset Project, operated by Crave Optimal Health LLC, is a wellness education and habit-tracking platform. <strong>We are not medical professionals, licensed dietitians, registered nurses, or healthcare providers.</strong>
                </p>
                <p className="text-slate-300">
                  The content, programs, services, and information provided through this platform—including but not limited to metabolic age calculations, body composition tracking, habit recommendations, and educational materials—are not intended to:
                </p>
                <ul className="text-slate-300 space-y-2">
                  <li>Diagnose, treat, cure, or prevent any disease or medical condition</li>
                  <li>Replace the advice of your physician or healthcare provider</li>
                  <li>Constitute a doctor-patient or healthcare provider relationship</li>
                  <li>Provide specific medical recommendations for your individual situation</li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">2</span>
                Consult Your Physician
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <div className="flex items-start gap-4 mb-4">
                  <Stethoscope className="w-6 h-6 text-gold-400 flex-shrink-0 mt-1" />
                  <p className="text-slate-300 mb-0">
                    <strong className="text-white">We strongly recommend that you consult with your physician or qualified healthcare provider before:</strong>
                  </p>
                </div>
                <ul className="text-slate-300 space-y-2 ml-10">
                  <li>Starting this or any other wellness, diet, or exercise program</li>
                  <li>Making any changes to your current diet, exercise routine, or lifestyle</li>
                  <li>Using any bioelectrical impedance analysis (BIA) devices such as smart scales</li>
                  <li>If you have any pre-existing medical conditions</li>
                  <li>If you are taking any medications</li>
                  <li>If you are pregnant, nursing, or planning to become pregnant</li>
                  <li>If you are over 50 years of age</li>
                </ul>
                <p className="text-slate-300 mt-4">
                  <strong className="text-gold-400">Your participation in this program is entirely voluntary, and you assume all risks associated with making lifestyle changes.</strong>
                </p>
              </div>
            </section>

            {/* Section 3 - Smart Scale Warning */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">3</span>
                Smart Scale & Bioelectrical Impedance Warnings
              </h2>
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Scale className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <p className="text-red-300 font-semibold mb-0">
                    Critical Safety Information for Smart Scale Users
                  </p>
                </div>
                <p className="text-slate-300">
                  Our program may involve the use of smart scales that utilize bioelectrical impedance analysis (BIA) technology. These devices send a small, imperceptible electrical current through your body to measure body composition metrics.
                </p>
                <div className="mt-4">
                  <h3 className="text-lg font-bold text-red-400 mb-3">DO NOT USE SMART SCALES IF YOU HAVE:</h3>
                  <ul className="text-slate-300 space-y-3">
                    <li className="flex items-start gap-3">
                      <Heart className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span><strong className="text-white">Pacemakers</strong> – BIA electrical currents may interfere with pacemaker function</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Heart className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span><strong className="text-white">Implantable Cardioverter-Defibrillators (ICDs)</strong> – Research indicates potential interference with these devices</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Heart className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span><strong className="text-white">Other Cardiac Implantable Electronic Devices (CIEDs)</strong> – Including loop recorders, cardiac monitors, or similar implanted devices</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-yellow-400 mb-3">USE WITH CAUTION / CONSULT PHYSICIAN:</h3>
                  <ul className="text-slate-300 space-y-2">
                    <li><strong className="text-white">Pregnancy</strong> – BIA has not been validated for pregnant women; disable body composition features</li>
                    <li><strong className="text-white">Epilepsy</strong> – Consult your physician before use</li>
                    <li><strong className="text-white">Other implanted electronic devices</strong> – Insulin pumps, neurostimulators, etc.</li>
                  </ul>
                </div>
                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-300 mb-0">
                    <strong>Note:</strong> Coronary stents are generally considered safe with BIA devices and do not require restriction.
                  </p>
                </div>
                <p className="text-slate-300 mt-4">
                  If you have any of the above conditions, you may still participate in the educational content and habit-tracking portions of our program, but you should NOT submit biometric data from smart scales. Contact us for alternative participation options.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">4</span>
                Health Coach Disclosure
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <p className="text-slate-300">
                  The coaches associated with The Metabolic Reset Project are <strong>independent OPTAVIA coaches</strong>. While some coaches may hold professional credentials (nutritionists, personal trainers, healthcare professionals), this is not a requirement.
                </p>
                <p className="text-slate-300">
                  All coaches are required to complete the OPTAVIA Health Coach Certification upon their one-year renewal. However, <strong>coaches are not acting as licensed healthcare providers</strong> when providing guidance through this platform.
                </p>
                <p className="text-slate-300">
                  Any recommendations, suggestions, or guidance provided by coaches—whether general or personalized—should not be construed as medical advice. Coaches may provide:
                </p>
                <ul className="text-slate-300 space-y-2">
                  <li>Lifestyle and wellness suggestions</li>
                  <li>Habit formation guidance</li>
                  <li>Motivational support and accountability</li>
                  <li>General nutritional information (not medical nutrition therapy)</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">5</span>
                Third-Party Products
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <p className="text-slate-300">
                  OPTAVIA products, smart scales, and other third-party products that may be referenced or recommended through this program are manufactured and sold by independent companies. <strong>Crave Optimal Health LLC does not manufacture, sell, or warrant any third-party products.</strong>
                </p>
                <p className="text-slate-300">
                  Any claims regarding third-party products are the responsibility of their respective manufacturers. Please review all product warnings, contraindications, and instructions before use.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">6</span>
                No Guarantees
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <p className="text-slate-300">
                  While we share success stories and general outcomes from participants, <strong>individual results will vary</strong>. We make no guarantees regarding:
                </p>
                <ul className="text-slate-300 space-y-2">
                  <li>Weight loss or body composition changes</li>
                  <li>Metabolic age reduction</li>
                  <li>Health improvements or disease prevention</li>
                  <li>Any specific health outcome</li>
                </ul>
                <p className="text-slate-300 mt-4">
                  Results depend on many factors including individual physiology, adherence to the program, pre-existing conditions, genetics, and other lifestyle factors beyond our control.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">7</span>
                Emergency Situations
              </h2>
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                <p className="text-slate-300">
                  <strong className="text-red-400">If you experience any medical emergency, chest pain, difficulty breathing, severe symptoms, or believe you are having a health crisis, immediately call 911 or your local emergency services.</strong>
                </p>
                <p className="text-slate-300 mt-4">
                  Do not rely on this platform, coaches, or any information provided here to address medical emergencies.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">8</span>
                Your Responsibility
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <p className="text-slate-300">
                  By using The Metabolic Reset Project, you acknowledge and agree that:
                </p>
                <ul className="text-slate-300 space-y-2">
                  <li>You are solely responsible for your health decisions</li>
                  <li>You will consult with appropriate healthcare providers regarding your health</li>
                  <li>You understand the inherent risks of lifestyle and dietary changes</li>
                  <li>You have read and understood this Medical Disclaimer</li>
                  <li>You release Crave Optimal Health LLC and its coaches from liability for any health-related outcomes</li>
                </ul>
              </div>
            </section>

            {/* Contact Section */}
            <section className="mb-10">
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-gold-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-white mt-0 mb-2">Questions About This Disclaimer?</h3>
                    <p className="text-slate-300 mb-0">
                      If you have questions about this Medical Disclaimer or need to discuss alternative participation options due to health restrictions, please contact us at:
                    </p>
                    <p className="text-gold-400 font-semibold mt-2 mb-0">
                      Crave Optimal Health LLC<br />
                      12648 W Vatland Dr<br />
                      Post Falls, Idaho 83854
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* FDA Disclaimer */}
            <section className="mb-10">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 text-center">
                <p className="text-slate-400 text-sm mb-0">
                  <strong>FDA Disclaimer:</strong> These statements have not been evaluated by the Food and Drug Administration. This program is not intended to diagnose, treat, cure, or prevent any disease.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}

export default MedicalDisclaimerPage;
