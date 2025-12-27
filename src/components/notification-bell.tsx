/**
 * Mobile-First Notification Bell Component
 * Following 2025 best practices for touch-friendly notifications with deep linking
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Check, CheckCheck, Loader2, UserCog, Trophy, Megaphone,
  Info, Bug, MessageCircle, ThumbsUp, AlertTriangle, ChevronRight,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNotifications, useUnreadNotificationCount, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/use-queries';
import { cn } from '@/lib/utils';
import type { Notification, NotificationType } from '@shared/types';
import { formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns';

// Icon mapping for notification types
const notificationIcons: Record<NotificationType, React.ReactNode> = {
  // Group/leader notifications (new terminology - preferred)
  group_leader_reassigned: <UserCog className="h-5 w-5 text-blue-500" />,
  new_group_member: <UserCog className="h-5 w-5 text-green-500" />,
  group_member_removed: <UserCog className="h-5 w-5 text-orange-500" />,
  // Legacy team/captain notifications (kept for backward compatibility)
  captain_reassigned: <UserCog className="h-5 w-5 text-blue-500" />,
  new_team_member: <UserCog className="h-5 w-5 text-green-500" />,
  team_member_removed: <UserCog className="h-5 w-5 text-orange-500" />,
  // Other notification types
  admin_impersonation: <Info className="h-5 w-5 text-amber-500" />,
  system_announcement: <Megaphone className="h-5 w-5 text-purple-500" />,
  achievement: <Trophy className="h-5 w-5 text-gold-500" />,
  bug_submitted: <Bug className="h-5 w-5 text-green-500" />,
  bug_status_changed: <Bug className="h-5 w-5 text-blue-500" />,
  bug_response: <MessageCircle className="h-5 w-5 text-indigo-500" />,
  new_bug_report: <AlertTriangle className="h-5 w-5 text-red-500" />,
  bug_satisfaction: <ThumbsUp className="h-5 w-5 text-amber-500" />,
  general: <Bell className="h-5 w-5 text-slate-500" />,
};

/**
 * Get the deep link URL for a notification based on its type and data
 */
function getNotificationDeepLink(notification: Notification): string {
  const data = notification.data || {};

  switch (notification.type) {
    // Bug-related notifications
    case 'bug_submitted':
    case 'bug_status_changed':
    case 'bug_response':
    case 'bug_satisfaction':
      // Link to user's bug reports page with specific bug highlighted
      if (data.bugId) {
        return `/app/bugs?bugId=${data.bugId}`;
      }
      return '/app/bugs';

    case 'new_bug_report':
      // Admin notification - link to admin bug panel with specific bug
      if (data.bugId) {
        return `/app/admin?tab=bugs&bugId=${data.bugId}`;
      }
      return '/app/admin?tab=bugs';

    // Group-related notifications (new terminology)
    case 'group_leader_reassigned':
    case 'new_group_member':
    case 'group_member_removed':
    // Legacy team-related notifications (kept for backward compatibility)
    case 'captain_reassigned':
    case 'new_team_member':
    case 'team_member_removed':
      return '/app/roster';

    // Achievement notifications
    case 'achievement':
      return '/app/profile';

    // System announcements and general
    case 'system_announcement':
    case 'admin_impersonation':
    case 'general':
    default:
      return '/app';
  }
}

/**
 * Group notifications by time period
 */
