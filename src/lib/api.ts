import { api } from './api-client';
import {
  User,
  RegisterRequest,
  LoginRequest,
  DailyScore,
  ScoreSubmitRequest,
  WeeklyBiometric,
  BiometricSubmitRequest,
  SystemStats,
  QuizLead,
  QuizLeadSubmitRequest,
  ResetProject,
  ProjectEnrollment,
  CreateProjectRequest,
  UpdateProjectRequest,
  BugReport,
  BugReportSubmitRequest,
  BugReportUpdateRequest,
  BugStatus,
  BugAIAnalysis,
  AnalyzeBugRequest,
  BugMessage,
  BugSatisfaction,
  SubmitBugSatisfactionRequest,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  CohortType,
  SystemSettings,
  GenealogyNode,
  PointsLedger,
  CourseContent,
  CreateCourseContentRequest,
  UpdateCourseContentRequest,
  UserProgress,
  CourseOverview,
  DayContentWithProgress,
  QuizResultResponse,
  ContentComment,
  Notification,
  ImpersonationSession
} from '@shared/types';
export const authApi = {
  register: (data: RegisterRequest) =>
    api<User>('/api/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: LoginRequest) =>
    api<User>('/api/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: (userId: string) =>
    api<User>('/api/me', { headers: { 'X-User-ID': userId } }),
  createPaymentIntent: (amount: number) =>
    api<{ clientSecret: string | null; mock: boolean }>('/api/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ amount })
    }),
};

// Payment API - for creating payment intents
export const paymentApi = {
  createIntent: (amount: number, idempotencyKey?: string, metadata?: {
    name?: string;
    phone?: string;
    email?: string;
    role?: string;
  }) =>
    api<{ clientSecret: string | null; mock: boolean }>('/api/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, idempotencyKey, metadata })
    }),
};

// Coupon API - for validating coupon codes
export const couponApi = {
  validate: (couponCode: string) =>
    api<{
      valid: boolean;
      message?: string;
      discount?: number;
      description?: string;
      bypassPayment?: boolean;
    }>('/api/validate-coupon', {
      method: 'POST',
      body: JSON.stringify({ couponCode })
    }),
};

// Users API - for registration (separate from auth for quiz funnel)
export const usersApi = {
  register: (data: {
    name: string;
    phone: string;
    email: string; // Required for Stripe receipts
    role: 'challenger' | 'coach';
    referralCodeUsed?: string;
    hasScale: boolean;
    timezone: string;
    projectId?: string;
    couponCode?: string; // Coupon code for free/discounted registration
  }) =>
    api<{ user: User; enrolledProjectId: string | null }>('/api/register', { method: 'POST', body: JSON.stringify(data) }),
};

// User Profile API - for updating profile info
export const userApi = {
  // Update user profile (avatarUrl, name, email, phone, timezone, cartLink, hasScale)
  updateProfile: (userId: string, updates: { avatarUrl?: string; name?: string; email?: string; phone?: string; timezone?: string; cartLink?: string; hasScale?: boolean }) =>
    api<User>('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
      headers: { 'X-User-ID': userId }
    }),

  // Get coach info (cart link, phone) for kit ordering
  getCoachInfo: (coachId: string) =>
    api<{ id: string; name: string; phone: string; cartLink?: string }>(`/api/users/${coachId}/coach-info`),

  // Track PWA install analytics
  trackPWAEvent: (userId: string, event: 'prompt_shown' | 'prompt_dismissed' | 'installed', source?: 'android' | 'ios' | 'desktop') =>
    api<{ success: boolean }>('/api/users/me/pwa-analytics', {
      method: 'POST',
      body: JSON.stringify({ event, source }),
      headers: { 'X-User-ID': userId }
    }),
};

// OTP (SMS) Authentication API
export const otpApi = {
  // Send OTP code to phone number
  sendOtp: (data: SendOtpRequest) =>
    api<SendOtpResponse & { devCode?: string }>('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Verify OTP code and login/register
  verifyOtp: (data: VerifyOtpRequest) =>
    api<VerifyOtpResponse & { verifiedPhone?: string }>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Check if phone is verified (for registration flow)
  checkVerified: (phone: string) =>
    api<{ verified: boolean; expired?: boolean }>(`/api/auth/check-verified/${encodeURIComponent(phone)}`),
};
export const scoreApi = {
  getDailyScore: (userId: string, date: string) =>
    api<DailyScore | null>(`/api/scores?date=${date}`, { headers: { 'X-User-ID': userId } }),
  getScoreHistory: (userId: string, limit?: number) =>
    api<DailyScore[]>(`/api/scores/history${limit ? `?limit=${limit}` : ''}`, { headers: { 'X-User-ID': userId } }),
  submitScore: (userId: string, data: ScoreSubmitRequest) =>
    api<DailyScore>('/api/scores', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'X-User-ID': userId }
    }),
};
export const biometricApi = {
  getBiometrics: (userId: string, weekNumber: number) =>
    api<WeeklyBiometric | null>(`/api/biometrics/${weekNumber}`, {
      headers: { 'X-User-ID': userId }
    }),
  getBiometricsHistory: (userId: string) =>
    api<WeeklyBiometric[]>('/api/biometrics/history', {
      headers: { 'X-User-ID': userId }
    }),
  submitBiometrics: (userId: string, data: BiometricSubmitRequest) =>
    api<WeeklyBiometric & { isNewSubmission: boolean }>('/api/biometrics', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'X-User-ID': userId }
    }),
};

