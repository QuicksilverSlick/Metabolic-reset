/**
 * Smart Push Permission Prompt Component
 * Asks for push notification permission at contextually appropriate moments
 * Following 2025 best practices: Don't ask immediately, explain the value first
 */

import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, MessageCircle, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePushNotifications, isPWAInstalled, isIOSDevice } from '@/hooks/use-push-notifications';
import { cn } from '@/lib/utils';

// Storage keys for tracking prompt state
const STORAGE_KEYS = {
  DISMISSED_AT: 'push_prompt_dismissed_at',
  TRIGGER_COUNT: 'push_prompt_trigger_count',
  SHOWN_CONTEXTS: 'push_prompt_shown_contexts',
};

// How long to wait before showing again after dismissal (7 days)
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

// Contexts that can trigger the prompt
export type PromptContext =
  | 'first_habit_complete'
  | 'first_biometric'
  | 'bug_submitted'
  | 'seven_days_active'
  | 'manual'; // User clicked "enable notifications" somewhere

interface PushPermissionPromptProps {
  /** The context that triggered this prompt */
  context: PromptContext;
  /** Whether the prompt should be shown (controlled externally) */
  open?: boolean;
  /** Callback when user responds to prompt */
  onOpenChange?: (open: boolean) => void;
  /** Called when user enables notifications successfully */
  onEnabled?: () => void;
  /** Called when user dismisses the prompt */
  onDismissed?: () => void;
}

// Contextual messages for different trigger points
const CONTEXT_MESSAGES: Record<PromptContext, { title: string; description: string }> = {
  first_habit_complete: {
    title: "Great progress! 🎉",
    description: "Want to stay on track? Enable notifications to get daily reminders and celebrate your achievements.",
  },
  first_biometric: {
    title: "Tracking your journey",
    description: "Get notified when it's time to log your next weigh-in and receive updates on your progress.",
  },
  bug_submitted: {
    title: "We'll look into it",
    description: "Enable notifications to know when an admin responds to your bug report.",
  },
  seven_days_active: {
    title: "You're on a roll! 🔥",
    description: "7 days strong! Enable notifications to keep the momentum going and never miss a check-in.",
  },
  manual: {
    title: "Stay in the loop",
    description: "Get instant updates about your progress, team changes, and important announcements.",
  },
};

// Benefits to show in the prompt
const BENEFITS = [
  { icon: <CheckCircle className="h-4 w-4 text-green-500" />, text: "Daily habit reminders" },
  { icon: <MessageCircle className="h-4 w-4 text-blue-500" />, text: "Bug report responses" },
  { icon: <Users className="h-4 w-4 text-purple-500" />, text: "Team updates" },
  { icon: <Sparkles className="h-4 w-4 text-amber-500" />, text: "Achievement celebrations" },
];

/**
 * Check if we should show the push prompt based on context and history
 */
export function shouldShowPushPrompt(context: PromptContext): boolean {
  // Check if push is even supported
  if (!('Notification' in window)) return false;

  // Already granted or denied
  if (Notification.permission !== 'default') return false;

  // iOS without PWA - can't do push
  if (isIOSDevice() && !isPWAInstalled()) return false;

  // Check dismiss cooldown
  const dismissedAt = localStorage.getItem(STORAGE_KEYS.DISMISSED_AT);
  if (dismissedAt) {
    const dismissedTime = parseInt(dismissedAt, 10);
    if (Date.now() - dismissedTime < DISMISS_COOLDOWN_MS) {
      return false;
    }
  }

  // Check if this context was already shown (only show each context once)
  const shownContexts = JSON.parse(localStorage.getItem(STORAGE_KEYS.SHOWN_CONTEXTS) || '[]');
  if (shownContexts.includes(context) && context !== 'manual') {
    return false;
  }

  return true;
}

/**
 * Mark a context as shown
 */
function markContextShown(context: PromptContext): void {
  const shownContexts = JSON.parse(localStorage.getItem(STORAGE_KEYS.SHOWN_CONTEXTS) || '[]');
  if (!shownContexts.includes(context)) {
    shownContexts.push(context);
    localStorage.setItem(STORAGE_KEYS.SHOWN_CONTEXTS, JSON.stringify(shownContexts));
  }
}

export function PushPermissionPrompt({
  context,
  open: controlledOpen,
  onOpenChange,
  onEnabled,
  onDismissed,
}: PushPermissionPromptProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { subscribe, isLoading } = usePushNotifications();

  // Use controlled or internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  // Auto-show based on context when mounted
  useEffect(() => {
    if (controlledOpen === undefined && shouldShowPushPrompt(context)) {
      // Small delay to not interrupt user flow
      const timer = setTimeout(() => {
        setInternalOpen(true);
        markContextShown(context);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [context, controlledOpen]);

  const handleEnable = async () => {
    const success = await subscribe();
    if (success) {
      setIsOpen(false);
      onEnabled?.();
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEYS.DISMISSED_AT, Date.now().toString());
    setIsOpen(false);
    onDismissed?.();
  };

  const message = CONTEXT_MESSAGES[context];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Bell className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center">{message.title}</DialogTitle>
          <DialogDescription className="text-center">
            {message.description}
          </DialogDescription>
        </DialogHeader>

        {/* Benefits list */}
        <div className="grid grid-cols-2 gap-2 py-4">
          {BENEFITS.map((benefit, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800"
            >
              {benefit.icon}
              <span className="text-xs text-slate-600 dark:text-slate-300">
                {benefit.text}
              </span>
            </div>
          ))}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleEnable}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Enabling...' : 'Enable Notifications'}
          </Button>
          <Button
            variant="ghost"
            onClick={handleDismiss}
            className="w-full text-slate-500"
          >
            Not now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to trigger push permission prompt at the right moment
 */
export function usePushPermissionPrompt() {
  const [promptContext, setPromptContext] = useState<PromptContext | null>(null);

  const triggerPrompt = (context: PromptContext) => {
    if (shouldShowPushPrompt(context)) {
      setPromptContext(context);
    }
  };

  const closePrompt = () => {
    setPromptContext(null);
  };

  return {
    promptContext,
    triggerPrompt,
    closePrompt,
    shouldShow: promptContext !== null,
  };
}
