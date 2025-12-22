import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { AlertTriangle, Heart, Activity, CheckCircle2, XCircle, Mail } from 'lucide-react';

export function AssumptionOfRiskPage() {
  const lastUpdated = 'December 22, 2025';

  return (
    <MarketingLayout>
      <div className="min-h-screen bg-navy-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/20 mb-6">
              <AlertTriangle className="w-8 h-8 text-orange-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Assumption of Risk & Liability Waiver
            </h1>
            <p className="text-slate-400 text-lg">
              Last Updated: {lastUpdated}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            {/* Important Notice */}
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 mb-10">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-bold text-orange-400 mt-0 mb-2">Important Legal Document</h2>
                  <p className="text-slate-300 mb-0">
                    <strong>PLEASE READ THIS ASSUMPTION OF RISK AND LIABILITY WAIVER CAREFULLY.</strong> By participating in The Metabolic Reset Project, you are agreeing to release Crave Optimal Health LLC from liability and assuming certain risks. If you do not agree to these terms, you should not participate in the program.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">1</span>
                Acknowledgment of Voluntary Participation
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <p className="text-slate-300">
                  I acknowledge that my participation in The Metabolic Reset Project, operated by Crave Optimal Health LLC ("Company"), is <strong className="text-white">entirely voluntary</strong>. I am choosing to participate of my own free will after having the opportunity to review the program materials, Medical Disclaimer, Terms of Service, and this Assumption of Risk & Liability Waiver.
                </p>
                <p className="text-slate-300 mb-0">
                  I understand that this program involves lifestyle modifications, habit changes, dietary considerations, physical activity recommendations, and the potential use of bioelectrical impedance analysis (BIA) devices such as smart scales.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">2</span>
                Acknowledgment of Inherent Risks
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <div className="flex items-start gap-4 mb-4">
                  <Activity className="w-6 h-6 text-gold-400 flex-shrink-0 mt-1" />
                  <p className="text-slate-300 mb-0">
                    I understand and acknowledge that participation in any wellness, fitness, or lifestyle modification program carries <strong className="text-white">inherent risks</strong>, including but not limited to:
                  </p>
                </div>
                <ul className="text-slate-300 space-y-2 ml-10">
                  <li>Physical discomfort, muscle soreness, or fatigue from increased activity</li>
                  <li>Injuries related to physical exercise or movement</li>
                  <li>Adverse reactions to dietary changes or nutritional modifications</li>
                  <li>Exacerbation of pre-existing medical conditions</li>
                  <li>Dehydration, electrolyte imbalances, or nutritional deficiencies</li>
                  <li>Cardiovascular events (particularly for those with underlying conditions)</li>
                  <li>Interference with medical devices from bioelectrical impedance devices</li>
                  <li>Psychological effects related to body image, weight, or lifestyle changes</li>
                  <li>Other unforeseen injuries or medical complications</li>
                </ul>
                <p className="text-slate-300 mt-4 mb-0">
                  <strong className="text-gold-400">I knowingly and voluntarily assume all such risks, both known and unknown, even if arising from the negligence of the Company or others.</strong>
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">3</span>
                Health Representations
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <p className="text-slate-300">By participating in this program, I represent and warrant that:</p>

                <div className="space-y-3 mt-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">I am at least <strong className="text-white">18 years of age</strong></span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">I am in <strong className="text-white">sufficient physical condition</strong> to participate in wellness activities</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">I have <strong className="text-white">consulted with my physician</strong> or healthcare provider before beginning this program (or understand that I should do so)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">I have <strong className="text-white">disclosed any relevant medical conditions</strong> that may affect my ability to safely participate</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">I will <strong className="text-white">immediately cease participation</strong> and seek medical attention if I experience any concerning symptoms</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 - Medical Device Restrictions */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">4</span>
                Cardiac Device & Medical Restrictions
              </h2>
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Heart className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <p className="text-slate-300 mb-0">
                    <strong className="text-red-400">I understand that bioelectrical impedance analysis (BIA) smart scales may pose risks to individuals with certain medical conditions or devices.</strong>
                  </p>
                </div>

                <h3 className="text-lg font-bold text-white mt-6 mb-3">I certify that I do NOT have any of the following (or I will NOT use smart scale biometric features):</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">Pacemaker</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">Implantable Cardioverter-Defibrillator (ICD)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">Other Cardiac Implantable Electronic Devices (CIEDs)</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mt-6 mb-3">I will exercise caution and consult my physician if I have:</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">Pregnancy (I will disable BIA features)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">Epilepsy or seizure disorders</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">Other implanted electronic medical devices (insulin pumps, neurostimulators, etc.)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">Heart disease or cardiovascular conditions</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">Kidney disease or liver disease</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">Diabetes or blood sugar regulation issues</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">History of eating disorders</span>
                  </div>
                </div>

                <p className="text-slate-300 mt-4 mb-0">
                  If I have any of the above conditions, I acknowledge that I am participating <strong className="text-white">at my own risk</strong> and have obtained appropriate medical clearance.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">5</span>
                Release of Liability
              </h2>
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                <p className="text-slate-300 uppercase font-semibold">
                  IN CONSIDERATION OF BEING ALLOWED TO PARTICIPATE IN THE METABOLIC RESET PROJECT, I HEREBY:
                </p>
                <p className="text-slate-300">
                  <strong className="text-white">RELEASE, WAIVE, DISCHARGE, AND COVENANT NOT TO SUE</strong> Crave Optimal Health LLC, its owners, officers, directors, employees, agents, coaches, affiliates, successors, and assigns (collectively, "Released Parties") from any and all liability, claims, demands, actions, or causes of action whatsoever arising out of or related to any loss, damage, or injury, including death, that may be sustained by me, or to any property belonging to me, while participating in this program, whether caused by the negligence of the Released Parties or otherwise.
                </p>
                <p className="text-slate-300 mb-0">
                  I further agree to <strong className="text-white">INDEMNIFY AND HOLD HARMLESS</strong> the Released Parties from any loss, liability, damage, or costs, including court costs and attorneys' fees, that they may incur arising from my participation in this program.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">6</span>
                No Guarantee of Results
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <p className="text-slate-300">
                  I understand that The Metabolic Reset Project <strong className="text-white">makes no guarantees</strong> regarding any specific health outcomes, including but not limited to:
                </p>
                <ul className="text-slate-300 space-y-2">
                  <li>Weight loss or body composition changes</li>
                  <li>Reduction in metabolic age</li>
                  <li>Improvement in any health markers or conditions</li>
                  <li>Achievement of any specific fitness or wellness goals</li>
                </ul>
                <p className="text-slate-300 mt-4 mb-0">
                  Results vary based on individual factors including adherence to the program, genetics, pre-existing conditions, and other lifestyle factors. Testimonials and success stories represent individual experiences and are not guaranteed outcomes.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">7</span>
                Understanding & Agreement
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <p className="text-slate-300">By using the Platform and participating in this program, I affirm that:</p>
                <ul className="text-slate-300 space-y-2">
                  <li>I have <strong className="text-white">read and fully understand</strong> this Assumption of Risk & Liability Waiver</li>
                  <li>I understand that I am <strong className="text-white">giving up substantial rights</strong>, including the right to sue</li>
                  <li>I am signing this document <strong className="text-white">freely and voluntarily</strong>, without any inducement or assurance</li>
                  <li>I intend this waiver to be a <strong className="text-white">complete and unconditional release</strong> of all liability to the greatest extent allowed by law</li>
                  <li>If any portion of this waiver is held invalid, the remaining portions shall continue in full force and effect</li>
                </ul>
              </div>
            </section>

            {/* Section 8 - Governing Law */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 text-sm font-bold">8</span>
                Governing Law
              </h2>
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <p className="text-slate-300 mb-0">
                  This Assumption of Risk & Liability Waiver shall be governed by and construed in accordance with the laws of the <strong className="text-white">State of Idaho</strong>, without regard to its conflict of law provisions. Any disputes arising from this waiver shall be subject to the arbitration provisions in our Terms of Service.
                </p>
              </div>
            </section>

            {/* Electronic Agreement Notice */}
            <section className="mb-10">
              <div className="bg-gold-500/10 border border-gold-500/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gold-400 mt-0 mb-3">Electronic Acceptance</h3>
                <p className="text-slate-300 mb-0">
                  By creating an account, making a payment, or otherwise using The Metabolic Reset Project platform, you acknowledge that you have read, understood, and agree to be bound by this Assumption of Risk & Liability Waiver. Your electronic acceptance has the same legal force and effect as a physical signature.
                </p>
              </div>
            </section>

            {/* Contact Section */}
            <section className="mb-10">
              <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-gold-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-white mt-0 mb-2">Questions?</h3>
                    <p className="text-slate-300">
                      If you have questions about this waiver, please contact us before participating:
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

export default AssumptionOfRiskPage;
