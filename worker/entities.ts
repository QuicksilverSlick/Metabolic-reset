import { IndexedEntity, Entity } from "./core-utils";
import type { User, DailyScore, WeeklyBiometric } from "@shared/types";
// USER ENTITY
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
}
// REFERRAL CODE MAPPING ENTITY
// Key: referralCode, State: { userId: string }
export class ReferralCodeEntity extends Entity<{ userId: string }> {
  static readonly entityName = "ref_code";
  static readonly initialState = { userId: "" };
}
// DAILY SCORE ENTITY
// Key: score:{userId}:{date}
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
// WEEKLY BIOMETRIC ENTITY
// Key: bio:{userId}:{weekNum}
export class WeeklyBiometricEntity extends IndexedEntity<WeeklyBiometric> {
  static readonly entityName = "bio";
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