/**
 * Unified Notification Helper
 * Sends both in-app notifications and push notifications together
 * Following 2025 best practices for notification systems
 */

import type { Env } from './core-utils';
import { NotificationEntity, UserEntity } from './entities';
import { sendPushToUser } from './push-utils';
import type { Notification, NotificationType } from '../shared/types';

// Map notification types to categories for user preferences
export const NOTIFICATION_CATEGORIES = {
  // Bug-related notifications
  bug_submitted: 'bugUpdates',
  bug_status_changed: 'bugUpdates',
  bug_response: 'bugUpdates',
  new_bug_report: 'bugUpdates',

  // Team/captain notifications
  captain_reassigned: 'teamChanges',
  new_team_member: 'teamChanges',
  team_member_removed: 'teamChanges',

  // Achievement notifications
  achievement: 'achievements',

  // System notifications
  system_announcement: 'systemAnnouncements',
  admin_impersonation: 'systemAnnouncements',

  // Course notifications (for future)
  course_reminder: 'courseReminders',
} as const;

// Notification priority levels for different treatment
export const NOTIFICATION_PRIORITIES: Record<NotificationType, 'urgent' | 'high' | 'normal' | 'low'> = {
  new_bug_report: 'high',         // Admins need to see bugs quickly
  bug_response: 'high',           // User waiting for response
  bug_submitted: 'normal',        // Confirmation
  bug_status_changed: 'normal',   // Status update
  captain_reassigned: 'normal',   // Team change
  new_team_member: 'normal',      // Team change
  team_member_removed: 'normal',  // Team change
  achievement: 'low',             // Celebration
  system_announcement: 'normal',  // System message
  admin_impersonation: 'low',     // Just informational
};

interface SendNotificationOptions {
  /** URL to open when push notification is clicked */
  pushUrl?: string;
  /** Tag for grouping/replacing notifications */
  pushTag?: string;
  /** Skip sending push (in-app only) */
  skipPush?: boolean;
  /** Additional data to attach to notification */
  data?: Record<string, unknown>;
  /** Override the default priority */
  priority?: 'urgent' | 'high' | 'normal' | 'low';
}

interface SendNotificationResult {
  notification: Notification;
  pushResult?: { sent: number; failed: number };
  pushSkipped?: boolean;
  pushSkipReason?: string;
}

/**
 * Send a notification to a user - both in-app and push
 * This is the main function to use for all notifications
 */
export async function sendNotification(
  env: Env,
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  options: SendNotificationOptions = {}
): Promise<SendNotificationResult> {
  // 1. Create in-app notification (always)
  const notification = await NotificationEntity.createNotification(
    env,
    userId,
    type,
    title,
    message,
    options.data
  );

  console.log(`[Notification] Created in-app notification ${notification.id} for user ${userId}`);

  // 2. Check if push should be skipped
  if (options.skipPush) {
    return { notification, pushSkipped: true, pushSkipReason: 'explicit_skip' };
  }

  // 3. Check user preferences (future: load from user entity)
  // For now, we send push to all users with subscriptions
  // TODO: Add user notification preferences check here

  // 4. Determine priority and URL
  const priority = options.priority || NOTIFICATION_PRIORITIES[type] || 'normal';
  const pushUrl = options.pushUrl || getPushUrlForType(type, options.data);

  // 5. Send push notification
  try {
    const pushResult = await sendPushToUser(env, userId, {
      title,
      body: message,
      url: pushUrl,
      tag: options.pushTag || type,
      data: {
        ...options.data,
        notificationId: notification.id,
        type,
        priority,
      },
    });

    console.log(`[Notification] Push sent to user ${userId}: ${pushResult.sent} success, ${pushResult.failed} failed`);

    return { notification, pushResult };
  } catch (error: any) {
    console.error(`[Notification] Push failed for user ${userId}:`, error.message);
    // Push failure should not block the notification - in-app is already created
    return { notification, pushSkipped: true, pushSkipReason: `push_error: ${error.message}` };
  }
}

/**
 * Send notification to multiple users
 */
export async function sendNotificationToUsers(
  env: Env,
  userIds: string[],
  type: NotificationType,
  title: string,
  message: string,
  options: SendNotificationOptions = {}
): Promise<{ results: SendNotificationResult[] }> {
  const results = await Promise.all(
    userIds.map(userId => sendNotification(env, userId, type, title, message, options))
  );
  return { results };
}

/**
 * Get the appropriate URL to open for different notification types
 */
function getPushUrlForType(type: NotificationType, data?: Record<string, unknown>): string {
  switch (type) {
    case 'bug_submitted':
    case 'bug_status_changed':
    case 'bug_response':
      // Link to the specific bug report
      if (data?.bugId) {
        return `/app/my-bug-reports?bugId=${data.bugId}`;
      }
      return '/app/my-bug-reports';

    case 'new_bug_report':
      // Admin: link to bug management
      if (data?.bugId) {
        return `/app/admin?tab=bugs&bugId=${data.bugId}`;
      }
      return '/app/admin?tab=bugs';

    case 'captain_reassigned':
    case 'new_team_member':
    case 'team_member_removed':
      return '/app/roster';

    case 'achievement':
      return '/app/profile';

    case 'system_announcement':
    case 'admin_impersonation':
    default:
      return '/app';
  }
}

/**
 * Send a system announcement to all users (or a filtered list)
 */
export async function sendSystemAnnouncement(
  env: Env,
  title: string,
  message: string,
  options: {
    userIds?: string[];  // If not provided, sends to all users
    priority?: 'urgent' | 'high' | 'normal' | 'low';
    url?: string;
  } = {}
): Promise<{ sent: number; failed: number }> {
  // Get user IDs to notify
  let userIds = options.userIds;

  if (!userIds || userIds.length === 0) {
    // TODO: Implement getting all active user IDs
    // For now, this requires explicit user IDs
    console.warn('[Notification] sendSystemAnnouncement called without userIds - no notifications sent');
    return { sent: 0, failed: 0 };
  }

  const results = await sendNotificationToUsers(
    env,
    userIds,
    'system_announcement',
    title,
    message,
    {
      pushUrl: options.url || '/app',
      priority: options.priority || 'normal',
    }
  );

  const sent = results.results.filter(r => r.pushResult && r.pushResult.sent > 0).length;
  const failed = results.results.filter(r => r.pushSkipped).length;

  return { sent, failed };
}
