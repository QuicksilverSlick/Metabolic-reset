import { IndexedEntity, Entity, Env } from "./core-utils";
import type { User, DailyScore, WeeklyBiometric, ReferralLedger } from "@shared/types";
// Helper entity for secondary index: ReferralCode -> UserId
export class ReferralCodeMapping extends Entity<{ userId: string }> {
  static readonly entityName = "ref-mapping";
  static readonly initialState = { userId: "" };
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
  // Override create to handle referral code index
  static async create(env: Env, state: User): Promise<User> {
    // 1. Check referral code uniqueness and lock it if provided
    if (state.referralCode) {
      const normalizedCode = state.referralCode.toUpperCase().trim();
      const mapping = new ReferralCodeMapping(env, normalizedCode);
      if (await mapping.exists()) {
        throw new Error("Referral code already taken");
      }
      // Save the mapping first to reserve the code
      await mapping.save({ userId: state.id });
    }
    // 2. Create the user normally
    try {
      const user = await super.create(env, state);
      return user;
    } catch (error) {
      // If user creation fails, we technically leave a dangling referral code mapping.
      // However, findByReferralCode handles this by checking if the user exists.
      // In a more robust system, we might attempt to delete the mapping here.
      throw error;
    }
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