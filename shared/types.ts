export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// UserRole - supports both legacy and new terminology for backward compatibility
// Legacy: 'challenger' | 'coach' - will be normalized to new values on read
// New: 'participant' | 'facilitator' - preferred values going forward
export type UserRole = 'challenger' | 'coach' | 'participant' | 'facilitator';

// Helper function to normalize role to new terminology
// Use this when comparing roles to ensure backward compatibility
export function normalizeRole(role: UserRole | string): 'participant' | 'facilitator' {
  if (role === 'challenger' || role === 'participant') return 'participant';
  if (role === 'coach' || role === 'facilitator') return 'facilitator';
  return 'participant'; // Default fallback
}

// Helper function to check if user is a group leader (facilitator/coach)
export function isGroupLeader(role: UserRole | string): boolean {
  return normalizeRole(role) === 'facilitator';
}

// Helper function to check if user is a participant (challenger)
export function isParticipant(role: UserRole | string): boolean {
  return normalizeRole(role) === 'participant';
}

// Get display name for role (user-facing text)
export function getRoleDisplayName(role: UserRole | string): string {
  if (isGroupLeader(role)) return 'Group Facilitator';
  return 'Participant';
}

// Cohort types for onboarding
// GROUP_A: Clinical Protocol, GROUP_B: Self-Directed, GROUP_C: Protocol Switchers (B→A)
export type CohortType = 'GROUP_A' | 'GROUP_B' | 'GROUP_C';

// Get display name for cohort (user-facing text)
export function getCohortDisplayName(cohort: CohortType | null | undefined): string {
  switch (cohort) {
    case 'GROUP_A': return 'Protocol A';
    case 'GROUP_B': return 'Protocol B';
    case 'GROUP_C': return 'Protocol C (Switcher)';
    default: return 'Not Selected';
  }
}

// Reset Project status values
export type ProjectStatus = 'draft' | 'upcoming' | 'active' | 'completed';

// Reset Project entity - represents a 28-day metabolic reset project
export interface ResetProject {
  id: string;
  name: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD (28 days after start)
  status: ProjectStatus;
  registrationOpen: boolean;
  createdAt: number;
  updatedAt: number;
}

// Project Enrollment - tracks user participation in projects
export interface ProjectEnrollment {
  id: string; // Format: projectId:userId
  projectId: string;
  userId: string;
  role: UserRole;
  groupLeaderId: string | null; // Their group leader for this project
  points: number; // Points earned in this project
  enrolledAt: number;
  isGroupLeaderEnrolled: boolean; // If role=facilitator, did they pay for this project?
  // Cohort onboarding fields
  cohortId: CohortType | null; // GROUP_A (Protocol), GROUP_B (DIY), or GROUP_C (Switchers)
  onboardingComplete: boolean; // Has completed full onboarding flow
  hasKit: boolean; // Group A only - do they have the nutrition kit
  kitOrderClicked: boolean; // Clicked "order kit" link
  kitOrderClickedAt: number | null; // Timestamp when they clicked order
  onboardingCompletedAt: number | null; // Timestamp when onboarding finished
}
export interface User {
  id: string;
  phone: string;
  email: string;
  name: string;
  role: UserRole;
  captainId: string | null; // @deprecated - use ProjectEnrollment.groupLeaderId for project-specific
  referralCode: string;
  timezone: string;
  points: number; // Legacy total - use ProjectEnrollment.points for project-specific
  currentProjectId: string | null; // Current active project
  createdAt: number; // Unix timestamp
  isActive: boolean;
  hasScale: boolean;
  isAdmin?: boolean; // Admin flag for system administrators
  isTestMode?: boolean; // Test mode - allows viewing content like an admin without admin privileges
  stripeCustomerId?: string;
  avatarUrl?: string; // User profile photo URL
  cartLink?: string; // Group Facilitator's personal cart link for kit orders (facilitators only)
  deletedAt?: number; // Unix timestamp for soft delete (30-day recovery window)
  deletedBy?: string; // Admin user ID who performed the deletion
  mergedInto?: string; // User ID this account was merged into (for duplicate resolution)
  couponCodeUsed?: string; // Coupon code used during registration (if any)
  // PWA Install Analytics
  pwaPromptShownAt?: number; // Timestamp when install prompt was first shown
  pwaPromptDismissedAt?: number; // Timestamp when user dismissed the prompt
  pwaInstalledAt?: number; // Timestamp when user installed the PWA
  pwaInstallSource?: 'android' | 'ios' | 'desktop'; // Platform where installed
  // Stripe Payment Tracking - Source of truth for payment verification
  stripePaymentId?: string; // Stripe PaymentIntent ID (pi_xxx)
  stripePaymentAmount?: number; // Amount paid in cents (e.g., 2800 = $28.00)
  stripePaymentStatus?: 'succeeded' | 'pending' | 'failed'; // Payment status
  stripePaymentAt?: number; // Unix timestamp when payment was confirmed
  // Notification Preferences
  notificationPreferences?: NotificationPreferences;
}

