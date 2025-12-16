import { IndexedEntity, Entity, Env, Index } from "./core-utils";
import type { User, DailyScore, WeeklyBiometric, ReferralLedger, SystemStats, QuizLead, ResetProject, ProjectEnrollment, BugReport, OtpRecord } from "@shared/types";
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

// Index for tracking all admins
export class AdminIndex extends Index<string> {
  constructor(env: Env) {
    super(env, "all-admins");
  }
}

// Helper entity for email -> userId lookup
export class EmailMapping extends Entity<{ userId: string }> {
  static readonly entityName = "email-mapping";
  static readonly initialState = { userId: "" };
}

// Phone -> UserId mapping for phone-based login
export class PhoneMapping extends Entity<{ userId: string }> {
  static readonly entityName = "phone-mapping";
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
    currentProjectId: null,
    createdAt: 0,
    isActive: true,
    hasScale: false,
    isAdmin: false
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

  static async findByEmail(env: Env, email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail) return null;
    const mapping = new EmailMapping(env, normalizedEmail);
    const state = await mapping.getState();
    if (!state.userId) return null;
    const userEntity = new UserEntity(env, state.userId);
    const userState = await userEntity.getState();
    if (!userState.id) return null;
    return userState;
  }

  static async findByPhone(env: Env, phone: string): Promise<User | null> {
    // Normalize phone to E.164 format (just digits, last 10)
    const digits = phone.replace(/\D/g, '').slice(-10);
    if (digits.length !== 10) return null;

    const normalizedPhone = `+1${digits}`;

    // First, try the fast path via PhoneMapping
    const mapping = new PhoneMapping(env, normalizedPhone);
    const state = await mapping.getState();
    if (state.userId) {
      const userEntity = new UserEntity(env, state.userId);
      const userState = await userEntity.getState();
      if (userState.id) return userState;
    }

    // Fallback: Search all users by phone (for users registered before OTP system)
    // This handles legacy users who don't have a PhoneMapping record
    const { items: allUsers } = await UserEntity.list(env);
    for (const user of allUsers) {
      if (!user.id || !user.phone) continue;
      const userDigits = user.phone.replace(/\D/g, '').slice(-10);
      if (userDigits === digits) {
        // Found a match - create the PhoneMapping for future lookups
        await mapping.save({ userId: user.id });
        return user;
      }
    }

    return null;
  }
}
export class DailyScoreEntity extends IndexedEntity<DailyScore> {
  static readonly entityName = "score";
  static readonly indexName = "scores";
  static readonly initialState: DailyScore = {
    id: "",
    projectId: "",
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
    projectId: "",
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
    projectId: "",
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

// Quiz Lead Entity - stores leads captured from quiz funnel
export class QuizLeadEntity extends IndexedEntity<QuizLead> {
  static readonly entityName = "quiz-lead";
  static readonly indexName = "quiz-leads";
  static readonly initialState: QuizLead = {
    id: "",
    projectId: null,
    name: "",
    phone: "",
    age: 0,
    referralCode: null,
    captainId: null,
    quizScore: 0,
    metabolicAge: 0,
    convertedToUserId: null,
    capturedAt: 0,
    source: "quiz"
  };
}

// Index for tracking leads by captain
export class CaptainLeadsIndex extends Index<string> {
  constructor(env: Env, captainId: string) {
    super(env, `captain-leads:${captainId}`);
  }
}

// Reset Project Entity - represents a 28-day challenge
export class ResetProjectEntity extends IndexedEntity<ResetProject> {
  static readonly entityName = "project";
  static readonly indexName = "projects";
  static readonly initialState: ResetProject = {
    id: "",
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "draft",
    registrationOpen: false,
    createdAt: 0,
    updatedAt: 0
  };

  // Calculate end date (28 days after start)
  static calculateEndDate(startDate: string): string {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 28);
    return end.toISOString().split('T')[0];
  }

  // Get current week number based on project start date
  static getCurrentWeek(startDate: string): number {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 0; // Before project starts
    const week = Math.floor(diffDays / 7) + 1;
    return Math.min(week, 4); // Cap at week 4
  }

  // Find active project (status = 'active')
  static async findActive(env: Env): Promise<ResetProject | null> {
    const { items: allProjects } = await ResetProjectEntity.list(env);
    return allProjects.find(p => p.status === 'active') || null;
  }

  // Find upcoming projects (status = 'upcoming')
  static async findUpcoming(env: Env): Promise<ResetProject[]> {
    const { items: allProjects } = await ResetProjectEntity.list(env);
    return allProjects.filter(p => p.status === 'upcoming');
  }

  // Find projects accepting registration
  static async findOpenForRegistration(env: Env): Promise<ResetProject[]> {
    const { items: allProjects } = await ResetProjectEntity.list(env);
    return allProjects.filter(p => p.registrationOpen && (p.status === 'active' || p.status === 'upcoming'));
  }
}

// Index for tracking all projects
export class ProjectIndex extends Index<string> {
  constructor(env: Env) {
    super(env, "all-projects");
  }
}

// Project Enrollment Entity - tracks user participation in projects
export class ProjectEnrollmentEntity extends IndexedEntity<ProjectEnrollment> {
  static readonly entityName = "enrollment";
  static readonly indexName = "enrollments";
  static readonly initialState: ProjectEnrollment = {
    id: "", // Format: projectId:userId
    projectId: "",
    userId: "",
    role: "challenger",
    groupLeaderId: null,
    points: 0,
    enrolledAt: 0,
    isGroupLeaderEnrolled: false
  };

