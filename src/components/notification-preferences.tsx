/**
 * Notification Preferences Component
 * Allows users to control which types of notifications they receive
 * Following 2025 best practices for user control over notifications
 */

import { useState, useEffect } from 'react';
import { Bell, BellOff, Bug, Users, Trophy, Megaphone, BookOpen, Loader2, Smartphone } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePushNotifications, isIOSDevice, isPWAInstalled } from '@/hooks/use-push-notifications';
import { useUser } from '@/hooks/use-queries';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { NotificationPreferences } from '@shared/types';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '@shared/types';

interface NotificationCategoryProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

function NotificationCategory({
  id,
  title,
  description,
  icon,
  enabled,
  onToggle,
  disabled = false,
}: NotificationCategoryProps) {
  return (
    <div className={cn(
      "flex items-center justify-between p-3 sm:p-4 rounded-xl transition-all",
      disabled
        ? "opacity-40 cursor-not-allowed"
        : "hover:bg-slate-50 dark:hover:bg-navy-800/50 cursor-pointer",
      enabled && !disabled && "bg-gold-50/50 dark:bg-gold-900/10"
    )}
    onClick={() => !disabled && onToggle(!enabled)}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn(
          "p-2 sm:p-2.5 rounded-lg shrink-0 transition-colors",
          enabled && !disabled
            ? "bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400"
            : "bg-slate-100 dark:bg-navy-800 text-slate-400 dark:text-slate-500"
        )}>
          {icon}
        </div>
        <div className="min-w-0">
          <Label
            htmlFor={id}
            className={cn(
              "text-sm font-medium block cursor-pointer",
              disabled ? "text-slate-400" : "text-navy-900 dark:text-white"
            )}
          >
            {title}
          </Label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
            {description}
          </p>
        </div>
      </div>
      <Switch
        id={id}
        checked={enabled}
        onCheckedChange={onToggle}
        disabled={disabled}
        className="shrink-0 ml-3"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

export function NotificationPreferencesPanel({ className }: { className?: string }) {
  const { data: user } = useUser();
  const {
    isSupported,
    isSubscribed,
    isLoading: pushLoading,
    isIOSWithoutPWA,
    permission,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  // Load preferences from localStorage (fallback until backend support)
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    const stored = localStorage.getItem('notification_preferences');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_NOTIFICATION_PREFERENCES;
      }
    }
    return user?.notificationPreferences || DEFAULT_NOTIFICATION_PREFERENCES;
  });

  // Sync with user data when it loads
  useEffect(() => {
    if (user?.notificationPreferences) {
      setPreferences(user.notificationPreferences);
    }
  }, [user?.notificationPreferences]);

  // Determine if push notifications are available
  const pushAvailable = isSupported && !isIOSWithoutPWA && permission !== 'denied';

  // Handle master push toggle
  const handleMasterToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      const success = await subscribe();
      if (success) {
        toast.success('Push notifications enabled!');
      }
    }
  };

  // Handle category toggle
  const handleCategoryToggle = (category: keyof Omit<NotificationPreferences, 'pushEnabled'>, enabled: boolean) => {
    const newPrefs = { ...preferences, [category]: enabled };
    setPreferences(newPrefs);
    // Save to localStorage
    localStorage.setItem('notification_preferences', JSON.stringify(newPrefs));
  };

  // iOS PWA required message
  if (isIOSWithoutPWA) {
    return (
      <Card className={cn("border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-lg">
            <Smartphone className="h-5 w-5" />
            Add to Home Screen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-600 dark:text-amber-500">
            On iOS, push notifications require the app to be installed to your Home Screen.
            Tap the <span className="font-medium">share button</span> in Safari and select
            <span className="font-medium"> "Add to Home Screen"</span>.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Permission denied message
  if (permission === 'denied') {
    return (
      <Card className={cn("border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400 text-lg">
            <BellOff className="h-5 w-5" />
            Notifications Blocked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600 dark:text-red-500">
            Notifications are blocked in your browser. To enable them, click the lock icon
            in your address bar and allow notifications for this site.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Not supported
  if (!isSupported) {
    return (
      <Card className={cn("border-slate-200 dark:border-navy-800", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-slate-500 text-lg">
            <BellOff className="h-5 w-5" />
            Notifications Not Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            Your browser doesn't support push notifications.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 transition-colors",
      className
    )}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-navy-900 dark:text-white text-lg sm:text-xl">
          <Bell className="h-5 w-5 text-gold-500" />
          Notification Settings
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400">
          Choose how you want to be notified about updates
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Master Push Toggle - Prominent */}
        <div
          className={cn(
            "flex items-center justify-between p-4 sm:p-5 rounded-xl transition-all cursor-pointer",
            isSubscribed
              ? "bg-gradient-to-r from-gold-50 to-amber-50 dark:from-gold-900/20 dark:to-amber-900/20 border-2 border-gold-200 dark:border-gold-800"
              : "bg-slate-100 dark:bg-navy-800 border-2 border-transparent hover:border-slate-200 dark:hover:border-navy-700"
          )}
          onClick={handleMasterToggle}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={cn(
              "p-3 rounded-xl transition-colors",
              isSubscribed
                ? "bg-gold-100 dark:bg-gold-900/40 text-gold-600 dark:text-gold-400"
                : "bg-slate-200 dark:bg-navy-700 text-slate-500"
            )}>
              {isSubscribed ? (
                <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <BellOff className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </div>
            <div>
              <Label
                htmlFor="master-push"
                className="text-base sm:text-lg font-semibold cursor-pointer text-navy-900 dark:text-white"
              >
                Push Notifications
              </Label>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {isSubscribed
                  ? "You'll receive updates even when the app is closed"
                  : "Enable to get instant updates on your device"
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {pushLoading && <Loader2 className="h-4 w-4 animate-spin text-gold-500" />}
            <Switch
              id="master-push"
              checked={isSubscribed}
              onCheckedChange={handleMasterToggle}
              disabled={pushLoading}
              className="data-[state=checked]:bg-gold-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        {/* Category Toggles - Only show when push is enabled */}
        {isSubscribed && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
              Notification Types
            </h4>

            <div className="grid grid-cols-1 gap-1">
              <NotificationCategory
                id="bugUpdates"
                title="Bug Reports"
                description="Updates on your submitted bug reports"
                icon={<Bug className="h-4 w-4" />}
                enabled={preferences.bugUpdates}
                onToggle={(enabled) => handleCategoryToggle('bugUpdates', enabled)}
              />

              <NotificationCategory
                id="teamChanges"
                title="Team Updates"
                description="Team assignments and member changes"
                icon={<Users className="h-4 w-4" />}
                enabled={preferences.teamChanges}
                onToggle={(enabled) => handleCategoryToggle('teamChanges', enabled)}
              />

              <NotificationCategory
                id="achievements"
                title="Achievements"
                description="Celebrate milestones and progress"
                icon={<Trophy className="h-4 w-4" />}
                enabled={preferences.achievements}
                onToggle={(enabled) => handleCategoryToggle('achievements', enabled)}
              />

              <NotificationCategory
                id="systemAnnouncements"
                title="Announcements"
                description="Important platform updates"
                icon={<Megaphone className="h-4 w-4" />}
                enabled={preferences.systemAnnouncements}
                onToggle={(enabled) => handleCategoryToggle('systemAnnouncements', enabled)}
              />

              <NotificationCategory
                id="courseReminders"
                title="Daily Reminders"
                description="Reminders for lessons and habits"
                icon={<BookOpen className="h-4 w-4" />}
                enabled={preferences.courseReminders}
                onToggle={(enabled) => handleCategoryToggle('courseReminders', enabled)}
              />
            </div>
          </div>
        )}

        {/* Hint when disabled */}
        {!isSubscribed && (
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-2">
            Enable push notifications to customize what updates you receive
          </p>
        )}
      </CardContent>
    </Card>
  );
}