// User notification preferences for controlling what notifications they receive
export interface NotificationPreferences {
  // Master push notification toggle
  pushEnabled: boolean;
  // Per-category preferences (all default to true)
  bugUpdates: boolean;        // bug_submitted, bug_status_changed, bug_response
  teamChanges: boolean;       // group_leader_reassigned, new_group_member, group_member_removed (legacy: captain_reassigned, new_team_member, team_member_removed)
  achievements: boolean;      // achievement, points milestones
  systemAnnouncements: boolean; // system_announcement
  courseReminders: boolean;   // daily lesson reminders (future)
}

// Default notification preferences for new users
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  pushEnabled: true,
  bugUpdates: true,
  teamChanges: true,
  achievements: true,
  systemAnnouncements: true,
  courseReminders: true,
};

// Coupon Usage - tracks who used which coupon codes
export interface CouponUsage {
  id: string;
  couponCode: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  projectId: string | null;
  usedAt: number;
}

export interface DailyScore {
  id: string; // Format: projectId:userId:YYYY-MM-DD
  projectId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  habits: {
    water: boolean;
    steps: boolean;
    sleep: boolean;
    lesson: boolean;
  };
  totalPoints: number;
  updatedAt: number;
}
export interface WeeklyBiometric {
  id: string; // Format: projectId:userId:weekN
  projectId: string;
  userId: string;
  weekNumber: number; // 0 = Initial, 1-4 = weekly, relative to project start
  weight: number;
  bodyFat: number;
  visceralFat: number;
  leanMass: number;
  metabolicAge: number;
  screenshotUrl: string;
  pointsAwarded: number;
  submittedAt: number;
  cohortId?: CohortType | null; // Snapshot of cohort at submission time
}
export interface ReferralLedger {
  id: string;
  projectId: string;
  recruiterId: string;
  newRecruitId: string;
  pointsAmount: number;
  createdAt: number;
}
export interface SystemStats {
  totalParticipants: number;
  totalBiometricSubmissions: number;
  totalHabitsLogged: number;
}

// System Settings - admin-configurable values
export interface SystemSettings {
  id: string; // "global"
  groupAVideoUrl: string; // Orientation video URL for Group A (Protocol)
  groupBVideoUrl: string; // Orientation video URL for Group B (DIY)
  kitOrderUrl: string; // URL to order the nutrition kit (fallback if no coach link)
  scaleOrderUrl: string; // URL to order a smart scale (e.g., Amazon link)
  fallbackPhone: string; // Fallback phone number if facilitator has no cart link (e.g., "5039741671")
  // Configurable point values - new terminology (preferred)
  referralPointsFacilitator?: number; // Points for facilitator when they refer someone (default: 1)
  referralPointsParticipant?: number; // Points for participant when they refer someone (default: 5)
  // Legacy field names (for backward compatibility - synced with new fields)
  referralPointsCoach: number; // @deprecated - use referralPointsFacilitator
  referralPointsChallenger: number; // @deprecated - use referralPointsParticipant
  dailyHabitPoints: number; // Points per daily habit completed (default: 1)
  biometricSubmissionPoints: number; // Points for biometric submission (default: 25)
  // System Announcement Banner
  announcementEnabled?: boolean; // Whether the announcement banner is shown
  announcementTitle?: string; // Short title like "Test Mode" or "Maintenance"
  announcementMessage?: string; // Main message content
  announcementVideoUrl?: string; // Optional video URL (Google Drive direct link)
  announcementType?: 'info' | 'warning' | 'success'; // Banner style
}
// DTOs
export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  referralCodeUsed?: string; // The code they entered to join
  isCaptain?: boolean; // @deprecated - use isGroupLeader; If they want to be their own group leader
  isGroupLeader?: boolean; // If they want to be their own group leader (facilitator)
  timezone?: string;
  hasScale?: boolean;
  projectId?: string; // Specific project to join (from referral link)
}
export interface ScoreSubmitRequest {
  date: string; // YYYY-MM-DD
  habits: {
    water?: boolean;
    steps?: boolean;
    sleep?: boolean;
    lesson?: boolean;
  };
  projectId?: string; // Optional project context
}
export interface BiometricSubmitRequest {
  weekNumber: number;
  weight: number;
  bodyFat: number;
  visceralFat: number;
  leanMass: number;
  metabolicAge: number;
  screenshotUrl: string;
  projectId?: string; // Optional project context
}

