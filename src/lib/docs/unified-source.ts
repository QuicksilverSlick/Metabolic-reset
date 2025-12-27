/**
 * Unified Documentation Source
 *
 * SINGLE SOURCE OF TRUTH for all documentation.
 * This file is used by:
 * - Frontend admin panel docs viewer
 * - Worker AI bug analysis context
 * - API documentation endpoints
 *
 * When updating documentation, update HERE ONLY.
 * The system auto-syncs to all consumers.
 *
 * @coverage 100% - All APIs, entities, and components documented
 * @lastUpdated 2025-12-23
 */

import type { AIDocSection, AIDocArticle, APIEndpointDoc, ComponentDoc, EntityDoc, ErrorCodeDoc } from './ai-types';

// Import comprehensive documentation from dedicated files
import { FULL_API_ENDPOINTS as ALL_API_ENDPOINTS } from './api-docs-full';
import { FULL_ENTITIES as ALL_ENTITIES } from './entity-docs-full';
import { ALL_COMPONENTS } from './component-docs-full';

// ============================================================================
// PLATFORM OVERVIEW
// ============================================================================

export const PLATFORM_CONTEXT = `
The Metabolic Reset Project is a 28-day health transformation platform.

TECH STACK:
- Frontend: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Cloudflare Workers + Durable Objects + Hono
- Database: Cloudflare D1 (SQLite)
- Storage: Cloudflare R2 (images/videos)
- Payments: Stripe (one-time $28 per project)
- Auth: Phone-based OTP via Twilio
- AI: Gemini 3 Flash via Cloudflare AI Gateway

KEY FEATURES:
- Daily habit tracking (water, steps, sleep, lessons)
- Weekly biometric submissions with photo evidence
- Course content with videos and quizzes
- Group leader referral system (genealogy tree)
- Admin panel for user management
- AI-powered bug analysis

USER ROLES:
1. Participants: Pay $28, track habits, submit biometrics (role=participant)
2. Group Facilitators: Free registration, referral links, group roster (role=facilitator)
3. Administrators: Full access, impersonation, content management (role=admin)

TERMINOLOGY (Legacy -> Current):
- Captain -> Group Leader (user who leads a group)
- Coach -> Facilitator (role type)
- Challenger -> Participant (regular user)
- Team -> Group (collection of participants)
- Challenge -> Project (28-day program)
- Recruits -> Group Members (users in a group)

KEY FILES:
- src/pages/app/AdminPage.tsx - Main admin panel
- src/pages/app/DashboardPage.tsx - User dashboard
- src/lib/terminology.ts - UI text constants
- worker/user-routes.ts - All API endpoints (~6600 lines)
- worker/entities.ts - Durable Object entities (~1400 lines)
- shared/types.ts - TypeScript type definitions (~700 lines)
`.trim();

// ============================================================================
// API ENDPOINT DOCUMENTATION
// ============================================================================

export const API_ENDPOINTS: APIEndpointDoc[] = [
  // Bug Reporting APIs
  {
    method: 'POST',
    path: '/api/bugs',
    description: 'Submit a new bug report with optional screenshot/video',
    authentication: 'user',
    requestBody: {
      type: 'BugReportSubmitRequest',
      description: 'Bug report details',
      fields: [
        { name: 'title', type: 'string', required: true, description: 'Brief summary of the bug' },
        { name: 'description', type: 'string', required: true, description: 'Detailed description' },
        { name: 'severity', type: 'BugSeverity', required: true, description: 'low | medium | high | critical' },
        { name: 'category', type: 'BugCategory', required: true, description: 'ui | functionality | performance | data | other' },
        { name: 'screenshotUrl', type: 'string', required: false, description: 'R2 URL of screenshot' },
        { name: 'videoUrl', type: 'string', required: false, description: 'R2 URL of screen recording' },
        { name: 'pageUrl', type: 'string', required: true, description: 'Page where bug occurred' },
        { name: 'userAgent', type: 'string', required: true, description: 'Browser/device info' },
      ],
    },
    responseBody: { type: 'BugReport', description: 'Created bug report' },
    errorCodes: [
      { code: 400, message: 'Bad Request', description: 'Invalid request body' },
      { code: 401, message: 'Unauthorized', description: 'User not authenticated' },
    ],
    sourceFile: 'worker/user-routes.ts',
    sourceLine: 3561,
  },
  {
    method: 'GET',
    path: '/api/bugs/mine',
    description: 'Get bug reports submitted by the current user',
    authentication: 'user',
    responseBody: { type: 'BugReport[]', description: 'Array of bug reports' },
    errorCodes: [
      { code: 401, message: 'Unauthorized', description: 'User not authenticated' },
    ],
    sourceFile: 'worker/user-routes.ts',
    sourceLine: 3611,
  },
  {
    method: 'GET',
    path: '/api/admin/bugs',
    description: 'Get all bug reports (admin only)',
    authentication: 'admin',
    responseBody: { type: 'BugReport[]', description: 'All bug reports sorted by date' },
    errorCodes: [
      { code: 401, message: 'Unauthorized', description: 'Not authenticated' },
      { code: 403, message: 'Forbidden', description: 'Admin access required' },
    ],
    sourceFile: 'worker/user-routes.ts',
    sourceLine: 3624,
  },
  {
    method: 'GET',
    path: '/api/admin/bugs/status/:status',
    description: 'Get bug reports filtered by status',
    authentication: 'admin',
    responseBody: { type: 'BugReport[]', description: 'Filtered bug reports' },
    errorCodes: [
      { code: 400, message: 'Bad Request', description: 'Invalid status value' },
      { code: 403, message: 'Forbidden', description: 'Admin access required' },
    ],
    sourceFile: 'worker/user-routes.ts',
    sourceLine: 3637,
  },
  {
    method: 'GET',
    path: '/api/admin/bugs/:bugId',
    description: 'Get a specific bug report by ID',
    authentication: 'admin',
    responseBody: { type: 'BugReport', description: 'Bug report details' },
    errorCodes: [
      { code: 404, message: 'Not Found', description: 'Bug report not found' },
      { code: 403, message: 'Forbidden', description: 'Admin access required' },
    ],
    sourceFile: 'worker/user-routes.ts',
    sourceLine: 3655,
  },
  {
    method: 'PATCH',
    path: '/api/admin/bugs/:bugId',
    description: 'Update bug report status or admin notes',
    authentication: 'admin',
    requestBody: {
      type: 'BugReportUpdateRequest',
      description: 'Fields to update',
      fields: [
        { name: 'status', type: 'BugStatus', required: false, description: 'open | in_progress | resolved | closed' },
        { name: 'adminNotes', type: 'string', required: false, description: 'Internal admin notes' },
      ],
    },
    responseBody: { type: 'BugReport', description: 'Updated bug report' },
    errorCodes: [
      { code: 404, message: 'Not Found', description: 'Bug report not found' },
      { code: 403, message: 'Forbidden', description: 'Admin access required' },
    ],
    sourceFile: 'worker/user-routes.ts',
    sourceLine: 3672,
  },
  {
    method: 'DELETE',
    path: '/api/admin/bugs/:bugId',
    description: 'Delete a bug report',
    authentication: 'admin',
    responseBody: { type: '{ success: boolean }', description: 'Deletion result' },
    errorCodes: [
      { code: 404, message: 'Not Found', description: 'Bug report not found' },
      { code: 403, message: 'Forbidden', description: 'Admin access required' },
    ],
    sourceFile: 'worker/user-routes.ts',
    sourceLine: 3705,
  },
  {
    method: 'POST',
    path: '/api/admin/bugs/:bugId/analyze',
    description: 'Trigger AI analysis of a bug report',
    authentication: 'admin',
    requestBody: {
      type: 'AnalyzeBugRequest',
      description: 'Analysis options',
      fields: [
        { name: 'includeScreenshot', type: 'boolean', required: false, description: 'Include screenshot in analysis' },
        { name: 'includeVideo', type: 'boolean', required: false, description: 'Include video in analysis' },
      ],
    },
    responseBody: { type: 'AnalyzeBugResponse', description: 'Analysis result' },
    errorCodes: [
      { code: 404, message: 'Not Found', description: 'Bug report not found' },
      { code: 500, message: 'Analysis Failed', description: 'AI analysis error' },
    ],
    sourceFile: 'worker/user-routes.ts',
    sourceLine: 3734,
  },
  {
    method: 'GET',
    path: '/api/admin/bugs/:bugId/analysis',
    description: 'Get the latest AI analysis for a bug',
    authentication: 'admin',
    responseBody: { type: 'BugAIAnalysis', description: 'Latest analysis or null' },
    errorCodes: [
      { code: 404, message: 'Not Found', description: 'Bug report not found' },
      { code: 403, message: 'Forbidden', description: 'Admin access required' },
    ],
    sourceFile: 'worker/user-routes.ts',
    sourceLine: 3821,
  },
  // User APIs
  {
    method: 'GET',
    path: '/api/me',
    description: 'Get current authenticated user profile',
    authentication: 'user',
    responseBody: { type: 'User', description: 'User profile' },
    errorCodes: [
      { code: 401, message: 'Unauthorized', description: 'Not authenticated' },
    ],
    sourceFile: 'worker/user-routes.ts',
    sourceLine: 245,
  },
  {
    method: 'GET',
    path: '/api/admin/users',
    description: 'Get all users (admin only)',
    authentication: 'admin',
    responseBody: { type: 'User[]', description: 'All users' },
    errorCodes: [
      { code: 403, message: 'Forbidden', description: 'Admin access required' },
    ],
    sourceFile: 'worker/user-routes.ts',
    sourceLine: 500,
  },
  {
    method: 'POST',
    path: '/api/admin/impersonate/:userId',
    description: 'Start impersonating a user (admin only)',
    authentication: 'admin',
    responseBody: { type: 'ImpersonationSession', description: 'Session details with expiry' },
    errorCodes: [
      { code: 404, message: 'Not Found', description: 'User not found' },
      { code: 403, message: 'Forbidden', description: 'Admin access required' },
    ],
    sourceFile: 'worker/user-routes.ts',
    sourceLine: 890,
  },
  // OTP Auth APIs
  {
    method: 'POST',
    path: '/api/otp/send',
    description: 'Send OTP code to phone number',
    authentication: 'none',
    requestBody: {
      type: 'SendOtpRequest',
      description: 'Phone number to send OTP',
      fields: [
        { name: 'phone', type: 'string', required: true, description: 'Phone in E.164 format (+1XXXXXXXXXX)' },
      ],
    },
    responseBody: { type: 'SendOtpResponse', description: 'Send result with expiry info' },
    errorCodes: [
      { code: 400, message: 'Bad Request', description: 'Invalid phone format' },
      { code: 429, message: 'Too Many Requests', description: 'Rate limit exceeded' },
    ],
    sourceFile: 'worker/user-routes.ts',
    sourceLine: 120,
  },
  {
    method: 'POST',
    path: '/api/otp/verify',
    description: 'Verify OTP code and authenticate',
    authentication: 'none',
    requestBody: {
      type: 'VerifyOtpRequest',
      description: 'OTP verification',
      fields: [
        { name: 'phone', type: 'string', required: true, description: 'Phone in E.164 format' },
        { name: 'code', type: 'string', required: true, description: '6-digit OTP code' },
      ],
    },
    responseBody: { type: 'VerifyOtpResponse', description: 'User data or new user flag' },
    errorCodes: [
      { code: 400, message: 'Bad Request', description: 'Invalid code format' },
      { code: 401, message: 'Invalid Code', description: 'Wrong OTP code' },
      { code: 429, message: 'Too Many Attempts', description: 'Max attempts exceeded' },
    ],
    sourceFile: 'worker/user-routes.ts',
    sourceLine: 160,
  },
  // Daily Habits APIs
  {
    method: 'GET',
    path: '/api/score',
    description: 'Get current day habit score',
    authentication: 'user',
    responseBody: { type: 'DailyScore', description: 'Today\'s habit completion' },
    errorCodes: [
      { code: 401, message: 'Unauthorized', description: 'Not authenticated' },
    ],
    sourceFile: 'worker/user-routes.ts',
    sourceLine: 1200,
  },
  {
    method: 'POST',
    path: '/api/score',
    description: 'Update daily habit score',
    authentication: 'user',
    requestBody: {
      type: 'DailyScoreUpdate',
      description: 'Habit toggles',
      fields: [
        { name: 'water', type: 'boolean', required: false, description: 'Water goal completed' },
        { name: 'steps', type: 'boolean', required: false, description: 'Steps goal completed' },
        { name: 'sleep', type: 'boolean', required: false, description: 'Sleep goal completed' },
        { name: 'lesson', type: 'boolean', required: false, description: 'Daily lesson completed' },
      ],
    },
    responseBody: { type: 'DailyScore', description: 'Updated score' },
    errorCodes: [
      { code: 401, message: 'Unauthorized', description: 'Not authenticated' },
      { code: 403, message: 'Impersonation Blocked', description: 'Cannot modify while impersonating' },
    ],
    sourceFile: 'worker/user-routes.ts',
    sourceLine: 1250,
  },
  // Biometrics APIs
  {
    method: 'GET',
    path: '/api/biometrics',
    description: 'Get all biometric submissions for current project',
    authentication: 'user',
    responseBody: { type: 'WeeklyBiometric[]', description: 'Week 0-4 submissions' },
    errorCodes: [
      { code: 401, message: 'Unauthorized', description: 'Not authenticated' },
    ],
    sourceFile: 'worker/user-routes.ts',
    sourceLine: 1400,
  },
  {
    method: 'POST',
    path: '/api/biometrics',
    description: 'Submit weekly biometric data',
    authentication: 'user',
    requestBody: {
      type: 'BiometricSubmission',
      description: 'Weekly measurements',
      fields: [
        { name: 'weekNumber', type: 'number', required: true, description: 'Week 0-4' },
        { name: 'weight', type: 'number', required: true, description: 'Weight in lbs' },
        { name: 'bodyFat', type: 'number', required: false, description: 'Body fat %' },
        { name: 'visceralFat', type: 'number', required: false, description: 'Visceral fat level' },
        { name: 'leanMass', type: 'number', required: false, description: 'Lean mass lbs' },
        { name: 'metabolicAge', type: 'number', required: false, description: 'Metabolic age years' },
        { name: 'screenshotUrl', type: 'string', required: true, description: 'Scale photo proof' },
      ],
    },
    responseBody: { type: 'WeeklyBiometric', description: 'Created submission' },
    errorCodes: [
      { code: 400, message: 'Bad Request', description: 'Invalid data' },
      { code: 403, message: 'Already Submitted', description: 'Week already submitted' },
    ],
    sourceFile: 'worker/user-routes.ts',
    sourceLine: 1450,
  },
];

