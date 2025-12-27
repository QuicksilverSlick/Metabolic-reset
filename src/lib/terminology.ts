/**
 * Centralized terminology configuration for the Metabolic Reset Project
 *
 * This file provides consistent display names and text mappings for UI elements.
 * Use these constants to ensure terminology consistency across the application.
 */

import type { CohortType } from '@shared/types';

// Re-export the helper functions from shared/types for convenience
export {
  getRoleDisplayName,
  getCohortDisplayName,
  normalizeRole,
  isGroupLeader,
  isParticipant,
  normalizeTransactionType,
  normalizeNotificationType,
} from '@shared/types';

// UI text replacements - use these for consistent terminology
export const UI_TEXT = {
  // Navigation and headers
  groupRoster: 'Group Roster',
  groupManagement: 'Group Management',

  // Role-related
  groupFacilitator: 'Group Facilitator',
  participant: 'Participant',
  groupLeader: 'Group Leader',

  // Structure
  group: 'Group',
  groupSize: 'Group Size',
  groupMember: 'Group Member',

  // Program
  project: 'Project',
  metabolicResetProject: 'Metabolic Reset Project',

  // Rewards
  awards: 'Awards',
  activityLeaders: 'Activity Leaders',
  metabolicMakeoverMasters: 'Metabolic Makeover Masters',

  // Actions
  referring: 'Referring',
  referParticipants: 'Refer Participants',

  // Biometrics
  weeklyMetabolicUpdate: 'Weekly Metabolic Update',
  metabolicAssessment: 'Metabolic Assessment',

  // Protocol
  protocolA: 'Protocol A',
  protocolB: 'Protocol B',
  protocolC: 'Protocol C (Switchers)',
} as const;

// Notification type display names
export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  // New terminology
  group_leader_reassigned: 'Group Leader Changed',
  new_group_member: 'New Group Member',
  group_member_removed: 'Group Member Removed',
  // Legacy terminology (mapped to new labels)
  captain_reassigned: 'Group Leader Changed',
  new_team_member: 'New Group Member',
  team_member_removed: 'Group Member Removed',
  // Other types
  admin_impersonation: 'Admin Access',
  system_announcement: 'System Announcement',
  achievement: 'Achievement',
  bug_submitted: 'Bug Report Submitted',
  bug_status_changed: 'Bug Status Updated',
  bug_response: 'Bug Report Response',
  new_bug_report: 'New Bug Report',
  new_support_request: 'New Support Request',
  bug_satisfaction: 'Feedback Request',
  general: 'Notification',
};

// Helper to format the biometrics page header
export function getWeeklyMetabolicUpdateTitle(weekNumber: number): string {
  return `${UI_TEXT.weeklyMetabolicUpdate} - Week ${weekNumber}`;
}

// Helper to format group member count
export function formatGroupSize(count: number): string {
  return `${count} ${count === 1 ? 'member' : 'members'}`;
}