// Login request for returning users
export interface LoginRequest {
  email: string;
  phone: string;
}

// Admin update request
export interface AdminUpdateUserRequest {
  userId: string;
  updates: {
    isAdmin?: boolean;
    isActive?: boolean;
    points?: number;
    role?: UserRole;
  };
}

// Sex type for quiz and metabolic calculations
export type SexType = 'male' | 'female';

// Quiz result types based on score ranges
// New system: GREEN (0-15), YELLOW (16-35), ORANGE (36-65), RED (66-100) - lower is better
// Legacy support: fatigue, instability, plateau, optimized (kept for backward compatibility)
export type QuizResultType =
  | 'green' | 'yellow' | 'orange' | 'red'  // New result types (lower score = healthier)
  | 'fatigue' | 'instability' | 'plateau' | 'optimized'; // Legacy types

// Quiz Lead - captured from quiz funnel before registration
export interface QuizLead {
  id: string;
  projectId: string | null;    // Project they were captured for
  name: string;
  phone: string;
  age: number;
  sex: SexType;                // Male or female for gender-specific questions
  referralCode: string | null; // The group leader's referral code that referred them
  captainId: string | null;    // @deprecated - use groupLeaderId; Resolved group leader user ID
  groupLeaderId?: string | null; // Resolved group leader user ID (preferred)
  quizScore: number;           // Total score (0-100) - lower is healthier in new system
  quizAnswers: Record<string, number>; // Question ID to points mapping
  resultType: QuizResultType;  // GREEN/YELLOW/ORANGE/RED (new) or legacy types
  metabolicAge: number;        // Legacy: Calculated metabolic age (deprecated, kept for compatibility)
  totalScore: number;          // New: Raw quiz score (0-100) for display
  convertedToUserId: string | null; // If they registered, link to their user ID
  capturedAt: number;          // Unix timestamp
  source: string;              // 'quiz'
}

// Quiz Lead submission request
export interface QuizLeadSubmitRequest {
  name: string;
  phone: string;
  age: number;
  sex: SexType;
  referralCode?: string | null;
  projectId?: string | null;
  quizScore: number;
  quizAnswers: Record<string, number>;
  resultType: QuizResultType;
  metabolicAge?: number;  // Legacy (deprecated, optional for backward compatibility)
  totalScore: number;     // New: Raw quiz score for display
}

// Admin Reset Project DTOs
export interface CreateProjectRequest {
  name: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  registrationOpen?: boolean;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  startDate?: string;
  status?: ProjectStatus;
  registrationOpen?: boolean;
}

// Bug Report types
export type BugSeverity = 'low' | 'medium' | 'high' | 'critical';
export type BugStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type BugCategory = 'ui' | 'functionality' | 'performance' | 'data' | 'other';
export type ReportType = 'bug' | 'support'; // Bug report or support request

export interface BugReport {
  id: string;
  type: ReportType; // 'bug' for bug reports, 'support' for support requests
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  description: string;
  severity: BugSeverity;
  category: BugCategory;
  status: BugStatus;
  screenshotUrl?: string;
  videoUrl?: string;
  pageUrl: string;
  userAgent: string;
  createdAt: number;
  updatedAt: number;
  adminNotes?: string;
}

