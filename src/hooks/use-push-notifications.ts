/**
 * Push Notification Hook
 * Manages web push subscription state and provides methods to subscribe/unsubscribe
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { pushApi } from '@/lib/api';
import { toast } from 'sonner';

// Check if push notifications are supported
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator &&
         'PushManager' in window &&
         'Notification' in window;
}

// Check if we're on iOS and need special handling
export function isIOSDevice(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

// Check if the PWA is installed (for iOS push requirement)
export function isPWAInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}

// Get current notification permission
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  permission: NotificationPermission | 'unsupported';
  isIOSWithoutPWA: boolean;
  subscriptionCount: number;
  error: string | null;
}

interface PushNotificationActions {
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  requestPermission: () => Promise<NotificationPermission>;
  checkStatus: () => Promise<void>;
}

export function usePushNotifications(): PushNotificationState & PushNotificationActions {
  const userId = useAuthStore(s => s.userId);

  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: true,
    permission: 'unsupported',
    isIOSWithoutPWA: false,
    subscriptionCount: 0,
    error: null,
  });

  // Check if push is supported and current status on mount
  useEffect(() => {
    const init = async () => {
      const supported = isPushSupported();
      const permission = getNotificationPermission();
      const iosWithoutPWA = isIOSDevice() && !isPWAInstalled();

      setState(prev => ({
        ...prev,
        isSupported: supported,
        permission,
        isIOSWithoutPWA: iosWithoutPWA,
        isLoading: false,
      }));

      // Check subscription status if user is logged in
      if (userId && supported) {
        await checkStatusInternal();
      }
    };

    init();
  }, [userId]);

  // Internal function to check subscription status
  const checkStatusInternal = useCallback(async () => {
    if (!userId) return;

    try {
      const status = await pushApi.getStatus(userId);
      setState(prev => ({
        ...prev,
        isSubscribed: status.subscribed,
        subscriptionCount: status.subscriptionCount,
      }));
    } catch (error) {
      console.error('[Push] Error checking status:', error);
    }
  }, [userId]);

  // Public check status method
  const checkStatus = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    await checkStatusInternal();
    setState(prev => ({ ...prev, isLoading: false }));
  }, [checkStatusInternal]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    setState(prev => ({ ...prev, permission }));
    return permission;
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!userId) {
      toast.error('Please log in to enable notifications');
      return false;
    }

    if (!isPushSupported()) {
      toast.error('Push notifications are not supported in your browser');
      return false;
    }

    // Check iOS PWA requirement
    if (isIOSDevice() && !isPWAInstalled()) {
      toast.error('On iOS, please add this app to your Home Screen first to enable push notifications');
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Request permission if not already granted
      const permission = await requestPermission();
      if (permission !== 'granted') {
        setState(prev => ({ ...prev, isLoading: false }));
        toast.error('Notification permission denied');
        return false;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Get VAPID public key from server
      const { publicKey } = await pushApi.getVapidKey();

      // Convert base64 to Uint8Array for applicationServerKey
      const applicationServerKey = urlBase64ToUint8Array(publicKey);

      // Subscribe to push manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // Send subscription to server
      const subscriptionJSON = subscription.toJSON();
      await pushApi.subscribe(userId, subscriptionJSON, navigator.userAgent);

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        subscriptionCount: prev.subscriptionCount + 1,
        isLoading: false,
      }));

      toast.success('Push notifications enabled!');
      return true;
    } catch (error: any) {
      console.error('[Push] Subscribe error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      toast.error(`Failed to enable notifications: ${error.message}`);
      return false;
    }
  }, [userId, requestPermission]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get current subscription from service worker
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push manager
        await subscription.unsubscribe();

        // Remove from server
        await pushApi.unsubscribe(userId, subscription.endpoint);
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        subscriptionCount: Math.max(0, prev.subscriptionCount - 1),
        isLoading: false,
      }));

      toast.success('Push notifications disabled');
      return true;
    } catch (error: any) {
      console.error('[Push] Unsubscribe error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      toast.error(`Failed to disable notifications: ${error.message}`);
      return false;
    }
  }, [userId]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    requestPermission,
    checkStatus,
  };
}

// Helper: Convert base64 URL to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
