import { api } from './api-client';
import {
  User,
  RegisterRequest,
  LoginRequest,
  DailyScore,
  ScoreSubmitRequest,
  WeeklyBiometric,
  BiometricSubmitRequest,
  SystemStats
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
  bootstrapAdmin: (email: string, secretKey: string) =>
    api<{ message: string; userId: string }>('/api/admin/bootstrap', {
      method: 'POST',
      body: JSON.stringify({ email, secretKey })
    }),
};