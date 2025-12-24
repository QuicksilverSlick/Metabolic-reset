/**
 * Push Notification Toggle Component
 * Allows users to enable/disable push notifications
 */

import { Bell, BellOff, Loader2, Smartphone, Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePushNotifications, isIOSDevice, isPWAInstalled } from '@/hooks/use-push-notifications';
import { cn } from '@/lib/utils';

interface PushNotificationToggleProps {
  className?: string;
  showDescription?: boolean;
}

export function PushNotificationToggle({
  className,
  showDescription = true,
}: PushNotificationToggleProps) {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    isIOSWithoutPWA,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  // Handle toggle
  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  // Not supported
  if (!isSupported) {
    return (
      <div className={cn("flex items-center gap-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-800", className)}>
        <BellOff className="h-5 w-5 text-slate-400" />
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">Push notifications not supported</p>
          {showDescription && (
            <p className="text-xs text-slate-400">Your browser doesn't support push notifications</p>
          )}
        </div>
      </div>
    );
  }

  // iOS without PWA installed
  if (isIOSWithoutPWA) {
    return (
      <div className={cn("flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800", className)}>
        <Smartphone className="h-5 w-5 text-amber-500" />
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Add to Home Screen required</p>
          {showDescription && (
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
              On iOS, push notifications only work when the app is added to your Home Screen.
              Tap the share button and select "Add to Home Screen".
            </p>
          )}
        </div>
      </div>
    );
  }

  // Permission denied
  if (permission === 'denied') {
    return (
      <div className={cn("flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800", className)}>
        <BellOff className="h-5 w-5 text-red-500" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">Notifications blocked</p>
          {showDescription && (
            <p className="text-xs text-red-600 dark:text-red-500 mt-1">
              Please enable notifications in your browser settings to receive push notifications.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-between gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50", className)}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-full",
          isSubscribed
            ? "bg-primary/10 text-primary"
            : "bg-slate-200 dark:bg-slate-700 text-slate-500"
        )}>
          {isSubscribed ? (
            <Bell className="h-5 w-5" />
          ) : (
            <BellOff className="h-5 w-5" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <Label htmlFor="push-toggle" className="text-sm font-medium cursor-pointer">
              Push Notifications
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p>Get instant notifications about bug report updates, team changes, and important announcements - even when the app is closed.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {showDescription && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isSubscribed
                ? "You'll receive notifications even when the app is closed"
                : "Enable to get important updates instantly"
              }
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
        <Switch
          id="push-toggle"
          checked={isSubscribed}
          onCheckedChange={handleToggle}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}

// Compact version for header/nav
export function PushNotificationButton({ className }: { className?: string }) {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    isIOSWithoutPWA,
    permission,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  if (!isSupported || isIOSWithoutPWA || permission === 'denied') {
    return null;
  }

  const handleClick = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn("relative h-8 w-8", className)}
            onClick={handleClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSubscribed ? (
              <Bell className="h-4 w-4 text-primary" />
            ) : (
              <BellOff className="h-4 w-4 text-slate-400" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{isSubscribed ? 'Disable push notifications' : 'Enable push notifications'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
