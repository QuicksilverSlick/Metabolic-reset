export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type UserRole = 'challenger' | 'coach';

// Cohort types for onboarding
export type CohortType = 'GROUP_A' | 'GROUP_B';

// Reset Project (Challenge) status values
export type ProjectStatus = 'draft' | 'upcoming' | 'active' | 'completed';

// Reset Project entity - represents a 28-day challenge
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
  isGroupLeaderEnrolled: boolean; // If role=coach, did they pay for this project?
  // Cohort onboarding fields
  cohortId: CohortType | null; // GROUP_A (Protocol) or GROUP_B (DIY)
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
  captainId: string | null; // Legacy - use ProjectEnrollment.groupLeaderId for project-specific
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
  cartLink?: string; // Coach's personal cart link for kit orders (coaches only)
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
}

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
  fallbackPhone: string; // Fallback phone number if coach has no cart link (e.g., "5039741671")
  // Configurable point values
  referralPointsCoach: number; // Points for coach when they refer someone (default: 1)
  referralPointsChallenger: number; // Points for challenger when they refer someone (default: 5)
  dailyHabitPoints: number; // Points per daily habit completed (default: 1)
  biometricSubmissionPoints: number; // Points for biometric submission (default: 25)
}
// DTOs
export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  referralCodeUsed?: string; // The code they entered to join
  isCaptain?: boolean; // If they want to be their own group leader
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
  captainId: string | null;    // Resolved group leader user ID (legacy name kept for compatibility)
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

export interface BugReport {
  id: string;
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
export type PointTransactionType =
  | 'referral_coach'      // Coach referred someone
  | 'referral_challenger' // Challenger referred someone
  | 'daily_habit'         // Completed daily habit
  | 'biometric_submit'    // Submitted biometrics
  | 'admin_adjustment'    // Admin manually adjusted points
  | 'bonus';              // Bonus points (admin awarded)

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
  referralPointsCoach?: number;
  referralPointsChallenger?: number;
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
  passingScore: number; // Percentage (0-100), default 80
  maxAttempts: number; // Maximum attempts allowed, default 2
  cooldownHours: number; // Hours between attempts, default 24
  timeLimit?: number; // Optional time limit in minutes
}

// Course Content - Admin-managed content items
export interface CourseContent {
  id: string;
  projectId: string; // Links to ResetProject
  dayNumber: number; // 1-28 (when content unlocks)
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
  // Engagement tracking
  likes: number; // Total likes on this content
  likedBy: string[]; // Array of userIds who liked
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
export type NotificationType =
  | 'captain_reassigned'      // User was reassigned to a new captain
  | 'new_team_member'         // Captain received a new team member
  | 'team_member_removed'     // Captain lost a team member (reassigned away)
  | 'admin_impersonation'     // Admin viewed user's account (audit)
  | 'system_announcement'     // System-wide announcements
  | 'achievement'             // Points, milestones, etc.
  | 'general';                // General notifications

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