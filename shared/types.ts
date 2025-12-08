export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type UserRole = 'challenger' | 'coach';
export interface User {
  id: string;
  phone: string;
  email: string;
  name: string;
  role: UserRole;
  captainId: string | null;
  referralCode: string;
  timezone: string;
  points: number;
  createdAt: number; // Unix timestamp
  isActive: boolean;
  hasScale: boolean;
  stripeCustomerId?: string;
}
export interface DailyScore {
  id: string; // Format: userId:YYYY-MM-DD
  userId: string;
  date: string; // YYYY-MM-DD
  habits: {
    water: boolean;
    steps: boolean;
    sleep: boolean;
    lesson: boolean;
  };
  totalPoints: number;
  updatedAt: number;
}
export interface WeeklyBiometric {
  id: string; // Format: userId:weekN
  userId: string;
  weekNumber: number;
  weight: number;
  bodyFat: number;
  visceralFat: number;
  leanMass: number;
  metabolicAge: number;
  screenshotUrl: string;
  pointsAwarded: number;
  submittedAt: number;
}
export interface ReferralLedger {
  id: string;
  recruiterId: string;
  newRecruitId: string;
  pointsAmount: number;
  createdAt: number;
}
export interface SystemStats {
  totalParticipants: number;
  totalBiometricSubmissions: number;
  totalHabitsLogged: number;
}
// DTOs
export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  referralCodeUsed?: string; // The code they entered to join
  isCaptain?: boolean; // If they want to be their own captain
  timezone?: string;
  hasScale?: boolean;
}
export interface ScoreSubmitRequest {
  date: string; // YYYY-MM-DD
  habits: {
    water?: boolean;
    steps?: boolean;
    sleep?: boolean;
    lesson?: boolean;
  };
}
export interface BiometricSubmitRequest {
  weekNumber: number;
  weight: number;
  bodyFat: number;
  visceralFat: number;
  leanMass: number;
  metabolicAge: number;
  screenshotUrl: string;
}