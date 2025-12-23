import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, scoreApi, biometricApi, rosterApi, statsApi, adminApi, leadsApi, projectApi, enrollmentApi, adminProjectApi, bugApi, adminBugApi, userApi, settingsApi, genealogyApi, pointsApi, adminGenealogyApi, adminPointsApi, referralApi, adminContentApi, courseApi, commentsApi, contentLikesApi, notificationsApi, impersonationApi, captainApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
import { ScoreSubmitRequest, BiometricSubmitRequest, RegisterRequest, LoginRequest, User, CreateProjectRequest, UpdateProjectRequest, BugReportSubmitRequest, BugReportUpdateRequest, BugStatus, CohortType, SystemSettings, CreateCourseContentRequest, UpdateCourseContentRequest } from '@shared/types';

// Helper hook: Returns the effective user ID for data fetching
// When impersonating, returns the impersonated user's ID; otherwise returns the logged-in user's ID
export function useEffectiveUserId() {
  const userId = useAuthStore(s => s.userId);
  const impersonation = useAuthStore(s => s.impersonation);

  // If impersonating, use the impersonated user's ID for data fetching
  if (impersonation.isImpersonating && impersonation.impersonatedUser?.id) {
    return impersonation.impersonatedUser.id;
  }
  return userId;
}

// Helper hook: Returns the effective user object for display
// When impersonating, returns the impersonated user; otherwise returns the logged-in user
export function useEffectiveUser() {
  const user = useAuthStore(s => s.user);
  const impersonation = useAuthStore(s => s.impersonation);

  // If impersonating, return the impersonated user for display
  if (impersonation.isImpersonating && impersonation.impersonatedUser) {
    return {
      data: impersonation.impersonatedUser,
      isLoading: false,
      isImpersonating: true,
    };
  }

  return {
    data: user,
    isLoading: false,
    isImpersonating: false,
  };
}

// Helper hook: Returns whether we are currently impersonating
// Use this to disable mutations during impersonation (view-only mode)
export function useIsImpersonating() {
  const impersonation = useAuthStore(s => s.impersonation);
  return impersonation.isImpersonating;
}

// Helper function: Throws error if trying to mutate during impersonation
function assertNotImpersonating(isImpersonating: boolean) {
  if (isImpersonating) {
    throw new Error('Actions are disabled in view-only mode');
  }
}

