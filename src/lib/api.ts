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
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse
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
    points?: number;
    role?: 'challenger' | 'coach';
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
};

// Referral API - for looking up referrer info
export const referralApi = {
  // Get referrer info by code (public, no auth)
  getReferrer: (code: string) =>
    api<{ name: string; role: string } | null>(`/api/referrer/${code}`),
};

// Quiz Leads API - for capturing and managing quiz funnel leads
export const leadsApi = {
  // Submit a new lead (public, no auth required)
  submitLead: (data: QuizLeadSubmitRequest) =>
    api<{ id: string; name: string; phone: string; age: number; captainId: string | null; metabolicAge: number }>(
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
};