export interface BugReportSubmitRequest {
  type?: ReportType; // Defaults to 'bug' if not provided
  title: string;
  description: string;
  severity: BugSeverity;
  category: BugCategory;
  screenshotUrl?: string;
  videoUrl?: string;
  pageUrl: string;
  userAgent: string;
}

export interface BugReportUpdateRequest {
  status?: BugStatus;
  adminNotes?: string;
}

// Bug Message - threaded conversation on bug reports
export interface BugMessage {
  id: string;
  bugId: string;              // Bug report this message belongs to
  userId: string;             // Who sent the message (empty for system)
  userName: string;           // Display name (e.g., "System" for automated)
  userAvatarUrl?: string;
  isAdmin: boolean;           // Is this from an admin?
  isSystem: boolean;          // Is this a system-generated message?
  systemType?: 'submitted' | 'status_change' | 'assigned' | 'resolved'; // Type of system message
  message: string;
  createdAt: number;
}

// Request to add a message to a bug thread
export interface AddBugMessageRequest {
  bugId: string;
  message: string;
}

// Bug satisfaction rating after resolution
export type BugSatisfactionRating = 'positive' | 'negative';

export interface BugSatisfaction {
  id: string;                 // Same as bugId
  bugId: string;
  userId: string;
  rating: BugSatisfactionRating;
  feedback?: string;          // Optional additional feedback
  submittedAt: number;
}

export interface SubmitBugSatisfactionRequest {
  bugId: string;
  rating: BugSatisfactionRating;
  feedback?: string;
}

// OTP (One-Time Password) for phone verification
export interface OtpRecord {
  id: string; // Phone number in E.164 format
  code: string; // 6-digit OTP code
  createdAt: number; // Unix timestamp
  expiresAt: number; // Unix timestamp (createdAt + 10 minutes)
  attempts: number; // Failed verification attempts
  verified: boolean;
}

// OTP Request/Response types
export interface SendOtpRequest {
  phone: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  expiresIn?: number; // seconds until expiration
}

export interface VerifyOtpRequest {
  phone: string;
  code: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  user?: User; // If verified and user exists
  isNewUser?: boolean; // If no user found with this phone
}

// Point Transaction types for audit log
// Includes both legacy and new terminology for backward compatibility
export type PointTransactionType =
  | 'referral_facilitator' // Facilitator referred someone (new)
  | 'referral_participant' // Participant referred someone (new)
  | 'referral_coach'       // @deprecated - use referral_facilitator
  | 'referral_challenger'  // @deprecated - use referral_participant
  | 'daily_habit'          // Completed daily habit
  | 'biometric_submit'     // Submitted biometrics
  | 'admin_adjustment'     // Admin manually adjusted points
  | 'bonus';               // Bonus points (admin awarded)

// Helper to normalize transaction type to new terminology
export function normalizeTransactionType(type: PointTransactionType): PointTransactionType {
  if (type === 'referral_coach') return 'referral_facilitator';
  if (type === 'referral_challenger') return 'referral_participant';
  return type;
}

// Points Ledger - audit log for all point transactions
export interface PointsLedger {
  id: string;
  projectId: string | null; // Project context (null for global)
  userId: string; // User who received/lost points
  transactionType: PointTransactionType;
  points: number; // Can be negative for deductions
  previousBalance: number; // Balance before transaction
  newBalance: number; // Balance after transaction
  relatedUserId: string | null; // For referrals, the referred user ID
  relatedEntityId: string | null; // Related score/biometric ID if applicable
  description: string; // Human-readable description
  adminId: string | null; // Admin who made the adjustment (if admin_adjustment)
  createdAt: number;
}

// Referral activity with enriched user details
export interface ReferralActivity extends PointsLedger {
  referredUser: {
    id: string;
    name: string;
    avatarUrl: string | null;
    role: UserRole;
  } | null;
}

// Genealogy tree node for visualization
export interface GenealogyNode {
  userId: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  points: number;
  referralCode: string;
  joinedAt: number;
  children: GenealogyNode[];
  // Stats
  directReferrals: number;
  totalDownline: number; // Total users in their entire downline
  teamPoints: number; // Total points of their entire downline
}

