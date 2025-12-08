import { api } from './api-client';
import {
  User,
  RegisterRequest,
  DailyScore,
  ScoreSubmitRequest,
  WeeklyBiometric,
  BiometricSubmitRequest
} from '@shared/types';
export const authApi = {
  register: (data: RegisterRequest) =>
    api<User>('/api/register', { method: 'POST', body: JSON.stringify(data) }),
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
  submitBiometrics: (userId: string, data: BiometricSubmitRequest) =>
    api<WeeklyBiometric>('/api/biometrics', {
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