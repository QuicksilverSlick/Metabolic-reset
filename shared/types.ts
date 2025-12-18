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
  stripeCustomerId?: string;
  avatarUrl?: string; // User profile photo URL
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
  kitOrderUrl: string; // URL to order the nutrition kit
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
export type QuizResultType = 'fatigue' | 'instability' | 'plateau' | 'optimized';

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
  quizScore: number;           // Total score (0-100)
  quizAnswers: Record<string, number>; // Question ID to points mapping
  resultType: QuizResultType;  // Fatigue, Instability, Plateau, or Optimized
  metabolicAge: number;        // Calculated metabolic age using Harris-Benedict
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
  metabolicAge: number;
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