// Admin-configurable point settings update request
export interface UpdatePointSettingsRequest {
  // New terminology (preferred)
  referralPointsFacilitator?: number;
  referralPointsParticipant?: number;
  // Legacy field names (for backward compatibility)
  referralPointsCoach?: number; // @deprecated - use referralPointsFacilitator
  referralPointsChallenger?: number; // @deprecated - use referralPointsParticipant
  dailyHabitPoints?: number;
  biometricSubmissionPoints?: number;
}

// ============================================================================
// LMS / Course Content System Types
// ============================================================================

// Content types for course items
export type CourseContentType = 'video' | 'quiz' | 'resource';

// Status of content availability for user
export type ContentStatus = 'locked' | 'available' | 'in_progress' | 'completed';

// Publish status for admin scheduling
export type ContentPublishStatus = 'draft' | 'scheduled' | 'published';

// Quiz question structure
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string; // Shown after answering for learning reinforcement
}

// Quiz data embedded in CourseContent
export interface QuizData {
  questions: QuizQuestion[];
  passingScore: number; // Percentage (0-100), default 85
  maxAttempts: number; // Maximum attempts allowed, default 3
  cooldownHours: number; // Hours between attempts, default 24
  timeLimit?: number; // Optional time limit in minutes
}

// Course Content - Admin-managed content items
export interface CourseContent {
  id: string;
  projectId: string; // Links to ResetProject
  dayNumber: number; // 1-28 (when content unlocks based on project start)
  contentType: CourseContentType;
  title: string;
  description: string;
  order: number; // For ordering multiple items on same day
  // Video-specific fields
  videoUrl?: string; // Cloudflare Stream URL
  videoDuration?: number; // Duration in seconds (for progress display)
  thumbnailUrl?: string; // Preview image
  // Quiz-specific fields
  quizData?: QuizData;
  // Resource-specific fields
  resourceUrl?: string; // PDF, link, etc.
  // Points and metadata
  points: number; // Points awarded on completion
  isRequired: boolean; // Must complete to unlock quiz for that week
  // Scheduling fields (new)
  publishStatus: ContentPublishStatus; // draft, scheduled, or published
  scheduledReleaseDate?: string; // YYYY-MM-DD - optional override for dayNumber-based scheduling
  publishedAt?: number; // Timestamp when content was published
  scheduledBy?: string; // Admin userId who scheduled this content
  // Engagement tracking
  likes: number; // Total likes on this content
  likedBy: string[]; // Array of userIds who liked
  commentCount: number; // Total comments on this content
  createdAt: number;
  updatedAt: number;
}

// User Progress - Per-user tracking of content completion
export interface UserProgress {
  id: string; // Format: enrollmentId:contentId
  enrollmentId: string; // projectId:userId
  contentId: string;
  userId: string;
  projectId: string;
  status: ContentStatus;
  // Video progress
  watchedPercentage: number; // 0-100
  lastPosition: number; // Seconds (for resume playback)
  // Quiz progress
  quizScore?: number; // Percentage scored on quiz
  quizAttempts: number;
  lastQuizAttemptAt?: number; // For cooldown tracking
  quizAnswers?: Record<string, number>; // Question ID to selected answer index
  // Completion tracking
  completedAt?: number;
  pointsAwarded: number;
  updatedAt: number;
}

// DTOs for LMS API
export interface CreateCourseContentRequest {
  projectId: string;
  dayNumber: number;
  contentType: CourseContentType;
  title: string;
  description?: string;
  order?: number;
  videoUrl?: string;
  videoDuration?: number;
  thumbnailUrl?: string;
  quizData?: QuizData;
  resourceUrl?: string;
  points?: number;
  isRequired?: boolean;
  // Scheduling fields
  publishStatus?: ContentPublishStatus; // Defaults to 'published' for backward compatibility
  scheduledReleaseDate?: string; // YYYY-MM-DD - optional override
}

export interface UpdateCourseContentRequest {
  dayNumber?: number;
  contentType?: CourseContentType;
  title?: string;
  description?: string;
  order?: number;
  videoUrl?: string;
  videoDuration?: number;
  thumbnailUrl?: string;
  quizData?: QuizData;
  resourceUrl?: string;
  points?: number;
  isRequired?: boolean;
  // Scheduling fields
  publishStatus?: ContentPublishStatus;
  scheduledReleaseDate?: string;
}

