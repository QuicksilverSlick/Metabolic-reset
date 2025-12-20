import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, scoreApi, biometricApi, rosterApi, statsApi, adminApi, leadsApi, projectApi, enrollmentApi, adminProjectApi, bugApi, adminBugApi, userApi, settingsApi, genealogyApi, pointsApi, adminGenealogyApi, adminPointsApi, referralApi, adminContentApi, courseApi, commentsApi, contentLikesApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
import { ScoreSubmitRequest, BiometricSubmitRequest, RegisterRequest, LoginRequest, User, CreateProjectRequest, UpdateProjectRequest, BugReportSubmitRequest, BugReportUpdateRequest, BugStatus, CohortType, SystemSettings, CreateCourseContentRequest, UpdateCourseContentRequest } from '@shared/types';
export function useUser() {
  const userId = useAuthStore(s => s.userId);
  const login = useAuthStore(s => s.login);
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) return null;
      try {
        const user = await authApi.getMe(userId);
        login(user); // Sync store with latest data
        return user;
      } catch (error) {
        // If user not found or error, maybe logout?
        console.error('Failed to fetch user', error);
        return null;
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Update user profile (avatarUrl, name, timezone)
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  const login = useAuthStore(s => s.login);
  return useMutation({
    mutationFn: (updates: { avatarUrl?: string; name?: string; timezone?: string }) => {
      if (!userId) throw new Error('Not authenticated');
      return userApi.updateProfile(userId, updates);
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['user', userId], user);
      login(user); // Sync store with latest data
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    }
  });
}
export function useDailyScore(date: string) {
  const userId = useAuthStore(s => s.userId);
  return useQuery({
    queryKey: ['score', date, userId],
    queryFn: () => userId ? scoreApi.getDailyScore(userId, date) : null,
    enabled: !!userId && !!date,
  });
}
export function useSubmitScore() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: (data: ScoreSubmitRequest) => {
      if (!userId) throw new Error('Not authenticated');
      return scoreApi.submitScore(userId, data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['score', data.date, userId], data);
      queryClient.invalidateQueries({ queryKey: ['user'] }); // Points update
      queryClient.invalidateQueries({ queryKey: ['scores', 'history'] }); // Update activity history
      toast.success('Progress saved!');
    },
    onError: (error) => {
      toast.error('Failed to save progress');
      console.error(error);
    }
  });
}
export function useWeeklyBiometrics(weekNumber: number) {
  const userId = useAuthStore(s => s.userId);
  return useQuery({
    queryKey: ['biometrics', weekNumber, userId],
    queryFn: () => userId ? biometricApi.getBiometrics(userId, weekNumber) : null,
    enabled: !!userId && weekNumber > 0,
  });
}

// Get all biometrics history for the current user
export function useBiometricsHistory() {
  const userId = useAuthStore(s => s.userId);
  return useQuery({
    queryKey: ['biometrics', 'history', userId],
    queryFn: () => userId ? biometricApi.getBiometricsHistory(userId) : [],
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get daily score history for the current user
export function useScoreHistory(limit?: number) {
  const userId = useAuthStore(s => s.userId);
  return useQuery({
    queryKey: ['scores', 'history', userId, limit],
    queryFn: () => userId ? scoreApi.getScoreHistory(userId, limit) : [],
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes - scores change more frequently
  });
}

// Get referral activity history for the current user
export function useReferralHistory() {
  const userId = useAuthStore(s => s.userId);
  return useQuery({
    queryKey: ['referrals', 'history', userId],
    queryFn: () => userId ? referralApi.getReferralHistory(userId) : [],
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSubmitBiometrics() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: (data: BiometricSubmitRequest) => {
      if (!userId) throw new Error('Not authenticated');
      return biometricApi.submitBiometrics(userId, data);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['biometrics'] });
      if (result.isNewSubmission) {
        toast.success('Biometrics submitted! +25 Points');
      } else {
        toast.success('Biometrics updated!');
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to submit biometrics');
    }
  });
}
export function useRegister() {
  const login = useAuthStore(s => s.login);
  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (user) => {
      login(user);
      toast.success('Registration successful!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    }
  });
}
export function usePaymentIntent() {
  return useMutation({
    mutationFn: (amount: number) => authApi.createPaymentIntent(amount),
  });
}
export function useTeamRoster() {
  const userId = useAuthStore(s => s.userId);
  return useQuery({
    queryKey: ['roster', userId],
    queryFn: () => userId ? rosterApi.getTeamRoster(userId) : [],
    enabled: !!userId,
  });
}

export function useTeamMemberBiometrics(recruitId: string | null) {
  const userId = useAuthStore(s => s.userId);
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: ['roster', 'biometrics', recruitId],
    queryFn: () => {
      if (!userId || !recruitId) return null;
      return rosterApi.getTeamMemberBiometrics(userId, recruitId);
    },
    enabled: !!userId && !!recruitId && user?.role === 'coach',
  });
}