// ============================================================================
// ENTITY DOCUMENTATION
// ============================================================================

export const ENTITIES: EntityDoc[] = [
  {
    name: 'BugReportEntity',
    filePath: 'worker/entities.ts',
    description: 'Stores bug reports submitted by users with optional media attachments',
    fields: [
      { name: 'id', type: 'string', description: 'Unique bug ID (bug-{timestamp}-{random})' },
      { name: 'userId', type: 'string', description: 'User who submitted the bug' },
      { name: 'userName', type: 'string', description: 'Name for display' },
      { name: 'userEmail', type: 'string', description: 'Email for contact' },
      { name: 'title', type: 'string', description: 'Brief bug summary' },
      { name: 'description', type: 'string', description: 'Detailed description' },
      { name: 'severity', type: 'BugSeverity', description: 'low | medium | high | critical' },
      { name: 'category', type: 'BugCategory', description: 'ui | functionality | performance | data | other' },
      { name: 'status', type: 'BugStatus', description: 'open | in_progress | resolved | closed', indexed: true },
      { name: 'screenshotUrl', type: 'string', description: 'R2 URL for screenshot' },
      { name: 'videoUrl', type: 'string', description: 'R2 URL for screen recording' },
      { name: 'pageUrl', type: 'string', description: 'Where bug occurred' },
      { name: 'userAgent', type: 'string', description: 'Browser/device info' },
      { name: 'createdAt', type: 'number', description: 'Unix timestamp', indexed: true },
      { name: 'updatedAt', type: 'number', description: 'Last update timestamp' },
      { name: 'adminNotes', type: 'string', description: 'Internal admin notes' },
    ],
    methods: [
      { name: 'getAllSorted', description: 'Get all bugs sorted by creation date', params: 'env: Env', returns: 'Promise<BugReport[]>' },
      { name: 'findByStatus', description: 'Filter bugs by status', params: 'env: Env, status: BugStatus', returns: 'Promise<BugReport[]>' },
      { name: 'findByUser', description: 'Get bugs submitted by a user', params: 'env: Env, userId: string', returns: 'Promise<BugReport[]>' },
    ],
    relatedEntities: ['BugAIAnalysisEntity', 'UserEntity'],
    usedBy: ['worker/user-routes.ts', 'src/components/admin/BugAIAnalysisPanel.tsx'],
  },
  {
    name: 'BugAIAnalysisEntity',
    filePath: 'worker/entities.ts',
    description: 'Stores AI analysis results for bug reports',
    fields: [
      { name: 'id', type: 'string', description: 'Analysis ID (analysis-{timestamp}-{random})' },
      { name: 'bugId', type: 'string', description: 'Bug being analyzed', indexed: true },
      { name: 'status', type: 'AIAnalysisStatus', description: 'pending | processing | completed | failed' },
      { name: 'analyzedAt', type: 'number', description: 'When analysis ran', indexed: true },
      { name: 'summary', type: 'string', description: 'AI-generated summary' },
      { name: 'suggestedCause', type: 'string', description: 'Likely cause of bug' },
      { name: 'suggestedSolutions', type: 'BugSolution[]', description: 'Array of solutions' },
      { name: 'screenshotAnalysis', type: 'ScreenshotAnalysis', description: 'Vision analysis of screenshot' },
      { name: 'videoAnalysis', type: 'VideoAnalysis', description: 'Analysis of video recording' },
      { name: 'relatedDocs', type: 'DocReference[]', description: 'Links to relevant docs' },
      { name: 'modelUsed', type: 'string', description: 'AI model used (gemini-3-flash-preview)' },
      { name: 'confidence', type: 'AIAnalysisConfidence', description: 'low | medium | high' },
      { name: 'processingTimeMs', type: 'number', description: 'How long analysis took' },
      { name: 'error', type: 'string', description: 'Error message if failed' },
    ],
    methods: [
      { name: 'findByBugId', description: 'Find analysis for a bug', params: 'env: Env, bugId: string', returns: 'Promise<BugAIAnalysis | null>' },
      { name: 'getLatestForBug', description: 'Get most recent analysis', params: 'env: Env, bugId: string', returns: 'Promise<BugAIAnalysis | null>' },
      { name: 'createPending', description: 'Create pending analysis', params: 'env: Env, bugId: string', returns: 'Promise<BugAIAnalysis>' },
      { name: 'complete', description: 'Mark analysis complete with results', params: 'env: Env, analysisId: string, result: Partial<BugAIAnalysis>', returns: 'Promise<void>' },
      { name: 'markFailed', description: 'Mark analysis as failed', params: 'env: Env, analysisId: string, error: string', returns: 'Promise<void>' },
    ],
    relatedEntities: ['BugReportEntity'],
    usedBy: ['worker/user-routes.ts', 'worker/ai-utils.ts'],
  },
  {
    name: 'UserEntity',
    filePath: 'worker/entities.ts',
    description: 'User accounts with profile, roles, and project enrollment',
    fields: [
      { name: 'id', type: 'string', description: 'Unique user ID' },
      { name: 'phone', type: 'string', description: 'Phone in E.164 format', unique: true },
      { name: 'email', type: 'string', description: 'Email address', unique: true },
      { name: 'name', type: 'string', description: 'Display name' },
      { name: 'avatarUrl', type: 'string', description: 'Profile photo URL' },
      { name: 'isAdmin', type: 'boolean', description: 'Administrator access' },
      { name: 'isGroupLeader', type: 'boolean', description: 'Coach status' },
      { name: 'referralCode', type: 'string', description: 'Unique referral code', unique: true },
      { name: 'referredBy', type: 'string', description: 'Referrer\'s user ID' },
      { name: 'currentProjectId', type: 'string', description: 'Active project' },
      { name: 'points', type: 'number', description: 'Total points earned' },
      { name: 'createdAt', type: 'number', description: 'Registration timestamp' },
    ],
    methods: [
      { name: 'findByPhone', description: 'Find user by phone', params: 'env: Env, phone: string', returns: 'Promise<User | null>' },
      { name: 'findByEmail', description: 'Find user by email', params: 'env: Env, email: string', returns: 'Promise<User | null>' },
      { name: 'findByReferralCode', description: 'Find user by referral code', params: 'env: Env, code: string', returns: 'Promise<User | null>' },
    ],
    relatedEntities: ['ProjectEnrollmentEntity', 'DailyScoreEntity', 'WeeklyBiometricEntity'],
    usedBy: ['worker/user-routes.ts', 'src/lib/auth-store.ts'],
  },
  {
    name: 'ImpersonationSessionEntity',
    filePath: 'worker/entities.ts',
    description: 'Tracks admin impersonation sessions for audit',
    fields: [
      { name: 'id', type: 'string', description: 'Session ID (imp-{timestamp}-{random})' },
      { name: 'adminUserId', type: 'string', description: 'Admin who initiated' },
      { name: 'adminUserName', type: 'string', description: 'Admin name for logs' },
      { name: 'targetUserId', type: 'string', description: 'User being impersonated' },
      { name: 'targetUserName', type: 'string', description: 'Target user name' },
      { name: 'startedAt', type: 'number', description: 'Session start timestamp' },
      { name: 'expiresAt', type: 'number', description: 'Auto-expire timestamp (60 min)' },
      { name: 'endedAt', type: 'number', description: 'Manual end timestamp' },
      { name: 'reason', type: 'string', description: 'Optional reason for impersonation' },
    ],
    methods: [
      { name: 'startSession', description: 'Create new impersonation session', params: 'env: Env, adminId: string, targetId: string, ...', returns: 'Promise<ImpersonationSession>' },
      { name: 'endSession', description: 'End an active session', params: 'env: Env, sessionId: string', returns: 'Promise<void>' },
      { name: 'isExpired', description: 'Check if session is expired', params: 'session: ImpersonationSession', returns: 'boolean' },
      { name: 'getRecent', description: 'Get recent sessions for audit', params: 'env: Env, limit?: number', returns: 'Promise<ImpersonationSession[]>' },
    ],
    relatedEntities: ['UserEntity'],
    usedBy: ['worker/user-routes.ts', 'src/lib/auth-store.ts', 'src/components/impersonation-banner.tsx'],
  },
];

// ============================================================================
// COMPONENT DOCUMENTATION
// ============================================================================

