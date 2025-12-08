import { IndexedEntity, Entity, Env, Index } from "./core-utils";
import type { User, DailyScore, WeeklyBiometric, ReferralLedger, SystemStats } from "@shared/types";
// Helper entity for secondary index: ReferralCode -> UserId
export class ReferralCodeMapping extends Entity<{ userId: string }> {
  static readonly entityName = "ref-mapping";
  static readonly initialState = { userId: "" };
}
// Index for tracking all captains (coaches)
export class CaptainIndex extends Index<string> {
  constructor(env: Env) {
    super(env, "all-captains");
  }
}
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = {
    id: "",
    phone: "",
    email: "",
    name: "",
    role: "challenger",
    captainId: null,
    referralCode: "",
    timezone: "UTC",
    points: 0,
    createdAt: 0,
    isActive: true,
    hasScale: false
  };
  static async findByReferralCode(env: Env, code: string): Promise<User | null> {
    // Normalize code to uppercase for case-insensitive lookup
    const normalizedCode = code.toUpperCase().trim();
    if (!normalizedCode) return null;
    const mapping = new ReferralCodeMapping(env, normalizedCode);
    const state = await mapping.getState();
    if (!state.userId) return null;
    const userEntity = new UserEntity(env, state.userId);
    const userState = await userEntity.getState();
    // Verify the user actually exists (in case of stale index)
    if (!userState.id) return null;
    return userState;
  }
  static async addPoints(env: Env, userId: string, points: number): Promise<void> {
    const userEntity = new UserEntity(env, userId);
    await userEntity.mutate(state => ({
      ...state,
      points: (state.points || 0) + points
    }));
  }
}
export class DailyScoreEntity extends IndexedEntity<DailyScore> {
  static readonly entityName = "score";
  static readonly indexName = "scores";
  static readonly initialState: DailyScore = {
    id: "",
    userId: "",
    date: "",
    habits: { water: false, steps: false, sleep: false, lesson: false },
    totalPoints: 0,
    updatedAt: 0
  };
}
export class WeeklyBiometricEntity extends IndexedEntity<WeeklyBiometric> {
  static readonly entityName = "biometric";
  static readonly indexName = "biometrics";
  static readonly initialState: WeeklyBiometric = {
    id: "",
    userId: "",
    weekNumber: 0,
    weight: 0,
    bodyFat: 0,
    visceralFat: 0,
    leanMass: 0,
    metabolicAge: 0,
    screenshotUrl: "",
    pointsAwarded: 0,
    submittedAt: 0
  };
}
export class ReferralLedgerEntity extends IndexedEntity<ReferralLedger> {
  static readonly entityName = "ledger";
  static readonly indexName = "ledgers";
  static readonly initialState: ReferralLedger = {
    id: "",
    recruiterId: "",
    newRecruitId: "",
    pointsAmount: 0,
    createdAt: 0
  };
}
export class SystemStatsEntity extends Entity<SystemStats> {
  static readonly entityName = "sys-stats";
  static readonly initialState: SystemStats = {
    totalParticipants: 0,
    totalBiometricSubmissions: 0,
    totalHabitsLogged: 0
  };
  static async incrementUsers(env: Env): Promise<void> {
    const entity = new SystemStatsEntity(env, "global");
    await entity.mutate(s => ({
      ...s,
      totalParticipants: (s.totalParticipants || 0) + 1
    }));
  }
  static async incrementSubmissions(env: Env): Promise<void> {
    const entity = new SystemStatsEntity(env, "global");
    await entity.mutate(s => ({
      ...s,
      totalBiometricSubmissions: (s.totalBiometricSubmissions || 0) + 1
    }));
  }
  static async incrementHabits(env: Env): Promise<void> {
    const entity = new SystemStatsEntity(env, "global");
    await entity.mutate(s => ({
      ...s,
      totalHabitsLogged: (s.totalHabitsLogged || 0) + 1
    }));
  }
}