export function useSystemStats() {
  return useQuery({
    queryKey: ['system-stats'],
    queryFn: statsApi.getSystemStats,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Get recent users with avatars (for hero section)
export function useRecentAvatars() {
  return useQuery({
    queryKey: ['recent-avatars'],
    queryFn: statsApi.getRecentAvatars,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Login hook for returning users
export function useLogin() {
  const login = useAuthStore(s => s.login);
  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (user) => {
      login(user);
      toast.success('Welcome back!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    }
  });
}

// Admin hooks
export function useAdminUsers() {
  const userId = useAuthStore(s => s.userId);
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => userId ? adminApi.getAllUsers(userId) : [],
    enabled: !!userId && !!user?.isAdmin,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useAdminUpdateUser() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: ({ targetUserId, updates }: {
      targetUserId: string;
      updates: { isAdmin?: boolean; isActive?: boolean; points?: number; role?: 'challenger' | 'coach' }
    }) => {
      if (!userId) throw new Error('Not authenticated');
      return adminApi.updateUser(userId, targetUserId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User updated successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update user');
    }
  });
}

export function useBootstrapAdmin() {
  return useMutation({
    mutationFn: ({ phone, secretKey }: { phone: string; secretKey: string }) =>
      adminApi.bootstrapAdmin(phone, secretKey),
    onSuccess: () => {
      toast.success('Admin created successfully!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create admin');
    }
  });
}

export function useAdminUserDetails(targetUserId: string | null) {
  const userId = useAuthStore(s => s.userId);
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: ['admin', 'user-details', targetUserId],
    queryFn: () => {
      if (!userId || !targetUserId) return null;
      return adminApi.getUser(userId, targetUserId);
    },
    enabled: !!userId && !!user?.isAdmin && !!targetUserId,
  });
}

// Get deleted users (admin)
export function useAdminDeletedUsers() {
  const userId = useAuthStore(s => s.userId);
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: ['admin', 'deleted-users'],
    queryFn: () => userId ? adminApi.getDeletedUsers(userId) : [],
    enabled: !!userId && !!user?.isAdmin,
    staleTime: 1000 * 60 * 2,
  });
}

// Soft delete a user (admin)
export function useAdminDeleteUser() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: (targetUserId: string) => {
      if (!userId) throw new Error('Not authenticated');
      return adminApi.deleteUser(userId, targetUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'deleted-users'] });
      toast.success('User deleted. Can be restored within 30 days.');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    }
  });
}

// Restore a deleted user (admin)
export function useAdminRestoreUser() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: (targetUserId: string) => {
      if (!userId) throw new Error('Not authenticated');
      return adminApi.restoreUser(userId, targetUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'deleted-users'] });
      toast.success('User restored successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to restore user');
    }
  });
}

// Permanently delete a user (admin)
export function useAdminPermanentDeleteUser() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: (targetUserId: string) => {
      if (!userId) throw new Error('Not authenticated');
      return adminApi.permanentlyDeleteUser(userId, targetUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'deleted-users'] });
      toast.success('User permanently deleted');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to permanently delete user');
    }
  });
}