export const rosterApi = {
  getTeamRoster: (userId: string) =>
    api<User[]>('/api/roster', { headers: { 'X-User-ID': userId } }),
  getTeamMemberBiometrics: (userId: string, recruitId: string) =>
    api<{
      recruit: { id: string; name: string; email: string; points: number; createdAt: number };
      biometrics: WeeklyBiometric[];
    }>(`/api/roster/${recruitId}/biometrics`, { headers: { 'X-User-ID': userId } }),
  searchCaptains: () =>
    api<User[]>('/api/captains'),
  assignCaptain: (userId: string, captainId: string) =>
    api<User>('/api/orphan/assign', {
      method: 'POST',
      body: JSON.stringify({ captainId }),
      headers: { 'X-User-ID': userId }
    }),
};
export const statsApi = {
  getSystemStats: () =>
    api<SystemStats>('/api/stats'),
  getRecentAvatars: () =>
    api<{ id: string; name: string; avatarUrl: string }[]>('/api/avatars/recent'),
};

// System Settings API - for video URLs, kit order link, etc.
export const settingsApi = {
  // Get system settings (public)
  getSettings: () =>
    api<SystemSettings>('/api/settings'),

  // Update system settings (admin only)
  updateSettings: (adminUserId: string, updates: Partial<Omit<SystemSettings, 'id'>>) =>
    api<SystemSettings>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(updates),
      headers: { 'X-User-ID': adminUserId }
    }),
};

