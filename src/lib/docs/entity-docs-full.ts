/**
 * Complete Entity Documentation
 *
 * All 19 Durable Object entities documented with full details
 */

import type { EntityDoc } from './ai-types';

export const FULL_ENTITIES: EntityDoc[] = [
  // ============================================================================
  // USER ENTITIES
  // ============================================================================
  {
    name: 'UserEntity',
    filePath: 'worker/entities.ts',
    description: 'Primary user account storage with profile, roles, referral info, and points. The central entity for all user-related operations.',
    fields: [
      { name: 'id', type: 'string', description: 'Unique user ID (UUID format)' },
      { name: 'phone', type: 'string', description: 'Phone number in E.164 format (+1XXXXXXXXXX), unique identifier' },
      { name: 'email', type: 'string', description: 'Email address, unique when set' },
      { name: 'name', type: 'string', description: 'Display name shown in UI' },
      { name: 'avatarUrl', type: 'string', description: 'Profile photo URL from R2' },
      { name: 'isAdmin', type: 'boolean', description: 'Administrator access flag' },
      { name: 'isGroupLeader', type: 'boolean', description: 'Coach/captain status flag' },
      { name: 'referralCode', type: 'string', description: 'Unique referral code for sharing (e.g., JOHN123)' },
      { name: 'referredBy', type: 'string', description: 'User ID of who referred this user' },
      { name: 'currentProjectId', type: 'string', description: 'Active project enrollment' },
      { name: 'points', type: 'number', description: 'Total lifetime points earned' },
      { name: 'hasScale', type: 'boolean', description: 'Whether user has a smart scale' },
      { name: 'phoneVerified', type: 'boolean', description: 'OTP verification completed' },
      { name: 'createdAt', type: 'number', description: 'Registration timestamp (Unix ms)' },
      { name: 'updatedAt', type: 'number', description: 'Last profile update timestamp' },
      { name: 'deletedAt', type: 'number', description: 'Soft-delete timestamp if deleted' },
      { name: 'lastActiveAt', type: 'number', description: 'Last activity timestamp' },
    ],
    methods: [
      { name: 'findByPhone', description: 'Find user by phone number using PhoneMapping index', params: 'env: Env, phone: string', returns: 'Promise<User | null>' },
      { name: 'findByEmail', description: 'Find user by email using EmailMapping index', params: 'env: Env, email: string', returns: 'Promise<User | null>' },
      { name: 'findByReferralCode', description: 'Find user by referral code using ReferralCodeMapping', params: 'env: Env, code: string', returns: 'Promise<User | null>' },
      { name: 'addPoints', description: 'Add points to user and record transaction', params: 'env: Env, userId: string, amount: number, reason: string', returns: 'Promise<void>' },
    ],
    relatedEntities: ['ProjectEnrollmentEntity', 'DailyScoreEntity', 'WeeklyBiometricEntity', 'ReferralLedgerEntity'],
    usedBy: ['worker/user-routes.ts', 'src/lib/auth-store.ts', 'src/hooks/use-queries.ts'],
  },

  // ============================================================================
  // DAILY TRACKING ENTITIES
  // ============================================================================
  {
    name: 'DailyScoreEntity',
    filePath: 'worker/entities.ts',
    description: 'Stores daily habit completion data for the 28-day challenge. One record per user per day.',
    fields: [
      { name: 'id', type: 'string', description: 'Composite key: userId-projectId-date' },
      { name: 'userId', type: 'string', description: 'User who submitted this score' },
      { name: 'projectId', type: 'string', description: 'Project this score belongs to' },
      { name: 'date', type: 'string', description: 'Date in YYYY-MM-DD format' },
      { name: 'water', type: 'boolean', description: 'Water intake goal completed' },
      { name: 'steps', type: 'boolean', description: 'Steps goal completed (10k default)' },
      { name: 'sleep', type: 'boolean', description: 'Sleep goal completed (7+ hours)' },
      { name: 'lesson', type: 'boolean', description: 'Daily lesson/video completed' },
      { name: 'totalPoints', type: 'number', description: 'Points earned for this day' },
      { name: 'createdAt', type: 'number', description: 'First submission timestamp' },
      { name: 'updatedAt', type: 'number', description: 'Last update timestamp' },
    ],
    methods: [
      { name: 'findByUserAndProject', description: 'Get all daily scores for user in project', params: 'env: Env, userId: string, projectId: string', returns: 'Promise<DailyScore[]>' },
      { name: 'findByDate', description: 'Get score for specific date', params: 'env: Env, userId: string, projectId: string, date: string', returns: 'Promise<DailyScore | null>' },
    ],
    relatedEntities: ['UserEntity', 'ProjectEnrollmentEntity'],
    usedBy: ['worker/user-routes.ts', 'src/pages/app/DashboardPage.tsx'],
  },
  {
    name: 'WeeklyBiometricEntity',
    filePath: 'worker/entities.ts',
    description: 'Stores weekly biometric measurements with scale photo proof. Week 0 is baseline, weeks 1-4 are progress.',
    fields: [
      { name: 'id', type: 'string', description: 'Composite key: userId-projectId-weekNumber' },
      { name: 'userId', type: 'string', description: 'User who submitted' },
      { name: 'projectId', type: 'string', description: 'Project enrollment' },
      { name: 'weekNumber', type: 'number', description: 'Week 0-4 (0 = baseline)' },
      { name: 'weight', type: 'number', description: 'Weight in pounds' },
      { name: 'bodyFat', type: 'number', description: 'Body fat percentage' },
      { name: 'visceralFat', type: 'number', description: 'Visceral fat level (1-59)' },
      { name: 'leanMass', type: 'number', description: 'Lean muscle mass in pounds' },
      { name: 'metabolicAge', type: 'number', description: 'Metabolic age in years' },
      { name: 'screenshotUrl', type: 'string', description: 'R2 URL of scale photo proof' },
      { name: 'createdAt', type: 'number', description: 'Submission timestamp' },
      { name: 'pointsAwarded', type: 'number', description: 'Points earned for this submission' },
    ],
    methods: [
      { name: 'findByUserAndProject', description: 'Get all biometrics for user in project', params: 'env: Env, userId: string, projectId: string', returns: 'Promise<WeeklyBiometric[]>' },
      { name: 'findByWeek', description: 'Get specific week submission', params: 'env: Env, userId: string, projectId: string, week: number', returns: 'Promise<WeeklyBiometric | null>' },
    ],
    relatedEntities: ['UserEntity', 'ProjectEnrollmentEntity'],
    usedBy: ['worker/user-routes.ts', 'src/pages/app/BiometricsPage.tsx'],
  },

  // ============================================================================
  // REFERRAL ENTITIES
  // ============================================================================
  {
    name: 'ReferralLedgerEntity',
    filePath: 'worker/entities.ts',
    description: 'Tracks referral relationships and bonus points. Records when someone signs up via referral link.',
    fields: [
      { name: 'id', type: 'string', description: 'Unique ledger entry ID' },
      { name: 'referrerId', type: 'string', description: 'Coach who made the referral' },
      { name: 'referredId', type: 'string', description: 'New user who was referred' },
      { name: 'referredName', type: 'string', description: 'Name of referred user' },
      { name: 'projectId', type: 'string', description: 'Project they enrolled in' },
      { name: 'bonusPoints', type: 'number', description: 'Points awarded to referrer' },
      { name: 'createdAt', type: 'number', description: 'When referral was recorded' },
    ],
    methods: [
      { name: 'findByReferrer', description: 'Get all referrals for a coach', params: 'env: Env, referrerId: string', returns: 'Promise<ReferralLedger[]>' },
    ],
    relatedEntities: ['UserEntity'],
    usedBy: ['worker/user-routes.ts', 'src/pages/app/RosterPage.tsx'],
  },

  // ============================================================================
  // SYSTEM ENTITIES
  // ============================================================================
  {
    name: 'SystemStatsEntity',
    filePath: 'worker/entities.ts',
    description: 'Global system statistics singleton. Tracks aggregate counts for social proof.',
    fields: [
      { name: 'id', type: 'string', description: 'Always "global"' },
      { name: 'totalUsers', type: 'number', description: 'Total registered users' },
      { name: 'totalSubmissions', type: 'number', description: 'Total habit submissions' },
      { name: 'totalHabits', type: 'number', description: 'Total habits tracked' },
      { name: 'updatedAt', type: 'number', description: 'Last update timestamp' },
    ],
    methods: [
      { name: 'incrementUsers', description: 'Increment user count', params: 'env: Env', returns: 'Promise<void>' },
      { name: 'incrementSubmissions', description: 'Increment submission count', params: 'env: Env', returns: 'Promise<void>' },
      { name: 'incrementHabits', description: 'Increment habit count', params: 'env: Env', returns: 'Promise<void>' },
    ],
    relatedEntities: [],
    usedBy: ['worker/user-routes.ts'],
  },
  {
    name: 'SystemSettingsEntity',
    filePath: 'worker/entities.ts',
    description: 'Global system settings singleton. Controls feature flags and platform behavior.',
    fields: [
      { name: 'id', type: 'string', description: 'Always "global"' },
      { name: 'enrollmentOpen', type: 'boolean', description: 'Whether new enrollments allowed' },
      { name: 'maintenanceMode', type: 'boolean', description: 'Platform in maintenance' },
      { name: 'kitReminderEnabled', type: 'boolean', description: 'Show kit purchase reminders' },
      { name: 'scaleReminderEnabled', type: 'boolean', description: 'Show scale purchase reminders' },
      { name: 'pointsConfig', type: 'PointsConfig', description: 'Points values for actions' },
      { name: 'updatedAt', type: 'number', description: 'Last update timestamp' },
      { name: 'updatedBy', type: 'string', description: 'Admin who last updated' },
    ],
    methods: [
      { name: 'getGlobal', description: 'Get global settings', params: 'env: Env', returns: 'Promise<SystemSettings>' },
      { name: 'updateGlobal', description: 'Update global settings', params: 'env: Env, settings: Partial<SystemSettings>', returns: 'Promise<SystemSettings>' },
    ],
    relatedEntities: [],
    usedBy: ['worker/user-routes.ts', 'src/hooks/use-queries.ts'],
  },

  // ============================================================================
  // LEAD ENTITIES
  // ============================================================================
  {
    name: 'QuizLeadEntity',
    filePath: 'worker/entities.ts',
    description: 'Stores leads from the marketing quiz funnel. Tracks potential customers before signup.',
    fields: [
      { name: 'id', type: 'string', description: 'Unique lead ID' },
      { name: 'name', type: 'string', description: 'Lead name' },
      { name: 'email', type: 'string', description: 'Lead email' },
      { name: 'phone', type: 'string', description: 'Lead phone (optional)' },
      { name: 'referralCode', type: 'string', description: 'Coach referral code used' },
      { name: 'referrerId', type: 'string', description: 'Coach user ID' },
      { name: 'quizAnswers', type: 'object', description: 'Quiz response data' },
      { name: 'converted', type: 'boolean', description: 'Whether lead became customer' },
      { name: 'convertedAt', type: 'number', description: 'When they converted' },
      { name: 'createdAt', type: 'number', description: 'Lead capture timestamp' },
    ],
    methods: [
      { name: 'findByCaptain', description: 'Get leads for a coach', params: 'env: Env, captainId: string', returns: 'Promise<QuizLead[]>' },
      { name: 'findByEmail', description: 'Find lead by email', params: 'env: Env, email: string', returns: 'Promise<QuizLead | null>' },
    ],
    relatedEntities: ['UserEntity'],
    usedBy: ['worker/user-routes.ts', 'src/pages/app/LeadsPage.tsx'],
  },

  // ============================================================================
  // PROJECT ENTITIES
  // ============================================================================
  {
    name: 'ResetProjectEntity',
    filePath: 'worker/entities.ts',
    description: 'Stores 28-day challenge projects/cohorts. Each project has start/end dates and enrollment windows.',
    fields: [
      { name: 'id', type: 'string', description: 'Unique project ID' },
      { name: 'name', type: 'string', description: 'Project display name (e.g., "January 2025 Challenge")' },
      { name: 'startDate', type: 'string', description: 'Challenge start date (ISO)' },
      { name: 'endDate', type: 'string', description: 'Challenge end date (ISO)' },
      { name: 'enrollmentOpenDate', type: 'string', description: 'When enrollment opens' },
      { name: 'enrollmentCloseDate', type: 'string', description: 'When enrollment closes' },
      { name: 'status', type: 'string', description: 'draft|upcoming|active|completed' },
      { name: 'price', type: 'number', description: 'Enrollment price in cents (2800 = $28)' },
      { name: 'createdAt', type: 'number', description: 'Project creation timestamp' },
      { name: 'createdBy', type: 'string', description: 'Admin who created' },
    ],
    methods: [
      { name: 'findActive', description: 'Get currently active projects', params: 'env: Env', returns: 'Promise<ResetProject[]>' },
      { name: 'findUpcoming', description: 'Get upcoming projects', params: 'env: Env', returns: 'Promise<ResetProject[]>' },
      { name: 'findOpenForRegistration', description: 'Get projects accepting enrollment', params: 'env: Env', returns: 'Promise<ResetProject[]>' },
    ],
    relatedEntities: ['ProjectEnrollmentEntity', 'CourseContentEntity'],
    usedBy: ['worker/user-routes.ts', 'src/pages/app/EnrollPage.tsx'],
  },
  {
    name: 'ProjectEnrollmentEntity',
    filePath: 'worker/entities.ts',
    description: 'Links users to projects. Tracks enrollment status, cohort assignment, and project-specific progress.',
    fields: [
      { name: 'id', type: 'string', description: 'Composite key: userId-projectId' },
      { name: 'userId', type: 'string', description: 'Enrolled user' },
      { name: 'projectId', type: 'string', description: 'Project enrolled in' },
      { name: 'cohortType', type: 'string', description: 'Cohort assignment (A, B, C, etc.)' },
      { name: 'enrolledAt', type: 'number', description: 'Enrollment timestamp' },
      { name: 'paymentIntentId', type: 'string', description: 'Stripe payment ID' },
      { name: 'paymentStatus', type: 'string', description: 'paid|pending|waived' },
      { name: 'points', type: 'number', description: 'Project-specific points' },
      { name: 'onboardingCompleted', type: 'object', description: 'Onboarding steps completed' },
      { name: 'status', type: 'string', description: 'active|completed|dropped' },
    ],
    methods: [
      { name: 'findByProjectAndUser', description: 'Get specific enrollment', params: 'env: Env, projectId: string, userId: string', returns: 'Promise<ProjectEnrollment | null>' },
      { name: 'findByUser', description: 'Get all enrollments for user', params: 'env: Env, userId: string', returns: 'Promise<ProjectEnrollment[]>' },
      { name: 'findByProject', description: 'Get all enrollments in project', params: 'env: Env, projectId: string', returns: 'Promise<ProjectEnrollment[]>' },
      { name: 'findGroupParticipants', description: 'Get group members for leaderboard', params: 'env: Env, projectId: string, cohort: string', returns: 'Promise<ProjectEnrollment[]>' },
      { name: 'addPoints', description: 'Add points to enrollment', params: 'env: Env, enrollmentId: string, points: number', returns: 'Promise<void>' },
    ],
    relatedEntities: ['UserEntity', 'ResetProjectEntity', 'UserProgressEntity'],
    usedBy: ['worker/user-routes.ts', 'src/hooks/use-queries.ts'],
  },

  // ============================================================================
  // BUG TRACKING ENTITIES
  // ============================================================================
  {
    name: 'BugReportEntity',
    filePath: 'worker/entities.ts',
    description: 'Stores user-submitted bug reports with optional screenshot and video attachments.',
    fields: [
      { name: 'id', type: 'string', description: 'Unique bug ID (bug-{timestamp}-{random})' },
      { name: 'userId', type: 'string', description: 'User who reported' },
      { name: 'userName', type: 'string', description: 'User name for display' },
      { name: 'userEmail', type: 'string', description: 'User email for contact' },
      { name: 'title', type: 'string', description: 'Brief bug summary' },
      { name: 'description', type: 'string', description: 'Detailed bug description' },
      { name: 'severity', type: 'BugSeverity', description: 'low|medium|high|critical' },
      { name: 'category', type: 'BugCategory', description: 'ui|functionality|performance|data|other' },
      { name: 'status', type: 'BugStatus', description: 'open|in_progress|resolved|closed' },
      { name: 'screenshotUrl', type: 'string', description: 'R2 URL of screenshot' },
      { name: 'videoUrl', type: 'string', description: 'R2 URL of screen recording' },
      { name: 'pageUrl', type: 'string', description: 'URL where bug occurred' },
      { name: 'userAgent', type: 'string', description: 'Browser/device info' },
      { name: 'adminNotes', type: 'string', description: 'Internal admin notes' },
      { name: 'createdAt', type: 'number', description: 'Report submission time' },
      { name: 'updatedAt', type: 'number', description: 'Last update time' },
    ],
    methods: [
      { name: 'getAllSorted', description: 'Get all bugs sorted by date', params: 'env: Env', returns: 'Promise<BugReport[]>' },
      { name: 'findByStatus', description: 'Filter bugs by status', params: 'env: Env, status: BugStatus', returns: 'Promise<BugReport[]>' },
      { name: 'findByUser', description: 'Get bugs from specific user', params: 'env: Env, userId: string', returns: 'Promise<BugReport[]>' },
    ],
    relatedEntities: ['BugAIAnalysisEntity', 'UserEntity'],
    usedBy: ['worker/user-routes.ts', 'src/components/admin/BugAIAnalysisPanel.tsx'],
  },
  {
    name: 'BugAIAnalysisEntity',
    filePath: 'worker/entities.ts',
    description: 'Stores AI analysis results for bug reports. Uses Gemini to analyze screenshots/videos and suggest solutions.',
    fields: [
      { name: 'id', type: 'string', description: 'Analysis ID (analysis-{timestamp}-{random})' },
      { name: 'bugId', type: 'string', description: 'Bug being analyzed' },
      { name: 'status', type: 'AIAnalysisStatus', description: 'pending|processing|completed|failed' },
      { name: 'analyzedAt', type: 'number', description: 'When analysis completed' },
      { name: 'summary', type: 'string', description: 'AI-generated bug summary' },
      { name: 'suggestedCause', type: 'string', description: 'Likely root cause' },
      { name: 'suggestedSolutions', type: 'BugSolution[]', description: 'Array of solution steps' },
      { name: 'screenshotAnalysis', type: 'ScreenshotAnalysis', description: 'What AI saw in screenshot' },
      { name: 'videoAnalysis', type: 'VideoAnalysis', description: 'Video analysis results' },
      { name: 'relatedDocs', type: 'DocReference[]', description: 'Links to relevant documentation' },
      { name: 'modelUsed', type: 'string', description: 'AI model (gemini-3-flash-preview)' },
      { name: 'confidence', type: 'AIAnalysisConfidence', description: 'low|medium|high' },
      { name: 'processingTimeMs', type: 'number', description: 'Analysis duration' },
      { name: 'error', type: 'string', description: 'Error message if failed' },
    ],
    methods: [
      { name: 'findByBugId', description: 'Find analysis for bug', params: 'env: Env, bugId: string', returns: 'Promise<BugAIAnalysis | null>' },
      { name: 'getLatestForBug', description: 'Get most recent analysis', params: 'env: Env, bugId: string', returns: 'Promise<BugAIAnalysis | null>' },
      { name: 'createPending', description: 'Create pending analysis record', params: 'env: Env, bugId: string', returns: 'Promise<BugAIAnalysis>' },
      { name: 'markProcessing', description: 'Mark as currently processing', params: 'env: Env, analysisId: string', returns: 'Promise<void>' },
      { name: 'complete', description: 'Mark complete with results', params: 'env: Env, analysisId: string, result: Partial<BugAIAnalysis>', returns: 'Promise<void>' },
      { name: 'markFailed', description: 'Mark as failed with error', params: 'env: Env, analysisId: string, error: string', returns: 'Promise<void>' },
      { name: 'getRecent', description: 'Get recent analyses', params: 'env: Env, limit?: number', returns: 'Promise<BugAIAnalysis[]>' },
    ],
    relatedEntities: ['BugReportEntity'],
    usedBy: ['worker/user-routes.ts', 'worker/ai-utils.ts', 'src/components/admin/BugAIAnalysisPanel.tsx'],
  },

  // ============================================================================
  // AUTH ENTITIES
  // ============================================================================
  {
    name: 'OtpEntity',
    filePath: 'worker/entities.ts',
    description: 'Stores one-time passwords for phone authentication. OTPs expire after 10 minutes.',
    fields: [
      { name: 'id', type: 'string', description: 'Phone number (E.164 format)' },
      { name: 'code', type: 'string', description: '6-digit OTP code' },
      { name: 'attempts', type: 'number', description: 'Failed verification attempts (max 5)' },
      { name: 'createdAt', type: 'number', description: 'When OTP was generated' },
      { name: 'expiresAt', type: 'number', description: 'Expiration timestamp (10 min from creation)' },
      { name: 'verified', type: 'boolean', description: 'Whether code was verified' },
    ],
    methods: [
      { name: 'create', description: 'Generate new OTP for phone', params: 'env: Env, phone: string', returns: 'Promise<string>' },
      { name: 'verify', description: 'Verify OTP code', params: 'env: Env, phone: string, code: string', returns: 'Promise<boolean>' },
      { name: 'isExpired', description: 'Check if OTP expired', params: 'otp: OtpRecord', returns: 'boolean' },
    ],
    relatedEntities: ['UserEntity'],
    usedBy: ['worker/user-routes.ts', 'src/pages/auth/OtpLoginPage.tsx'],
  },

  // ============================================================================
  // POINTS ENTITIES
  // ============================================================================
  {
    name: 'PointsLedgerEntity',
    filePath: 'worker/entities.ts',
    description: 'Transaction log for all point additions/deductions. Provides audit trail and history.',
    fields: [
      { name: 'id', type: 'string', description: 'Transaction ID' },
      { name: 'userId', type: 'string', description: 'User affected' },
      { name: 'amount', type: 'number', description: 'Points added (positive) or removed (negative)' },
      { name: 'reason', type: 'string', description: 'Why points were awarded/deducted' },
      { name: 'category', type: 'string', description: 'habit|biometric|referral|admin|bonus' },
      { name: 'relatedId', type: 'string', description: 'Related entity ID (e.g., daily score)' },
      { name: 'createdAt', type: 'number', description: 'Transaction timestamp' },
      { name: 'createdBy', type: 'string', description: 'Admin ID for manual adjustments' },
    ],
    methods: [
      { name: 'recordTransaction', description: 'Record points transaction', params: 'env: Env, userId: string, amount: number, reason: string, category: string', returns: 'Promise<void>' },
      { name: 'findByUser', description: 'Get user point history', params: 'env: Env, userId: string', returns: 'Promise<PointsTransaction[]>' },
      { name: 'getRecent', description: 'Get recent transactions', params: 'env: Env, limit?: number', returns: 'Promise<PointsTransaction[]>' },
    ],
    relatedEntities: ['UserEntity'],
    usedBy: ['worker/user-routes.ts', 'src/pages/app/PointsPage.tsx'],
  },

  // ============================================================================
  // COURSE CONTENT ENTITIES
  // ============================================================================
  {
    name: 'CourseContentEntity',
    filePath: 'worker/entities.ts',
    description: 'Stores LMS content items - videos, quizzes, and articles for the 28-day curriculum.',
    fields: [
      { name: 'id', type: 'string', description: 'Unique content ID' },
      { name: 'projectId', type: 'string', description: 'Project this content belongs to' },
      { name: 'dayNumber', type: 'number', description: 'Day 1-28 this content is for' },
      { name: 'type', type: 'ContentType', description: 'video|quiz|article' },
      { name: 'title', type: 'string', description: 'Content title' },
      { name: 'description', type: 'string', description: 'Content description/summary' },
      { name: 'videoUrl', type: 'string', description: 'Cloudflare Stream video URL' },
      { name: 'videoDuration', type: 'number', description: 'Video duration in seconds' },
      { name: 'thumbnailUrl', type: 'string', description: 'Video thumbnail' },
      { name: 'quizQuestions', type: 'QuizQuestion[]', description: 'Quiz questions if type=quiz' },
      { name: 'passingScore', type: 'number', description: 'Required score to pass (0-100)' },
      { name: 'articleContent', type: 'string', description: 'Markdown article content' },
      { name: 'order', type: 'number', description: 'Display order within day' },
      { name: 'isRequired', type: 'boolean', description: 'Required for day completion' },
      { name: 'likesCount', type: 'number', description: 'Number of likes' },
      { name: 'commentsCount', type: 'number', description: 'Number of comments' },
      { name: 'createdAt', type: 'number', description: 'Creation timestamp' },
      { name: 'updatedAt', type: 'number', description: 'Last update timestamp' },
    ],
    methods: [
      { name: 'toggleLike', description: 'Toggle like on content', params: 'env: Env, contentId: string, userId: string', returns: 'Promise<boolean>' },
      { name: 'findByProject', description: 'Get all content for project', params: 'env: Env, projectId: string', returns: 'Promise<CourseContent[]>' },
      { name: 'findByProjectAndDay', description: 'Get content for specific day', params: 'env: Env, projectId: string, day: number', returns: 'Promise<CourseContent[]>' },
      { name: 'findQuizzes', description: 'Get all quizzes', params: 'env: Env, projectId: string', returns: 'Promise<CourseContent[]>' },
      { name: 'findRequiredContent', description: 'Get required content for day', params: 'env: Env, projectId: string, day: number', returns: 'Promise<CourseContent[]>' },
    ],
    relatedEntities: ['ResetProjectEntity', 'UserProgressEntity', 'ContentCommentEntity'],
    usedBy: ['worker/user-routes.ts', 'src/pages/app/CoursePage.tsx', 'src/components/admin/ContentManager.tsx'],
  },
  {
    name: 'UserProgressEntity',
    filePath: 'worker/entities.ts',
    description: 'Tracks user progress through course content - video watch time, quiz attempts, completion status.',
    fields: [
      { name: 'id', type: 'string', description: 'Composite key: enrollmentId-contentId' },
      { name: 'enrollmentId', type: 'string', description: 'Enrollment this tracks' },
      { name: 'contentId', type: 'string', description: 'Content being tracked' },
      { name: 'userId', type: 'string', description: 'User ID' },
      { name: 'projectId', type: 'string', description: 'Project ID' },
      { name: 'status', type: 'ProgressStatus', description: 'not_started|in_progress|completed' },
      { name: 'videoProgress', type: 'number', description: 'Video watch progress 0-100' },
      { name: 'videoCurrentTime', type: 'number', description: 'Last playback position' },
      { name: 'quizAttempts', type: 'number', description: 'Number of quiz attempts' },
      { name: 'quizBestScore', type: 'number', description: 'Best quiz score 0-100' },
      { name: 'quizPassed', type: 'boolean', description: 'Whether passed quiz' },
      { name: 'completedAt', type: 'number', description: 'When marked complete' },
      { name: 'pointsAwarded', type: 'number', description: 'Points earned' },
      { name: 'liked', type: 'boolean', description: 'User liked this content' },
      { name: 'createdAt', type: 'number', description: 'First interaction' },
      { name: 'updatedAt', type: 'number', description: 'Last update' },
    ],
    methods: [
      { name: 'findByEnrollmentAndContent', description: 'Get specific progress', params: 'env: Env, enrollmentId: string, contentId: string', returns: 'Promise<UserProgress | null>' },
      { name: 'findByEnrollment', description: 'Get all progress for enrollment', params: 'env: Env, enrollmentId: string', returns: 'Promise<UserProgress[]>' },
      { name: 'findByContent', description: 'Get all progress for content', params: 'env: Env, contentId: string', returns: 'Promise<UserProgress[]>' },
      { name: 'getOrCreate', description: 'Get or create progress record', params: 'env: Env, enrollmentId: string, contentId: string', returns: 'Promise<UserProgress>' },
      { name: 'updateVideoProgress', description: 'Update video watch progress', params: 'env: Env, progressId: string, progress: number, currentTime: number', returns: 'Promise<void>' },
      { name: 'markCompleted', description: 'Mark content as completed', params: 'env: Env, progressId: string', returns: 'Promise<void>' },
      { name: 'recordQuizAttempt', description: 'Record quiz attempt', params: 'env: Env, progressId: string, score: number', returns: 'Promise<QuizResultResponse>' },
    ],
    relatedEntities: ['ProjectEnrollmentEntity', 'CourseContentEntity'],
    usedBy: ['worker/user-routes.ts', 'src/pages/app/VideoPlayerPage.tsx'],
  },
  {
    name: 'ContentCommentEntity',
    filePath: 'worker/entities.ts',
    description: 'Stores comments on course content. Supports threaded replies and likes.',
    fields: [
      { name: 'id', type: 'string', description: 'Unique comment ID' },
      { name: 'contentId', type: 'string', description: 'Content being commented on' },
      { name: 'userId', type: 'string', description: 'Comment author' },
      { name: 'userName', type: 'string', description: 'Author name for display' },
      { name: 'userAvatarUrl', type: 'string', description: 'Author avatar' },
      { name: 'text', type: 'string', description: 'Comment text' },
      { name: 'parentId', type: 'string', description: 'Parent comment for replies' },
      { name: 'likesCount', type: 'number', description: 'Number of likes' },
      { name: 'likedBy', type: 'string[]', description: 'User IDs who liked' },
      { name: 'createdAt', type: 'number', description: 'Post timestamp' },
      { name: 'updatedAt', type: 'number', description: 'Edit timestamp' },
    ],
    methods: [
      { name: 'findByContent', description: 'Get comments for content', params: 'env: Env, contentId: string', returns: 'Promise<ContentComment[]>' },
      { name: 'addComment', description: 'Add new comment', params: 'env: Env, contentId: string, userId: string, text: string, parentId?: string', returns: 'Promise<ContentComment>' },
      { name: 'toggleLike', description: 'Toggle like on comment', params: 'env: Env, commentId: string, userId: string', returns: 'Promise<boolean>' },
    ],
    relatedEntities: ['CourseContentEntity', 'UserEntity'],
    usedBy: ['worker/user-routes.ts', 'src/components/course/CommentSection.tsx'],
  },

  // ============================================================================
  // COUPON ENTITIES
  // ============================================================================
  {
    name: 'CouponUsageEntity',
    filePath: 'worker/entities.ts',
    description: 'Tracks coupon code usage to prevent reuse and gather analytics.',
    fields: [
      { name: 'id', type: 'string', description: 'Usage ID' },
      { name: 'code', type: 'string', description: 'Coupon code used' },
      { name: 'userId', type: 'string', description: 'User who used coupon' },
      { name: 'discount', type: 'number', description: 'Discount applied in cents' },
      { name: 'projectId', type: 'string', description: 'Project enrolled with coupon' },
      { name: 'usedAt', type: 'number', description: 'Usage timestamp' },
    ],
    methods: [
      { name: 'findByCode', description: 'Get all uses of a coupon', params: 'env: Env, code: string', returns: 'Promise<CouponUsage[]>' },
      { name: 'hasUserUsedCoupon', description: 'Check if user already used coupon', params: 'env: Env, userId: string, code: string', returns: 'Promise<boolean>' },
      { name: 'recordUsage', description: 'Record coupon usage', params: 'env: Env, userId: string, code: string, discount: number, projectId: string', returns: 'Promise<void>' },
    ],
    relatedEntities: ['UserEntity', 'ProjectEnrollmentEntity'],
    usedBy: ['worker/user-routes.ts'],
  },

  // ============================================================================
  // NOTIFICATION ENTITIES
  // ============================================================================
  {
    name: 'NotificationEntity',
    filePath: 'worker/entities.ts',
    description: 'Stores user notifications for team updates, achievements, and system messages.',
    fields: [
      { name: 'id', type: 'string', description: 'Unique notification ID' },
      { name: 'userId', type: 'string', description: 'Recipient user' },
      { name: 'type', type: 'NotificationType', description: 'new_team_member|achievement|system|reminder' },
      { name: 'title', type: 'string', description: 'Notification title' },
      { name: 'message', type: 'string', description: 'Notification body' },
      { name: 'data', type: 'object', description: 'Additional context data' },
      { name: 'read', type: 'boolean', description: 'Whether user has read' },
      { name: 'readAt', type: 'number', description: 'When marked as read' },
      { name: 'createdAt', type: 'number', description: 'Creation timestamp' },
    ],
    methods: [
      { name: 'createNotification', description: 'Create new notification', params: 'env: Env, userId: string, type: string, title: string, message: string, data?: object', returns: 'Promise<Notification>' },
      { name: 'findByUser', description: 'Get user notifications', params: 'env: Env, userId: string, limit?: number', returns: 'Promise<Notification[]>' },
      { name: 'getUnreadCount', description: 'Count unread notifications', params: 'env: Env, userId: string', returns: 'Promise<number>' },
      { name: 'markAsRead', description: 'Mark notification as read', params: 'env: Env, notificationId: string', returns: 'Promise<void>' },
      { name: 'markAllAsRead', description: 'Mark all as read for user', params: 'env: Env, userId: string', returns: 'Promise<void>' },
    ],
    relatedEntities: ['UserEntity'],
    usedBy: ['worker/user-routes.ts', 'src/components/notification-bell.tsx'],
  },

  // ============================================================================
  // IMPERSONATION ENTITIES
  // ============================================================================
  {
    name: 'ImpersonationSessionEntity',
    filePath: 'worker/entities.ts',
    description: 'Audit log for admin impersonation sessions. Tracks who impersonated whom and for how long.',
    fields: [
      { name: 'id', type: 'string', description: 'Session ID (imp-{timestamp}-{random})' },
      { name: 'adminUserId', type: 'string', description: 'Admin who initiated' },
      { name: 'adminUserName', type: 'string', description: 'Admin name for logs' },
      { name: 'targetUserId', type: 'string', description: 'User being impersonated' },
      { name: 'targetUserName', type: 'string', description: 'Target user name' },
      { name: 'startedAt', type: 'number', description: 'Session start timestamp' },
      { name: 'expiresAt', type: 'number', description: 'Auto-expiry (60 min from start)' },
      { name: 'endedAt', type: 'number', description: 'Manual end timestamp' },
      { name: 'reason', type: 'string', description: 'Optional reason for impersonation' },
    ],
    methods: [
      { name: 'startSession', description: 'Start impersonation session', params: 'env: Env, adminId: string, adminName: string, targetId: string, targetName: string, reason?: string', returns: 'Promise<ImpersonationSession>' },
      { name: 'endSession', description: 'End impersonation session', params: 'env: Env, sessionId: string', returns: 'Promise<void>' },
      { name: 'getRecent', description: 'Get recent sessions for audit', params: 'env: Env, limit?: number', returns: 'Promise<ImpersonationSession[]>' },
      { name: 'findByTargetUser', description: 'Find sessions for a user', params: 'env: Env, targetUserId: string', returns: 'Promise<ImpersonationSession[]>' },
    ],
    relatedEntities: ['UserEntity'],
    usedBy: ['worker/user-routes.ts', 'src/lib/auth-store.ts', 'src/components/impersonation-banner.tsx'],
  },
];