// Quiz Leads hooks - for captains to view their leads from quiz funnel
export function useCaptainLeads() {
  const userId = useAuthStore(s => s.userId);
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: ['leads', userId],
    queryFn: () => userId ? leadsApi.getMyLeads(userId) : [],
    enabled: !!userId && user?.role === 'coach',
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// =========================================
// Reset Project hooks
// =========================================

// Get all projects
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: projectApi.getAllProjects,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get projects open for registration
export function useOpenProjects() {
  return useQuery({
    queryKey: ['projects', 'open'],
    queryFn: projectApi.getOpenProjects,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get active project
export function useActiveProject() {
  return useQuery({
    queryKey: ['projects', 'active'],
    queryFn: projectApi.getActiveProject,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get single project by ID
export function useProject(projectId: string | null) {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => projectId ? projectApi.getProject(projectId) : null,
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get current week info for a project
export function useProjectWeek(projectId: string | null) {
  return useQuery({
    queryKey: ['projects', projectId, 'week'],
    queryFn: () => projectId ? projectApi.getProjectWeek(projectId) : null,
    enabled: !!projectId,
    staleTime: 1000 * 60 * 1, // 1 minute - week can change
  });
}

// Get group participants for a project (for group leaders)
export function useGroupParticipants(projectId: string | null) {
  const userId = useAuthStore(s => s.userId);
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: ['projects', projectId, 'group', userId],
    queryFn: () => userId && projectId ? projectApi.getGroupParticipants(userId, projectId) : [],
    enabled: !!userId && !!projectId && user?.role === 'coach',
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// =========================================
// Project Enrollment hooks
// =========================================

// Get current user's enrollments
export function useMyEnrollments() {
  const userId = useAuthStore(s => s.userId);
  return useQuery({
    queryKey: ['enrollments', userId],
    queryFn: () => userId ? enrollmentApi.getMyEnrollments(userId) : [],
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get current user's active enrollment (most recent active project)
export function useMyActiveEnrollment() {
  const { data: enrollments, isLoading, error } = useMyEnrollments();

  // Find an enrollment in an active or upcoming project (prioritize active)
  // The projectStatus comes from the enriched enrollment data
  const activeEnrollment = enrollments?.find(e => e.projectStatus === 'active')
    || enrollments?.find(e => e.projectStatus === 'upcoming')
    || (enrollments && enrollments.length > 0 ? enrollments[0] : null);

  return {
    data: activeEnrollment,
    isLoading,
    error
  };
}

// Get enrollment for specific project
export function useEnrollment(projectId: string | null) {
  const userId = useAuthStore(s => s.userId);
  return useQuery({
    queryKey: ['enrollments', projectId, userId],
    queryFn: () => userId && projectId ? enrollmentApi.getEnrollment(userId, projectId) : null,
    enabled: !!userId && !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Enroll in a project
export function useEnrollInProject() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: ({ projectId, groupLeaderId }: { projectId: string; groupLeaderId?: string }) => {
      if (!userId) throw new Error('Not authenticated');
      return enrollmentApi.enroll(userId, projectId, groupLeaderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Successfully enrolled in project!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to enroll');
    }
  });
}

// =========================================
// Admin Project hooks
// =========================================

// Create new project (admin only)
export function useCreateProject() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: (data: CreateProjectRequest) => {
      if (!userId) throw new Error('Not authenticated');
      return adminProjectApi.createProject(userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create project');
    }
  });
}

// Update project (admin only)
export function useUpdateProject() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: ({ projectId, updates }: { projectId: string; updates: UpdateProjectRequest }) => {
      if (!userId) throw new Error('Not authenticated');
      return adminProjectApi.updateProject(userId, projectId, updates);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.setQueryData(['projects', data.id], data);
      toast.success('Project updated successfully!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update project');
    }
  });
}

// Delete project (admin only)
export function useDeleteProject() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: (projectId: string) => {
      if (!userId) throw new Error('Not authenticated');
      return adminProjectApi.deleteProject(userId, projectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted successfully!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete project');
    }
  });
}

// Get project enrollments (admin only)
export function useProjectEnrollments(projectId: string | null) {
  const userId = useAuthStore(s => s.userId);
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: ['admin', 'projects', projectId, 'enrollments'],
    queryFn: () => userId && projectId ? adminProjectApi.getProjectEnrollments(userId, projectId) : [],
    enabled: !!userId && !!projectId && !!user?.isAdmin,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// =========================================
// Admin User Enrollment hooks
// =========================================

// Get a user's enrollments (admin only)
export function useAdminUserEnrollments(targetUserId: string | null) {
  const userId = useAuthStore(s => s.userId);
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: ['admin', 'user-enrollments', targetUserId],
    queryFn: () => userId && targetUserId ? adminApi.getUserEnrollments(userId, targetUserId) : [],
    enabled: !!userId && !!targetUserId && !!user?.isAdmin,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Enroll a user in a project (admin only)
export function useAdminEnrollUser() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: ({ targetUserId, projectId }: { targetUserId: string; projectId: string }) => {
      if (!userId) throw new Error('Not authenticated');
      return adminApi.enrollUserInProject(userId, targetUserId, projectId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'user-enrollments', variables.targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects', variables.projectId, 'enrollments'] });
      toast.success('User enrolled in project successfully!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to enroll user');
    }
  });
}

// Remove a user from a project (admin only)
export function useAdminRemoveUserFromProject() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: ({ targetUserId, projectId }: { targetUserId: string; projectId: string }) => {
      if (!userId) throw new Error('Not authenticated');
      return adminApi.removeUserFromProject(userId, targetUserId, projectId);
    },
    onSuccess: async (_, variables) => {
      // Force refetch of enrollment data
      await queryClient.refetchQueries({ queryKey: ['admin', 'user-enrollments', variables.targetUserId] });
      await queryClient.refetchQueries({ queryKey: ['admin', 'projects', variables.projectId, 'enrollments'] });
      toast.success('User removed from project successfully!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to remove user from project');
    }
  });
}

// =========================================
// Bug Report hooks
// =========================================

// Submit a bug report
export function useSubmitBugReport() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: (data: BugReportSubmitRequest) => {
      if (!userId) throw new Error('Not authenticated');
      return bugApi.submitBug(userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugs', 'mine'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'bugs'] });
      toast.success('Bug report submitted! Thank you for your feedback.');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to submit bug report');
    }
  });
}

// Get current user's bug reports
export function useMyBugReports() {
  const userId = useAuthStore(s => s.userId);
  return useQuery({
    queryKey: ['bugs', 'mine', userId],
    queryFn: () => userId ? bugApi.getMyBugs(userId) : [],
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// =========================================
// Admin Bug Report hooks
// =========================================

// Get all bug reports (admin only)
export function useAdminBugReports() {
  const userId = useAuthStore(s => s.userId);
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: ['admin', 'bugs'],
    queryFn: () => userId ? adminBugApi.getAllBugs(userId) : [],
    enabled: !!userId && !!user?.isAdmin,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get bug reports by status (admin only)
export function useAdminBugReportsByStatus(status: BugStatus | null) {
  const userId = useAuthStore(s => s.userId);
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: ['admin', 'bugs', 'status', status],
    queryFn: () => userId && status ? adminBugApi.getBugsByStatus(userId, status) : [],
    enabled: !!userId && !!user?.isAdmin && !!status,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get single bug report (admin only)
export function useAdminBugReport(bugId: string | null) {
  const userId = useAuthStore(s => s.userId);
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: ['admin', 'bugs', bugId],
    queryFn: () => userId && bugId ? adminBugApi.getBug(userId, bugId) : null,
    enabled: !!userId && !!user?.isAdmin && !!bugId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Update bug report (admin only)
export function useAdminUpdateBugReport() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: ({ bugId, updates }: { bugId: string; updates: BugReportUpdateRequest }) => {
      if (!userId) throw new Error('Not authenticated');
      return adminBugApi.updateBug(userId, bugId, updates);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bugs'] });
      queryClient.setQueryData(['admin', 'bugs', data.id], data);
      toast.success('Bug report updated!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update bug report');
    }
  });
}

// Delete bug report (admin only)
export function useAdminDeleteBugReport() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: (bugId: string) => {
      if (!userId) throw new Error('Not authenticated');
      return adminBugApi.deleteBug(userId, bugId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bugs'] });
      toast.success('Bug report deleted!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete bug report');
    }
  });
}

// =========================================
// System Settings hooks
// =========================================

// Get system settings (video URLs, kit order link)
export function useSystemSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.getSettings,
    staleTime: 1000 * 60 * 30, // 30 minutes - settings rarely change
  });
}