export const adminApi = {
  getAllUsers: (adminUserId: string) =>
    api<User[]>('/api/admin/users', { headers: { 'X-User-ID': adminUserId } }),
  getUser: (adminUserId: string, targetUserId: string) =>
    api<{ user: User; scores: any[]; biometrics: any[] }>(`/api/admin/users/${targetUserId}`, {
      headers: { 'X-User-ID': adminUserId }
    }),
  updateUser: (adminUserId: string, targetUserId: string, updates: {
    isAdmin?: boolean;
    isActive?: boolean;
    isTestMode?: boolean;
    points?: number;
    role?: 'challenger' | 'coach';
    name?: string;
    email?: string;
    phone?: string;
    timezone?: string;
  }) =>
    api<User>(`/api/admin/users/${targetUserId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
      headers: { 'X-User-ID': adminUserId }
    }),
  getAdmins: (adminUserId: string) =>
    api<User[]>('/api/admin/admins', { headers: { 'X-User-ID': adminUserId } }),
  bootstrapAdmin: (phone: string, secretKey: string) =>
    api<{ message: string; userId: string; userName?: string }>('/api/admin/bootstrap', {
      method: 'POST',
      body: JSON.stringify({ phone, secretKey })
    }),
  // Get a user's enrollments (admin)
  getUserEnrollments: (adminUserId: string, targetUserId: string) =>
    api<(ProjectEnrollment & {
      projectName: string;
      projectStatus: string;
      projectStartDate: string;
    })[]>(`/api/admin/users/${targetUserId}/enrollments`, {
      headers: { 'X-User-ID': adminUserId }
    }),
  // Enroll a user in a project (admin)
  enrollUserInProject: (adminUserId: string, targetUserId: string, projectId: string) =>
    api<{ success: boolean; message: string }>(`/api/admin/users/${targetUserId}/enroll`, {
      method: 'POST',
      body: JSON.stringify({ projectId }),
      headers: { 'X-User-ID': adminUserId }
    }),
  // Remove a user from a project (admin)
  removeUserFromProject: (adminUserId: string, targetUserId: string, projectId: string) =>
    api<{ success: boolean; message: string }>(`/api/admin/users/${targetUserId}/enrollments/${projectId}`, {
      method: 'DELETE',
      headers: { 'X-User-ID': adminUserId }
    }),
  // Soft delete a user (30-day recovery window)
  deleteUser: (adminUserId: string, targetUserId: string) =>
    api<{ message: string; deletedAt: number; userId: string }>(`/api/admin/users/${targetUserId}`, {
      method: 'DELETE',
      headers: { 'X-User-ID': adminUserId }
    }),
  // Restore a soft-deleted user
  restoreUser: (adminUserId: string, targetUserId: string) =>
    api<{ message: string; userId: string }>(`/api/admin/users/${targetUserId}/restore`, {
      method: 'POST',
      headers: { 'X-User-ID': adminUserId }
    }),
  // Get all deleted users
  getDeletedUsers: (adminUserId: string) =>
    api<(User & { daysRemaining: number; canRestore: boolean })[]>('/api/admin/users/deleted/list', {
      headers: { 'X-User-ID': adminUserId }
    }),
  // Permanently delete a user (no recovery)
  permanentlyDeleteUser: (adminUserId: string, targetUserId: string) =>
    api<{ message: string; userId: string }>(`/api/admin/users/${targetUserId}/permanent`, {
      method: 'DELETE',
      headers: { 'X-User-ID': adminUserId }
    }),
  // Clear OTP record for a phone number (admin only)
  clearOtp: (adminUserId: string, phone: string) =>
    api<{ success: boolean; message: string; phone: string }>(`/api/admin/otp/${encodeURIComponent(phone)}`, {
      method: 'DELETE',
      headers: { 'X-User-ID': adminUserId }
    }),
  // Find duplicate users by phone or email (includes active-deleted matches)
  findDuplicates: (adminUserId: string) =>
    api<{
      totalDuplicateSets: number;
      duplicates: Array<{
        type: 'phone' | 'email';
        value: string;
        users: Array<{
          id: string;
          name: string;
          referralCode: string;
          phone: string;
          email: string;
          avatarUrl: string;
          points: number;
          createdAt: number;
          isRecommendedPrimary: boolean;
          isDeleted: boolean;
        }>;
      }>;
      stats?: {
        totalActiveUsers: number;
        totalDeletedUsers: number;
      };
    }>('/api/admin/duplicates', {
      headers: { 'X-User-ID': adminUserId }
    }),
  // Merge two duplicate users into one
  mergeUsers: (adminUserId: string, primaryUserId: string, secondaryUserId: string) =>
    api<{
      success: boolean;
      message: string;
      primaryUserId: string;
      secondaryUserId: string;
      mergeLog: string[];
      primaryUser: {
        id: string;
        name: string;
        referralCode: string;
        secondaryReferralCode: string;
      };
    }>('/api/admin/users/merge', {
      method: 'POST',
      body: JSON.stringify({ primaryUserId, secondaryUserId }),
      headers: { 'X-User-ID': adminUserId }
    }),
  // Browse Stripe payments with bi-directional pagination
  getStripePayments: (adminUserId: string, options?: {
    limit?: number;
    startingAfter?: string;
    endingBefore?: string;
  }) => {
    const params = new URLSearchParams();
    params.append('limit', (options?.limit || 25).toString());
    if (options?.startingAfter) params.append('starting_after', options.startingAfter);
    if (options?.endingBefore) params.append('ending_before', options.endingBefore);
    return api<{
      payments: Array<{
        id: string;
        paymentIntentId: string | null;
        amount: number;
        amountFormatted: string;
        status: string;
        createdAt: number;
        metadata: { name?: string; phone?: string; email?: string; role?: string };
        receiptEmail?: string;
        cardLast4: string | null;
        cardBrand: string | null;
        billingName: string | null;
        billingEmail: string | null;
        billingPhone: string | null;
        linkedUser: { id: string; name: string; phone: string } | null;
      }>;
      hasMore: boolean;
      hasPrevious: boolean;
      firstId: string | null;
      lastId: string | null;
    }>(`/api/admin/stripe/payments?${params.toString()}`, {
      headers: { 'X-User-ID': adminUserId }
    });
  },
  // Search Stripe charges with server-side filtering (card last4, status, amount)
  searchStripePayments: (adminUserId: string, options: {
    cardLast4?: string;
    cardBrand?: string;
    status?: string;
    minAmount?: number;
    maxAmount?: number;
    limit?: number;
    page?: string;
  }) => {
    const params = new URLSearchParams();
    params.append('limit', (options.limit || 25).toString());
    if (options.cardLast4) params.append('card_last4', options.cardLast4);
    if (options.cardBrand) params.append('card_brand', options.cardBrand);
    if (options.status) params.append('status', options.status);
    if (options.minAmount) params.append('min_amount', options.minAmount.toString());
    if (options.maxAmount) params.append('max_amount', options.maxAmount.toString());
    if (options.page) params.append('page', options.page);
    return api<{
      payments: Array<{
        id: string;
        paymentIntentId: string | null;
        amount: number;
        amountFormatted: string;
        status: string;
        createdAt: number;
        metadata: { name?: string; phone?: string; email?: string; role?: string };
        receiptEmail?: string;
        cardLast4: string | null;
        cardBrand: string | null;
        billingName: string | null;
        billingEmail: string | null;
        billingPhone: string | null;
        linkedUser: { id: string; name: string; phone: string } | null;
      }>;
      hasMore: boolean;
      nextPage: string | null;
      query: string;
    }>(`/api/admin/stripe/search?${params.toString()}`, {
      headers: { 'X-User-ID': adminUserId }
    });
  },
  // Link a Stripe payment to a user
  linkStripePayment: (adminUserId: string, paymentIntentId: string, userId: string) =>
    api<{
      message: string;
      user: { id: string; name: string };
      payment: { id: string; amount: number; status: string };
    }>('/api/admin/stripe/link', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId, userId }),
      headers: { 'X-User-ID': adminUserId }
    }),
  // Unlink a Stripe payment from a user
  unlinkStripePayment: (adminUserId: string, userId: string) =>
    api<{
      message: string;
      user: { id: string; name: string };
      previousPaymentId: string;
    }>('/api/admin/stripe/unlink', {
      method: 'POST',
      body: JSON.stringify({ userId }),
      headers: { 'X-User-ID': adminUserId }
    }),
};

// Referral API - for looking up referrer info and history
export const referralApi = {
  // Get referrer info by code (public, no auth)
  getReferrer: (code: string) =>
    api<{ name: string; role: string } | null>(`/api/referrer/${code}`),
  // Get referral history for current user (authenticated)
  getReferralHistory: (userId: string) =>
    api<import('@shared/types').ReferralActivity[]>('/api/referrals/history', {
      headers: { 'X-User-ID': userId }
    }),
};

// Quiz Leads API - for capturing and managing quiz funnel leads
export const leadsApi = {
  // Submit a new lead (public, no auth required)
  submitLead: (data: QuizLeadSubmitRequest) =>
    api<{
      id: string;
      name: string;
      phone: string;
      age: number;
      sex: 'male' | 'female';
      captainId: string | null;
      resultType: 'green' | 'yellow' | 'orange' | 'red' | 'fatigue' | 'instability' | 'plateau' | 'optimized';
      totalScore: number;
      metabolicAge: number;
    }>(
      '/api/leads',
      { method: 'POST', body: JSON.stringify(data) }
    ),

  // Get leads for the current captain (requires auth)
  getMyLeads: (userId: string) =>
    api<QuizLead[]>('/api/leads', { headers: { 'X-User-ID': userId } }),

  // Mark a lead as converted
  convertLead: (leadId: string, userId: string) =>
    api<QuizLead>(`/api/leads/${leadId}/convert`, {
      method: 'PATCH',
      body: JSON.stringify({ userId })
    }),
};

// Reset Project API - for managing challenge projects
export const projectApi = {
  // Get all projects (public)
  getAllProjects: () =>
    api<ResetProject[]>('/api/projects'),

  // Get projects open for registration (public)
  getOpenProjects: () =>
    api<ResetProject[]>('/api/projects/open'),

  // Get active project (public)
  getActiveProject: () =>
    api<ResetProject | null>('/api/projects/active'),

  // Get single project by ID (public)
  getProject: (projectId: string) =>
    api<ResetProject>(`/api/projects/${projectId}`),

  // Get current week info for a project
  getProjectWeek: (projectId: string) =>
    api<{
      currentWeek: number;
      projectId: string;
      projectName: string;
      startDate: string;
      endDate: string;
      status: string;
      isBeforeStart: boolean;
      isAfterEnd: boolean;
      daysUntilStart: number;
      daysRemaining: number;
    }>(`/api/projects/${projectId}/week`),

  // Get group participants for a project (for group leaders)
  getGroupParticipants: (userId: string, projectId: string) =>
    api<(ProjectEnrollment & { userName: string; userEmail: string })[]>(
      `/api/projects/${projectId}/group`,
      { headers: { 'X-User-ID': userId } }
    ),
};

// Project Enrollment API - for managing user enrollments
export const enrollmentApi = {
  // Get current user's enrollments
  getMyEnrollments: (userId: string) =>
    api<(ProjectEnrollment & {
      projectName: string;
      projectStatus: string;
      projectStartDate: string;
      projectEndDate: string;
    })[]>('/api/enrollments', { headers: { 'X-User-ID': userId } }),

  // Get enrollment for specific project
  getEnrollment: (userId: string, projectId: string) =>
    api<(ProjectEnrollment & {
      projectName: string;
      projectStatus: string;
      projectStartDate: string;
      projectEndDate: string;
    }) | null>(`/api/enrollments/${projectId}`, { headers: { 'X-User-ID': userId } }),

  // Enroll in a project
  enroll: (userId: string, projectId: string, groupLeaderId?: string) =>
    api<ProjectEnrollment>('/api/enrollments', {
      method: 'POST',
      body: JSON.stringify({ projectId, groupLeaderId }),
      headers: { 'X-User-ID': userId }
    }),

  // Update cohort selection for enrollment
  updateCohort: (userId: string, projectId: string, cohortId: CohortType) =>
    api<ProjectEnrollment>(`/api/enrollments/${projectId}/cohort`, {
      method: 'PATCH',
      body: JSON.stringify({ cohortId }),
      headers: { 'X-User-ID': userId }
    }),

  // Update onboarding progress
  updateOnboarding: (userId: string, projectId: string, updates: {
    hasKit?: boolean;
    kitOrderClicked?: boolean;
    onboardingComplete?: boolean;
  }) =>
    api<ProjectEnrollment>(`/api/enrollments/${projectId}/onboarding`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
      headers: { 'X-User-ID': userId }
    }),
};

// Admin Project API - for admin project management
export const adminProjectApi = {
  // Create new project
  createProject: (adminUserId: string, data: CreateProjectRequest) =>
    api<ResetProject>('/api/admin/projects', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'X-User-ID': adminUserId }
    }),

  // Update project
  updateProject: (adminUserId: string, projectId: string, updates: UpdateProjectRequest) =>
    api<ResetProject>(`/api/admin/projects/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
      headers: { 'X-User-ID': adminUserId }
    }),

  // Delete project
  deleteProject: (adminUserId: string, projectId: string) =>
    api<{ message: string }>(`/api/admin/projects/${projectId}`, {
      method: 'DELETE',
      headers: { 'X-User-ID': adminUserId }
    }),

  // Get project enrollments
  getProjectEnrollments: (adminUserId: string, projectId: string) =>
    api<(ProjectEnrollment & { userName: string; userEmail: string })[]>(
      `/api/admin/projects/${projectId}/enrollments`,
      { headers: { 'X-User-ID': adminUserId } }
    ),

  // Get cohort stats for a project
  getCohortStats: (adminUserId: string, projectId: string) =>
    api<{
      total: number;
      groupA: number;
      groupB: number;
      unassigned: number;
      onboardingComplete: number;
      onboardingPending: number;
      groupAWithKit: number;
      groupANeedKit: number;
    }>(`/api/admin/projects/${projectId}/cohort-stats`, {
      headers: { 'X-User-ID': adminUserId }
    }),

  // Update user's cohort (admin)
  updateEnrollmentCohort: (adminUserId: string, enrollmentId: string, cohortId: CohortType | null) =>
    api<ProjectEnrollment>(`/api/admin/enrollments/${enrollmentId}/cohort`, {
      method: 'PATCH',
      body: JSON.stringify({ cohortId }),
      headers: { 'X-User-ID': adminUserId }
    }),
};