function groupNotificationsByTime(notifications: Notification[]): Record<string, Notification[]> {
  const groups: Record<string, Notification[]> = {
    'Today': [],
    'Yesterday': [],
    'This Week': [],
    'Earlier': [],
  };

  notifications.forEach((notification) => {
    const date = new Date(notification.createdAt);

    if (isToday(date)) {
      groups['Today'].push(notification);
    } else if (isYesterday(date)) {
      groups['Yesterday'].push(notification);
    } else if (isThisWeek(date)) {
      groups['This Week'].push(notification);
    } else {
      groups['Earlier'].push(notification);
    }
  });

  // Remove empty groups
  return Object.fromEntries(
    Object.entries(groups).filter(([_, items]) => items.length > 0)
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onNavigate: (url: string) => void;
}

function NotificationItem({ notification, onMarkRead, onNavigate }: NotificationItemProps) {
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);

  // Touch handlers for swipe-to-mark-read
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startX.current;
    const diffY = Math.abs(currentY - startY.current);

    // Only swipe if horizontal movement is greater than vertical (prevent scroll interference)
    if (Math.abs(diffX) > 10 && Math.abs(diffX) > diffY) {
      setIsSwiping(true);
      // Only allow left swipe, cap at -120px
      setSwipeX(Math.max(Math.min(diffX, 0), -120));
    }
  };

  const handleTouchEnd = () => {
    if (swipeX < -80 && !notification.read) {
      // Threshold reached - mark as read
      onMarkRead(notification.id);
    }
    setSwipeX(0);
    setIsSwiping(false);
  };

  // Handle click/tap to navigate
  const handleClick = () => {
    if (isSwiping) return; // Don't navigate if swiping

    // Mark as read if unread
    if (!notification.read) {
      onMarkRead(notification.id);
    }

    // Navigate to the deep link
    const url = getNotificationDeepLink(notification);
    onNavigate(url);
  };

  const deepLinkUrl = getNotificationDeepLink(notification);
  const hasDeepLink = deepLinkUrl !== '/app';

  return (
    <div className="relative overflow-hidden">
      {/* Swipe action indicator */}
      <div
        className={cn(
          "absolute inset-y-0 right-0 flex items-center justify-end px-4 transition-opacity",
          swipeX < -40 ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700"
        )}
        style={{ width: Math.abs(swipeX) + 'px', opacity: Math.min(1, Math.abs(swipeX) / 80) }}
      >
        <Check className="h-5 w-5 text-white" />
      </div>

      {/* Notification content */}
      <div
        className={cn(
          "flex items-start gap-3 p-4 border-b border-slate-100 dark:border-slate-800",
          "cursor-pointer transition-all duration-200 active:bg-slate-100 dark:active:bg-slate-800",
          "min-h-[72px]", // Ensure minimum touch target height
          !notification.read && "bg-amber-50/70 dark:bg-amber-900/20 border-l-4 border-l-amber-500"
        )}
        style={{ transform: `translateX(${swipeX}px)` }}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="button"
        tabIndex={0}
        aria-label={`${notification.read ? '' : 'Unread: '}${notification.title}. ${notification.message}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
          }
        }}
      >
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 p-2 rounded-lg transition-colors",
          !notification.read
            ? "bg-amber-100 dark:bg-amber-900/40"
            : "bg-slate-100 dark:bg-slate-800"
        )}>
          {notificationIcons[notification.type] || notificationIcons.general}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 py-0.5">
          <div className="flex items-start justify-between gap-2">
            <p className={cn(
              "text-sm leading-tight text-slate-900 dark:text-white",
              !notification.read && "font-semibold"
            )}>
              {notification.title}
            </p>
            {!notification.read && (
              <span className="flex-shrink-0 h-2.5 w-2.5 bg-amber-500 rounded-full mt-1 ring-2 ring-amber-100 dark:ring-amber-900/50" />
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
            {notification.message}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
            </p>
            {hasDeepLink && (
              <span className="flex items-center gap-0.5 text-xs text-blue-500 dark:text-blue-400">
                View <ChevronRight className="h-3 w-3" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const prevUnreadCount = useRef<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  const { data: notificationsData, isLoading, refetch } = useNotifications(30);
  const { data: unreadData } = useUnreadNotificationCount();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const unreadCount = unreadData?.count || 0;
  const notifications = notificationsData?.notifications || [];
  const groupedNotifications = groupNotificationsByTime(notifications);

  // Trigger shake animation when unread count increases
  useEffect(() => {
    if (unreadCount > prevUnreadCount.current && prevUnreadCount.current !== 0) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 1000);
      return () => clearTimeout(timer);
    }
    prevUnreadCount.current = unreadCount;
  }, [unreadCount]);

  // Pull-to-refresh handlers
  const handleScrollTouchStart = useCallback((e: React.TouchEvent) => {
    const container = scrollContainerRef.current;
    if (container && container.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, []);

  const handleScrollTouchMove = useCallback((e: React.TouchEvent) => {
    const container = scrollContainerRef.current;
    if (container && container.scrollTop === 0 && touchStartY.current > 0) {
      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - touchStartY.current);
      // Resistance effect - pull distance diminishes as you pull further
      setPullDistance(Math.min(distance * 0.5, 80));
    }
  }, []);

  const handleScrollTouchEnd = useCallback(async () => {
    if (pullDistance > 60) {
      setIsRefreshing(true);
      await refetch();
      setIsRefreshing(false);
    }
    setPullDistance(0);
    touchStartY.current = 0;
  }, [pullDistance, refetch]);

  const handleMarkRead = (notificationId: string) => {
    markReadMutation.mutate(notificationId);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const handleNavigate = (url: string) => {
    setOpen(false);
    // Small delay to allow popover to close smoothly
    setTimeout(() => {
      navigate(url);
    }, 150);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative h-10 w-10 touch-manipulation", // Larger touch target
            isShaking && "animate-shake"
          )}
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        >
          <Bell className={cn(
            "h-5 w-5 transition-colors",
            unreadCount > 0
              ? "text-amber-500 dark:text-amber-400"
              : "text-slate-600 dark:text-slate-300"
          )} />
          {unreadCount > 0 && (
            <>
              {/* Pulsing ring behind badge */}
              <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 bg-red-500/30 rounded-full animate-ping" />
              {/* Badge with count */}
              <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1.5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-slate-900">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            </>
          )}
        </Button>
      </PopoverTrigger>

      {/* Mobile-first: full width on small screens, fixed width on larger */}
      <PopoverContent
        className="w-[calc(100vw-16px)] sm:w-96 p-0 max-h-[80vh] sm:max-h-[500px] overflow-hidden"
        align="end"
        sideOffset={8}
        role="dialog"
        aria-label="Notifications"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div>
            <h4 className="font-semibold text-base text-slate-900 dark:text-white">
              Notifications
            </h4>
            <span className="sr-only">{unreadCount} unread</span>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isPending}
            >
              {markAllReadMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
              )}
              Mark all read
            </Button>
          )}
        </div>

        {/* Pull-to-refresh indicator */}
        {pullDistance > 0 && (
          <div
            className="flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 transition-all overflow-hidden"
            style={{ height: pullDistance }}
          >
            <RefreshCw
              className={cn(
                "h-5 w-5 text-slate-400 transition-transform",
                pullDistance > 60 && "text-blue-500",
                isRefreshing && "animate-spin"
              )}
              style={{ transform: `rotate(${pullDistance * 3}deg)` }}
            />
          </div>
        )}

        {/* Scrollable notification list */}
        <div
          ref={scrollContainerRef}
          className="overflow-y-auto overscroll-contain scrollbar-hide"
          style={{ maxHeight: 'calc(80vh - 60px)', WebkitOverflowScrolling: 'touch' }}
          onTouchStart={handleScrollTouchStart}
          onTouchMove={handleScrollTouchMove}
          onTouchEnd={handleScrollTouchEnd}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4 mb-4">
                <Bell className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-base font-medium text-slate-900 dark:text-slate-100 mb-1">
                All caught up!
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                We'll notify you when something new happens
              </p>
            </div>
          ) : (
            <>
              {/* Live region for screen readers */}
              <div aria-live="polite" aria-atomic="true" className="sr-only">
                {unreadCount > 0 && `${unreadCount} unread notifications`}
              </div>

              {/* Grouped notifications */}
              {Object.entries(groupedNotifications).map(([group, items]) => (
                <div key={group}>
                  {/* Group header */}
                  <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 sticky top-0">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {group}
                    </span>
                  </div>

                  {/* Notifications in this group */}
                  {items.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={handleMarkRead}
                      onNavigate={handleNavigate}
                    />
                  ))}
                </div>
              ))}

              {/* Bottom padding for better scrolling */}
              <div className="h-4" />
            </>
          )}
        </div>

        {/* Swipe hint for mobile - only show if there are unread notifications */}
        {unreadCount > 0 && notifications.length > 0 && (
          <div className="sm:hidden px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-center text-slate-400 dark:text-slate-500">
              Swipe left on a notification to mark as read
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