// Update system settings (admin only)
export function useUpdateSystemSettings() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: (updates: Partial<Omit<SystemSettings, 'id'>>) => {
      if (!userId) throw new Error('Not authenticated');
      return settingsApi.updateSettings(userId, updates);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['settings'], data);
      toast.success('Settings updated successfully!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update settings');
    }
  });
}

// =========================================
// Cohort Onboarding hooks
// =========================================

// Update cohort selection for current user's enrollment
export function useUpdateCohort() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: ({ projectId, cohortId }: { projectId: string; cohortId: CohortType }) => {
      if (!userId) throw new Error('Not authenticated');
      return enrollmentApi.updateCohort(userId, projectId, cohortId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      // Don't show toast - onboarding flow will handle navigation
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to select cohort');
    }
  });
}

// Update onboarding progress (hasKit, kitOrderClicked, onboardingComplete)
export function useUpdateOnboarding() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: ({ projectId, updates }: {
      projectId: string;
      updates: { hasKit?: boolean; kitOrderClicked?: boolean; onboardingComplete?: boolean }
    }) => {
      if (!userId) throw new Error('Not authenticated');
      return enrollmentApi.updateOnboarding(userId, projectId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      // Don't show toast - onboarding flow will handle navigation
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update onboarding progress');
    }
  });
}