// Bug Report API - for submitting and managing bug reports
export const bugApi = {
  // Submit a new bug report (requires auth)
  submitBug: (userId: string, data: BugReportSubmitRequest) =>
    api<BugReport>('/api/bugs', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'X-User-ID': userId }
    }),

  // Get current user's bug reports
  getMyBugs: (userId: string) =>
    api<BugReport[]>('/api/bugs/mine', { headers: { 'X-User-ID': userId } }),

  // Get a single bug with messages and satisfaction (user or admin)
  getBugWithMessages: (userId: string, bugId: string) =>
    api<{ bug: BugReport; messages: BugMessage[]; satisfaction: BugSatisfaction | null }>(`/api/bugs/${bugId}`, {
      headers: { 'X-User-ID': userId }
    }),

  // Get messages for a bug
  getBugMessages: (userId: string, bugId: string) =>
    api<BugMessage[]>(`/api/bugs/${bugId}/messages`, {
      headers: { 'X-User-ID': userId }
    }),

  // Add a message to a bug thread
  addBugMessage: (userId: string, bugId: string, message: string) =>
    api<BugMessage>(`/api/bugs/${bugId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
      headers: { 'X-User-ID': userId }
    }),

  // Get satisfaction feedback for a bug
  getBugSatisfaction: (userId: string, bugId: string) =>
    api<BugSatisfaction | null>(`/api/bugs/${bugId}/satisfaction`, {
      headers: { 'X-User-ID': userId }
    }),

  // Submit satisfaction feedback
  submitSatisfaction: (userId: string, data: SubmitBugSatisfactionRequest) =>
    api<BugSatisfaction>(`/api/bugs/${data.bugId}/satisfaction`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'X-User-ID': userId }
    }),
};

// Media Upload API - for uploading screenshots, videos, and course content
export const uploadApi = {
  // Get presigned URL for upload
  getPresignedUrl: (userId: string, filename: string, contentType: string, fileSize: number, category?: 'bugs' | 'avatars' | 'content') =>
    api<{ uploadUrl: string; key: string; publicUrl: string }>('/api/upload/presigned-url', {
      method: 'POST',
      body: JSON.stringify({ filename, contentType, fileSize, category }),
      headers: { 'X-User-ID': userId }
    }),

  // Upload file directly
  uploadFile: async (userId: string, key: string, file: Blob, contentType: string): Promise<{ success: boolean; key: string; publicUrl: string; size: number }> => {
    const formData = new FormData();
    formData.append('file', file, key.split('/').pop() || 'file');
    formData.append('key', key);

    const response = await fetch('/api/upload/file', {
      method: 'POST',
      headers: { 'X-User-ID': userId },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    // Backend returns { success: true, data: { ... } }, extract the data field
    const json = await response.json();
    return json.data;
  }
};

// Cloudflare Stream API - for large video uploads (>95MB)
// Uses TUS protocol for resumable uploads up to 200GB
export const streamApi = {
  // Get TUS upload config from backend
  // Returns endpoint and credentials for TUS upload
  createUpload: (userId: string, meta?: { name?: string; projectId?: string }, fileSize?: number) =>
    api<{
      tusEndpoint: string;
      apiToken: string;
      accountId: string;
      maxDurationSeconds: number;
      meta: Record<string, string>;
    }>('/api/stream/create-upload', {
      method: 'POST',
      body: JSON.stringify({ maxDurationSeconds: 3600, meta, fileSize }),
      headers: { 'X-User-ID': userId }
    }),

  // Check the status of a Stream video (processing, ready, error)
  getStatus: (userId: string, uid: string) =>
    api<{
      uid: string;
      status: string;
      ready: boolean;
      duration: number | null;
      thumbnail: string | null;
      playbackUrl: string | null;
      dashUrl: string | null;
      previewUrl: string | null;
      errorReason: string | null;
      errorText: string | null;
    }>(`/api/stream/status/${uid}`, { headers: { 'X-User-ID': userId } }),

  // Upload file to Cloudflare Stream using TUS protocol
  // Returns the video UID after upload starts
  uploadToStream: async (
    tusEndpoint: string,
    apiToken: string,
    file: File,
    meta: Record<string, string>,
    onProgress?: (percent: number) => void
  ): Promise<string> => {
    // Dynamically import tus-js-client
    const { Upload } = await import('tus-js-client');

    return new Promise((resolve, reject) => {
      const upload = new Upload(file, {
        endpoint: tusEndpoint,
        headers: {
          'Authorization': `Bearer ${apiToken}`
        },
        metadata: {
          name: file.name,
          filetype: file.type,
          ...meta
        },
        chunkSize: 50 * 1024 * 1024, // 50MB chunks
        retryDelays: [0, 1000, 3000, 5000],
        onError: (error) => {
          console.error('TUS upload error:', error);
          reject(error);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = (bytesUploaded / bytesTotal) * 100;
          if (onProgress) {
            onProgress(percentage);
          }
        },
        onSuccess: () => {
          // Extract video UID from the upload URL
          // URL format: https://api.cloudflare.com/client/v4/accounts/{account_id}/stream/{video_uid}
          const uploadUrl = upload.url;
          if (uploadUrl) {
            const parts = uploadUrl.split('/');
            const uid = parts[parts.length - 1];
            resolve(uid);
          } else {
            reject(new Error('Upload completed but no URL returned'));
          }
        }
      });

      // Check if there's a previous upload to resume
      upload.findPreviousUploads().then((previousUploads) => {
        if (previousUploads.length > 0) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }
        upload.start();
      });
    });
  },

  // Poll for video ready status (with timeout)
  waitForReady: async (
    userId: string,
    uid: string,
    maxWaitMs: number = 300000, // 5 minutes default
    pollIntervalMs: number = 3000 // 3 seconds
  ): Promise<{ ready: boolean; playbackUrl: string | null; previewUrl: string | null; duration?: number; error?: string }> => {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      const status = await streamApi.getStatus(userId, uid);

      if (status.ready && status.playbackUrl) {
        return {
          ready: true,
          playbackUrl: status.playbackUrl,
          previewUrl: status.previewUrl,
          duration: status.duration || undefined
        };
      }

      if (status.status === 'error') {
        return { ready: false, playbackUrl: null, previewUrl: null, error: status.errorText || 'Video processing failed' };
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }

    return { ready: false, playbackUrl: null, previewUrl: null, error: 'Timed out waiting for video to be ready' };
  }
};

// Admin Bug API - for admin bug management
export const adminBugApi = {
  // Get all bug reports
  getAllBugs: (adminUserId: string) =>
    api<BugReport[]>('/api/admin/bugs', { headers: { 'X-User-ID': adminUserId } }),

  // Get bugs by status
  getBugsByStatus: (adminUserId: string, status: BugStatus) =>
    api<BugReport[]>(`/api/admin/bugs/status/${status}`, { headers: { 'X-User-ID': adminUserId } }),

  // Get single bug
  getBug: (adminUserId: string, bugId: string) =>
    api<BugReport>(`/api/admin/bugs/${bugId}`, { headers: { 'X-User-ID': adminUserId } }),

  // Update bug (status, admin notes)
  updateBug: (adminUserId: string, bugId: string, updates: BugReportUpdateRequest) =>
    api<BugReport>(`/api/admin/bugs/${bugId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
      headers: { 'X-User-ID': adminUserId }
    }),

  // Delete bug
  deleteBug: (adminUserId: string, bugId: string) =>
    api<{ message: string }>(`/api/admin/bugs/${bugId}`, {
      method: 'DELETE',
      headers: { 'X-User-ID': adminUserId }
    }),

  // AI Analysis - trigger analysis for a bug
  analyzeBug: async (adminUserId: string, bugId: string, options?: Partial<AnalyzeBugRequest>) => {
    console.log('[adminBugApi.analyzeBug] Called');
    console.log('[adminBugApi.analyzeBug] adminUserId:', adminUserId);
    console.log('[adminBugApi.analyzeBug] bugId:', bugId);
    console.log('[adminBugApi.analyzeBug] options:', options);

    const requestBody = JSON.stringify(options || { includeScreenshot: true, includeVideo: true });
    console.log('[adminBugApi.analyzeBug] Request body:', requestBody);

    const result = await api<{ analysis: BugAIAnalysis }>(`/api/admin/bugs/${bugId}/analyze`, {
      method: 'POST',
      body: requestBody,
      headers: { 'X-User-ID': adminUserId }
    });

    console.log('[adminBugApi.analyzeBug] Response:', result);
    if (result.analysis) {
      console.log('[adminBugApi.analyzeBug] Analysis summary:', result.analysis.summary);
      console.log('[adminBugApi.analyzeBug] Analysis error:', result.analysis.error);
      console.log('[adminBugApi.analyzeBug] Analysis confidence:', result.analysis.confidence);
      console.log('[adminBugApi.analyzeBug] Processing time:', result.analysis.processingTimeMs, 'ms');
    }

    return result;
  },

  // AI Analysis - get existing analysis for a bug
  getBugAnalysis: (adminUserId: string, bugId: string) =>
    api<{ analysis: BugAIAnalysis | null }>(`/api/admin/bugs/${bugId}/analysis`, {
      headers: { 'X-User-ID': adminUserId }
    }),

  // AI Analysis - get all recent analyses
  getAllAnalyses: (adminUserId: string) =>
    api<{ analyses: BugAIAnalysis[] }>('/api/admin/ai-analyses', {
      headers: { 'X-User-ID': adminUserId }
    }),
};

