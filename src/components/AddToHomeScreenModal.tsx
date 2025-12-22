import { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePWAInstall, InstallSource } from '@/hooks/usePWAInstall';
import { useUser } from '@/hooks/use-queries';
import { Smartphone, Share, PlusSquare, CheckCircle2 } from 'lucide-react';

// Session storage key for dismissed state
const DISMISSED_KEY = 'pwa-prompt-dismissed';

interface AddToHomeScreenModalProps {
  onPromptShown?: () => void;
  onDismissed?: () => void;
  onInstalled?: (source: InstallSource) => void;
}

export function AddToHomeScreenModal({
  onPromptShown,
  onDismissed,
  onInstalled,
}: AddToHomeScreenModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { data: user } = useUser();
  const { canInstall, isInstalled, isIOS, installSource, promptInstall } = usePWAInstall();

  // Check if user has already installed (from their profile)
  const hasAlreadyInstalled = !!user?.pwaInstalledAt;

  // Check if dismissed this session
  const isDismissedThisSession = sessionStorage.getItem(DISMISSED_KEY) === 'true';

  useEffect(() => {
    // Show modal if:
    // 1. Can install (prompt available or iOS)
    // 2. Not already installed
    // 3. User hasn't already installed according to their profile
    // 4. Not dismissed this session
    if (canInstall && !isInstalled && !hasAlreadyInstalled && !isDismissedThisSession) {
      setIsOpen(true);
      onPromptShown?.();
    }
  }, [canInstall, isInstalled, hasAlreadyInstalled, isDismissedThisSession, onPromptShown]);

  const handleDismiss = useCallback(() => {
    sessionStorage.setItem(DISMISSED_KEY, 'true');
    setIsOpen(false);
    onDismissed?.();
  }, [onDismissed]);

  const handleInstall = useCallback(async () => {
    if (isIOS) {
      // For iOS, we can't trigger install programmatically
      // The user needs to follow the instructions
      // We'll track this as "installed" when they click the button
      // (They indicated intent to install)
      setShowSuccess(true);
      onInstalled?.(installSource);
      setTimeout(() => {
        setIsOpen(false);
      }, 3000);
    } else {
      // For Android/Desktop, trigger the native prompt
      const installed = await promptInstall();
      if (installed) {
        setShowSuccess(true);
        onInstalled?.(installSource);
        setTimeout(() => {
          setIsOpen(false);
        }, 2000);
      }
    }
  }, [isIOS, promptInstall, installSource, onInstalled]);

  // Don't render if conditions aren't met
  if (!canInstall || isInstalled || hasAlreadyInstalled) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="sm:max-w-md bg-navy-900 border-navy-700" aria-describedby="pwa-install-description">
        {showSuccess ? (
          // Success state
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {isIOS ? 'Almost There!' : 'App Installed!'}
            </h3>
            <p className="text-slate-400">
              {isIOS
                ? 'Follow the steps above to complete installation.'
                : 'Metabolic Reset is now on your home screen.'}
            </p>
          </div>
        ) : (
          // Main content
          <>
            <DialogHeader className="text-center sm:text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center mb-4 shadow-lg">
                <Smartphone className="w-8 h-8 text-navy-900" />
              </div>
              <DialogTitle className="text-2xl font-bold text-white">
                Your Reset, One Tap Away
              </DialogTitle>
              <DialogDescription className="text-slate-300 text-base mt-2">
                Searching for bookmarks wastes precious momentum.
              </DialogDescription>
            </DialogHeader>

            <div id="pwa-install-description" className="space-y-4 py-4">
              {/* Value proposition */}
              <p className="text-slate-400 text-center">
                Add Metabolic Reset to your home screen for instant access to your daily habits,
                biometrics, and progress tracking.
              </p>

              {/* Benefits */}
              <div className="bg-navy-800/50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-gold-500" />
                  </div>
                  <p className="text-slate-300 text-sm">
                    <span className="font-medium text-white">Stay consistent.</span> One tap to log
                    your water, steps, and sleep.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-gold-500" />
                  </div>
                  <p className="text-slate-300 text-sm">
                    <span className="font-medium text-white">Stay on track.</span> Never miss a day
                    of your 28-day transformation.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-gold-500" />
                  </div>
                  <p className="text-slate-300 text-sm">
                    <span className="font-medium text-white">Transform your health.</span> Watch
                    your metabolic age drop.
                  </p>
                </div>
              </div>

              {/* iOS-specific instructions */}
              {isIOS && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-sm text-blue-300 font-medium mb-3">
                    To install on your iPhone or iPad:
                  </p>
                  <ol className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">
                        1
                      </span>
                      <span>
                        Tap the{' '}
                        <Share className="inline w-4 h-4 text-blue-400 mx-1" /> Share button
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">
                        2
                      </span>
                      <span>
                        Scroll down and tap{' '}
                        <PlusSquare className="inline w-4 h-4 text-blue-400 mx-1" /> "Add to Home
                        Screen"
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">
                        3
                      </span>
                      <span>Tap "Add" in the top right</span>
                    </li>
                  </ol>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-col gap-2">
              <Button
                onClick={handleInstall}
                className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold"
              >
                {isIOS ? "I'll Add It Now" : 'Add to Home Screen'}
              </Button>
              <Button
                variant="ghost"
                onClick={handleDismiss}
                className="w-full text-slate-400 hover:text-white hover:bg-navy-800"
              >
                Not Now
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
