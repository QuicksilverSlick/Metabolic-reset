'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBugReportStore } from '@/lib/bug-report-store';
import { BugReportDialog } from '@/components/BugReportDialog';
import { FloatingBugCapture } from '@/components/FloatingBugCapture';

/**
 * SupportButton - A floating support button for pre-login pages
 * Shows a MessageCircle icon and opens the support dialog when clicked.
 * Include this on pages like registration, payment, quiz results, etc.
 */
export function SupportButton() {
  const openAsSupport = useBugReportStore(s => s.openAsSupport);

  return (
    <>
      {/* Floating support button */}
      <Button
        onClick={openAsSupport}
        variant="ghost"
        size="icon"
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-navy-800/90 text-gold hover:bg-navy-700 hover:text-gold-400 shadow-lg border border-navy-600"
        title="Contact Support"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>

      {/* Support Dialog - controlled by store */}
      <BugReportDialog trigger={<span className="hidden" />} />

      {/* Floating capture component for screenshots/recording */}
      <FloatingBugCapture />
    </>
  );
}