// Video progress update
export interface UpdateVideoProgressRequest {
  contentId: string;
  watchedPercentage: number;
  lastPosition: number;
}

// Quiz submission
export interface SubmitQuizRequest {
  contentId: string;
  answers: Record<string, number>; // Question ID to selected answer index
}

// Quiz result response
export interface QuizResultResponse {
  passed: boolean;
  score: number; // Percentage
  correctCount: number;
  totalQuestions: number;
  pointsAwarded: number;
  attemptsRemaining: number;
  canRetryAt?: number; // Timestamp when retry is allowed
  results: Array<{
    questionId: string;
    correct: boolean;
    correctAnswer: number;
    userAnswer: number;
    explanation?: string;
  }>;
}

// Course overview for user dashboard
export interface CourseOverview {
  totalContent: number;
  completedContent: number;
  availableContent: number;
  lockedContent: number;
  totalPoints: number;
  earnedPoints: number;
  currentDay: number; // Based on enrollment date
  nextUnlockDay: number;
  nextUnlockContent?: CourseContent;
}

// Day's content with progress for user view
export interface DayContentWithProgress {
  dayNumber: number;
  isUnlocked: boolean;
  unlockDate: string; // YYYY-MM-DD
  content: Array<{
    content: CourseContent;
    progress: UserProgress | null;
    prerequisitesMet: boolean;
  }>;
}

// Content Comments - YouTube-style comments on course content
export interface ContentComment {
  id: string;
  contentId: string; // Course content this comment belongs to
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  text: string;
  likes: number;
  likedBy: string[]; // Array of userIds who liked
  createdAt: number;
  updatedAt?: number;
}

// Comment DTOs
export interface AddCommentRequest {
  contentId: string;
  text: string;
}

export interface LikeCommentRequest {
  commentId: string;
}

export interface LikeContentRequest {
  contentId: string;
}

// Notification types for in-app notifications
// Includes both legacy and new terminology for backward compatibility
export type NotificationType =
  // New terminology (preferred)
  | 'group_leader_reassigned' // User was reassigned to a new group leader
  | 'new_group_member'        // Group leader received a new group member
  | 'group_member_removed'    // Group leader lost a group member (reassigned away)
  // Legacy terminology (@deprecated - kept for backward compatibility)
  | 'captain_reassigned'      // @deprecated - use group_leader_reassigned
  | 'new_team_member'         // @deprecated - use new_group_member
  | 'team_member_removed'     // @deprecated - use group_member_removed
  // Other notification types
  | 'admin_impersonation'     // Admin viewed user's account (audit)
  | 'system_announcement'     // System-wide announcements
  | 'achievement'             // Points, milestones, etc.
  | 'bug_submitted'           // User's bug report was received
  | 'bug_status_changed'      // Bug status updated (in_progress, resolved, etc.)
  | 'bug_response'            // Admin/user replied to a bug thread
  | 'new_bug_report'          // Alert to admins when a new bug is submitted
  | 'bug_satisfaction'        // Satisfaction survey after bug resolution
  | 'general';                // General notifications

// Helper to normalize notification type to new terminology
export function normalizeNotificationType(type: NotificationType): NotificationType {
  if (type === 'captain_reassigned') return 'group_leader_reassigned';
  if (type === 'new_team_member') return 'new_group_member';
  if (type === 'team_member_removed') return 'group_member_removed';
  return type;
}

export interface Notification {
  id: string;
  userId: string;             // User who receives the notification
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>; // Additional data (e.g., { newCaptainId, oldCaptainId })
  read: boolean;
  readAt?: number;
  createdAt: number;
}

// Impersonation session tracking (for audit)
// Sessions auto-expire after 60 minutes for security
export interface ImpersonationSession {
  id: string;
  adminUserId: string;        // Admin who initiated impersonation
  adminUserName: string;
  targetUserId: string;       // User being impersonated
  targetUserName: string;
  startedAt: number;
  expiresAt: number;          // Auto-expires after 60 minutes
  endedAt?: number;
  reason?: string;            // Optional reason for impersonation
}