export const COMPONENTS: ComponentDoc[] = [
  {
    name: 'BugAIAnalysisPanel',
    filePath: 'src/components/admin/BugAIAnalysisPanel.tsx',
    description: 'Displays AI analysis results for a bug report with solutions, screenshot/video analysis, and related docs',
    props: [
      { name: 'bugId', type: 'string', required: true, description: 'Bug report ID to show analysis for' },
      { name: 'hasScreenshot', type: 'boolean', required: true, description: 'Whether bug has screenshot' },
      { name: 'hasVideo', type: 'boolean', required: true, description: 'Whether bug has video' },
    ],
    hooks: ['useBugAIAnalysis', 'useAnalyzeBug'],
    usedBy: ['AdminPage.tsx (Bugs tab)'],
    uses: ['Button', 'Card', 'Badge', 'Collapsible'],
    stateManagement: 'React Query for server state',
    examples: ['<BugAIAnalysisPanel bugId="bug-123" hasScreenshot={true} hasVideo={false} />'],
  },
  {
    name: 'DocsTab',
    filePath: 'src/components/admin/docs/DocsTab.tsx',
    description: 'Main documentation viewer in admin panel with sidebar navigation and search',
    props: [
      { name: 'targetSection', type: 'string | null', required: false, description: 'Section to navigate to' },
      { name: 'targetArticle', type: 'string | null', required: false, description: 'Article to navigate to' },
      { name: 'onClearTarget', type: '() => void', required: false, description: 'Callback after navigation' },
    ],
    hooks: [],
    usedBy: ['AdminPage.tsx'],
    uses: ['DocsSidebar', 'DocsSearch', 'DocsArticle', 'Card'],
    stateManagement: 'Local React state for navigation',
  },
  {
    name: 'FloatingBugCapture',
    filePath: 'src/components/FloatingBugCapture.tsx',
    description: 'Floating bug icon button that opens the bug report dialog',
    props: [],
    hooks: ['useBugReportStore'],
    usedBy: ['App.tsx (global)'],
    uses: ['BugReportDialog', 'Button'],
    stateManagement: 'Zustand bug-report-store',
  },
  {
    name: 'BugReportDialog',
    filePath: 'src/components/BugReportDialog.tsx',
    description: 'Modal dialog for submitting bug reports with screenshot/video capture',
    props: [],
    hooks: ['useBugReportStore', 'useSubmitBugReport'],
    usedBy: ['FloatingBugCapture'],
    uses: ['Dialog', 'Form', 'Select', 'Textarea', 'Button'],
    stateManagement: 'Zustand for form state, React Query for submission',
  },
  {
    name: 'ImpersonationBanner',
    filePath: 'src/components/impersonation-banner.tsx',
    description: 'Banner shown during impersonation with countdown timer and exit button',
    props: [],
    hooks: ['useAuthStore'],
    usedBy: ['App.tsx (conditional)'],
    uses: ['Button', 'Badge'],
    stateManagement: 'Zustand auth-store for impersonation state',
  },
];

// ============================================================================
// ERROR CODE DOCUMENTATION
// ============================================================================

export const ERROR_CODES: ErrorCodeDoc[] = [
  {
    code: 'AUTH_NOT_AUTHENTICATED',
    httpStatus: 401,
    message: 'Not authenticated',
    description: 'User is not logged in or session has expired',
    possibleCauses: [
      'Session token expired',
      'User logged out in another tab',
      'Browser cleared cookies/storage',
      'JWT verification failed',
    ],
    solutions: [
      'Redirect user to login page',
      'Clear local storage and re-authenticate',
      'Check if OTP verification completed',
    ],
    relatedFiles: ['worker/user-routes.ts', 'src/lib/auth-store.ts'],
    relatedDocs: ['user-management:authentication'],
  },
  {
    code: 'AUTH_ADMIN_REQUIRED',
    httpStatus: 403,
    message: 'Admin access required',
    description: 'Endpoint requires admin privileges but user is not an admin',
    possibleCauses: [
      'User isAdmin flag is false',
      'Attempting to access admin-only route',
      'Impersonating a non-admin user',
    ],
    solutions: [
      'Verify user has isAdmin: true in database',
      'Contact administrator for access upgrade',
      'End impersonation session if active',
    ],
    relatedFiles: ['worker/user-routes.ts'],
    relatedDocs: ['user-management:user-roles'],
  },
  {
    code: 'IMPERSONATION_BLOCKED',
    httpStatus: 403,
    message: 'Cannot perform this action while impersonating',
    description: 'Mutation attempted during impersonation session (view-only mode)',
    possibleCauses: [
      'Admin tried to submit data while impersonating',
      'assertNotImpersonating guard triggered',
    ],
    solutions: [
      'End impersonation session before making changes',
      'Make changes through admin panel directly',
      'This is expected security behavior',
    ],
    relatedFiles: ['src/hooks/use-queries.ts', 'worker/user-routes.ts'],
    relatedDocs: ['impersonation:view-only-mode'],
  },
  {
    code: 'BUG_NOT_FOUND',
    httpStatus: 404,
    message: 'Bug report not found',
    description: 'The requested bug report does not exist',
    possibleCauses: [
      'Bug was deleted',
      'Invalid bug ID format',
      'Bug ID from different environment',
    ],
    solutions: [
      'Verify bug ID is correct',
      'Check if bug was soft-deleted',
      'Refresh bug list from server',
    ],
    relatedFiles: ['worker/user-routes.ts', 'worker/entities.ts'],
    relatedDocs: ['bug-tracking:managing-bugs'],
  },
  {
    code: 'AI_ANALYSIS_FAILED',
    httpStatus: 500,
    message: 'AI analysis failed',
    description: 'Gemini API call failed during bug analysis',
    possibleCauses: [
      'GEMINI_API_KEY not configured',
      'AI_GATEWAY_ACCOUNT_ID missing',
      'Gemini API rate limit exceeded',
      'Invalid image/video format',
      'Network timeout to Gemini',
    ],
    solutions: [
      'Verify AI Gateway configuration in wrangler.toml',
      'Check Cloudflare AI Gateway dashboard for errors',
      'Retry analysis after a few minutes',
      'Check image is valid PNG/JPEG under 4MB',
    ],
    relatedFiles: ['worker/ai-utils.ts', 'worker/user-routes.ts'],
    relatedDocs: ['bug-tracking:ai-analysis'],
  },
  {
    code: 'OTP_EXPIRED',
    httpStatus: 401,
    message: 'OTP code has expired',
    description: 'The verification code is older than 10 minutes',
    possibleCauses: [
      'User waited too long to enter code',
      'Code was sent more than 10 minutes ago',
    ],
    solutions: [
      'Request a new OTP code',
      'Inform user codes expire after 10 minutes',
    ],
    relatedFiles: ['worker/entities.ts', 'worker/user-routes.ts'],
    relatedDocs: ['user-management:authentication'],
  },
  {
    code: 'OTP_MAX_ATTEMPTS',
    httpStatus: 429,
    message: 'Too many verification attempts',
    description: 'User has exceeded 5 failed OTP attempts',
    possibleCauses: [
      'User entered wrong code 5+ times',
      'Possible brute force attempt',
    ],
    solutions: [
      'Request a new OTP code (resets attempts)',
      'Wait 10 minutes for code to expire',
    ],
    relatedFiles: ['worker/entities.ts'],
    relatedDocs: ['user-management:authentication'],
  },
];

// ============================================================================
// DOCUMENTATION SECTIONS (AI-ENHANCED)
// ============================================================================