// Genealogy API - for viewing referral trees
export const genealogyApi = {
  // Get current user's genealogy tree (their downline)
  getMyTree: (userId: string) =>
    api<GenealogyNode>('/api/genealogy/me', { headers: { 'X-User-ID': userId } }),

  // Get genealogy tree for specific user (coach can see own recruits, admin can see anyone)
  getTree: (userId: string, targetUserId: string) =>
    api<GenealogyNode>(`/api/genealogy/${targetUserId}`, { headers: { 'X-User-ID': userId } }),
};

// Points Ledger API - for viewing point transaction history
export const pointsApi = {
  // Get current user's point transaction history
  getMyHistory: (userId: string) =>
    api<PointsLedger[]>('/api/points/history', { headers: { 'X-User-ID': userId } }),

  // Get current point settings (public)
  getPointSettings: () =>
    api<{
      referralPointsCoach: number;
      referralPointsChallenger: number;
      dailyHabitPoints: number;
      biometricSubmissionPoints: number;
    }>('/api/settings/points'),
};

// Admin Genealogy API - for admin genealogy management
export const adminGenealogyApi = {
  // Get full genealogy for any user
  getTree: (adminUserId: string, targetUserId: string) =>
    api<GenealogyNode>(`/api/admin/genealogy/${targetUserId}`, { headers: { 'X-User-ID': adminUserId } }),

  // Get all root coaches
  getRoots: (adminUserId: string) =>
    api<{
      userId: string;
      name: string;
      role: string;
      avatarUrl?: string;
      points: number;
      referralCode: string;
      joinedAt: number;
      directReferrals: number;
    }[]>('/api/admin/genealogy/roots', { headers: { 'X-User-ID': adminUserId } }),
};