  // Get enrollment by project and user
  static async findByProjectAndUser(env: Env, projectId: string, userId: string): Promise<ProjectEnrollment | null> {
    const id = `${projectId}:${userId}`;
    const entity = new ProjectEnrollmentEntity(env, id);
    // Must use exists() because getState() auto-populates the id field even for non-existent entities
    const doesExist = await entity.exists();
    if (!doesExist) return null;
    return entity.getState();
  }

  // Get all enrollments for a user (across all projects)
  static async findByUser(env: Env, userId: string): Promise<ProjectEnrollment[]> {
    const { items: allEnrollments } = await ProjectEnrollmentEntity.list(env);
    return allEnrollments.filter(e => e.userId === userId);
  }

  // Get all enrollments for a project
  static async findByProject(env: Env, projectId: string): Promise<ProjectEnrollment[]> {
    const { items: allEnrollments } = await ProjectEnrollmentEntity.list(env);
    return allEnrollments.filter(e => e.projectId === projectId);
  }

  // Get group participants for a group leader in a specific project
  static async findGroupParticipants(env: Env, projectId: string, groupLeaderId: string): Promise<ProjectEnrollment[]> {
    const { items: allEnrollments } = await ProjectEnrollmentEntity.list(env);
    return allEnrollments.filter(e => e.projectId === projectId && e.groupLeaderId === groupLeaderId);
  }

  // Add points to enrollment
  static async addPoints(env: Env, projectId: string, userId: string, points: number): Promise<void> {
    const id = `${projectId}:${userId}`;
    const entity = new ProjectEnrollmentEntity(env, id);
    await entity.mutate(state => ({
      ...state,
      points: (state.points || 0) + points
    }));
  }
}

// Index for tracking enrollments by project
export class ProjectEnrollmentIndex extends Index<string> {
  constructor(env: Env, projectId: string) {
    super(env, `project-enrollments:${projectId}`);
  }
}

// Index for tracking enrollments by user
export class UserEnrollmentIndex extends Index<string> {
  constructor(env: Env, userId: string) {
    super(env, `user-enrollments:${userId}`);
  }
}

// Bug Report Entity - stores user-submitted bug reports
export class BugReportEntity extends IndexedEntity<BugReport> {
  static readonly entityName = "bug-report";
  static readonly indexName = "bug-reports";
  static readonly initialState: BugReport = {
    id: "",
    userId: "",
    userName: "",
    userEmail: "",
    title: "",
    description: "",
    severity: "medium",
    category: "other",
    status: "open",
    screenshotUrl: "",
    videoUrl: "",
    pageUrl: "",
    userAgent: "",
    createdAt: 0,
    updatedAt: 0,
    adminNotes: ""
  };

  // Get all bug reports sorted by creation date (newest first)
  static async getAllSorted(env: Env): Promise<BugReport[]> {
    const { items } = await BugReportEntity.list(env);
    return items.sort((a, b) => b.createdAt - a.createdAt);
  }

  // Get bug reports by status
  static async findByStatus(env: Env, status: BugReport['status']): Promise<BugReport[]> {
    const { items } = await BugReportEntity.list(env);
    return items.filter(b => b.status === status).sort((a, b) => b.createdAt - a.createdAt);
  }

  // Get bug reports by user
  static async findByUser(env: Env, userId: string): Promise<BugReport[]> {
    const { items } = await BugReportEntity.list(env);
    return items.filter(b => b.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
  }
}

// Index for tracking all bug reports
export class BugReportIndex extends Index<string> {
  constructor(env: Env) {
    super(env, "all-bug-reports");
  }
}

// OTP Entity - stores one-time passwords for phone verification
// ID is the phone number in E.164 format (e.g., +18065551234)
export class OtpEntity extends Entity<OtpRecord> {
  static readonly entityName = "otp";
  static readonly initialState: OtpRecord = {
    id: "",
    code: "",
    createdAt: 0,
    expiresAt: 0,
    attempts: 0,
    verified: false
  };

  // Check if OTP is expired
  isExpired(): boolean {
    return Date.now() > this.state.expiresAt;
  }

  // Check if too many attempts (max 5)
  hasTooManyAttempts(): boolean {
    return this.state.attempts >= 5;
  }

  // Increment attempt count
  async incrementAttempts(): Promise<void> {
    await this.mutate(state => ({
      ...state,
      attempts: state.attempts + 1
    }));
  }

  // Mark as verified
  async markVerified(): Promise<void> {
    await this.patch({ verified: true });
  }
}