// ============================================================================
// AI Bug Analysis Types (Cloudflare AI Gateway + Gemini)
// ============================================================================

export type AIAnalysisConfidence = 'low' | 'medium' | 'high';
export type AIAnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Suggested solution from AI analysis
export interface BugSolution {
  title: string;
  description: string;
  steps: string[];
  estimatedEffort: 'quick' | 'moderate' | 'significant';
  confidence: AIAnalysisConfidence;
}

// Screenshot analysis result
export interface ScreenshotAnalysis {
  description: string;            // What the AI sees in the screenshot
  visibleErrors: string[];        // Any visible error messages
  uiElements: string[];           // Key UI elements identified
  potentialIssues: string[];      // Issues spotted in the screenshot
}

// Video analysis result (Gemini multimodal)
export interface VideoAnalysis {
  description: string;            // Overall description of what happens
  reproductionSteps: string[];    // Steps observed to reproduce the bug
  userActions: string[];          // What the user did
  timestamps: Array<{             // Key moments in the video
    seconds: number;
    description: string;
  }>;
  errorMoments: Array<{           // When errors appeared
    seconds: number;
    description: string;
  }>;
}

// Documentation reference from AI analysis
export interface DocReference {
  sectionId: string;              // Documentation section ID
  sectionTitle: string;           // Human-readable section title
  articleId: string;              // Article ID within section
  articleTitle: string;           // Human-readable article title
  relevance: string;              // Why this doc is relevant to the bug
  excerpt?: string;               // Relevant excerpt from the doc
}

// Full AI analysis result for a bug report
export interface BugAIAnalysis {
  id: string;
  bugId: string;
  status: AIAnalysisStatus;
  analyzedAt: number;
  summary: string;                // Brief summary of the bug
  suggestedCause: string;         // What likely caused this bug
  suggestedSolutions: BugSolution[];
  screenshotAnalysis?: ScreenshotAnalysis;
  videoAnalysis?: VideoAnalysis;
  relatedDocs?: DocReference[];   // Relevant documentation articles
  modelUsed: string;              // e.g., "gemini-1.5-flash", "workers-ai"
  confidence: AIAnalysisConfidence;
  processingTimeMs: number;
  error?: string;                 // Error message if analysis failed
}

// Request to trigger AI analysis
export interface AnalyzeBugRequest {
  bugId: string;
  includeScreenshot?: boolean;
  includeVideo?: boolean;
}

// Response from AI analysis endpoint
export interface AnalyzeBugResponse {
  success: boolean;
  analysis?: BugAIAnalysis;
  error?: string;
}

// ============================================================================
// Web Push Notification Types
// ============================================================================

// Push subscription stored per user/device
export interface PushSubscription {
  id: string;                       // Unique ID for this subscription
  userId: string;                   // User who owns this subscription
  endpoint: string;                 // Push service endpoint URL
  keys: {
    p256dh: string;                 // Public key for encryption
    auth: string;                   // Auth secret
  };
  userAgent?: string;               // Browser/device info
  createdAt: number;
  lastUsedAt: number;               // Last time a push was sent successfully
  failCount: number;                // Consecutive failures (remove after threshold)
}

// Request to subscribe to push notifications
export interface PushSubscribeRequest {
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  userAgent?: string;
}

// Request to send a push notification
export interface SendPushRequest {
  userId: string;
  title: string;
  body: string;
  url?: string;                     // URL to open when clicked
  tag?: string;                     // Grouping tag
  data?: Record<string, unknown>;   // Additional data
}

// Notification preferences (user settings)
export interface NotificationPreferences {
  userId: string;
  pushEnabled: boolean;             // Master toggle for push
  emailEnabled: boolean;            // Email notifications (future)
  // Granular settings
  bugUpdates: boolean;              // Bug report updates
  systemAnnouncements: boolean;     // Admin announcements
  teamUpdates: boolean;             // Team member changes
  achievements: boolean;            // Achievements/milestones
  dailyReminders: boolean;          // Daily habit reminders
  quietHoursStart?: string;         // "22:00" - no push during quiet hours
  quietHoursEnd?: string;           // "08:00"
}