// Get cohort stats for a project (admin only)
export function useAdminCohortStats(projectId: string | null) {
  const userId = useAuthStore(s => s.userId);
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: ['admin', 'projects', projectId, 'cohort-stats'],
    queryFn: () => userId && projectId ? adminProjectApi.getCohortStats(userId, projectId) : null,
    enabled: !!userId && !!projectId && !!user?.isAdmin,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Update user's cohort (admin only)
export function useAdminUpdateCohort() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: ({ enrollmentId, cohortId }: { enrollmentId: string; cohortId: CohortType | null }) => {
      if (!userId) throw new Error('Not authenticated');
      return adminProjectApi.updateEnrollmentCohort(userId, enrollmentId, cohortId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast.success('Cohort updated successfully!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update cohort');
    }
  });
}

// =========================================
// Genealogy hooks
// =========================================

// Get current user's genealogy tree
export function useMyGenealogy() {
  const userId = useAuthStore(s => s.userId);
  return useQuery({
    queryKey: ['genealogy', 'me', userId],
    queryFn: () => userId ? genealogyApi.getMyTree(userId) : null,
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get genealogy tree for specific user
export function useGenealogy(targetUserId: string | null) {
  const userId = useAuthStore(s => s.userId);
  return useQuery({
    queryKey: ['genealogy', targetUserId],
    queryFn: () => userId && targetUserId ? genealogyApi.getTree(userId, targetUserId) : null,
    enabled: !!userId && !!targetUserId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Admin: Get genealogy tree for any user
export function useAdminGenealogy(targetUserId: string | null) {
  const userId = useAuthStore(s => s.userId);
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: ['admin', 'genealogy', targetUserId],
    queryFn: () => userId && targetUserId ? adminGenealogyApi.getTree(userId, targetUserId) : null,
    enabled: !!userId && !!user?.isAdmin && !!targetUserId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Admin: Get all root coaches
export function useAdminGenealogyRoots() {
  const userId = useAuthStore(s => s.userId);
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: ['admin', 'genealogy', 'roots'],
    queryFn: () => userId ? adminGenealogyApi.getRoots(userId) : [],
    enabled: !!userId && !!user?.isAdmin,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// =========================================
// Points Ledger hooks
// =========================================

// Get current user's point transaction history
export function useMyPointsHistory() {
  const userId = useAuthStore(s => s.userId);
  return useQuery({
    queryKey: ['points', 'history', userId],
    queryFn: () => userId ? pointsApi.getMyHistory(userId) : [],
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get point settings (public)
export function usePointSettings() {
  return useQuery({
    queryKey: ['settings', 'points'],
    queryFn: pointsApi.getPointSettings,
    staleTime: 1000 * 60 * 30, // 30 minutes - settings rarely change
  });
}

// Admin: Get point transactions for any user
export function useAdminUserPointsHistory(targetUserId: string | null) {
  const userId = useAuthStore(s => s.userId);
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: ['admin', 'points', 'history', targetUserId],
    queryFn: () => userId && targetUserId ? adminPointsApi.getUserHistory(userId, targetUserId) : [],
    enabled: !!userId && !!user?.isAdmin && !!targetUserId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Admin: Get recent point transactions (global)
export function useAdminRecentPointsTransactions(limit?: number) {
  const userId = useAuthStore(s => s.userId);
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: ['admin', 'points', 'recent', limit],
    queryFn: () => userId ? adminPointsApi.getRecentTransactions(userId, limit) : [],
    enabled: !!userId && !!user?.isAdmin,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Admin: Adjust user points
export function useAdminAdjustPoints() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: (data: { userId: string; points: number; description: string; projectId?: string }) => {
      if (!userId) throw new Error('Not authenticated');
      return adminPointsApi.adjustPoints(userId, data);
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'points'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      toast.success(`Points adjusted successfully! New balance: ${result.user.points}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to adjust points');
    }
  });
}

// Admin: Update point settings
export function useAdminUpdatePointSettings() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: (updates: {
      referralPointsCoach?: number;
      referralPointsChallenger?: number;
      dailyHabitPoints?: number;
      biometricSubmissionPoints?: number;
    }) => {
      if (!userId) throw new Error('Not authenticated');
      return adminPointsApi.updatePointSettings(userId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Point settings updated successfully!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update point settings');
    }
  });
}

// =========================================
// LMS / Course Content hooks
// =========================================

// Admin: Get all content for a project
export function useAdminProjectContent(projectId: string | null) {
  const userId = useAuthStore(s => s.userId);
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: ['admin', 'content', projectId],
    queryFn: () => userId && projectId ? adminContentApi.getProjectContent(userId, projectId) : [],
    enabled: !!userId && !!user?.isAdmin && !!projectId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Admin: Get content analytics for a project
export function useAdminContentAnalytics(projectId: string | null) {
  const userId = useAuthStore(s => s.userId);
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: ['admin', 'content', projectId, 'analytics'],
    queryFn: () => userId && projectId ? adminContentApi.getContentAnalytics(userId, projectId) : [],
    enabled: !!userId && !!user?.isAdmin && !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Admin: Create course content
export function useAdminCreateContent() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: (data: CreateCourseContentRequest) => {
      if (!userId) throw new Error('Not authenticated');
      return adminContentApi.createContent(userId, data);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'content', result.projectId] });
      toast.success('Content created successfully!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create content');
    }
  });
}

// Admin: Update course content
export function useAdminUpdateContent() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: ({ contentId, updates }: { contentId: string; updates: UpdateCourseContentRequest }) => {
      if (!userId) throw new Error('Not authenticated');
      return adminContentApi.updateContent(userId, contentId, updates);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'content', result.projectId] });
      toast.success('Content updated successfully!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update content');
    }
  });
}

// Admin: Delete course content
export function useAdminDeleteContent() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: ({ contentId, projectId }: { contentId: string; projectId: string }) => {
      if (!userId) throw new Error('Not authenticated');
      return adminContentApi.deleteContent(userId, contentId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'content', variables.projectId] });
      toast.success('Content deleted successfully!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete content');
    }
  });
}

// Admin: Copy content between projects
export function useAdminCopyContent() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: ({ sourceProjectId, targetProjectId }: { sourceProjectId: string; targetProjectId: string }) => {
      if (!userId) throw new Error('Not authenticated');
      return adminContentApi.copyContent(userId, sourceProjectId, targetProjectId);
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'content', variables.targetProjectId] });
      toast.success(`Copied ${result.copiedCount} content items!`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to copy content');
    }
  });
}

// User: Get course overview
export function useCourseOverview() {
  const userId = useAuthStore(s => s.userId);
  return useQuery({
    queryKey: ['course', 'overview', userId],
    queryFn: () => userId ? courseApi.getOverview(userId) : null,
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get day's content (polls for real-time like updates)
export function useDayContent(dayNumber: number | null) {
  const userId = useAuthStore(s => s.userId);
  return useQuery({
    queryKey: ['course', 'day', dayNumber],
    queryFn: () => userId && dayNumber ? courseApi.getDayContent(userId, dayNumber) : null,
    enabled: !!userId && !!dayNumber,
    staleTime: 1000 * 10, // 10 seconds
    refetchInterval: 5000, // Poll every 5 seconds for real-time like updates
    refetchIntervalInBackground: false,
  });
}

// User: Update video progress
export function useUpdateVideoProgress() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: ({ contentId, watchedPercentage, lastPosition }: { contentId: string; watchedPercentage: number; lastPosition: number }) => {
      if (!userId) throw new Error('Not authenticated');
      return courseApi.updateVideoProgress(userId, contentId, watchedPercentage, lastPosition);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['course'] });
      if (result.justCompleted) {
        toast.success(`Video completed! +${result.pointsAwarded} points`);
      }
    },
    onError: (error) => {
      console.error('Failed to update video progress:', error);
    }
  });
}

// User: Mark video complete
export function useCompleteVideo() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: (contentId: string) => {
      if (!userId) throw new Error('Not authenticated');
      return courseApi.completeVideo(userId, contentId);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['course'] });
      if (!result.alreadyCompleted) {
        toast.success(`Video completed! +${result.pointsAwarded} points`);
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to complete video');
    }
  });
}

// User: Submit quiz
export function useSubmitQuiz() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: ({ contentId, answers }: { contentId: string; answers: Record<string, number> }) => {
      if (!userId) throw new Error('Not authenticated');
      return courseApi.submitQuiz(userId, contentId, answers);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['course'] });
      if (result.passed) {
        toast.success(`Quiz passed! ${result.score}% - +${result.pointsAwarded} points`);
      } else {
        toast.error(`Quiz not passed. ${result.score}% (need 80%). ${result.attemptsRemaining} attempts remaining.`);
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to submit quiz');
    }
  });
}

// User: Get all progress
export function useCourseProgress() {
  const userId = useAuthStore(s => s.userId);
  return useQuery({
    queryKey: ['course', 'progress', userId],
    queryFn: () => userId ? courseApi.getProgress(userId) : null,
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// ========== Content Comments ==========

// Get comments for a content item (with real-time polling)
export function useContentComments(contentId: string | null) {
  const userId = useAuthStore(s => s.userId);
  return useQuery({
    queryKey: ['comments', contentId],
    queryFn: () => contentId && userId ? commentsApi.getComments(userId, contentId) : null,
    enabled: !!contentId && !!userId,
    staleTime: 1000 * 5, // 5 seconds
    refetchInterval: 3000, // Poll every 3 seconds for real-time comments
    refetchIntervalInBackground: false, // Don't poll when tab is in background
  });
}

// Add a comment
export function useAddComment() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: ({ contentId, text }: { contentId: string; text: string }) => {
      if (!userId) throw new Error('Not authenticated');
      return commentsApi.addComment(userId, contentId, text);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.contentId] });
      toast.success('Comment added!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to add comment');
    }
  });
}

// Like/unlike a comment
export function useLikeComment() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: ({ commentId, contentId }: { commentId: string; contentId: string }) => {
      if (!userId) throw new Error('Not authenticated');
      return commentsApi.likeComment(userId, commentId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.contentId] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to like comment');
    }
  });
}

// ========== Content Likes ==========

// Get content details with like count (with polling for real-time updates)
export function useContentDetails(contentId: string | null) {
  const userId = useAuthStore(s => s.userId);
  return useQuery({
    queryKey: ['content', contentId],
    queryFn: () => contentId && userId ? contentLikesApi.getContent(userId, contentId) : null,
    enabled: !!contentId && !!userId,
    staleTime: 1000 * 5, // 5 seconds
    refetchInterval: 5000, // Poll every 5 seconds for real-time like updates
    refetchIntervalInBackground: false,
  });
}

// Like/unlike a content item
export function useLikeContent() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: (contentId: string) => {
      if (!userId) throw new Error('Not authenticated');
      return contentLikesApi.likeContent(userId, contentId);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['content', result.content.id] });
      queryClient.invalidateQueries({ queryKey: ['course'] }); // Refresh day content too
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to like content');
    }
  });
}