// Admin Points API - for admin point management
export const adminPointsApi = {
  // Get point transactions for any user
  getUserHistory: (adminUserId: string, targetUserId: string) =>
    api<PointsLedger[]>(`/api/admin/points/${targetUserId}/history`, { headers: { 'X-User-ID': adminUserId } }),

  // Get recent point transactions (global)
  getRecentTransactions: (adminUserId: string, limit?: number) =>
    api<PointsLedger[]>(`/api/admin/points/recent${limit ? `?limit=${limit}` : ''}`, { headers: { 'X-User-ID': adminUserId } }),

  // Manually adjust user points
  adjustPoints: (adminUserId: string, data: { userId: string; points: number; description: string; projectId?: string }) =>
    api<{ transaction: PointsLedger; user: User }>('/api/admin/points/adjust', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'X-User-ID': adminUserId }
    }),

  // Update point settings
  updatePointSettings: (adminUserId: string, updates: {
    referralPointsCoach?: number;
    referralPointsChallenger?: number;
    dailyHabitPoints?: number;
    biometricSubmissionPoints?: number;
  }) =>
    api<SystemSettings>('/api/admin/settings/points', {
      method: 'PUT',
      body: JSON.stringify(updates),
      headers: { 'X-User-ID': adminUserId }
    }),
};

