import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { CreditCard, AlertTriangle, RefreshCw, Shield, Mail } from 'lucide-react';

export default function RefundPolicyPage() {
  const lastUpdated = 'December 22, 2025';
  const effectiveDate = 'December 22, 2025';

  return (
    <MarketingLayout>
      <div className="min-h-screen bg-navy-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-500/20 mb-6">
              <CreditCard className="w-8 h-8 text-gold-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Refund Policy
            </h1>
            <p className="text-slate-400 text-lg">
              Last Updated: {lastUpdated} | Effective Date: {effectiveDate}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            {/* Overview */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
              <p className="text-slate-300">
                Thank you for participating in the 28 Day Reset program operated by
                Crave Optimal Health LLC ("Company," "we," "us," or "our"). This
                Refund Policy explains our policies regarding refunds for program
                fees and related payments.
              </p>
              <p className="text-slate-300 mt-4">
                By purchasing access to our program, you acknowledge that you have
                read, understood, and agree to the terms of this Refund Policy.
              </p>
            </section>

            {/* Program Fees */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">Program Fees</h2>
              <p className="text-slate-300">
                The 28 Day Reset program is offered at the following one-time fee
                structure:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-300">
                <li>
                  <strong className="text-white">Challenger (Participant):</strong> $28.00 one-time fee
                </li>
                <li>
                  <strong className="text-white">Coach (Group Leader):</strong> $49.00 one-time fee
                </li>
              </ul>
              <p className="text-slate-300 mt-4">
                These are non-recurring charges. There are no automatic renewals,
                subscription fees, or hidden charges associated with program
                participation.
              </p>
            </section>

            {/* General Refund Policy */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">General Refund Policy</h2>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                  <p className="text-amber-200 font-semibold mb-0">
                    All sales are final. Program fees are generally non-refundable.
                  </p>
                </div>
              </div>
              <p className="text-slate-300">
                Due to the digital nature of our program and the immediate access
                provided upon payment, we are unable to offer refunds for:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-300">
                <li>Change of mind after purchase</li>
                <li>Failure to complete the program</li>
                <li>Dissatisfaction with program results</li>
                <li>Inability to participate due to personal circumstances</li>
                <li>Not reading program requirements before purchase</li>
                <li>Technical issues on your end (device, internet connection)</li>
              </ul>
              <p className="text-slate-300 mt-4">
                We encourage all prospective participants to carefully review our
                program information, Medical Disclaimer, Terms of Service, and
                Assumption of Risk documents before making a purchase decision.
              </p>
            </section>

            {/* Duplicate Charge Refunds */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <RefreshCw className="w-6 h-6 text-green-400" />
                <h2 className="text-2xl font-bold text-white mb-0">Duplicate Charge Refunds</h2>
              </div>
              <p className="text-slate-300">
                We will issue full refunds in cases of verified duplicate charges.
                A duplicate charge occurs when:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-300">
                <li>
                  You were charged more than once for the same registration due to
                  a technical error
                </li>
                <li>
                  Multiple transactions were processed for a single intended
                  purchase
                </li>
                <li>
                  A system error resulted in an additional charge beyond your
                  intended purchase
                </li>
              </ul>
              <p className="text-white font-semibold mt-6">
                To request a duplicate charge refund:
              </p>
              <ol className="list-decimal pl-6 space-y-2 mt-2 text-slate-300">
                <li>
                  Contact us within <strong className="text-white">7 days</strong> of the duplicate charge
                </li>
                <li>Provide your email address used for registration</li>
                <li>
                  Include proof of the duplicate charges (bank statement,
                  transaction IDs, or payment confirmation emails)
                </li>
                <li>
                  Send your request to:{" "}
                  <a
                    href="mailto:support@craveoptimalhealth.com"
                    className="text-gold-400 hover:text-gold-300 underline"
                  >
                    support@craveoptimalhealth.com
                  </a>
                </li>
              </ol>
              <p className="text-slate-300 mt-4">
                We will investigate all duplicate charge claims within 5-7 business
                days. If verified, refunds will be processed to the original payment
                method within 5-10 business days, depending on your financial
                institution.
              </p>
            </section>

            {/* Consideration Period */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">7-Day Consideration Period</h2>
              <p className="text-slate-300">
                We encourage all potential participants to take advantage of a 7-day
                consideration period before purchasing. During this time:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-300">
                <li>Review all program materials and requirements</li>
                <li>
                  Read our{" "}
                  <a href="/legal/medical-disclaimer" className="text-gold-400 hover:text-gold-300 underline">
                    Medical Disclaimer
                  </a>{" "}
                  carefully
                </li>
                <li>Consult with your healthcare provider if you have any health concerns</li>
                <li>
                  Review the{" "}
                  <a href="/legal/assumption-of-risk" className="text-gold-400 hover:text-gold-300 underline">
                    Assumption of Risk
                  </a>{" "}
                  document
                </li>
                <li>Ensure you have access to a compatible smart scale (if applicable)</li>
                <li>Verify you can commit to the full 28-day program</li>
              </ul>
              <p className="text-slate-300 mt-4">
                This consideration period is advisory only and does not constitute
                a refund guarantee. Once payment is processed, the no-refund policy
                applies.
              </p>
            </section>

            {/* Exceptions */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">Exceptional Circumstances</h2>
              <p className="text-slate-300">
                In rare cases, we may consider refund requests under exceptional
                circumstances at our sole discretion. These may include:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-300">
                <li>
                  Verified technical issues on our platform that completely
                  prevented access for an extended period
                </li>
                <li>Billing errors made by our payment processor</li>
                <li>Program cancellation by Crave Optimal Health LLC</li>
              </ul>
              <p className="text-slate-300 mt-4">
                Each request will be evaluated on a case-by-case basis. Submitting
                a request does not guarantee approval.
              </p>
            </section>

            {/* Chargebacks */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">Chargebacks and Disputes</h2>
              <p className="text-slate-300">
                We strongly encourage you to contact us directly before initiating
                a chargeback or dispute with your financial institution. Initiating
                a chargeback without first attempting to resolve the issue with us
                may result in:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-300">
                <li>Immediate termination of your program access</li>
                <li>Prohibition from future program participation</li>
                <li>
                  Collection efforts for any reversed funds if the chargeback is
                  found to be invalid
                </li>
              </ul>
              <p className="text-slate-300 mt-4">
                We maintain comprehensive transaction records and will provide
                evidence to dispute fraudulent chargeback claims.
              </p>
            </section>

            {/* Payment Security */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-green-400" />
                <h2 className="text-2xl font-bold text-white mb-0">Payment Security</h2>
              </div>
              <p className="text-slate-300">
                All payments are processed securely through Stripe, a PCI-compliant
                payment processor. We do not store your complete credit card
                information on our servers. For more information about how your
                payment data is handled, please review our{" "}
                <a href="/legal/privacy" className="text-gold-400 hover:text-gold-300 underline">
                  Privacy Policy
                </a>
                .
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-6 h-6 text-gold-400" />
                <h2 className="text-2xl font-bold text-white mb-0">Contact Information</h2>
              </div>
              <p className="text-slate-300">
                For refund inquiries or payment-related questions, please contact us:
              </p>
              <div className="bg-navy-800/50 border border-navy-700 p-6 rounded-xl mt-4">
                <p className="font-semibold text-white text-lg">
                  Crave Optimal Health LLC
                </p>
                <p className="text-slate-300 mt-3">
                  <strong className="text-white">Email:</strong>{" "}
                  <a
                    href="mailto:support@craveoptimalhealth.com"
                    className="text-gold-400 hover:text-gold-300 underline"
                  >
                    support@craveoptimalhealth.com
                  </a>
                </p>
                <p className="text-slate-300 mt-2">
                  <strong className="text-white">Mailing Address:</strong><br />
                  12648 W Vatland Dr<br />
                  Post Falls, Idaho 83854
                </p>
              </div>
              <p className="text-slate-400 text-sm mt-4">
                Please allow 5-7 business days for a response to refund inquiries.
                Include "Refund Request" in your email subject line for faster
                processing.
              </p>
            </section>

            {/* Policy Changes */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">Changes to This Policy</h2>
              <p className="text-slate-300">
                We reserve the right to modify this Refund Policy at any time.
                Changes will be effective immediately upon posting to this page.
                The "Last Updated" date at the top of this policy indicates when
                the most recent changes were made.
              </p>
              <p className="text-slate-300 mt-4">
                Continued use of our services after any changes constitutes
                acceptance of the updated policy. The policy in effect at the time
                of your purchase will govern any refund requests for that
                transaction.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-white mb-4">Governing Law</h2>
              <p className="text-slate-300">
                This Refund Policy is governed by the laws of the State of Idaho,
                without regard to its conflict of law provisions. Any disputes
                arising from this policy shall be subject to the dispute resolution
                procedures outlined in our{" "}
                <a href="/legal/terms" className="text-gold-400 hover:text-gold-300 underline">
                  Terms of Service
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
