import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, scoreApi, biometricApi, rosterApi, statsApi, adminApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
import { ScoreSubmitRequest, BiometricSubmitRequest, RegisterRequest, LoginRequest, User } from '@shared/types';
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
    mutationFn: ({ email, secretKey }: { email: string; secretKey: string }) =>
      adminApi.bootstrapAdmin(email, secretKey),
    onSuccess: () => {
      toast.success('Admin created successfully! Please log in again.');
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