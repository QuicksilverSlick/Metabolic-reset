/**
 * iOS Install Prompt Component
 * Shows a banner for iOS users who haven't installed the PWA
 * Required for push notifications on iOS
 */

import { useState, useEffect } from 'react';
import { X, Share, Plus, Bell, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Check if we're on iOS
function isIOSDevice(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

// Check if the PWA is installed (standalone mode)
function isPWAInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}

// Get storage key for dismissal
const DISMISS_KEY = 'ios-install-prompt-dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface IOSInstallPromptProps {
  className?: string;
}

export function IOSInstallPrompt({ className }: IOSInstallPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Only show on iOS devices that haven't installed the PWA
    if (!isIOSDevice() || isPWAInstalled()) {
      return;
    }

    // Check if user has dismissed within the last 7 days
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissedTime < DISMISS_DURATION_MS) {
        return;
      }
    }

    // Show the prompt after a short delay
    const timer = setTimeout(() => setShowPrompt(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 animate-slide-up",
      "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
      "shadow-lg shadow-orange-500/20",
      className
    )}>
      {/* Main Banner */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-sm">Get Push Notifications</p>
            <p className="text-xs text-white/80">Add to Home Screen for the best experience</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="bg-white text-orange-600 hover:bg-white/90 text-xs px-3"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide' : 'How?'}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Expandable Instructions */}
      {showDetails && (
        <div className="px-4 pb-4 pt-1 bg-white/10 backdrop-blur">
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 shrink-0">
                <span className="font-bold">1</span>
              </div>
              <div>
                <p className="font-medium">Tap the Share button</p>
                <p className="text-white/70 text-xs mt-0.5">
                  It's the square with an arrow pointing up
                  <Share className="inline h-3 w-3 ml-1" />
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 shrink-0">
                <span className="font-bold">2</span>
              </div>
              <div>
                <p className="font-medium">Scroll down and tap "Add to Home Screen"</p>
                <p className="text-white/70 text-xs mt-0.5">
                  Look for the
                  <Plus className="inline h-3 w-3 mx-1" />
                  icon with this label
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 shrink-0">
                <span className="font-bold">3</span>
              </div>
              <div>
                <p className="font-medium">Tap "Add" to confirm</p>
                <p className="text-white/70 text-xs mt-0.5">
                  The app will appear on your Home Screen
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/70">
            <ArrowDown className="h-3 w-3 animate-bounce" />
            <span>Find the Share button at the bottom of Safari</span>
            <ArrowDown className="h-3 w-3 animate-bounce" />
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version that can be shown inline
export function IOSInstallBanner({ className }: { className?: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isIOSDevice() && !isPWAInstalled()) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className={cn(
      "flex items-center gap-2 p-3 rounded-lg",
      "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800",
      className
    )}>
      <Bell className="h-4 w-4 text-amber-500 shrink-0" />
      <div className="flex-1 text-xs text-amber-700 dark:text-amber-400">
        <span className="font-medium">Tip:</span> Add this app to your Home Screen for push notifications.
        Tap <Share className="inline h-3 w-3 mx-0.5" /> then "Add to Home Screen".
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0 text-amber-500 hover:text-amber-600"
        onClick={() => setShow(false)}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