export const documentationSections: AIDocSection[] = [
  {
    id: 'overview',
    title: 'Getting Started',
    description: 'Platform overview and quick start guides',
    icon: 'BookOpen',
    order: 1,
    aiContext: 'Overview section covers platform introduction, admin navigation, and quick start tasks. Reference when bugs relate to general navigation or onboarding.',
    relatedSections: ['user-management', 'bug-tracking'],
    articles: [
      {
        id: 'introduction',
        title: 'Platform Introduction',
        description: 'Overview of the Metabolic Reset Challenge platform',
        tags: ['overview', 'introduction', 'getting-started', 'architecture'],
        lastUpdated: '2024-12-23',
        importance: 10,
        symptoms: ['new user confusion', 'platform overview needed', 'architecture question'],
        codeReferences: [
          { filePath: 'package.json', description: 'Project dependencies and scripts', type: 'config' },
          { filePath: 'wrangler.jsonc', description: 'Cloudflare Worker configuration', type: 'config' },
          { filePath: 'src/App.tsx', description: 'Main React application entry', type: 'component' },
        ],
        content: `
# Metabolic Reset Challenge Platform

Welcome to the admin documentation for the Metabolic Reset Challenge platform. This living documentation system provides comprehensive guides for managing all aspects of the platform.

## What is This Platform?

The Metabolic Reset Challenge is a 28-day health transformation program that combines:

- **Daily Habit Tracking**: Water intake, steps, sleep, and lesson completion
- **Weekly Biometrics**: Weight and measurement tracking with photo evidence
- **Educational Content**: Video courses and quizzes
- **Community Support**: Coach-led teams and accountability groups
- **Gamification**: Points, streaks, and leaderboards

## Platform Architecture

| Component | Technology |
|-----------|------------|
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Cloudflare Workers + Durable Objects |
| Database | Cloudflare D1 (SQLite) |
| Storage | Cloudflare R2 (images/videos) |
| Payments | Stripe (one-time $28 per project) |
| Auth | Phone-based OTP via Twilio |
| AI | Gemini 3 Flash via Cloudflare AI Gateway |

## Key User Roles

### Participants
Regular users who enroll in challenges. They:
- Pay $28 per project enrollment
- Track daily habits
- Submit weekly biometrics
- Complete course content

### Coaches (Group Leaders)
Team leaders who recruit participants. They:
- Register for free (no payment required)
- Get unique referral links
- View their team roster
- Track team progress and leads

### Administrators
Platform managers with full access. They:
- Manage all users and projects
- View system-wide analytics
- Configure content and settings
- Access impersonation and debugging tools
- Use AI-powered bug analysis

## About This Documentation

This documentation is:

- **Living**: Updated alongside code changes
- **AI-Integrated**: Powers bug analysis and solutions
- **Code-Based**: Version controlled with the application
- **Searchable**: Full-text search across all articles
        `.trim(),
        relatedArticles: ['navigation', 'admin-quick-start'],
      },
      {
        id: 'navigation',
        title: 'Admin Panel Navigation',
        description: 'Guide to navigating the admin interface',
        tags: ['navigation', 'admin', 'ui', 'tabs'],
        lastUpdated: '2024-12-23',
        importance: 9,
        symptoms: ['cannot find feature', 'where is setting', 'admin tab missing'],
        codeReferences: [
          { filePath: 'src/pages/app/AdminPage.tsx', description: 'Main admin panel component', type: 'component' },
          { filePath: 'src/components/admin/ContentManager.tsx', description: 'LMS content management', type: 'component' },
        ],
        apiEndpoints: ['/api/admin/users', '/api/admin/bugs', '/api/admin/projects'],
        components: ['AdminPage', 'ContentManager', 'DocsTab'],
        content: `
# Admin Panel Navigation

The Admin Panel is your central hub for managing the Metabolic Reset platform.

## Accessing the Admin Panel

1. Log in with an admin account
2. Click **Admin Panel** in the sidebar menu
3. Only users with \`isAdmin: true\` will see this option

## Admin Tabs Overview

| Tab | Purpose | Key File |
|-----|---------|----------|
| **Users** | Manage participant and coach accounts | AdminPage.tsx |
| **Projects** | Create and configure challenge cohorts | AdminPage.tsx |
| **Content** | Manage videos, lessons, and quizzes | ContentManager.tsx |
| **Bugs** | Review and triage user-submitted bug reports | BugAIAnalysisPanel.tsx |
| **Genealogy** | View referral relationships and team structures | genealogy-tree.tsx |
| **Settings** | Configure system-wide settings | AdminPage.tsx |
| **Deleted** | View and restore soft-deleted items | AdminPage.tsx |
| **Duplicates** | Identify and merge duplicate accounts | AdminPage.tsx |
| **Payments** | View Stripe payments and transactions | AdminPage.tsx |
| **Docs** | Access this documentation system | DocsTab.tsx |

## Key API Endpoints

- \`GET /api/admin/users\` - List all users
- \`GET /api/admin/bugs\` - List all bug reports
- \`POST /api/admin/bugs/:id/analyze\` - Trigger AI analysis
- \`POST /api/admin/impersonate/:userId\` - Start impersonation
        `.trim(),
        relatedArticles: ['introduction', 'admin-quick-start'],
      },
    ],
  },
  {
    id: 'bug-tracking',
    title: 'Bug Tracking',
    description: 'Managing bug reports and AI analysis',
    icon: 'Bug',
    order: 3,
    aiContext: 'Bug tracking section covers bug submission, triage, and AI analysis. This is the most relevant section for bugs about the bug system itself.',
    relatedSections: ['overview', 'impersonation'],
    articles: [
      {
        id: 'bug-overview',
        title: 'Bug Tracking System',
        description: 'How the bug reporting system works',
        tags: ['bugs', 'overview', 'support', 'ai-analysis'],
        lastUpdated: '2024-12-23',
        importance: 10,
        symptoms: ['bug not submitting', 'screenshot not uploading', 'video not recording'],
        codeReferences: [
          { filePath: 'src/components/FloatingBugCapture.tsx', description: 'Floating bug button', type: 'component' },
          { filePath: 'src/components/BugReportDialog.tsx', description: 'Bug report form', type: 'component' },
          { filePath: 'worker/entities.ts', lineStart: 374, lineEnd: 413, description: 'BugReportEntity', type: 'entity' },
        ],
        apiEndpoints: ['/api/bugs', '/api/bugs/mine', '/api/admin/bugs'],
        entities: ['BugReportEntity', 'BugAIAnalysisEntity'],
        components: ['FloatingBugCapture', 'BugReportDialog', 'BugAIAnalysisPanel'],
        content: `
# Bug Tracking System

The platform includes a built-in bug reporting system that allows users to submit issues with screenshots and screen recordings.

## How It Works

### User Perspective
1. User encounters an issue
2. Clicks the **bug icon** floating button (bottom-right)
3. Fills out bug report form
4. Optionally captures screenshot or recording
5. Submits the report

### Admin Perspective
1. Bug appears in Admin > Bugs tab
2. Admin reviews details and media
3. Clicks "Analyze with AI" for suggestions
4. Triages and assigns priority
5. Updates status as resolved

## Bug Report Contents

| Field | Description |
|-------|-------------|
| Title | Brief summary of the issue |
| Description | Detailed explanation |
| Severity | Critical, High, Medium, Low |
| Category | UI, Functionality, Performance, Data, Other |
| Screenshot | Visual capture of the issue (R2 storage) |
| Video | Screen recording (R2 storage) |
| Page URL | Where the issue occurred |
| User Agent | Browser/device information |

## Severity Levels

| Level | Definition | Response Time |
|-------|------------|---------------|
| **Critical** | App crash, data loss, security | Immediate |
| **High** | Major feature broken | Same day |
| **Medium** | Feature partially working | This week |
| **Low** | Minor UI/UX issue | Backlog |

## Key Files

- \`src/components/FloatingBugCapture.tsx\` - Floating bug button
- \`src/components/BugReportDialog.tsx\` - Report submission form
- \`src/lib/bug-report-store.ts\` - Form state management
- \`worker/entities.ts:374\` - BugReportEntity class
- \`worker/user-routes.ts:3561\` - POST /api/bugs endpoint
        `.trim(),
        relatedArticles: ['ai-analysis', 'bug-triage'],
      },
      {
        id: 'ai-analysis',
        title: 'AI Bug Analysis',
        description: 'How the AI analyzes bugs and suggests solutions',
        tags: ['ai', 'gemini', 'analysis', 'solutions', 'screenshots', 'video'],
        lastUpdated: '2024-12-23',
        importance: 10,
        symptoms: ['analysis failed', 'no solutions generated', 'AI not working'],
        codeReferences: [
          { filePath: 'worker/ai-utils.ts', description: 'AI analysis implementation', type: 'util' },
          { filePath: 'worker/docs-context.ts', description: 'Documentation context for AI', type: 'util' },
          { filePath: 'src/components/admin/BugAIAnalysisPanel.tsx', description: 'Analysis display UI', type: 'component' },
        ],
        apiEndpoints: ['/api/admin/bugs/:bugId/analyze', '/api/admin/bugs/:bugId/analysis'],
        entities: ['BugAIAnalysisEntity'],
        components: ['BugAIAnalysisPanel'],
        errorCodes: ['AI_ANALYSIS_FAILED'],
        content: `
# AI Bug Analysis

The platform uses Gemini 3 Flash (via Cloudflare AI Gateway) to analyze bug reports and suggest solutions.

## How It Works

1. Admin clicks "Analyze with AI" on a bug report
2. System creates a pending analysis record
3. AI receives:
   - Bug title and description
   - Screenshot (if available) - analyzed with vision
   - Video URL (if available)
   - Relevant documentation context
4. AI returns structured analysis
5. Results displayed with solutions and related docs

## Analysis Components

### Screenshot Analysis
When a screenshot is included, AI identifies:
- Visible error messages
- UI elements in the screenshot
- Potential issues visible on screen

### Video Analysis
For screen recordings, AI extracts:
- Reproduction steps observed
- User actions taken
- Timestamps where errors appear

### Documentation Integration
The AI searches our documentation to:
- Find relevant articles
- Reference specific files/components
- Provide context-aware solutions

## Configuration

Required environment variables:
\`\`\`bash
AI_GATEWAY_ACCOUNT_ID=your-cloudflare-account-id
AI_GATEWAY_ID=bug-analysis
GEMINI_API_KEY=your-gemini-api-key
\`\`\`

## Troubleshooting

### "Analysis Failed" Error
1. Check AI Gateway config in Cloudflare dashboard
2. Verify GEMINI_API_KEY is set
3. Check worker logs for detailed error
4. Ensure image is < 4MB PNG/JPEG

### Low Confidence Results
- Add more detail to bug description
- Include screenshot showing the issue
- Provide reproduction steps

## Key Files

- \`worker/ai-utils.ts\` - Main AI analysis logic
- \`worker/docs-context.ts\` - Documentation context builder
- \`worker/entities.ts:1298\` - BugAIAnalysisEntity
        `.trim(),
        relatedArticles: ['bug-overview', 'bug-triage'],
      },
      {
        id: 'bug-triage',
        title: 'Bug Triage Process',
        description: 'How to prioritize and categorize bugs',
        tags: ['bugs', 'triage', 'process', 'severity'],
        lastUpdated: '2024-12-23',
        importance: 8,
        symptoms: ['too many bugs', 'prioritization needed', 'bug backlog'],
        content: `
# Bug Triage Process

Effective bug triage ensures critical issues are addressed promptly.

## Daily Triage Routine

1. **Check new submissions** (Status: Open)
2. **Run AI analysis** on bugs with screenshots/videos
3. **Review severity** - Is it correctly categorized?
4. **Assess impact** - How many users affected?
5. **Update status** to In Progress if being worked on
6. **Add admin notes** - Document findings

## Severity Assessment

### Critical
- Application crashes
- Data loss or corruption
- Security vulnerabilities
- Payment processing failures
- Users cannot log in

### High
- Major feature completely broken
- Significant data display errors
- Performance severely degraded
- Affects majority of users

### Medium
- Feature partially broken
- Minor data display issues
- Workaround exists

### Low
- Cosmetic/UI issues
- Minor UX improvements
- Edge case bugs

## Using AI Analysis

1. Open the bug in admin panel
2. Click "Analyze with AI"
3. Review suggested causes
4. Follow solution steps
5. Check related documentation
6. Update bug status when resolved
        `.trim(),
        relatedArticles: ['bug-overview', 'ai-analysis'],
      },
    ],
  },
  {
    id: 'impersonation',
    title: 'User Impersonation',
    description: 'Secure admin tool for viewing the app as any user',
    icon: 'UserCog',
    order: 4,
    aiContext: 'Impersonation section covers viewing app as other users for debugging. Relevant for bugs where admin sees different behavior than users.',
    relatedSections: ['user-management', 'bug-tracking'],
    articles: [
      {
        id: 'impersonation-overview',
        title: 'Impersonation Overview',
        description: 'What is user impersonation and when to use it',
        tags: ['security', 'admin', 'impersonation', 'debugging'],
        lastUpdated: '2024-12-23',
        importance: 9,
        symptoms: ['need to see user view', 'user reports different behavior', 'debugging user issue'],
        codeReferences: [
          { filePath: 'src/components/impersonation-banner.tsx', description: 'Impersonation UI banner', type: 'component' },
          { filePath: 'src/lib/auth-store.ts', description: 'Auth state with impersonation', type: 'util' },
          { filePath: 'worker/entities.ts', lineStart: 1227, lineEnd: 1292, description: 'ImpersonationSessionEntity', type: 'entity' },
        ],
        apiEndpoints: ['/api/admin/impersonate/:userId'],
        entities: ['ImpersonationSessionEntity'],
        components: ['ImpersonationBanner'],
        errorCodes: ['IMPERSONATION_BLOCKED'],
        content: `
# User Impersonation System

Allows administrators to securely view the application as any user for debugging.

## Key Security Features

| Feature | Description |
|---------|-------------|
| **Admin-Only** | Only \`isAdmin: true\` users can impersonate |
| **60-Minute Timeout** | Sessions auto-expire for security |
| **View-Only Mode** | All mutations blocked (assertNotImpersonating) |
| **Visual Indicator** | Banner with countdown timer |
| **Audit Logging** | Every session recorded |

## How to Impersonate

1. Go to Admin Panel > Users
2. Click the **eye icon** on any user row
3. Confirm in the dialog
4. Banner appears with timer
5. Browse app as user (read-only)
6. Click "Exit" or wait for timeout

## Blocked Actions

During impersonation, these are blocked:
- Submit daily habits
- Submit biometric data
- Update profile
- Any data modifications
- Payment submissions

## Files

- \`src/components/impersonation-banner.tsx\` - Banner UI
- \`src/lib/auth-store.ts\` - Impersonation state
- \`worker/entities.ts:1227\` - Session entity
- \`worker/user-routes.ts:890\` - API endpoint
        `.trim(),
        relatedArticles: ['impersonation-troubleshooting'],
      },
      {
        id: 'impersonation-troubleshooting',
        title: 'Impersonation Troubleshooting',
        description: 'Common issues and solutions',
        tags: ['troubleshooting', 'impersonation', 'errors'],
        lastUpdated: '2024-12-23',
        importance: 7,
        symptoms: ['cannot impersonate', 'timer missing', 'session ended unexpectedly'],
        errorCodes: ['IMPERSONATION_BLOCKED', 'AUTH_ADMIN_REQUIRED'],
        content: `
# Impersonation Troubleshooting

## Common Issues

### "Cannot impersonate user" Error
**Causes:**
- You don't have admin privileges
- Target user doesn't exist
- There's already an active session

**Solutions:**
1. Verify your \`isAdmin: true\` in database
2. Refresh user list
3. End any existing session first

### Timer Not Showing
**Causes:**
- Legacy session without \`expiresAt\`
- Browser cache issue

**Solutions:**
1. End session and start new one
2. Hard refresh (Ctrl+Shift+R)
3. Clear browser cache

### Actions Still Working (Not View-Only)
**Cause:** Mutation not guarded with \`assertNotImpersonating\`

**Solution:** Report as bug - this needs code fix

### Session Ended Unexpectedly
**Causes:**
- 60-minute timeout reached
- Another tab ended session
- Browser storage cleared

**Solution:** Start a new session if needed
        `.trim(),
        relatedArticles: ['impersonation-overview'],
      },
    ],
  },
  {
    id: 'user-management',
    title: 'User Management',
    description: 'Managing users, roles, and authentication',
    icon: 'Users',
    order: 2,
    aiContext: 'User management covers user roles, authentication, and profile management. Relevant for login issues, permission problems, and user data bugs.',
    relatedSections: ['overview', 'impersonation'],
    articles: [
      {
        id: 'user-roles',
        title: 'User Roles & Permissions',
        description: 'Understanding the different user types',
        tags: ['users', 'roles', 'permissions', 'security', 'admin', 'coach'],
        lastUpdated: '2024-12-23',
        importance: 9,
        symptoms: ['permission denied', 'cannot access feature', 'user role wrong'],
        codeReferences: [
          { filePath: 'shared/types.ts', lineStart: 1, lineEnd: 50, description: 'User type definition', type: 'type' },
          { filePath: 'worker/entities.ts', description: 'UserEntity class', type: 'entity' },
        ],
        entities: ['UserEntity'],
        errorCodes: ['AUTH_ADMIN_REQUIRED', 'AUTH_NOT_AUTHENTICATED'],
        content: `
# User Roles & Permissions

The platform has three user roles with different capabilities.

## Role Hierarchy

\`\`\`
Administrator (isAdmin: true)
    ↓
Coach (isGroupLeader: true)
    ↓
Participant (default)
\`\`\`

## Participants
- Pay $28 per enrollment
- Track habits and biometrics
- View course content
- Submit bug reports

## Coaches (Group Leaders)
- Free registration
- Unique referral link (\`referralCode\`)
- View team roster
- Track leads and conversions
- All participant capabilities

## Administrators
- Full platform access
- Manage all users and content
- Impersonate users
- Access audit logs
- View AI bug analysis

## Permission Matrix

| Action | Participant | Coach | Admin |
|--------|:-----------:|:-----:|:-----:|
| Enroll in project | $28 | Free | Free |
| Track habits | Yes | Yes | Yes |
| Get referral link | No | Yes | Yes |
| View team roster | No | Yes | Yes |
| Access admin panel | No | No | Yes |
| Impersonate users | No | No | Yes |
        `.trim(),
        relatedArticles: ['authentication'],
      },
      {
        id: 'authentication',
        title: 'Authentication System',
        description: 'Phone OTP login flow',
        tags: ['auth', 'login', 'otp', 'phone', 'twilio'],
        lastUpdated: '2024-12-23',
        importance: 10,
        symptoms: ['cannot login', 'otp not received', 'code expired', 'too many attempts'],
        codeReferences: [
          { filePath: 'src/pages/auth/OtpLoginPage.tsx', description: 'OTP login page', type: 'component' },
          { filePath: 'worker/entities.ts', lineStart: 422, lineEnd: 460, description: 'OtpEntity', type: 'entity' },
        ],
        apiEndpoints: ['/api/otp/send', '/api/otp/verify'],
        entities: ['OtpEntity', 'UserEntity'],
        errorCodes: ['OTP_EXPIRED', 'OTP_MAX_ATTEMPTS', 'AUTH_NOT_AUTHENTICATED'],
        content: `
# Authentication System

The platform uses phone-based OTP (One-Time Password) authentication via Twilio.

## Login Flow

1. User enters phone number (E.164 format: +1XXXXXXXXXX)
2. System sends 6-digit OTP via SMS
3. User enters code within 10 minutes
4. If verified:
   - Existing user: Log in
   - New user: Go to registration

## OTP Rules

- **Expiry**: 10 minutes after sending
- **Max Attempts**: 5 failed verifications
- **Code Length**: 6 digits
- **Cooldown**: Request new code anytime

## Common Issues

### OTP Not Received
1. Check phone number format (+1...)
2. Verify Twilio is configured
3. Check SMS delivery logs
4. Try resending after 30 seconds

### Code Expired
- Codes expire after 10 minutes
- Request a new code

### Too Many Attempts
- Max 5 failed attempts
- Request new code to reset

## Key Files

- \`src/pages/auth/OtpLoginPage.tsx\` - Login UI
- \`worker/entities.ts:422\` - OtpEntity
- \`worker/user-routes.ts:120\` - /api/otp/send
- \`worker/user-routes.ts:160\` - /api/otp/verify

## Environment Variables

\`\`\`bash
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
\`\`\`
        `.trim(),
        relatedArticles: ['user-roles'],
      },
    ],
  },
  {
    id: 'daily-tracking',
    title: 'Daily Habit Tracking',
    description: 'Managing daily habits, scores, and streaks',
    icon: 'CheckSquare',
    order: 5,
    aiContext: 'Daily tracking covers habit completion, points, and streaks. Relevant for bugs about habits not saving, points not updating, or streak issues.',
    relatedSections: ['overview', 'biometrics'],
    articles: [
      {
        id: 'habits-overview',
        title: 'Daily Habits System',
        description: 'How daily habit tracking works',
        tags: ['habits', 'tracking', 'dashboard', 'points', 'streaks'],
        lastUpdated: '2025-12-23',
        importance: 9,
        symptoms: ['habits not saving', 'points not updating', 'streak lost', 'checkbox not working'],
        codeReferences: [
          { filePath: 'src/pages/app/DashboardPage.tsx', description: 'Dashboard with habit toggles', type: 'component' },
          { filePath: 'worker/entities.ts', lineStart: 133, description: 'DailyScoreEntity', type: 'entity' },
        ],
        apiEndpoints: ['/api/score', '/api/scores/history'],
        entities: ['DailyScoreEntity', 'PointsLedgerEntity'],
        content: `
# Daily Habits System

Users track four daily habits to earn points and maintain streaks.

## The Four Habits

| Habit | Description | Points |
|-------|-------------|--------|
| **Water** | Drink daily water goal | Configurable |
| **Steps** | Meet step count goal | Configurable |
| **Sleep** | Get quality sleep | Configurable |
| **Lesson** | Complete daily lesson | Configurable |

## How It Works

1. User opens Dashboard
2. Toggles each completed habit
3. Points are awarded instantly
4. Progress saved to DailyScoreEntity
5. Streaks update at midnight

## Day Calculation

- Day number calculated from project start date
- Uses user's browser timezone
- DailyScore ID format: \`projectId:userId:YYYY-MM-DD\`

## Points System

- Each habit has configurable point values in SystemSettings
- Points awarded immediately on toggle
- Points recorded in PointsLedgerEntity for audit trail

## Key Files

- \`src/pages/app/DashboardPage.tsx\` - Habit UI
- \`worker/entities.ts:133\` - DailyScoreEntity
- \`worker/entities.ts:491\` - PointsLedgerEntity
- \`worker/user-routes.ts\` - GET/POST /api/score

## Common Issues

### Habits Not Saving
1. Check network connection
2. Verify user is enrolled in active project
3. Check for impersonation mode (blocks mutations)

### Points Not Updating
1. Check PointsLedgerEntity for transaction
2. Verify point values in SystemSettings
3. Check browser console for errors
        `.trim(),
        relatedArticles: ['points-system'],
      },
      {
        id: 'points-system',
        title: 'Points & Leaderboards',
        description: 'How points and rankings work',
        tags: ['points', 'leaderboard', 'gamification', 'rankings'],
        lastUpdated: '2025-12-23',
        importance: 7,
        symptoms: ['leaderboard wrong', 'points missing', 'ranking incorrect'],
        codeReferences: [
          { filePath: 'worker/entities.ts', lineStart: 491, description: 'PointsLedgerEntity', type: 'entity' },
        ],
        apiEndpoints: ['/api/leaderboard', '/api/points/history'],
        entities: ['PointsLedgerEntity', 'UserEntity', 'ProjectEnrollmentEntity'],
        content: `
# Points & Leaderboards

Gamification drives engagement through points and competitive leaderboards.

## Point Sources

| Action | Points | Entity |
|--------|--------|--------|
| Complete habit | Configurable | DailyScoreEntity |
| Submit biometrics | Configurable | WeeklyBiometricEntity |
| Complete quiz | Configurable | UserProgressEntity |
| Referral signup | Configurable | ReferralLedgerEntity |

## Leaderboard Types

- **Global**: All participants across all projects
- **Project**: Within a single challenge cohort
- **Team**: Within a coach's referral group

## Points Ledger

Every point transaction is recorded:
- User ID
- Amount (+/-)
- Source (habit, biometric, quiz, referral)
- Timestamp
- Related entity ID

## Key Files

- \`worker/entities.ts:491\` - PointsLedgerEntity
- \`src/pages/app/LeaderboardPage.tsx\` - Leaderboard UI
- \`worker/user-routes.ts\` - Leaderboard APIs
        `.trim(),
        relatedArticles: ['habits-overview'],
      },
    ],
  },
  {
    id: 'biometrics',
    title: 'Weekly Biometrics',
    description: 'Weight and body composition tracking',
    icon: 'Scale',
    order: 6,
    aiContext: 'Biometrics covers weekly measurements and photo submissions. Relevant for bugs about uploads, validation, or incorrect week numbers.',
    relatedSections: ['daily-tracking', 'overview'],
    articles: [
      {
        id: 'biometrics-overview',
        title: 'Biometric Submissions',
        description: 'How weekly biometric tracking works',
        tags: ['biometrics', 'weight', 'measurements', 'photos', 'scale'],
        lastUpdated: '2025-12-23',
        importance: 9,
        symptoms: ['cannot submit biometrics', 'photo upload failed', 'wrong week', 'validation error'],
        codeReferences: [
          { filePath: 'src/pages/app/DashboardPage.tsx', description: 'Biometrics submission form', type: 'component' },
          { filePath: 'worker/entities.ts', lineStart: 146, description: 'WeeklyBiometricEntity', type: 'entity' },
        ],
        apiEndpoints: ['/api/biometrics', '/api/upload/biometric'],
        entities: ['WeeklyBiometricEntity'],
        content: `
# Weekly Biometrics

Participants submit body composition data weekly with photo proof.

## Submission Schedule

| Week | When | Purpose |
|------|------|---------|
| Week 0 | Before start | Baseline measurements |
| Week 1-3 | During challenge | Progress tracking |
| Week 4 | End of challenge | Final results |

## Required Fields

| Field | Type | Description |
|-------|------|-------------|
| weight | number | Weight in lbs |
| bodyFat | number | Body fat percentage |
| visceralFat | number | Visceral fat level (1-59) |
| leanMass | number | Lean mass in lbs |
| metabolicAge | number | Metabolic age in years |
| screenshotUrl | string | Photo proof from smart scale |

## Photo Upload Flow

1. User takes photo of smart scale display
2. Image compressed client-side (< 4MB)
3. Uploaded to R2 via presigned URL
4. URL saved with biometric data

## Validation Rules

- Cannot submit same week twice
- All required fields must be present
- Photo must be valid image format
- Week number must match project timeline

## Key Files

- \`src/pages/app/DashboardPage.tsx\` - Submission form
- \`worker/entities.ts:146\` - WeeklyBiometricEntity
- \`worker/user-routes.ts\` - POST /api/biometrics

## WeeklyBiometric ID Format

\`projectId:userId:week0\` through \`projectId:userId:week4\`
        `.trim(),
        relatedArticles: ['scale-reminder'],
      },
      {
        id: 'scale-reminder',
        title: 'Smart Scale Integration',
        description: 'Setting up and using smart scales',
        tags: ['scale', 'hardware', 'setup', 'integration'],
        lastUpdated: '2025-12-23',
        importance: 6,
        symptoms: ['no scale', 'scale not reading', 'need to order scale'],
        codeReferences: [
          { filePath: 'src/components/scale-reminder-banner.tsx', description: 'Scale reminder banner', type: 'component' },
        ],
        content: `
# Smart Scale Integration

Users need a smart body composition scale for accurate measurements.

## Recommended Scales

Smart scales that measure:
- Weight
- Body fat percentage
- Visceral fat
- Lean mass
- Metabolic age

## Scale Reminder Banner

The ScaleReminderBanner component appears for users without a scale:
- Links to purchase page (from SystemSettings.scaleOrderUrl)
- "I Have One Now" button updates user.hasScale

## Configuration

In Admin > Settings:
- \`scaleOrderUrl\`: Link to purchase smart scale
- Controls visibility of scale reminder

## Key Files

- \`src/components/scale-reminder-banner.tsx\` - Banner component
- SystemSettings entity - URL configuration
        `.trim(),
        relatedArticles: ['biometrics-overview'],
      },
    ],
  },
  {
    id: 'content-lms',
    title: 'Course Content (LMS)',
    description: 'Managing videos, quizzes, and educational content',
    icon: 'Video',
    order: 7,
    aiContext: 'LMS section covers course content management including videos, quizzes, and progress tracking. Relevant for video playback issues, quiz problems, or content not unlocking.',
    relatedSections: ['overview', 'daily-tracking'],
    articles: [
      {
        id: 'lms-overview',
        title: 'LMS System Overview',
        description: 'How course content delivery works',
        tags: ['content', 'videos', 'quizzes', 'courses', 'lms', 'learning'],
        lastUpdated: '2025-12-23',
        importance: 8,
        symptoms: ['video not playing', 'quiz not loading', 'content locked', 'progress not saving'],
        codeReferences: [
          { filePath: 'src/pages/app/CoursePage.tsx', description: 'Course content display', type: 'component' },
          { filePath: 'src/components/admin/ContentManager.tsx', description: 'Admin content management', type: 'component' },
          { filePath: 'worker/entities.ts', lineStart: 653, description: 'CourseContentEntity', type: 'entity' },
        ],
        apiEndpoints: ['/api/content', '/api/content/:contentId/progress', '/api/admin/content'],
        entities: ['CourseContentEntity', 'UserProgressEntity'],
        components: ['ContentManager'],
        content: `
# LMS System Overview

The Learning Management System delivers educational content throughout the 28-day challenge.

## Content Types

| Type | Description | Tracking |
|------|-------------|----------|
| **Video** | Cloudflare Stream videos | Watch time, completion |
| **Quiz** | Multiple choice questions | Score, attempts |
| **Resource** | PDFs, links, downloads | View count |

## Content Unlocking

Content unlocks based on \`dayNumber\` (1-28):
- Day 1 content available on project start
- New content unlocks at midnight
- Admin can override unlock dates

## Progress Tracking

UserProgressEntity tracks:
- Video watch time (percentage)
- Quiz scores and attempts
- Completion status
- Last accessed timestamp

## Admin Content Management

ContentManager component allows:
- Create/edit/delete content
- Upload videos to Cloudflare Stream
- Build quiz questions
- Set unlock days
- View engagement analytics

## Key Files

- \`src/pages/app/CoursePage.tsx\` - Student content view
- \`src/components/admin/ContentManager.tsx\` - Admin UI
- \`worker/entities.ts:653\` - CourseContentEntity
- \`worker/entities.ts:736\` - UserProgressEntity

## Content ID Format

\`content-{projectId}-{type}-{dayNumber}-{random}\`
        `.trim(),
        relatedArticles: ['quiz-management', 'video-streaming'],
      },
      {
        id: 'quiz-management',
        title: 'Quiz System',
        description: 'Creating and managing quizzes',
        tags: ['quizzes', 'questions', 'scoring', 'attempts'],
        lastUpdated: '2025-12-23',
        importance: 7,
        symptoms: ['quiz not submitting', 'wrong score', 'cannot retry quiz', 'cooldown active'],
        codeReferences: [
          { filePath: 'worker/entities.ts', lineStart: 736, description: 'UserProgressEntity.recordQuizAttempt', type: 'entity' },
        ],
        apiEndpoints: ['/api/content/:contentId/quiz/submit'],
        entities: ['CourseContentEntity', 'UserProgressEntity'],
        content: `
# Quiz System

Quizzes test comprehension and award points.

## Quiz Configuration

| Setting | Description |
|---------|-------------|
| \`passingScore\` | Minimum % to pass (default: 80) |
| \`maxAttempts\` | Max tries (0 = unlimited) |
| \`cooldownMinutes\` | Wait time between attempts |
| \`pointsValue\` | Points for passing |

## Question Types

Currently supported:
- Multiple choice (single answer)
- Multiple choice (multi-select)

## Attempt Flow

1. User opens quiz content
2. Answers all questions
3. Submits for scoring
4. If passed: points awarded
5. If failed: can retry after cooldown

## Scoring Logic

\`\`\`
score = (correctAnswers / totalQuestions) * 100
passed = score >= passingScore
\`\`\`

## Key Files

- \`worker/entities.ts:736\` - UserProgressEntity
- \`worker/user-routes.ts\` - Quiz submission endpoint
        `.trim(),
        relatedArticles: ['lms-overview'],
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payments & Enrollment',
    description: 'Stripe integration and user enrollment',
    icon: 'CreditCard',
    order: 8,
    aiContext: 'Payments section covers Stripe checkout, enrollment, and refunds. Relevant for payment failures, enrollment issues, or coupon problems.',
    relatedSections: ['user-management', 'overview'],
    articles: [
      {
        id: 'stripe-integration',
        title: 'Stripe Integration',
        description: 'How payments and checkout work',
        tags: ['payments', 'stripe', 'checkout', 'enrollment', 'registration'],
        lastUpdated: '2025-12-23',
        importance: 10,
        symptoms: ['payment failed', 'not enrolled after payment', 'checkout error', 'card declined'],
        codeReferences: [
          { filePath: 'src/pages/auth/RegistrationPage.tsx', description: 'Registration with payment', type: 'component' },
          { filePath: 'worker/user-routes.ts', description: 'Stripe webhook handler', type: 'api' },
        ],
        apiEndpoints: ['/api/create-payment-intent', '/api/validate-coupon', '/api/register'],
        content: `
# Stripe Integration

One-time $28 payment for challenge enrollment.

## Payment Flow

1. User completes quiz funnel → QuizLead captured
2. Proceeds to registration page
3. Enters name, email, referral code (optional)
4. Stripe Checkout session created
5. User completes payment
6. Webhook confirms payment
7. User created + enrolled in project

## Coach Bypass

Group Leaders (coaches) skip payment:
- \`isGroupLeader: true\` flag
- Free enrollment via referral link
- Still creates user + enrollment

## Environment Variables

\`\`\`bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
\`\`\`

## Webhook Events

| Event | Action |
|-------|--------|
| \`checkout.session.completed\` | Create user, enroll in project |
| \`payment_intent.succeeded\` | Backup enrollment trigger |
| \`charge.refunded\` | Mark enrollment as refunded |

## Key Files

- \`src/pages/auth/RegistrationPage.tsx\` - Checkout UI
- \`worker/user-routes.ts\` - Payment endpoints
- \`worker/entities.ts\` - ProjectEnrollmentEntity
        `.trim(),
        relatedArticles: ['coupons', 'refunds'],
      },
      {
        id: 'coupons',
        title: 'Coupon System',
        description: 'Discount codes and promotions',
        tags: ['coupons', 'discounts', 'promotions', 'codes'],
        lastUpdated: '2025-12-23',
        importance: 6,
        symptoms: ['coupon not working', 'invalid code', 'coupon already used'],
        codeReferences: [
          { filePath: 'worker/entities.ts', lineStart: 1061, description: 'CouponUsageEntity', type: 'entity' },
        ],
        apiEndpoints: ['/api/validate-coupon'],
        entities: ['CouponUsageEntity'],
        content: `
# Coupon System

Discount codes for promotional pricing.

## Coupon Validation

1. User enters coupon code at checkout
2. API validates against Stripe Promotion Codes
3. If valid: discount applied
4. Usage recorded in CouponUsageEntity

## Usage Tracking

CouponUsageEntity records:
- Coupon code
- User who used it
- Timestamp
- Resulting discount amount

## One-Time Use

By default, coupons are one-per-customer:
- \`hasUserUsedCoupon()\` checks prior usage
- Returns error if already used

## Key Files

- \`worker/entities.ts:1061\` - CouponUsageEntity
- \`worker/user-routes.ts\` - Validation endpoint
        `.trim(),
        relatedArticles: ['stripe-integration'],
      },
    ],
  },
  {
    id: 'referrals',
    title: 'Referrals & Teams',
    description: 'Coach referral system and team management',
    icon: 'Users',
    order: 9,
    aiContext: 'Referrals section covers coach referral links, team rosters, and genealogy trees. Relevant for referral tracking issues or team structure bugs.',
    relatedSections: ['user-management', 'payments'],
    articles: [
      {
        id: 'referral-system',
        title: 'Referral System',
        description: 'How referral links and tracking work',
        tags: ['referrals', 'coaches', 'teams', 'links', 'tracking'],
        lastUpdated: '2025-12-23',
        importance: 8,
        symptoms: ['referral not tracked', 'wrong coach assigned', 'team not showing'],
        codeReferences: [
          { filePath: 'worker/entities.ts', lineStart: 164, description: 'ReferralLedgerEntity', type: 'entity' },
          { filePath: 'src/components/ui/genealogy-tree.tsx', description: 'Team tree visualization', type: 'component' },
        ],
        apiEndpoints: ['/api/referral-link', '/api/roster', '/api/genealogy'],
        entities: ['ReferralLedgerEntity', 'UserEntity'],
        components: ['GenealogyTree'],
        content: `
# Referral System

Coaches recruit participants via unique referral links.

## Referral Link Format

\`https://app.metabolicreset.com/register?ref=COACH_CODE\`

## How It Works

1. Coach shares their unique referral link
2. Participant clicks link and registers
3. \`referredBy\` set to coach's user ID
4. ReferralLedgerEntity records the relationship
5. Coach sees participant on their roster

## Referral Benefits

| Benefit | Description |
|---------|-------------|
| Free enrollment | Coaches don't pay $28 |
| Team roster | View all referred users |
| Bonus points | Points for each referral signup |
| Group leader perks | Access to team analytics |

## Genealogy Tree

The GenealogyTree component visualizes:
- Multi-level referral relationships
- Team member stats
- Expansion/collapse per node

## Key Files

- \`worker/entities.ts:164\` - ReferralLedgerEntity
- \`src/components/ui/genealogy-tree.tsx\` - Tree component
- \`src/pages/app/RosterPage.tsx\` - Team roster view
        `.trim(),
        relatedArticles: ['team-roster'],
      },
      {
        id: 'team-roster',
        title: 'Team Roster',
        description: 'Viewing and managing team members',
        tags: ['roster', 'team', 'members', 'coaches'],
        lastUpdated: '2025-12-23',
        importance: 7,
        symptoms: ['roster empty', 'member missing', 'cannot see team'],
        apiEndpoints: ['/api/roster', '/api/admin/roster/:userId'],
        content: `
# Team Roster

Coaches view their referred participants.

## Roster Features

- List of all referred users
- Progress stats per member
- Contact information
- Enrollment status
- Points and rankings

## Access Levels

| Role | Can View |
|------|----------|
| Coach | Own team only |
| Admin | Any coach's team |

## Roster API

\`\`\`
GET /api/roster - Coach's own team
GET /api/admin/roster/:userId - Admin view of any team
\`\`\`

## Key Files

- \`src/pages/app/RosterPage.tsx\` - Coach roster view
- \`worker/user-routes.ts\` - Roster endpoints
        `.trim(),
        relatedArticles: ['referral-system'],
      },
    ],
  },
  {
    id: 'technical-reference',
    title: 'Technical Reference',
    description: 'API endpoints, entities, and component documentation',
    icon: 'Code',
    order: 10,
    aiContext: 'Technical reference provides programmatic documentation for developers. Contains API endpoint details, entity schemas, and component props.',
    relatedSections: ['overview', 'bug-tracking'],
    articles: [
      {
        id: 'api-overview',
        title: 'API Reference',
        description: 'All 121 API endpoints',
        tags: ['api', 'endpoints', 'rest', 'http', 'reference'],
        lastUpdated: '2025-12-23',
        importance: 10,
        symptoms: ['api error', '404 not found', '401 unauthorized', '500 server error'],
        codeReferences: [
          { filePath: 'worker/user-routes.ts', description: 'All API route handlers (~3800 lines)', type: 'api' },
          { filePath: 'src/lib/api.ts', description: 'Frontend API client', type: 'util' },
        ],
        content: `
# API Reference

The platform has **121 API endpoints** with 100% documentation coverage.

## Authentication Levels

| Level | Description |
|-------|-------------|
| \`none\` | Public endpoints (OTP, registration) |
| \`user\` | Requires authenticated user |
| \`admin\` | Requires isAdmin: true |

## Endpoint Categories

| Category | Count | Examples |
|----------|-------|----------|
| Health/Status | 3 | /api/health |
| Auth/OTP | 5 | /api/otp/send, /api/otp/verify |
| User Profile | 8 | /api/me, /api/users/me |
| Daily Scores | 6 | /api/score, /api/scores/history |
| Biometrics | 5 | /api/biometrics |
| Projects | 12 | /api/projects, /api/enrollments |
| Course Content | 15 | /api/content, /api/progress |
| Admin | 45 | /api/admin/* |
| Payments | 8 | /api/stripe/*, /api/coupons |
| Notifications | 5 | /api/notifications |
| Bug Reports | 10 | /api/bugs, /api/admin/bugs |

## API File Location

All endpoints defined in: \`worker/user-routes.ts\`

## Frontend Client

API calls wrapped in: \`src/lib/api.ts\`

Uses TanStack Query for:
- Caching
- Optimistic updates
- Error handling
- Loading states
        `.trim(),
        relatedArticles: ['entities-overview', 'components-overview'],
      },
      {
        id: 'entities-overview',
        title: 'Entity Reference',
        description: 'All 19 Durable Object entities',
        tags: ['entities', 'database', 'durable-objects', 'd1', 'schema'],
        lastUpdated: '2025-12-23',
        importance: 9,
        symptoms: ['data not saving', 'entity error', 'database issue'],
        codeReferences: [
          { filePath: 'worker/entities.ts', description: 'All Durable Object entity definitions (~1400 lines)', type: 'entity' },
        ],
        content: `
# Entity Reference

The platform has **19 Durable Object entities** with 100% documentation coverage.

## Entity List

| Entity | Purpose | Line |
|--------|---------|------|
| UserEntity | User accounts and profiles | 33 |
| DailyScoreEntity | Daily habit tracking | 133 |
| WeeklyBiometricEntity | Weekly measurements | 146 |
| ReferralLedgerEntity | Referral relationships | 164 |
| SystemStatsEntity | Platform statistics | 176 |
| QuizLeadEntity | Quiz funnel leads | 207 |
| ResetProjectEntity | Challenge projects | 238 |
| ProjectEnrollmentEntity | User enrollments | 299 |
| BugReportEntity | Bug reports | 374 |
| OtpEntity | OTP codes | 424 |
| SystemSettingsEntity | Global settings | 460 |
| PointsLedgerEntity | Points transactions | 491 |
| CourseContentEntity | LMS content | 653 |
| UserProgressEntity | Content progress | 736 |
| ContentCommentEntity | Content comments | 951 |
| CouponUsageEntity | Coupon tracking | 1061 |
| NotificationEntity | User notifications | 1127 |
| ImpersonationSessionEntity | Admin impersonation | 1227 |
| BugAIAnalysisEntity | AI bug analysis | 1298 |

## Entity File Location

All entities defined in: \`worker/entities.ts\`

## ID Formats

Many entities use composite IDs:
- DailyScore: \`projectId:userId:YYYY-MM-DD\`
- Enrollment: \`projectId:userId\`
- Biometric: \`projectId:userId:weekN\`
        `.trim(),
        relatedArticles: ['api-overview', 'components-overview'],
      },
      {
        id: 'components-overview',
        title: 'Component Reference',
        description: 'All 34 documented React components',
        tags: ['components', 'react', 'ui', 'frontend', 'props'],
        lastUpdated: '2025-12-23',
        importance: 8,
        symptoms: ['component error', 'ui bug', 'rendering issue'],
        codeReferences: [
          { filePath: 'src/components/', description: 'All React components', type: 'component' },
        ],
        content: `
# Component Reference

The platform has **34 documented components** with 100% coverage.

## Component Categories

### Layout Components
- AppLayout - Main authenticated wrapper
- MarketingLayout - Public page wrapper
- AppSidebar - Navigation sidebar

### Admin Components
- BugAIAnalysisPanel - AI bug analysis display
- ContentManager - LMS content CRUD
- PaymentsTab - Stripe payment management
- DocsTab, DocsSidebar, DocsSearch, DocsArticle

### Bug Reporting
- BugReportDialog - Bug submission form
- FloatingBugCapture - Screen recording/screenshot

### Error Handling
- ErrorFallback - Error display
- RouteErrorBoundary - Route error wrapper

### User Features
- NotificationBell - Notification dropdown
- ImpersonationBanner - Admin impersonation indicator
- CohortBadge - Group A/B indicator
- KitReminderBanner, ScaleReminderBanner

### UI Primitives
- CircularProgress - Progress ring
- AnimatedOrbs, BeamsBackground, FloatingParticles
- GenealogyTree - Referral tree visualization
- BorderBeam, GlowWrapper - Visual effects

## Component File Location

Components in: \`src/components/\`

Organized by:
- \`/admin\` - Admin panel components
- \`/layout\` - Layout wrappers
- \`/ui\` - Primitives and effects
        `.trim(),
        relatedArticles: ['api-overview', 'entities-overview'],
      },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'User notification system',
    icon: 'Bell',
    order: 11,
    aiContext: 'Notifications section covers the in-app notification system. Relevant for bugs about missing notifications or read status issues.',
    relatedSections: ['overview', 'push-notifications'],
    articles: [
      {
        id: 'notifications-overview',
        title: 'Notification System',
        description: 'How in-app notifications work',
        tags: ['notifications', 'bell', 'alerts', 'messages'],
        lastUpdated: '2025-12-23',
        importance: 6,
        symptoms: ['notification not showing', 'unread count wrong', 'cannot mark as read'],
        codeReferences: [
          { filePath: 'src/components/notification-bell.tsx', description: 'Notification bell dropdown', type: 'component' },
          { filePath: 'worker/entities.ts', lineStart: 1127, description: 'NotificationEntity', type: 'entity' },
        ],
        apiEndpoints: ['/api/notifications', '/api/notifications/:id/read', '/api/notifications/read-all'],
        entities: ['NotificationEntity'],
        components: ['NotificationBell'],
        content: `
# Notification System

In-app notifications keep users informed.

## Notification Types

| Type | Example |
|------|---------|
| \`achievement\` | "You completed a 7-day streak!" |
| \`reminder\` | "Don't forget to log today's habits" |
| \`announcement\` | "New content available" |
| \`system\` | "Your biometrics were approved" |

## NotificationBell Component

Located in header:
- Shows unread count badge
- Dropdown with recent notifications
- Mark individual as read
- Mark all as read

## API Endpoints

\`\`\`
GET /api/notifications - List user notifications
GET /api/notifications/unread-count - Get unread count
POST /api/notifications/:id/read - Mark one as read
POST /api/notifications/read-all - Mark all as read
\`\`\`

## Key Files

- \`src/components/notification-bell.tsx\` - Bell component
- \`worker/entities.ts:1127\` - NotificationEntity
- \`worker/user-routes.ts\` - Notification endpoints
        `.trim(),
        relatedArticles: ['push-overview'],
      },
    ],
  },
  {
    id: 'push-notifications',
    title: 'Push Notifications',
    description: 'Web push notifications and system announcements',
    icon: 'Smartphone',
    order: 12,
    aiContext: 'Push notifications section covers web push subscriptions, VAPID keys, and platform-specific requirements (iOS PWA). Relevant for bugs about push not working, iOS issues, or subscription problems.',
    relatedSections: ['notifications', 'bug-tracking'],
    articles: [
      {
        id: 'push-overview',
        title: 'Push Notifications',
        description: 'How web push notifications work',
        tags: ['push', 'notifications', 'web-push', 'vapid', 'service-worker', 'ios', 'pwa'],
        lastUpdated: '2025-12-24',
        importance: 9,
        symptoms: ['push not working', 'notifications not arriving', 'ios push failed', 'subscribe error', 'permission denied'],
        codeReferences: [
          { filePath: 'src/hooks/use-push-notifications.ts', description: 'Push notification hook', type: 'hook' },
          { filePath: 'src/components/push-notification-toggle.tsx', description: 'Push toggle component', type: 'component' },
          { filePath: 'src/components/push-permission-prompt.tsx', description: 'Permission prompt dialog', type: 'component' },
          { filePath: 'worker/entities.ts', lineStart: 1537, description: 'PushSubscriptionEntity', type: 'entity' },
          { filePath: 'worker/push-utils.ts', description: 'Push sending utilities', type: 'util' },
        ],
        apiEndpoints: ['/api/push/vapid-key', '/api/push/subscribe', '/api/push/unsubscribe', '/api/push/status', '/api/admin/push/test'],
        entities: ['PushSubscriptionEntity', 'NotificationEntity'],
        components: ['PushNotificationToggle', 'PushPermissionPrompt', 'NotificationPreferencesPanel', 'PushNotificationsTab'],
        content: `
# Web Push Notifications

Real-time push notifications reach users even when the app is closed.

## How It Works

1. User clicks "Enable Notifications"
2. Browser requests permission
3. Browser creates push subscription (endpoint + keys)
4. Subscription saved to PushSubscriptionEntity
5. Server sends pushes via Web Push protocol

## Platform Requirements

| Platform | Requirements |
|----------|--------------|
| **Chrome/Firefox/Edge** | Works natively |
| **Safari (macOS)** | Works natively |
| **iOS Safari** | Must add to Home Screen (PWA) |
| **Android** | Works natively |

## iOS PWA Requirement

iOS only supports push for installed PWAs:
1. Open site in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. Open from Home Screen
5. Then enable notifications

## VAPID Keys

Web Push requires VAPID (Voluntary Application Server Identification):
- Public key: Sent to browser for subscription
- Private key: Signs push messages (server-side)
- Configure in: \`VAPID_PUBLIC_KEY\`, \`VAPID_PRIVATE_KEY\` env vars

## Push Subscription Entity

| Field | Description |
|-------|-------------|
| id | Unique subscription ID |
| userId | User who owns this |
| endpoint | Push service URL |
| keys | Encryption keys (p256dh, auth) |
| failCount | Delivery failures (auto-removes at 5) |

## API Endpoints

\`\`\`
GET /api/push/vapid-key - Get public key
POST /api/push/subscribe - Create subscription
POST /api/push/unsubscribe - Remove subscription
GET /api/push/status - Check subscription status
POST /api/admin/push/test - Send test push (admin)
\`\`\`

## Key Files

- \`src/hooks/use-push-notifications.ts\` - Main hook
- \`src/components/push-notification-toggle.tsx\` - Toggle UI
- \`worker/push-utils.ts\` - Server-side push
- \`worker/entities.ts:1537\` - PushSubscriptionEntity
        `.trim(),
        relatedArticles: ['notifications-overview', 'push-preferences'],
      },
      {
        id: 'push-preferences',
        title: 'Notification Preferences',
        description: 'User notification settings and categories',
        tags: ['preferences', 'settings', 'categories', 'toggle'],
        lastUpdated: '2025-12-24',
        importance: 7,
        symptoms: ['wrong notifications', 'too many notifications', 'category toggle not working'],
        codeReferences: [
          { filePath: 'src/components/notification-preferences.tsx', description: 'Preferences panel', type: 'component' },
          { filePath: 'shared/types.ts', description: 'NotificationPreferences type', type: 'type' },
        ],
        components: ['NotificationPreferencesPanel'],
        content: `
# Notification Preferences

Users can customize which notification types they receive.

## Category Toggles

| Category | Description |
|----------|-------------|
| **Bug Updates** | Responses to submitted bugs |
| **Team Changes** | Team assignments and member changes |
| **Achievements** | Milestones and progress celebrations |
| **Announcements** | System-wide announcements |
| **Daily Reminders** | Habit and lesson reminders |

## How Preferences Work

1. Master toggle enables/disables all push
2. Category toggles filter which types
3. Preferences stored in localStorage
4. (Future: sync to user profile on server)

## Key Components

- \`NotificationPreferencesPanel\` - Full settings panel
- \`PushNotificationToggle\` - Simple on/off toggle

## Default Preferences

All categories enabled by default when push is enabled.
        `.trim(),
        relatedArticles: ['push-overview'],
      },
    ],
  },
  {
    id: 'bug-messaging',
    title: 'Bug Messaging',
    description: 'Communication between users and admins on bug reports',
    icon: 'MessageCircle',
    order: 13,
    aiContext: 'Bug messaging covers the threaded conversation system on bug reports. Relevant for bugs about messages not sending, not receiving notifications, or satisfaction feedback.',
    relatedSections: ['bug-tracking', 'push-notifications'],
    articles: [
      {
        id: 'bug-messaging-overview',
        title: 'Bug Report Messaging',
        description: 'How threaded bug conversations work',
        tags: ['bugs', 'messaging', 'chat', 'threads', 'satisfaction'],
        lastUpdated: '2025-12-24',
        importance: 8,
        symptoms: ['message not sending', 'notification not received', 'cannot reply to bug', 'satisfaction not submitting'],
        codeReferences: [
          { filePath: 'src/components/admin/BugMessagesPanel.tsx', description: 'Admin messaging panel', type: 'component' },
          { filePath: 'worker/entities.ts', lineStart: 427, description: 'BugMessageEntity', type: 'entity' },
          { filePath: 'worker/entities.ts', lineStart: 530, description: 'BugSatisfactionEntity', type: 'entity' },
        ],
        apiEndpoints: ['/api/bugs/:bugId/messages', '/api/bugs/:bugId/satisfaction', '/api/bugs/:bugId/detail'],
        entities: ['BugMessageEntity', 'BugSatisfactionEntity', 'BugReportEntity'],
        components: ['BugMessagesPanel'],
        content: `
# Bug Report Messaging

Threaded conversations between users and admins on bug reports.

## How It Works

1. User submits bug report
2. Admin reviews in Admin > Bugs tab
3. Admin sends message via BugMessagesPanel
4. User receives push notification
5. User replies, admin gets notified
6. When resolved, user can rate satisfaction

## Message Types

| Type | Description |
|------|-------------|
| **User Message** | Message from bug reporter |
| **Admin Message** | Response from admin |
| **System Message** | Auto-generated (status change, etc) |

## System Message Types

- \`submitted\` - Bug was submitted
- \`status_change\` - Status updated
- \`assigned\` - Bug assigned to admin
- \`resolved\` - Bug marked resolved

## Satisfaction Feedback

After bug resolution:
1. User sees feedback prompt
2. Can rate positive or negative
3. Optional written feedback
4. Admin notified of rating

## API Endpoints

\`\`\`
GET /api/bugs/:bugId/messages - Get message thread
POST /api/bugs/:bugId/messages - Add message
GET /api/bugs/:bugId/satisfaction - Get satisfaction
POST /api/bugs/:bugId/satisfaction - Submit feedback
GET /api/bugs/:bugId/detail - Get bug + messages + satisfaction
\`\`\`

## Key Entities

- \`BugMessageEntity\` - Individual messages
- \`BugSatisfactionEntity\` - User feedback
- \`BugReportEntity\` - Parent bug report

## Key Files

- \`src/components/admin/BugMessagesPanel.tsx\` - Admin UI
- \`src/pages/app/MyBugReportsPage.tsx\` - User view
- \`worker/entities.ts:427\` - BugMessageEntity
- \`worker/entities.ts:530\` - BugSatisfactionEntity
        `.trim(),
        relatedArticles: ['bug-overview'],
      },
    ],
  },
  {
    id: 'terminology',
    title: 'Terminology & Naming',
    description: 'Official naming conventions and terminology mappings',
    icon: 'BookText',
    order: 14,
    aiContext: 'Terminology section defines the official naming conventions. CRITICAL for understanding legacy vs new terminology. Captain=GroupLeader, Challenger=Participant, Coach=Facilitator, Team=Group, Challenge=Project.',
    relatedSections: ['overview', 'user-management'],
    articles: [
      {
        id: 'terminology-overview',
        title: 'Naming Conventions',
        description: 'Official terminology and legacy mappings',
        tags: ['terminology', 'naming', 'legacy', 'migration', 'captain', 'coach', 'facilitator', 'group-leader'],
        lastUpdated: '2025-12-26',
        importance: 10,
        symptoms: ['terminology confusion', 'legacy API usage', 'role name mismatch', 'captain vs facilitator'],
        codeReferences: [
          { filePath: 'src/lib/terminology.ts', description: 'UI text constants and helpers', type: 'lib' },
          { filePath: 'shared/types.ts', lineStart: 11, description: 'Role normalization functions', type: 'types' },
        ],
        apiEndpoints: ['/api/group-leaders', '/api/admin/facilitators', '/api/admin/users/:userId/reassign-group-leader'],
        entities: ['UserEntity'],
        components: [],
        content: `
# Terminology & Naming Conventions

The platform migrated from legacy "challenge" terminology to "Metabolic Reset Project" terminology in December 2025.

## Role Terminology

| Legacy Term | Current Term | Description |
|-------------|--------------|-------------|
| **Captain** | **Group Leader** | User who leads a group of participants |
| **Coach** | **Facilitator** | Role type for group leaders (role=facilitator) |
| **Challenger** | **Participant** | Regular user tracking habits (role=participant) |
| **Team** | **Group** | Collection of participants under a leader |
| **Challenge** | **Project** | The 28-day metabolic reset program |
| **Recruits** | **Group Members** | Users assigned to a group leader |

## Database Field Mappings

The database still uses legacy field names for backwards compatibility:

| Database Field | UI Display | Notes |
|----------------|------------|-------|
| captainId | Group Leader ID | User's assigned group leader |
| role: 'coach' | Group Facilitator | Legacy role value |
| role: 'facilitator' | Group Facilitator | New role value |
| role: 'challenger' | Participant | Legacy role value |
| role: 'participant' | Participant | New role value |

## Helper Functions

Use these functions from src/lib/terminology.ts or shared/types.ts:

- normalizeRole(role) - Returns 'participant' or 'facilitator'
- isGroupLeader(role) - True if facilitator/coach
- isParticipant(role) - True if participant/challenger
- getRoleDisplayName(role) - Returns "Group Facilitator" or "Participant"
- getCohortDisplayName(cohort) - Returns "Protocol A/B/C"

## API Endpoint Mappings

New endpoints with legacy aliases:

| New Endpoint | Legacy Alias | Purpose |
|--------------|--------------|---------|
| GET /api/group-leaders | GET /api/captains | List all group leaders |
| GET /api/admin/facilitators | GET /api/admin/coaches | Admin list of facilitators |
| POST /api/admin/users/:id/reassign-group-leader | POST /api/admin/users/:id/reassign-captain | Reassign user |
| POST /api/admin/users/bulk-reassign-group-leader | POST /api/admin/users/bulk-reassign-captain | Bulk reassign |

## UI Text Constants

Use UI_TEXT from src/lib/terminology.ts:

- UI_TEXT.groupRoster - "Group Roster"
- UI_TEXT.groupManagement - "Group Management"
- UI_TEXT.groupFacilitator - "Group Facilitator"
- UI_TEXT.participant - "Participant"
- UI_TEXT.groupLeader - "Group Leader"
- UI_TEXT.metabolicResetProject - "Metabolic Reset Project"
- UI_TEXT.protocolA - "Protocol A"
- UI_TEXT.protocolB - "Protocol B"
- UI_TEXT.protocolC - "Protocol C (Switchers)"

## Key Files

- src/lib/terminology.ts - UI text constants and re-exports
- shared/types.ts:11-47 - Role normalization functions
- worker/user-routes.ts - API endpoints with legacy aliases
        `.trim(),
        relatedArticles: ['introduction', 'user-overview'],
      },
    ],
  },
  {
    id: 'roadmap',
    title: 'Roadmap & Planning',
    description: 'Future feature development plans',
    icon: 'Map',
    order: 15,
    aiContext: 'Roadmap section covers planned features. The community-plan directory contains 12-phase development plans for social features, real-time updates, and more.',
    relatedSections: ['overview'],
    articles: [
      {
        id: 'community-features',
        title: 'Community Features Roadmap',
        description: '12-phase plan for social and community features',
        tags: ['roadmap', 'community', 'social', 'future', 'planning', 'phases'],
        lastUpdated: '2025-12-26',
        importance: 7,
        symptoms: ['feature request', 'planned feature', 'future development'],
        codeReferences: [
          { filePath: 'community-plan/MASTER_GOVERNANCE_CONTEXT.md', description: 'Master governance document', type: 'docs' },
          { filePath: 'community-plan/DESIGN_SYSTEM_MIDNIGHT_GOLD.md', description: 'Design system specifications', type: 'docs' },
        ],
        apiEndpoints: [],
        entities: [],
        components: [],
        content: `
# Community Features Roadmap

A 12-phase development plan for social and community features is documented in the community-plan/ directory.

## Phase Overview

| Phase | Name | Description |
|-------|------|-------------|
| 1 | Data Architecture | Entity schemas, indexes, migrations |
| 2 | Media Pipeline | Image/video upload, processing, CDN |
| 3 | Social API | Posts, comments, reactions, feeds |
| 5 | Realtime DO | Durable Objects for live updates |
| 6 | Admin Moderation | Content moderation tools |
| 7 | Optimization Launch | Performance tuning, launch prep |
| 8 | Payments | Subscription tiers, premium features |
| 9 | Privacy Security | Data protection, audit logs |
| 10 | Engagement | Gamification, achievements |
| 11 | Genealogy Integration | Team hierarchy visualization |
| 12 | Challenge Control | Project lifecycle management |

## Design System

The "Midnight Gold" design system defines:
- Navy (#0F172A) and Gold (#F59E0B) brand colors
- Montserrat (display) and Open Sans (body) typography
- Glassmorphism and gold glow effects
- Dark-first responsive design

## Key Planning Documents

community-plan/
- MASTER_GOVERNANCE_CONTEXT.md - Overall governance
- DESIGN_SYSTEM_MIDNIGHT_GOLD.md - Visual design specs
- PHASE_01_DATA_ARCH.md - Data architecture
- PHASE_02_MEDIA_PIPELINE.md - Media handling
- PHASE_03_SOCIAL_API.md - Social features
- PHASE_05_REALTIME_DO.md - Real-time updates
- PHASE_06_ADMIN_MODERATION.md - Moderation tools
- PHASE_07_OPTIMIZATION_LAUNCH.md - Launch prep
- PHASE_08_PAYMENTS.md - Payment features
- PHASE_09_PRIVACY_SECURITY.md - Security
- PHASE_10_ENGAGEMENT.md - Gamification
- PHASE_11_GENEALOGY_INTEGRATION.md - Team trees
- PHASE_12_CHALLENGE_CONTROL.md - Project mgmt

## Status

These features are **planned but not yet implemented**. Current development focuses on core platform stability and the existing feature set.
        `.trim(),
        relatedArticles: ['introduction'],
      },
    ],
  },
];

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Get all documentation sections
 */
export function getAllSections(): AIDocSection[] {
  return documentationSections.sort((a, b) => a.order - b.order);
}

/**
 * Get section by ID
 */
export function getSectionById(id: string): AIDocSection | undefined {
  return documentationSections.find(s => s.id === id);
}

/**
 * Get article by section and article ID
 */
export function getArticle(sectionId: string, articleId: string): AIDocArticle | undefined {
  const section = getSectionById(sectionId);
  return section?.articles.find(a => a.id === articleId);
}

/**
 * Get all API endpoints (121 endpoints - 100% coverage)
 */
export function getAPIEndpoints(): APIEndpointDoc[] {
  return ALL_API_ENDPOINTS;
}

/**
 * Get API endpoint by path
 */
export function getAPIEndpoint(method: string, path: string): APIEndpointDoc | undefined {
  return ALL_API_ENDPOINTS.find(e => e.method === method && e.path === path);
}

/**
 * Get all entities (19 entities - 100% coverage)
 */
export function getEntities(): EntityDoc[] {
  return ALL_ENTITIES;
}

/**
 * Get entity by name
 */
export function getEntity(name: string): EntityDoc | undefined {
  return ALL_ENTITIES.find(e => e.name === name);
}

/**
 * Get all components (34 components - 100% coverage)
 */
export function getComponents(): ComponentDoc[] {
  return ALL_COMPONENTS;
}

/**
 * Get component by name
 */
export function getComponent(name: string): ComponentDoc | undefined {
  return ALL_COMPONENTS.find(c => c.name === name);
}

/**
 * Get all error codes
 */
export function getErrorCodes(): ErrorCodeDoc[] {
  return ERROR_CODES;
}

/**
 * Get error code by code string
 */
export function getErrorCode(code: string): ErrorCodeDoc | undefined {
  return ERROR_CODES.find(e => e.code === code);
}

/**
 * Get platform context summary
 */
export function getPlatformContext(): string {
  return PLATFORM_CONTEXT;
}
