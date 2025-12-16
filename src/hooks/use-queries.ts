import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, scoreApi, biometricApi, rosterApi, statsApi, adminApi, leadsApi, projectApi, enrollmentApi, adminProjectApi, bugApi, adminBugApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
import { ScoreSubmitRequest, BiometricSubmitRequest, RegisterRequest, LoginRequest, User, CreateProjectRequest, UpdateProjectRequest, BugReportSubmitRequest, BugReportUpdateRequest, BugStatus } from '@shared/types';
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