// Admin Course Content API - for managing LMS content
export const adminContentApi = {
  // Get all content for a project
  getProjectContent: (adminUserId: string, projectId: string) =>
    api<CourseContent[]>(`/api/admin/projects/${projectId}/content`, { headers: { 'X-User-ID': adminUserId } }),

  // Get single content item
  getContent: (adminUserId: string, contentId: string) =>
    api<CourseContent>(`/api/admin/content/${contentId}`, { headers: { 'X-User-ID': adminUserId } }),

  // Create new content
  createContent: (adminUserId: string, data: CreateCourseContentRequest) =>
    api<CourseContent>('/api/admin/content', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'X-User-ID': adminUserId }
    }),

  // Update content
  updateContent: (adminUserId: string, contentId: string, updates: UpdateCourseContentRequest) =>
    api<CourseContent>(`/api/admin/content/${contentId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
      headers: { 'X-User-ID': adminUserId }
    }),

  // Delete content
  deleteContent: (adminUserId: string, contentId: string) =>
    api<{ deleted: boolean }>(`/api/admin/content/${contentId}`, {
      method: 'DELETE',
      headers: { 'X-User-ID': adminUserId }
    }),

  // Reorder content within a day
  reorderContent: (adminUserId: string, projectId: string, dayNumber: number, contentIds: string[]) =>
    api<{ reordered: boolean }>(`/api/admin/projects/${projectId}/content/reorder`, {
      method: 'POST',
      body: JSON.stringify({ dayNumber, contentIds }),
      headers: { 'X-User-ID': adminUserId }
    }),

  // Copy content from one project to another
  copyContent: (adminUserId: string, sourceProjectId: string, targetProjectId: string) =>
    api<{ copiedCount: number; contentIds: string[] }>(`/api/admin/projects/${sourceProjectId}/content/copy/${targetProjectId}`, {
      method: 'POST',
      headers: { 'X-User-ID': adminUserId }
    }),

  // Get content analytics
  getContentAnalytics: (adminUserId: string, projectId: string) =>
    api<{
      contentId: string;
      title: string;
      dayNumber: number;
      contentType: string;
      totalEnrollments: number;
      completedCount: number;
      inProgressCount: number;
      completionRate: number;
      avgQuizScore: number | null;
      avgWatchPercentage: number | null;
    }[]>(`/api/admin/projects/${projectId}/content/analytics`, { headers: { 'X-User-ID': adminUserId } }),
};

// User Course API - for viewing and completing course content
export const courseApi = {
  // Get course overview
  getOverview: (userId: string) =>
    api<{ hasEnrollment: boolean; overview?: CourseOverview }>('/api/course/overview', { headers: { 'X-User-ID': userId } }),

  // Get day's content with progress
  getDayContent: (userId: string, dayNumber: number) =>
    api<DayContentWithProgress>(`/api/course/day/${dayNumber}`, { headers: { 'X-User-ID': userId } }),

  // Update video progress
  updateVideoProgress: (userId: string, contentId: string, watchedPercentage: number, lastPosition: number) =>
    api<{ progress: UserProgress; justCompleted: boolean; pointsAwarded: number }>('/api/course/video/progress', {
      method: 'POST',
      body: JSON.stringify({ contentId, watchedPercentage, lastPosition }),
      headers: { 'X-User-ID': userId }
    }),

  // Mark video complete
  completeVideo: (userId: string, contentId: string) =>
    api<{ progress: UserProgress; alreadyCompleted: boolean; pointsAwarded: number }>('/api/course/video/complete', {
      method: 'POST',
      body: JSON.stringify({ contentId }),
      headers: { 'X-User-ID': userId }
    }),

  // Submit quiz answers
  submitQuiz: (userId: string, contentId: string, answers: Record<string, number>) =>
    api<QuizResultResponse>('/api/course/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ contentId, answers }),
      headers: { 'X-User-ID': userId }
    }),

  // Get all progress
  getProgress: (userId: string) =>
    api<{ hasEnrollment: boolean; progress: UserProgress[] }>('/api/course/progress', { headers: { 'X-User-ID': userId } }),
};

// Content Comments API - for YouTube-style comments on course content
export const commentsApi = {
  // Get comments for a content item
  getComments: (userId: string, contentId: string) =>
    api<{ comments: ContentComment[] }>(`/api/course/comments/${contentId}`, { headers: { 'X-User-ID': userId } }),

  // Add a comment
  addComment: (userId: string, contentId: string, text: string) =>
    api<{ comment: ContentComment }>('/api/course/comments', {
      method: 'POST',
      body: JSON.stringify({ contentId, text }),
      headers: { 'X-User-ID': userId }
    }),

  // Like/unlike a comment
  likeComment: (userId: string, commentId: string) =>
    api<{ comment: ContentComment }>('/api/course/comments/like', {
      method: 'POST',
      body: JSON.stringify({ commentId }),
      headers: { 'X-User-ID': userId }
    }),
};

// Content Likes API - for liking videos/resources
export const contentLikesApi = {
  // Like/unlike a content item
  likeContent: (userId: string, contentId: string) =>
    api<{ content: CourseContent }>('/api/course/content/like', {
      method: 'POST',
      body: JSON.stringify({ contentId }),
      headers: { 'X-User-ID': userId }
    }),

  // Get content details (for polling likes)
  getContent: (userId: string, contentId: string) =>
    api<{ content: CourseContent }>(`/api/course/content/${contentId}`, { headers: { 'X-User-ID': userId } }),
};

// Notifications API - for in-app notifications
export const notificationsApi = {
  // Get user's notifications
  getNotifications: (userId: string, limit?: number) =>
    api<{ notifications: Notification[]; unreadCount: number }>(
      `/api/notifications${limit ? `?limit=${limit}` : ''}`,
      { headers: { 'X-User-ID': userId } }
    ),

  // Get unread count (for badge)
  getUnreadCount: (userId: string) =>
    api<{ count: number }>('/api/notifications/unread-count', { headers: { 'X-User-ID': userId } }),

  // Mark notification as read
  markAsRead: (userId: string, notificationId: string) =>
    api<{ notification: Notification }>(`/api/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: { 'X-User-ID': userId }
    }),

  // Mark all notifications as read
  markAllAsRead: (userId: string) =>
    api<{ markedCount: number }>('/api/notifications/mark-all-read', {
      method: 'POST',
      headers: { 'X-User-ID': userId }
    }),
};