// Fetch user data - but during impersonation, fetch the impersonated user's data
export function useUser() {
  const userId = useAuthStore(s => s.userId);
  const login = useAuthStore(s => s.login);
  const impersonation = useAuthStore(s => s.impersonation);

  // During impersonation, we don't want to refetch and sync the admin user
  // Instead, we'll use the impersonated user data from the store
  const effectiveUserId = useEffectiveUserId();
  const isImpersonating = impersonation.isImpersonating;

  return useQuery({
    queryKey: ['user', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return null;
      try {
        const user = await authApi.getMe(effectiveUserId);
        // Only sync to store if NOT impersonating (we don't want to overwrite admin's login)
        if (!isImpersonating) {
          login(user);
        }
        return user;
      } catch (error) {
        console.error('Failed to fetch user', error);
        return null;
      }
    },
    enabled: !!effectiveUserId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Update user profile (avatarUrl, name, email, phone, timezone, cartLink, hasScale)
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  const login = useAuthStore(s => s.login);
  const isImpersonating = useIsImpersonating();
  return useMutation({
    mutationFn: (updates: { avatarUrl?: string; name?: string; email?: string; phone?: string; timezone?: string; cartLink?: string; hasScale?: boolean }) => {
      assertNotImpersonating(isImpersonating);
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
  const effectiveUserId = useEffectiveUserId();
  return useQuery({
    queryKey: ['score', date, effectiveUserId],
    queryFn: () => effectiveUserId ? scoreApi.getDailyScore(effectiveUserId, date) : null,
    enabled: !!effectiveUserId && !!date,
  });
}
export function useSubmitScore() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  const isImpersonating = useIsImpersonating();
  return useMutation({
    mutationFn: (data: ScoreSubmitRequest) => {
      assertNotImpersonating(isImpersonating);
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
  const effectiveUserId = useEffectiveUserId();
  return useQuery({
    queryKey: ['biometrics', weekNumber, effectiveUserId],
    queryFn: () => effectiveUserId ? biometricApi.getBiometrics(effectiveUserId, weekNumber) : null,
    enabled: !!effectiveUserId && weekNumber > 0,
  });
}

// Get all biometrics history for the current user (or impersonated user)
export function useBiometricsHistory() {
  const effectiveUserId = useEffectiveUserId();
  return useQuery({
    queryKey: ['biometrics', 'history', effectiveUserId],
    queryFn: () => effectiveUserId ? biometricApi.getBiometricsHistory(effectiveUserId) : [],
    enabled: !!effectiveUserId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get daily score history for the current user (or impersonated user)
export function useScoreHistory(limit?: number) {
  const effectiveUserId = useEffectiveUserId();
  return useQuery({
    queryKey: ['scores', 'history', effectiveUserId, limit],
    queryFn: () => effectiveUserId ? scoreApi.getScoreHistory(effectiveUserId, limit) : [],
    enabled: !!effectiveUserId,
    staleTime: 1000 * 60 * 2, // 2 minutes - scores change more frequently
  });
}

// Get referral activity history for the current user (or impersonated user)
export function useReferralHistory() {
  const effectiveUserId = useEffectiveUserId();
  return useQuery({
    queryKey: ['referrals', 'history', effectiveUserId],
    queryFn: () => effectiveUserId ? referralApi.getReferralHistory(effectiveUserId) : [],
    enabled: !!effectiveUserId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSubmitBiometrics() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  const isImpersonating = useIsImpersonating();
  return useMutation({
    mutationFn: (data: BiometricSubmitRequest) => {
      assertNotImpersonating(isImpersonating);
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
  const effectiveUserId = useEffectiveUserId();
  return useQuery({
    queryKey: ['roster', effectiveUserId],
    queryFn: () => effectiveUserId ? rosterApi.getTeamRoster(effectiveUserId) : [],
    enabled: !!effectiveUserId,
  });
}

// Get referral stats for the current coach (derived from roster)
export function useReferralStats() {
  const { data: roster } = useTeamRoster();
  // Compute stats from roster data
  const totalReferred = roster?.length || 0;
  return {
    data: {
      totalReferred,
      pointsEarned: totalReferred, // 1 point per referral
    },
    isLoading: false,
  };
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
      updates: {
        isAdmin?: boolean;
        isActive?: boolean;
        isTestMode?: boolean;
        points?: number;
        role?: 'challenger' | 'coach';
        name?: string;
        email?: string;
        phone?: string;
        timezone?: string;
      }
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

// Clear OTP record for a phone (admin)
export function useAdminClearOtp() {
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: (phone: string) => {
      if (!userId) throw new Error('Not authenticated');
      return adminApi.clearOtp(userId, phone);
    },
    onSuccess: (data) => {
      toast.success(data.message || 'OTP record cleared successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to clear OTP record');
    }
  });
}

// Find duplicate users by phone or email (admin)
export function useAdminFindDuplicates() {
  const userId = useAuthStore(s => s.userId);
  return useQuery({
    queryKey: ['admin', 'duplicates'],
    queryFn: async () => {
      if (!userId) throw new Error('Not authenticated');
      console.log('[useAdminFindDuplicates] Calling API with userId:', userId);
      const result = await adminApi.findDuplicates(userId);
      console.log('[useAdminFindDuplicates] API returned:', result);
      return result;
    },
    enabled: !!userId,
    staleTime: 0, // Always refetch
    gcTime: 0, // Don't cache
  });
}

// Merge duplicate users (admin)
export function useAdminMergeUsers() {
  const userId = useAuthStore(s => s.userId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ primaryUserId, secondaryUserId }: { primaryUserId: string; secondaryUserId: string }) => {
      if (!userId) throw new Error('Not authenticated');
      return adminApi.mergeUsers(userId, primaryUserId, secondaryUserId);
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Users merged successfully');
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'duplicates'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'deleted'] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to merge users');
    }
  });
}

// Quiz Leads hooks - for captains to view their leads from quiz funnel (or impersonated user)
export function useCaptainLeads() {
  const effectiveUserId = useEffectiveUserId();
  const impersonation = useAuthStore(s => s.impersonation);
  // Use impersonated user's role if impersonating, otherwise use logged-in user
  const effectiveUser = impersonation.isImpersonating && impersonation.impersonatedUser
    ? impersonation.impersonatedUser
    : useAuthStore.getState().user;
  return useQuery({
    queryKey: ['leads', effectiveUserId],
    queryFn: () => effectiveUserId ? leadsApi.getMyLeads(effectiveUserId) : [],
    enabled: !!effectiveUserId && effectiveUser?.role === 'coach',
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

// Get group participants for a project (for group leaders or impersonated coach)
export function useGroupParticipants(projectId: string | null) {
  const effectiveUserId = useEffectiveUserId();
  const impersonation = useAuthStore(s => s.impersonation);
  // Use impersonated user's role if impersonating, otherwise use logged-in user
  const effectiveUser = impersonation.isImpersonating && impersonation.impersonatedUser
    ? impersonation.impersonatedUser
    : useAuthStore.getState().user;
  return useQuery({
    queryKey: ['projects', projectId, 'group', effectiveUserId],
    queryFn: () => effectiveUserId && projectId ? projectApi.getGroupParticipants(effectiveUserId, projectId) : [],
    enabled: !!effectiveUserId && !!projectId && effectiveUser?.role === 'coach',
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// =========================================
// Project Enrollment hooks
// =========================================

// Get current user's enrollments (or impersonated user's)
export function useMyEnrollments() {
  const effectiveUserId = useEffectiveUserId();
  return useQuery({
    queryKey: ['enrollments', effectiveUserId],
    queryFn: () => effectiveUserId ? enrollmentApi.getMyEnrollments(effectiveUserId) : [],
    enabled: !!effectiveUserId,
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
  const isImpersonating = useIsImpersonating();
  return useMutation({
    mutationFn: ({ projectId, groupLeaderId }: { projectId: string; groupLeaderId?: string }) => {
      assertNotImpersonating(isImpersonating);
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
  const isImpersonating = useIsImpersonating();
  return useMutation({
    mutationFn: (data: BugReportSubmitRequest) => {
      assertNotImpersonating(isImpersonating);
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
// AI Bug Analysis hooks
// =========================================

// Get AI analysis for a specific bug (admin only)
export function useBugAIAnalysis(bugId: string | null) {
  const userId = useAuthStore(s => s.userId);
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: ['admin', 'bugs', bugId, 'analysis'],
    queryFn: () => adminBugApi.getBugAnalysis(userId!, bugId!),
    enabled: !!userId && !!user?.isAdmin && !!bugId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Trigger AI analysis for a bug (admin only)
export function useAnalyzeBug() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: async ({ bugId, options }: { bugId: string; options?: { includeScreenshot?: boolean; includeVideo?: boolean } }) => {
      console.log('[useAnalyzeBug] Starting mutation');
      console.log('[useAnalyzeBug] userId:', userId);
      console.log('[useAnalyzeBug] bugId:', bugId);
      console.log('[useAnalyzeBug] options:', options);

      if (!userId) {
        console.error('[useAnalyzeBug] Not authenticated!');
        throw new Error('Not authenticated');
      }

      console.log('[useAnalyzeBug] Calling adminBugApi.analyzeBug...');
      const result = await adminBugApi.analyzeBug(userId, bugId, options);
      console.log('[useAnalyzeBug] API returned:', result);

      return result;
    },
    onSuccess: (data, variables) => {
      console.log('[useAnalyzeBug] onSuccess called');
      console.log('[useAnalyzeBug] data:', data);
      console.log('[useAnalyzeBug] variables:', variables);

      // Check if analysis has an error
      if (data?.analysis?.error) {
        console.warn('[useAnalyzeBug] Analysis completed with error:', data.analysis.error);
        toast.error(`Analysis failed: ${data.analysis.error}`);
      } else if (data?.analysis?.summary === 'Analysis failed') {
        console.warn('[useAnalyzeBug] Analysis failed (summary indicates failure)');
        toast.error('AI analysis failed - check console for details');
      } else {
        toast.success('AI analysis complete!');
      }

      // Update the analysis cache for this bug
      queryClient.setQueryData(['admin', 'bugs', variables.bugId, 'analysis'], data);
      queryClient.invalidateQueries({ queryKey: ['admin', 'ai-analyses'] });
    },
    onError: (error) => {
      console.error('[useAnalyzeBug] onError called');
      console.error('[useAnalyzeBug] error:', error);
      toast.error(error instanceof Error ? error.message : 'AI analysis failed');
    }
  });
}

// Get all recent AI analyses (admin only)
export function useAllAIAnalyses() {
  const userId = useAuthStore(s => s.userId);
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: ['admin', 'ai-analyses'],
    queryFn: () => adminBugApi.getAllAnalyses(userId!),
    enabled: !!userId && !!user?.isAdmin,
    staleTime: 1000 * 60 * 2, // 2 minutes
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
  const isImpersonating = useIsImpersonating();
  return useMutation({
    mutationFn: ({ projectId, cohortId }: { projectId: string; cohortId: CohortType }) => {
      assertNotImpersonating(isImpersonating);
      if (!userId) throw new Error('Not authenticated');
      return enrollmentApi.updateCohort(userId, projectId, cohortId);
    },
    onSuccess: () => {
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
  const isImpersonating = useIsImpersonating();
  return useMutation({
    mutationFn: ({ projectId, updates }: {
      projectId: string;
      updates: { hasKit?: boolean; kitOrderClicked?: boolean; onboardingComplete?: boolean }
    }) => {
      assertNotImpersonating(isImpersonating);
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
// Coach Info hooks
// =========================================

// Get coach info (cart link, phone) for kit ordering
export function useCoachInfo(coachId: string | null) {
  return useQuery({
    queryKey: ['coach-info', coachId],
    queryFn: () => coachId ? userApi.getCoachInfo(coachId) : null,
    enabled: !!coachId,
    staleTime: 1000 * 60 * 10, // 10 minutes - coach info rarely changes
  });
}

// =========================================
// Genealogy hooks
// =========================================

// Get current user's genealogy tree (or impersonated user's)
export function useMyGenealogy() {
  const effectiveUserId = useEffectiveUserId();
  return useQuery({
    queryKey: ['genealogy', 'me', effectiveUserId],
    queryFn: () => effectiveUserId ? genealogyApi.getMyTree(effectiveUserId) : null,
    enabled: !!effectiveUserId,
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

// Get current user's point transaction history (or impersonated user's)
export function useMyPointsHistory() {
  const effectiveUserId = useEffectiveUserId();
  return useQuery({
    queryKey: ['points', 'history', effectiveUserId],
    queryFn: () => effectiveUserId ? pointsApi.getMyHistory(effectiveUserId) : [],
    enabled: !!effectiveUserId,
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

// User: Get course overview (or impersonated user's)
export function useCourseOverview() {
  const effectiveUserId = useEffectiveUserId();
  return useQuery({
    queryKey: ['course', 'overview', effectiveUserId],
    queryFn: () => effectiveUserId ? courseApi.getOverview(effectiveUserId) : null,
    enabled: !!effectiveUserId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get day's content (polls for real-time like updates) (or impersonated user's)
export function useDayContent(dayNumber: number | null) {
  const effectiveUserId = useEffectiveUserId();
  return useQuery({
    queryKey: ['course', 'day', dayNumber, effectiveUserId],
    queryFn: () => effectiveUserId && dayNumber ? courseApi.getDayContent(effectiveUserId, dayNumber) : null,
    enabled: !!effectiveUserId && !!dayNumber,
    staleTime: 1000 * 10, // 10 seconds
    refetchInterval: 5000, // Poll every 5 seconds for real-time like updates
    refetchIntervalInBackground: false,
  });
}

// User: Update video progress
export function useUpdateVideoProgress() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  const isImpersonating = useIsImpersonating();
  return useMutation({
    mutationFn: ({ contentId, watchedPercentage, lastPosition }: { contentId: string; watchedPercentage: number; lastPosition: number }) => {
      assertNotImpersonating(isImpersonating);
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
  const isImpersonating = useIsImpersonating();
  return useMutation({
    mutationFn: (contentId: string) => {
      assertNotImpersonating(isImpersonating);
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
  const isImpersonating = useIsImpersonating();
  return useMutation({
    mutationFn: ({ contentId, answers }: { contentId: string; answers: Record<string, number> }) => {
      assertNotImpersonating(isImpersonating);
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

// User: Get all progress (or impersonated user's)
export function useCourseProgress() {
  const effectiveUserId = useEffectiveUserId();
  return useQuery({
    queryKey: ['course', 'progress', effectiveUserId],
    queryFn: () => effectiveUserId ? courseApi.getProgress(effectiveUserId) : null,
    enabled: !!effectiveUserId,
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
  const isImpersonating = useIsImpersonating();
  return useMutation({
    mutationFn: ({ contentId, text }: { contentId: string; text: string }) => {
      assertNotImpersonating(isImpersonating);
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
  const isImpersonating = useIsImpersonating();
  return useMutation({
    mutationFn: ({ commentId, contentId }: { commentId: string; contentId: string }) => {
      assertNotImpersonating(isImpersonating);
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
  const isImpersonating = useIsImpersonating();
  return useMutation({
    mutationFn: (contentId: string) => {
      assertNotImpersonating(isImpersonating);
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

// =========================================
// Notification hooks
// =========================================

// Get user's notifications
export function useNotifications(limit?: number) {
  const userId = useAuthStore(s => s.userId);
  return useQuery({
    queryKey: ['notifications', userId, limit],
    queryFn: () => userId ? notificationsApi.getNotifications(userId, limit) : null,
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

// Get unread notification count (for badge)
export function useUnreadNotificationCount() {
  const userId = useAuthStore(s => s.userId);
  return useQuery({
    queryKey: ['notifications', 'unread-count', userId],
    queryFn: () => userId ? notificationsApi.getUnreadCount(userId) : { count: 0 },
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Poll every minute
  });
}

// Mark notification as read
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  const isImpersonating = useIsImpersonating();
  return useMutation({
    mutationFn: (notificationId: string) => {
      assertNotImpersonating(isImpersonating);
      if (!userId) throw new Error('Not authenticated');
      return notificationsApi.markAsRead(userId, notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to mark notification as read');
    }
  });
}

// Mark all notifications as read
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  const isImpersonating = useIsImpersonating();
  return useMutation({
    mutationFn: () => {
      assertNotImpersonating(isImpersonating);
      if (!userId) throw new Error('Not authenticated');
      return notificationsApi.markAllAsRead(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to mark all notifications as read');
    }
  });
}

// =========================================
// Impersonation hooks (admin only)
// =========================================

// Start impersonation session
export function useStartImpersonation() {
  const userId = useAuthStore(s => s.userId);
  const startImpersonation = useAuthStore(s => s.startImpersonation);
  return useMutation({
    mutationFn: ({ targetUserId, reason }: { targetUserId: string; reason?: string }) => {
      if (!userId) throw new Error('Not authenticated');
      return impersonationApi.startSession(userId, targetUserId, reason);
    },
    onSuccess: (result) => {
      startImpersonation(result.targetUser, result.session.id);
      toast.success(`Now viewing as ${result.targetUser.name}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to start impersonation');
    }
  });
}

// End impersonation session
export function useEndImpersonation() {
  const userId = useAuthStore(s => s.userId);
  const impersonation = useAuthStore(s => s.impersonation);
  const endImpersonation = useAuthStore(s => s.endImpersonation);
  return useMutation({
    mutationFn: () => {
      if (!userId) throw new Error('Not authenticated');
      if (!impersonation.impersonationSessionId) throw new Error('No active impersonation session');
      return impersonationApi.endSession(userId, impersonation.impersonationSessionId);
    },
    onSuccess: () => {
      endImpersonation();
      toast.success('Impersonation session ended');
    },
    onError: (error) => {
      // End locally anyway
      endImpersonation();
      console.error('Failed to end impersonation on server:', error);
    }
  });
}

// Get impersonation audit log (admin only)
export function useImpersonationAuditLog(limit?: number) {
  const userId = useAuthStore(s => s.userId);
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: ['admin', 'impersonation', 'audit', limit],
    queryFn: () => userId ? impersonationApi.getAuditLog(userId, limit) : null,
    enabled: !!userId && !!user?.isAdmin,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// =========================================
// Captain Reassignment hooks (admin only)
// =========================================

// Get all coaches for captain dropdown
export function useAllCoaches() {
  const userId = useAuthStore(s => s.userId);
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: ['admin', 'coaches'],
    queryFn: () => userId ? captainApi.getAllCoaches(userId) : null,
    enabled: !!userId && !!user?.isAdmin,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Reassign a single user to a new captain
export function useReassignCaptain() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: ({ targetUserId, newCaptainId }: { targetUserId: string; newCaptainId: string | null }) => {
      if (!userId) throw new Error('Not authenticated');
      return captainApi.reassignCaptain(userId, targetUserId, newCaptainId);
    },
    onSuccess: (result) => {
      const newCaptainName = result.newCaptainId ? 'new captain' : 'no captain';
      toast.success(`User reassigned to ${newCaptainName}`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'coaches'] });
      queryClient.invalidateQueries({ queryKey: ['roster'] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to reassign captain');
    }
  });
}

// Bulk reassign multiple users to a new captain
export function useBulkReassignCaptain() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: ({ userIds, newCaptainId }: { userIds: string[]; newCaptainId: string | null }) => {
      if (!userId) throw new Error('Not authenticated');
      return captainApi.bulkReassign(userId, userIds, newCaptainId);
    },
    onSuccess: (result) => {
      if (result.failed > 0) {
        toast.warning(`Reassigned ${result.reassigned} users, ${result.failed} failed`);
      } else {
        toast.success(`Successfully reassigned ${result.reassigned} users`);
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'coaches'] });
      queryClient.invalidateQueries({ queryKey: ['roster'] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to bulk reassign captains');
    }
  });
}