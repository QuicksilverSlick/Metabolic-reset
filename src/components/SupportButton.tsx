'use client';

import { HelpCircle } from 'lucide-react';
import { useBugReportStore } from '@/lib/bug-report-store';
import { BugReportDialog } from '@/components/BugReportDialog';
import { FloatingBugCapture } from '@/components/FloatingBugCapture';

/**
 * SupportButton - A floating support button for pre-login pages
 * Shows a HelpCircle icon with "Need Help?" label and opens the support dialog when clicked.
 * Include this on pages like registration, payment, quiz results, etc.
 */
export function SupportButton() {
  const openAsSupport = useBugReportStore(s => s.openAsSupport);

  return (
    <>
      {/* Floating support button with label */}
      <button
        onClick={openAsSupport}
        className="fixed bottom-4 right-4 z-50 flex flex-col items-center gap-1 group"
        title="Contact Support"
      >
        <span className="text-xs font-medium text-gold-400 opacity-90 group-hover:opacity-100 transition-opacity">
          Need Help?
        </span>
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 text-navy-900 shadow-lg flex items-center justify-center group-hover:from-gold-400 group-hover:to-gold-500 group-hover:shadow-xl group-hover:scale-105 transition-all duration-200">
          <HelpCircle className="h-6 w-6" />
        </div>
      </button>

      {/* Support Dialog - controlled by store */}
      <BugReportDialog trigger={<span className="hidden" />} />

      {/* Floating capture component for screenshots/recording */}
      <FloatingBugCapture />
    </>
  );
}
