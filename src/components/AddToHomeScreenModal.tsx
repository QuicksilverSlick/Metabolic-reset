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
import { Smartphone, Share, PlusSquare, CheckCircle2, MoreVertical, HelpCircle, ChevronUp, Loader2 } from 'lucide-react';

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
  const [showHelp, setShowHelp] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const { data: user } = useUser();
  const { canInstall, isPWACapable, isInstalled, isIOS, isAndroid, isDesktop, hasNativePrompt, installSource, promptInstall } = usePWAInstall();

  // Check if user has already installed (from their profile)
  const hasAlreadyInstalled = !!user?.pwaInstalledAt;

  // Check if dismissed this session
  const isDismissedThisSession = sessionStorage.getItem(DISMISSED_KEY) === 'true';

  // TODO: REMOVE THIS - Testing mode to force show the modal
  const TEST_MODE = false;

  // Delay showing modal to meet Chrome's 30-second engagement requirement
  // This ensures the beforeinstallprompt event has time to fire
  const SHOW_DELAY_MS = 35000; // 35 seconds to give buffer beyond Chrome's 30s requirement

  useEffect(() => {
    // Don't show if already installed or dismissed
    if (isInstalled || hasAlreadyInstalled || isDismissedThisSession) {
      return;
    }

    // For TEST_MODE, show immediately
    if (TEST_MODE) {
      setIsOpen(true);
      onPromptShown?.();
      return;
    }

    // Wait for engagement time before showing (Chrome requires ~30 seconds)
    const timer = setTimeout(() => {
      // Re-check conditions after delay - use isPWACapable to show on all platforms
      if (isPWACapable && !isInstalled && !hasAlreadyInstalled) {
        setIsOpen(true);
        onPromptShown?.();
      }
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isPWACapable, isInstalled, hasAlreadyInstalled, isDismissedThisSession, onPromptShown]);

  const handleDismiss = useCallback(() => {
    sessionStorage.setItem(DISMISSED_KEY, 'true');
    setIsOpen(false);
    onDismissed?.();
  }, [onDismissed]);

  const handleInstall = useCallback(async () => {
    setIsInstalling(true);

    // Try the native install prompt first
    const installed = await promptInstall();

    setIsInstalling(false);

    if (installed) {
      setShowSuccess(true);
      onInstalled?.(installSource);
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    } else {
      // Native prompt not available or was dismissed - show help instructions
      // This happens when:
      // 1. User hasn't been on site for 30+ seconds (Chrome's engagement heuristic)
      // 2. User dismissed the native prompt
      // 3. Browser doesn't support beforeinstallprompt
      setShowHelp(true);
    }
  }, [promptInstall, installSource, onInstalled]);

  const handleHelpInstallConfirm = useCallback(() => {
    // User says they'll follow the manual instructions
    setShowSuccess(true);
    onInstalled?.(installSource);
    setTimeout(() => {
      setIsOpen(false);
    }, 3000);
  }, [installSource, onInstalled]);

  // Don't render if conditions aren't met
  // Use isPWACapable instead of canInstall to allow rendering on desktop before beforeinstallprompt fires
  if (!isPWACapable || isInstalled || hasAlreadyInstalled) {
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
              {showHelp ? 'Almost There!' : 'App Installed!'}
            </h3>
            <p className="text-slate-400">
              {showHelp
                ? 'Follow the instructions to complete installation.'
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

              {/* Help Instructions (collapsible) */}
              {showHelp && (
                <div className="space-y-3">
                  {/* Explanation note */}
                  <p className="text-sm text-slate-400 text-center italic">
                    Follow these quick steps to add the app to your home screen:
                  </p>

                  {/* iOS instructions */}
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
                            <Share className="inline w-4 h-4 text-blue-400 mx-1" /> Share button at the bottom
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">
                            2
                          </span>
                          <span>
                            Scroll down and tap{' '}
                            <PlusSquare className="inline w-4 h-4 text-blue-400 mx-1" /> "Add to Home Screen"
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

                  {/* Android instructions */}
                  {isAndroid && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <p className="text-sm text-green-300 font-medium mb-3">
                        To install on your Android device:
                      </p>
                      <ol className="space-y-2 text-sm text-slate-300">
                        <li className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-xs font-bold text-green-400">
                            1
                          </span>
                          <span>
                            Tap the{' '}
                            <MoreVertical className="inline w-4 h-4 text-green-400 mx-1" /> menu (3 dots) in your browser
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-xs font-bold text-green-400">
                            2
                          </span>
                          <span>
                            Tap{' '}
                            <PlusSquare className="inline w-4 h-4 text-green-400 mx-1" /> "Add to Home screen" or "Install app"
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-xs font-bold text-green-400">
                            3
                          </span>
                          <span>Tap "Add" or "Install" to confirm</span>
                        </li>
                      </ol>
                    </div>
                  )}

                  {/* Desktop instructions */}
                  {isDesktop && (
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                      <p className="text-sm text-purple-300 font-medium mb-3">
                        To install on your computer:
                      </p>
                      <ol className="space-y-2 text-sm text-slate-300">
                        <li className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-400">
                            1
                          </span>
                          <span>Look for the install icon in your browser's address bar</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-400">
                            2
                          </span>
                          <span>Click "Install" when prompted</span>
                        </li>
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-col gap-2">
              {!showHelp ? (
                <>
                  <Button
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold disabled:opacity-70"
                  >
                    {isInstalling ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Installing...
                      </>
                    ) : (
                      'Add to Home Screen'
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowHelp(true)}
                    className="w-full text-slate-400 hover:text-white hover:bg-navy-800"
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Show Me How
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleDismiss}
                    className="w-full text-slate-500 hover:text-slate-300 hover:bg-transparent text-sm"
                  >
                    Not Now
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleHelpInstallConfirm}
                    className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold"
                  >
                    I'll Add It Now
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowHelp(false)}
                    className="w-full text-slate-400 hover:text-white hover:bg-navy-800"
                  >
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Hide Instructions
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleDismiss}
                    className="w-full text-slate-500 hover:text-slate-300 hover:bg-transparent text-sm"
                  >
                    Not Now
                  </Button>
                </>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
