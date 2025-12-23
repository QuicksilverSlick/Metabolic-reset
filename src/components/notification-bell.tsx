import { useState } from 'react';
import { Bell, Check, CheckCheck, Loader2, UserCog, Trophy, Megaphone, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, useUnreadNotificationCount, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/use-queries';
import { cn } from '@/lib/utils';
import type { Notification, NotificationType } from '@shared/types';
import { formatDistanceToNow } from 'date-fns';

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  captain_reassigned: <UserCog className="h-4 w-4 text-blue-500" />,
  new_team_member: <UserCog className="h-4 w-4 text-green-500" />,
  team_member_removed: <UserCog className="h-4 w-4 text-orange-500" />,
  admin_impersonation: <Info className="h-4 w-4 text-amber-500" />,
  system_announcement: <Megaphone className="h-4 w-4 text-purple-500" />,
  achievement: <Trophy className="h-4 w-4 text-gold-500" />,
  general: <Bell className="h-4 w-4 text-slate-500" />,
};

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors',
        !notification.read && 'bg-amber-50/50 dark:bg-amber-900/10'
      )}
      onClick={() => !notification.read && onMarkRead(notification.id)}
    >
      <div className="flex-shrink-0 mt-0.5">
        {notificationIcons[notification.type] || notificationIcons.general}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm', !notification.read && 'font-medium')}>
            {notification.title}
          </p>
          {!notification.read && (
            <span className="flex-shrink-0 h-2 w-2 bg-amber-500 rounded-full mt-1.5" />
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: notificationsData, isLoading } = useNotifications(20);
  const { data: unreadData } = useUnreadNotificationCount();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const unreadCount = unreadData?.count || 0;
  const notifications = notificationsData?.notifications || [];

  const handleMarkRead = (notificationId: string) => {
    markReadMutation.mutate(notificationId);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8"
        >
          <Bell className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-700">
          <h4 className="font-medium text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isPending}
            >
              {markAllReadMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <CheckCheck className="h-3 w-3 mr-1" />
              )}
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <Bell className="h-8 w-8 mb-2" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
              />
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
