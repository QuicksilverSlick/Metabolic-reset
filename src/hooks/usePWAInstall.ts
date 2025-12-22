import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export type InstallSource = 'android' | 'ios' | 'desktop';

interface UsePWAInstallReturn {
  /** Whether the app can be installed (prompt available or iOS/Android) */
  canInstall: boolean;
  /** Whether this is a platform that supports PWA install (may need to wait for prompt) */
  isPWACapable: boolean;
  /** Whether the app is already installed (running in standalone mode) */
  isInstalled: boolean;
  /** Whether this is an iOS device (requires manual install instructions) */
  isIOS: boolean;
  /** Whether this is an Android device */
  isAndroid: boolean;
  /** Whether this is a desktop browser */
  isDesktop: boolean;
  /** Whether the native install prompt is available */
  hasNativePrompt: boolean;
  /** The platform type for analytics */
  installSource: InstallSource;
  /** Trigger the native install prompt (Android/Desktop only) */
  promptInstall: () => Promise<boolean>;
}

/**
 * Hook for managing PWA installation
 * Handles both the native beforeinstallprompt (Android/Desktop) and iOS detection
 */
// Store the deferred prompt globally so it persists across re-renders and can be accessed synchronously
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;

export function usePWAInstall(): UsePWAInstallReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
  const [isInstalled, setIsInstalled] = useState(false);

  // Detect platform
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);

  const installSource: InstallSource = isIOS ? 'ios' : isAndroid ? 'android' : 'desktop';

  useEffect(() => {
    // Check if already installed (standalone mode)
    const checkInstalled = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');

      setIsInstalled(isStandalone);
    };

    checkInstalled();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    // Capture the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      globalDeferredPrompt = e;
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }, [deferredPrompt]);

  // Can install if we have a deferred prompt (Android/Desktop) or it's iOS/Android (manual install)
  const hasNativePrompt = deferredPrompt !== null;
  const isDesktop = !isIOS && !isAndroid;
  const canInstall = !isInstalled && (hasNativePrompt || isIOS || isAndroid);

  // isPWACapable means the platform supports PWA install (prompt may come later on desktop/Android)
  // This is true for all platforms except installed state
  const isPWACapable = !isInstalled;

  return {
    canInstall,
    isPWACapable,
    isInstalled,
    isIOS,
    isAndroid,
    isDesktop,
    hasNativePrompt,
    installSource,
    promptInstall,
  };
}
