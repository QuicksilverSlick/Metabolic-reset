'use client';

import { useCallback, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useBugReportStore } from '@/lib/bug-report-store';
import { toast } from 'sonner';

/**
 * FloatingBugCapture - A global component that handles screenshots for bug reports
 * This component lives at the app root level so it persists across navigation.
 * It shows a floating widget during screenshot capture.
 */
export function FloatingBugCapture() {
  const store = useBugReportStore();

  // Capture screenshot using html2canvas
  const captureScreenshot = useCallback(async () => {
    store.setCaptureMode('screenshot-pending');

    // Small delay to let any dialog animations finish
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0a1628', // Navy background as fallback
        scale: Math.min(window.devicePixelRatio || 1, 2), // Cap at 2x for performance
        logging: false,
        // Ignore the floating capture widget and any dialogs
        ignoreElements: (element) => {
          return element.id === 'floating-bug-capture' ||
            element.getAttribute('role') === 'dialog' ||
            element.classList.contains('fixed');
        }
      });

      canvas.toBlob((blob) => {
        if (blob) {
          // Revoke old preview URL if exists
          if (store.media.screenshotPreview) {
            URL.revokeObjectURL(store.media.screenshotPreview);
          }
          const preview = URL.createObjectURL(blob);
          store.setScreenshot(blob, preview);
          toast.success('Screenshot captured!', {
            description: 'You can review it before submitting.'
          });
        } else {
          toast.error('Failed to capture screenshot', {
            description: 'Please try again or describe the issue manually.'
          });
        }
        store.setCaptureMode('idle');
        // Open dialog to show the result
        store.setDialogOpen(true);
        store.setMinimized(false);
      }, 'image/png', 0.9);
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      toast.error('Screenshot failed', {
        description: 'Please describe your issue manually.'
      });
      store.setCaptureMode('idle');
      // Re-open dialog even on failure
      store.setDialogOpen(true);
      store.setMinimized(false);
    }
  }, [store]);

  // Expose capture function globally so BugReportDialog can trigger it
  useEffect(() => {
    (window as any).__bugCapture = {
      captureScreenshot,
    };
    return () => {
      delete (window as any).__bugCapture;
    };
  }, [captureScreenshot]);

  // Only show the floating widget when capturing
  if (store.captureMode !== 'screenshot-pending') {
    return null;
  }

  return (
    <div
      id="floating-bug-capture"
      className="fixed bottom-4 right-4 z-[9999] animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <div className="bg-navy-900 border border-navy-600 rounded-2xl shadow-2xl p-3 flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1">
          <Loader2 className="h-4 w-4 text-gold animate-spin" />
          <span className="text-white text-sm">Capturing screenshot...</span>
        </div>
      </div>
    </div>
  );
}
