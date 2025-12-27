'use client';

import { Headset } from 'lucide-react';
import { useBugReportStore } from '@/lib/bug-report-store';
import { BugReportDialog } from '@/components/BugReportDialog';
import { FloatingBugCapture } from '@/components/FloatingBugCapture';

/**
 * SupportButton - A floating support button for pre-login pages
 * Shows a Headset icon with "Need Help?" label and opens the support dialog when clicked.
 * Include this on pages like registration, payment, quiz results, etc.
 */
export function SupportButton() {
  const openAsSupport = useBugReportStore(s => s.openAsSupport);

  return (
    <>
      {/* Floating support button - simple icon with label */}
      <button
        onClick={openAsSupport}
        className="fixed bottom-4 right-4 z-50 flex flex-col items-center gap-0.5 group"
        title="Contact Support"
      >
        <span className="text-[10px] font-medium text-gold-400 group-hover:text-gold-300 transition-colors">
          Need Help?
        </span>
        <Headset className="h-7 w-7 text-gold-500 group-hover:text-gold-400 group-hover:scale-110 transition-all duration-200" />
      </button>

      {/* Support Dialog - controlled by store */}
      <BugReportDialog trigger={<span className="hidden" />} />

      {/* Floating capture component for screenshots/recording */}
      <FloatingBugCapture />
    </>
  );
}
