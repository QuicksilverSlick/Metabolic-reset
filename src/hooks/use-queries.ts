import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, scoreApi, biometricApi, rosterApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
import { ScoreSubmitRequest, BiometricSubmitRequest, RegisterRequest } from '@shared/types';
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
export function useSubmitBiometrics() {
  const queryClient = useQueryClient();
  const userId = useAuthStore(s => s.userId);
  return useMutation({
    mutationFn: (data: BiometricSubmitRequest) => {
      if (!userId) throw new Error('Not authenticated');
      return biometricApi.submitBiometrics(userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Biometrics submitted! +25 Points');
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