// Push Notifications API - for web push subscription management
export const pushApi = {
  // Get VAPID public key for subscription
  getVapidKey: () =>
    api<{ publicKey: string }>('/api/push/vapid-key'),

  // Subscribe to push notifications
  subscribe: (userId: string, subscription: PushSubscriptionJSON, userAgent?: string) =>
    api<{ success: boolean; subscriptionId: string }>('/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify({ subscription, userAgent }),
      headers: { 'X-User-ID': userId }
    }),

  // Unsubscribe from push notifications
  unsubscribe: (userId: string, endpoint: string) =>
    api<{ success: boolean; deleted: boolean }>('/api/push/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ endpoint }),
      headers: { 'X-User-ID': userId }
    }),

  // Get subscription status
  getStatus: (userId: string) =>
    api<{
      subscribed: boolean;
      subscriptionCount: number;
      subscriptions: Array<{
        id: string;
        createdAt: number;
        lastUsedAt: number;
        userAgent?: string;
      }>;
    }>('/api/push/status', {
      headers: { 'X-User-ID': userId }
    }),

  // Admin: Send test push notification
  sendTest: (adminUserId: string, targetUserId: string, title: string, body: string, url?: string) =>
    api<{ success: boolean; sent: number; failed: number }>('/api/admin/push/test', {
      method: 'POST',
      body: JSON.stringify({ targetUserId, title, body, url }),
      headers: { 'X-User-ID': adminUserId }
    }),
};

// Admin Impersonation API - for viewing user accounts (view-only)
export const impersonationApi = {
  // Start impersonation session
  startSession: (adminUserId: string, targetUserId: string, reason?: string) =>
    api<{
      session: ImpersonationSession;
      targetUser: User;
    }>('/api/admin/impersonate/start', {
      method: 'POST',
      body: JSON.stringify({ targetUserId, reason }),
      headers: { 'X-User-ID': adminUserId }
    }),

  // End impersonation session
  endSession: (adminUserId: string, sessionId: string) =>
    api<{ session: ImpersonationSession }>('/api/admin/impersonate/end', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
      headers: { 'X-User-ID': adminUserId }
    }),

  // Get audit log of impersonation sessions
  getAuditLog: (adminUserId: string, limit?: number) =>
    api<{ sessions: ImpersonationSession[] }>(
      `/api/admin/impersonate/audit${limit ? `?limit=${limit}` : ''}`,
      { headers: { 'X-User-ID': adminUserId } }
    ),
};

// Admin Captain Reassignment API - for assigning participants to captains
export const captainApi = {
  // Get all coaches (for dropdown)
  getAllCoaches: (adminUserId: string) =>
    api<{ coaches: Array<{ id: string; name: string; referralCode: string; teamSize: number }> }>(
      '/api/admin/coaches',
      { headers: { 'X-User-ID': adminUserId } }
    ),

  // Reassign a single user to a new captain
  reassignCaptain: (adminUserId: string, userId: string, newCaptainId: string | null) =>
    api<{
      user: User;
      oldCaptainId: string | null;
      newCaptainId: string | null;
      notificationsSent: string[];
    }>(`/api/admin/users/${userId}/reassign-captain`, {
      method: 'POST',
      body: JSON.stringify({ newCaptainId }),
      headers: { 'X-User-ID': adminUserId }
    }),

  // Bulk reassign multiple users to a new captain
  bulkReassign: (adminUserId: string, userIds: string[], newCaptainId: string | null) =>
    api<{
      reassigned: number;
      failed: number;
      results: Array<{
        userId: string;
        success: boolean;
        oldCaptainId: string | null;
        error?: string;
      }>;
    }>('/api/admin/users/bulk-reassign-captain', {
      method: 'POST',
      body: JSON.stringify({ userIds, newCaptainId }),
      headers: { 'X-User-ID': adminUserId }
    }),
};