import { IndexedEntity, Entity, Env, Index } from "./core-utils";
import type { User, DailyScore, WeeklyBiometric, ReferralLedger, SystemStats, QuizLead, ResetProject, ProjectEnrollment, BugReport, OtpRecord, SystemSettings, PointsLedger, PointTransactionType, GenealogyNode, CourseContent, UserProgress, ContentStatus, Notification, NotificationType, ImpersonationSession, BugAIAnalysis, AIAnalysisStatus, BugMessage, BugSatisfaction, BugSatisfactionRating, PushSubscription } from "@shared/types";
// Helper entity for secondary index: ReferralCode -> UserId
export class ReferralCodeMapping extends Entity<{ userId: string }> {
  static readonly entityName = "ref-mapping";
  static readonly initialState = { userId: "" };
}
// Index for tracking all group leaders (facilitators)
// @deprecated - use GroupLeaderIndex; CaptainIndex kept for backward compatibility
export class CaptainIndex extends Index<string> {
  constructor(env: Env) {
    super(env, "all-captains");
  }
}

// Index for tracking all group leaders (facilitators) - preferred
// Note: Points to same underlying data as CaptainIndex for backward compatibility
export class GroupLeaderIndex extends Index<string> {
  constructor(env: Env) {
    // Using same key as CaptainIndex to share data during transition
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
    isAdmin: false,
    isTestMode: false,
    avatarUrl: "",
    cartLink: ""
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
      // If user exists and is NOT deleted, return them
      if (userState.id && !userState.deletedAt) {
        return userState;
      }
      // User is deleted or doesn't exist - fall through to search for active user
    }

    // Fallback: Search all users by phone (for legacy users or when mapping points to deleted user)
    // Find the ACTIVE user with this phone number
    const { items: allUsers } = await UserEntity.list(env);
    let activeUser: User | null = null;

    for (const user of allUsers) {
      if (!user.id || !user.phone) continue;
      const userDigits = user.phone.replace(/\D/g, '').slice(-10);
      if (userDigits === digits) {
        // Skip deleted users - we want the active one
        if (user.deletedAt) continue;
        activeUser = user;
        break;
      }
    }

    if (activeUser) {
      // Update the PhoneMapping to point to the active user
      await mapping.save({ userId: activeUser.id });
      return activeUser;
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

  // Override create to update secondary indexes
  static async create(env: Env, state: DailyScore): Promise<DailyScore> {
    const id = state.id;
    const inst = new DailyScoreEntity(env, id);
    await inst.save(state);

    // Add to primary index
    const idx = new Index<string>(env, DailyScoreEntity.indexName);
    await idx.add(id);

    // Add to user-specific index for fast lookups
    const userScoreIndex = new UserDailyScoresIndex(env, state.userId);
    await userScoreIndex.add(id);

    return state;
  }

  // Get all scores for a user - uses secondary index (O(n) where n = user's scores, not all scores)
  static async findByUser(env: Env, userId: string): Promise<DailyScore[]> {
    const userIndex = new UserDailyScoresIndex(env, userId);
    const scoreIds = await userIndex.list();

    if (scoreIds.length === 0) return [];

    const scores = await Promise.all(
      scoreIds.map(async (id) => {
        const entity = new DailyScoreEntity(env, id);
        return entity.getState();
      })
    );

    return scores.filter(s => s.id).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  // Get scores for a user in a specific project
  static async findByUserAndProject(env: Env, userId: string, projectId: string): Promise<DailyScore[]> {
    const userScores = await DailyScoreEntity.findByUser(env, userId);
    return userScores.filter(s => s.projectId === projectId);
  }
}

// Secondary index for user's daily scores
export class UserDailyScoresIndex extends Index<string> {
  constructor(env: Env, userId: string) {
    super(env, `user-scores:${userId}`);
  }
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
    sex: "female",
    referralCode: null,
    captainId: null,
    quizScore: 0,
    quizAnswers: {},
    resultType: "green",  // New default result type
    metabolicAge: 0,      // Legacy field (deprecated)
    totalScore: 0,        // New: Raw quiz score for display
    convertedToUserId: null,
    capturedAt: 0,
    source: "quiz"
  };
}

// Index for tracking leads by group leader
// @deprecated - use GroupLeaderLeadsIndex; CaptainLeadsIndex kept for backward compatibility
export class CaptainLeadsIndex extends Index<string> {
  constructor(env: Env, captainId: string) {
    super(env, `captain-leads:${captainId}`);
  }
}

// Index for tracking leads by group leader - preferred
// Note: Points to same underlying data as CaptainLeadsIndex for backward compatibility
export class GroupLeaderLeadsIndex extends Index<string> {
  constructor(env: Env, groupLeaderId: string) {
    // Using same key pattern as CaptainLeadsIndex to share data during transition
    super(env, `captain-leads:${groupLeaderId}`);
  }
}

// Reset Project Entity - represents a 28-day metabolic reset project
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
    isGroupLeaderEnrolled: false,
    // Cohort onboarding fields
    cohortId: null,
    onboardingComplete: false,
    hasKit: false,
    kitOrderClicked: false,
    kitOrderClickedAt: null,
    onboardingCompletedAt: null
  };

  // Override create to also update secondary indexes for efficient lookups
  static async create(env: Env, state: ProjectEnrollment): Promise<ProjectEnrollment> {
    // Call parent create
    const id = state.id || `${state.projectId}:${state.userId}`;
    const enrollmentWithId = { ...state, id };
    const inst = new ProjectEnrollmentEntity(env, id);
    await inst.save(enrollmentWithId);

    // Add to primary index
    const idx = new Index<string>(env, ProjectEnrollmentEntity.indexName);
    await idx.add(id);

    // Add to secondary indexes for fast lookups
    const projectIndex = new ProjectEnrollmentIndex(env, state.projectId);
    await projectIndex.add(id);

    const userIndex = new UserEnrollmentIndex(env, state.userId);
    await userIndex.add(id);

    return enrollmentWithId;
  }

  // Get enrollment by project and user
  static async findByProjectAndUser(env: Env, projectId: string, userId: string): Promise<ProjectEnrollment | null> {
    const id = `${projectId}:${userId}`;
    const entity = new ProjectEnrollmentEntity(env, id);
    // Must use exists() because getState() auto-populates the id field even for non-existent entities
    const doesExist = await entity.exists();
    if (!doesExist) return null;
    return entity.getState();
  }

  // Get all enrollments for a user (across all projects) - uses secondary index
  static async findByUser(env: Env, userId: string): Promise<ProjectEnrollment[]> {
    const userIndex = new UserEnrollmentIndex(env, userId);
    const enrollmentIds = await userIndex.list();

    if (enrollmentIds.length === 0) return [];

    const enrollments = await Promise.all(
      enrollmentIds.map(async (id) => {
        const entity = new ProjectEnrollmentEntity(env, id);
        return entity.getState();
      })
    );

    return enrollments.filter(e => e.id);
  }

  // Get all enrollments for a project - uses secondary index
  static async findByProject(env: Env, projectId: string): Promise<ProjectEnrollment[]> {
    const projectIndex = new ProjectEnrollmentIndex(env, projectId);
    const enrollmentIds = await projectIndex.list();

    if (enrollmentIds.length === 0) return [];

    const enrollments = await Promise.all(
      enrollmentIds.map(async (id) => {
        const entity = new ProjectEnrollmentEntity(env, id);
        return entity.getState();
      })
    );

    return enrollments.filter(e => e.id);
  }

  // Get group participants for a group leader in a specific project - optimized
  static async findGroupParticipants(env: Env, projectId: string, groupLeaderId: string): Promise<ProjectEnrollment[]> {
    // Use project index first (smaller subset than full table scan)
    const projectEnrollments = await ProjectEnrollmentEntity.findByProject(env, projectId);
    return projectEnrollments.filter(e => e.groupLeaderId === groupLeaderId);
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

// ============================================
// BUG MESSAGE SYSTEM (Threaded Conversations)
// ============================================

// Bug Message Entity - messages in a bug report thread
export class BugMessageEntity extends IndexedEntity<BugMessage> {
  static readonly entityName = "bug-message";
  static readonly indexName = "bug-messages";
  static readonly initialState: BugMessage = {
    id: "",
    bugId: "",
    userId: "",
    userName: "",
    userAvatarUrl: "",
    isAdmin: false,
    isSystem: false,
    message: "",
    createdAt: 0
  };

  // Get all messages for a bug (oldest first for chat order)
  static async findByBug(env: Env, bugId: string): Promise<BugMessage[]> {
    const index = new BugMessagesIndex(env, bugId);
    const ids = await index.list();

    const messages = await Promise.all(
      ids.map(async (id) => {
        const entity = new BugMessageEntity(env, id);
        return entity.getState();
      })
    );

    return messages
      .filter(m => m.id)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  // Create a new message in a bug thread
  static async createMessage(
    env: Env,
    bugId: string,
    userId: string,
    userName: string,
    userAvatarUrl: string | undefined,
    isAdmin: boolean,
    message: string
  ): Promise<BugMessage> {
    const id = `${bugId}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const bugMessage: BugMessage = {
      id,
      bugId,
      userId,
      userName,
      userAvatarUrl,
      isAdmin,
      isSystem: false,
      message,
      createdAt: Date.now()
    };

    await BugMessageEntity.create(env, bugMessage);

    // Add to bug-specific index
    const index = new BugMessagesIndex(env, bugId);
    await index.add(id);

    return bugMessage;
  }

  // Create a system-generated message (for status changes, confirmations, etc.)
  static async createSystemMessage(
    env: Env,
    bugId: string,
    systemType: 'submitted' | 'status_change' | 'assigned' | 'resolved',
    message: string
  ): Promise<BugMessage> {
    const id = `${bugId}-sys-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const bugMessage: BugMessage = {
      id,
      bugId,
      userId: 'system',
      userName: 'System',
      userAvatarUrl: undefined,
      isAdmin: false,
      isSystem: true,
      systemType,
      message,
      createdAt: Date.now()
    };

    await BugMessageEntity.create(env, bugMessage);

    // Add to bug-specific index
    const index = new BugMessagesIndex(env, bugId);
    await index.add(id);

    return bugMessage;
  }
}

// Index for messages within a specific bug report
export class BugMessagesIndex extends Index<string> {
  constructor(env: Env, bugId: string) {
    super(env, `bug-messages:${bugId}`);
  }
}

// Bug Satisfaction Entity - user feedback after bug resolution
export class BugSatisfactionEntity extends Entity<BugSatisfaction> {
  static readonly entityName = "bug-satisfaction";
  static readonly initialState: BugSatisfaction = {
    id: "",
    bugId: "",
    userId: "",
    rating: "positive",
    feedback: "",
    submittedAt: 0
  };

  // Create satisfaction feedback
  static async create(
    env: Env,
    bugId: string,
    userId: string,
    rating: BugSatisfactionRating,
    feedback?: string
  ): Promise<BugSatisfaction> {
    const entity = new BugSatisfactionEntity(env, bugId);
    const satisfaction: BugSatisfaction = {
      id: bugId,
      bugId,
      userId,
      rating,
      feedback,
      submittedAt: Date.now()
    };
    await entity.setState(satisfaction);
    return satisfaction;
  }

  // Get satisfaction by bug ID
  static async findByBug(env: Env, bugId: string): Promise<BugSatisfaction | null> {
    const entity = new BugSatisfactionEntity(env, bugId);
    const state = await entity.getState();
    return state.id ? state : null;
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

// System Settings Entity - admin-configurable values
export class SystemSettingsEntity extends Entity<SystemSettings> {
  static readonly entityName = "system-settings";
  static readonly initialState: SystemSettings = {
    id: "global",
    groupAVideoUrl: "https://descriptusercontent.com/published/9e3d87f9-a6f6-4088-932e-87d618f6fafa/original.mp4",
    groupBVideoUrl: "https://descriptusercontent.com/published/6117b02a-9c38-4ac2-b79a-b4f0e2708367/original.mp4",
    kitOrderUrl: "https://www.optavia.com/us/en/coach/craveoptimalhealth/sc/30164167-000070009",
    scaleOrderUrl: "", // Amazon link for smart scale - admin configurable
    fallbackPhone: "5039741671", // Fallback phone if coach has no cart link
    // Default point values
    referralPointsCoach: 1,
    referralPointsChallenger: 5,
    dailyHabitPoints: 1,
    biometricSubmissionPoints: 25
  };

  // Get global settings (singleton pattern)
  static async getGlobal(env: Env): Promise<SystemSettings> {
    const entity = new SystemSettingsEntity(env, "global");
    return entity.getState();
  }

  // Update global settings
  static async updateGlobal(env: Env, updates: Partial<Omit<SystemSettings, 'id'>>): Promise<SystemSettings> {
    const entity = new SystemSettingsEntity(env, "global");
    await entity.patch(updates);
    return entity.getState();
  }
}

// Points Ledger Entity - audit log for all point transactions
export class PointsLedgerEntity extends IndexedEntity<PointsLedger> {
  static readonly entityName = "points-ledger";
  static readonly indexName = "points-ledgers";
  static readonly initialState: PointsLedger = {
    id: "",
    projectId: null,
    userId: "",
    transactionType: "daily_habit",
    points: 0,
    previousBalance: 0,
    newBalance: 0,
    relatedUserId: null,
    relatedEntityId: null,
    description: "",
    adminId: null,
    createdAt: 0
  };

  // Create a new point transaction with audit logging
  static async recordTransaction(
    env: Env,
    params: {
      projectId: string | null;
      userId: string;
      transactionType: PointTransactionType;
      points: number;
      relatedUserId?: string | null;
      relatedEntityId?: string | null;
      description: string;
      adminId?: string | null;
    }
  ): Promise<PointsLedger> {
    // Get current user balance
    const userEntity = new UserEntity(env, params.userId);
    const user = await userEntity.getState();
    const previousBalance = user.points || 0;
    const newBalance = previousBalance + params.points;

    const ledgerId = crypto.randomUUID();
    const now = Date.now();

    const transaction: PointsLedger = {
      id: ledgerId,
      projectId: params.projectId,
      userId: params.userId,
      transactionType: params.transactionType,
      points: params.points,
      previousBalance,
      newBalance,
      relatedUserId: params.relatedUserId || null,
      relatedEntityId: params.relatedEntityId || null,
      description: params.description,
      adminId: params.adminId || null,
      createdAt: now
    };

    // Save the transaction
    await PointsLedgerEntity.create(env, transaction);

    // Update user points
    await userEntity.patch({ points: newBalance });

    // Also update project enrollment points if projectId provided
    if (params.projectId) {
      await ProjectEnrollmentEntity.addPoints(env, params.projectId, params.userId, params.points);
    }

    // Index by user for quick lookups
    const userLedgerIndex = new Index(env, `points-ledger:${params.userId}`);
    await userLedgerIndex.add(ledgerId);

    return transaction;
  }

  // Get all transactions for a user
  static async findByUser(env: Env, userId: string): Promise<PointsLedger[]> {
    const userLedgerIndex = new Index(env, `points-ledger:${userId}`);
    const ledgerIds = await userLedgerIndex.list();

    const transactions = await Promise.all(ledgerIds.map(async (id) => {
      const entity = new PointsLedgerEntity(env, id);
      return entity.getState();
    }));

    // Sort by createdAt descending
    return transactions
      .filter(t => t.id)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  // Get recent transactions (for admin view)
  static async getRecent(env: Env, limit: number = 50): Promise<PointsLedger[]> {
    const { items } = await PointsLedgerEntity.list(env);
    return items
      .filter(t => t.id)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }
}

// Referral Tree Index - tracks who referred whom for genealogy
export class ReferralTreeIndex extends Index<string> {
  constructor(env: Env, userId: string) {
    super(env, `referrals:${userId}`);
  }
}

// Helper function to build genealogy tree
export async function buildGenealogyTree(
  env: Env,
  rootUserId: string,
  maxDepth: number = 10
): Promise<GenealogyNode | null> {
  const userEntity = new UserEntity(env, rootUserId);
  const user = await userEntity.getState();
  if (!user.id) return null;

  // Track visited nodes to prevent infinite loops from circular references
  const visitedNodes = new Set<string>();

  async function buildNode(userId: string, depth: number): Promise<GenealogyNode> {
    // CRITICAL: Prevent infinite loops from circular references (self-assignment or cycles)
    if (visitedNodes.has(userId)) {
      console.warn(`[Genealogy] Cycle detected: user ${userId} already visited. Skipping to prevent infinite loop.`);
      // Return a minimal node without children to break the cycle
      const cycleUserEntity = new UserEntity(env, userId);
      const cycleUser = await cycleUserEntity.getState();
      return {
        userId: cycleUser.id || userId,
        name: cycleUser.name || 'Unknown',
        role: cycleUser.role,
        avatarUrl: cycleUser.avatarUrl,
        points: cycleUser.points || 0,
        referralCode: cycleUser.referralCode,
        joinedAt: cycleUser.createdAt,
        children: [], // No children to break cycle
        directReferrals: 0,
        totalDownline: 0,
        teamPoints: 0
      };
    }

    // Mark this node as visited before processing
    visitedNodes.add(userId);

    const nodeUserEntity = new UserEntity(env, userId);
    const nodeUser = await nodeUserEntity.getState();

    // Get direct referrals (recruits)
    const recruitIndex = new Index(env, `recruits:${userId}`);
    const recruitIds = await recruitIndex.list();

    // Build children recursively (with depth limit)
    const children: GenealogyNode[] = [];
    let totalDownline = 0;
    let teamPoints = 0;

    if (depth < maxDepth) {
      for (const recruitId of recruitIds) {
        // Skip self-references (shouldn't happen, but extra safety)
        if (recruitId === userId) {
          console.warn(`[Genealogy] Self-reference detected: user ${userId} references themselves. Skipping.`);
          continue;
        }
        const childNode = await buildNode(recruitId, depth + 1);
        children.push(childNode);
        totalDownline += 1 + childNode.totalDownline;
        teamPoints += childNode.points + childNode.teamPoints;
      }
    }

    return {
      userId: nodeUser.id,
      name: nodeUser.name,
      role: nodeUser.role,
      avatarUrl: nodeUser.avatarUrl,
      points: nodeUser.points,
      referralCode: nodeUser.referralCode,
      joinedAt: nodeUser.createdAt,
      children,
      directReferrals: recruitIds.length,
      totalDownline,
      teamPoints
    };
  }

  return buildNode(rootUserId, 0);
}

// ============================================================================
// LMS / Course Content Entities
// ============================================================================

// Course Content Entity - Admin-managed content items
export class CourseContentEntity extends IndexedEntity<CourseContent> {
  static readonly entityName = "course-content";
  static readonly indexName = "course-contents";
  static readonly initialState: CourseContent = {
    id: "",
    projectId: "",
    dayNumber: 1,
    contentType: "video",
    title: "",
    description: "",
    order: 0,
    videoUrl: "",
    videoDuration: 0,
    thumbnailUrl: "",
    quizData: undefined,
    resourceUrl: "",
    points: 0,
    isRequired: true,
    // Scheduling fields - default to 'published' for backward compatibility
    publishStatus: "published",
    scheduledReleaseDate: undefined,
    publishedAt: undefined,
    scheduledBy: undefined,
    likes: 0,
    likedBy: [],
    createdAt: 0,
    updatedAt: 0
  };

  // Toggle like on content (returns updated content)
  static async toggleLike(env: Env, contentId: string, userId: string): Promise<CourseContent> {
    const entity = new CourseContentEntity(env, contentId);
    const state = await entity.getState();
    if (!state.id) throw new Error('Content not found');

    const likedBy = state.likedBy || [];
    const alreadyLiked = likedBy.includes(userId);

    await entity.mutate(s => ({
      ...s,
      likes: alreadyLiked ? Math.max(0, (s.likes || 0) - 1) : (s.likes || 0) + 1,
      likedBy: alreadyLiked ? likedBy.filter(id => id !== userId) : [...likedBy, userId],
      updatedAt: Date.now()
    }));

    return entity.getState();
  }

  // Get all content for a project, sorted by day and order
  static async findByProject(env: Env, projectId: string): Promise<CourseContent[]> {
    const { items } = await CourseContentEntity.list(env);
    return items
      .filter(c => c.projectId === projectId)
      .sort((a, b) => {
        if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber;
        return a.order - b.order;
      });
  }

  // Get content for a specific day
  static async findByProjectAndDay(env: Env, projectId: string, dayNumber: number): Promise<CourseContent[]> {
    const allContent = await CourseContentEntity.findByProject(env, projectId);
    return allContent.filter(c => c.dayNumber === dayNumber);
  }

  // Get all quizzes for a project
  static async findQuizzes(env: Env, projectId: string): Promise<CourseContent[]> {
    const allContent = await CourseContentEntity.findByProject(env, projectId);
    return allContent.filter(c => c.contentType === 'quiz');
  }

  // Get required content for a day range (for prerequisite checking)
  static async findRequiredContent(env: Env, projectId: string, fromDay: number, toDay: number): Promise<CourseContent[]> {
    const allContent = await CourseContentEntity.findByProject(env, projectId);
    return allContent.filter(c =>
      c.isRequired && c.dayNumber >= fromDay && c.dayNumber <= toDay
    );
  }
}

// Index for tracking content by project
export class ProjectContentIndex extends Index<string> {
  constructor(env: Env, projectId: string) {
    super(env, `project-content:${projectId}`);
  }
}

// User Progress Entity - Per-user tracking of content completion
export class UserProgressEntity extends IndexedEntity<UserProgress> {
  static readonly entityName = "user-progress";
  static readonly indexName = "user-progresses";
  static readonly initialState: UserProgress = {
    id: "", // Format: enrollmentId:contentId
    enrollmentId: "",
    contentId: "",
    userId: "",
    projectId: "",
    status: "locked",
    watchedPercentage: 0,
    lastPosition: 0,
    quizScore: undefined,
    quizAttempts: 0,
    lastQuizAttemptAt: undefined,
    quizAnswers: undefined,
    completedAt: undefined,
    pointsAwarded: 0,
    updatedAt: 0
  };

  // Get progress for a specific content item for a user
  static async findByEnrollmentAndContent(
    env: Env,
    enrollmentId: string,
    contentId: string
  ): Promise<UserProgress | null> {
    const id = `${enrollmentId}:${contentId}`;
    const entity = new UserProgressEntity(env, id);
    const exists = await entity.exists();
    if (!exists) return null;
    return entity.getState();
  }

  // Get all progress for a user in a project
  static async findByEnrollment(env: Env, enrollmentId: string): Promise<UserProgress[]> {
    const { items } = await UserProgressEntity.list(env);
    return items.filter(p => p.enrollmentId === enrollmentId);
  }

  // Get all progress for a specific content item (for analytics)
  static async findByContent(env: Env, contentId: string): Promise<UserProgress[]> {
    const { items } = await UserProgressEntity.list(env);
    return items.filter(p => p.contentId === contentId);
  }

  // Create or get progress record
  static async getOrCreate(
    env: Env,
    enrollmentId: string,
    contentId: string,
    userId: string,
    projectId: string,
    initialStatus: ContentStatus = 'locked'
  ): Promise<UserProgress> {
    const id = `${enrollmentId}:${contentId}`;
    const entity = new UserProgressEntity(env, id);
    const exists = await entity.exists();

    if (exists) {
      return entity.getState();
    }

    // Create new progress record
    const now = Date.now();
    const progress: UserProgress = {
      id,
      enrollmentId,
      contentId,
      userId,
      projectId,
      status: initialStatus,
      watchedPercentage: 0,
      lastPosition: 0,
      quizAttempts: 0,
      pointsAwarded: 0,
      updatedAt: now
    };

    await UserProgressEntity.create(env, progress);
    return progress;
  }

  // Update video progress
  static async updateVideoProgress(
    env: Env,
    progressId: string,
    watchedPercentage: number,
    lastPosition: number
  ): Promise<UserProgress> {
    const entity = new UserProgressEntity(env, progressId);
    const now = Date.now();

    await entity.mutate(state => {
      const newStatus: ContentStatus = watchedPercentage >= 90 ? 'completed' :
                                       state.status === 'locked' ? 'in_progress' : state.status;
      return {
        ...state,
        watchedPercentage: Math.max(state.watchedPercentage, watchedPercentage),
        lastPosition,
        status: newStatus,
        completedAt: newStatus === 'completed' && !state.completedAt ? now : state.completedAt,
        updatedAt: now
      };
    });

    return entity.getState();
  }

  // Mark content as completed
  static async markCompleted(
    env: Env,
    progressId: string,
    pointsAwarded: number = 0
  ): Promise<UserProgress> {
    const entity = new UserProgressEntity(env, progressId);
    const now = Date.now();

    await entity.mutate(state => ({
      ...state,
      status: 'completed' as ContentStatus,
      completedAt: state.completedAt || now,
      pointsAwarded: state.pointsAwarded + pointsAwarded,
      updatedAt: now
    }));

    return entity.getState();
  }

  // Record quiz attempt
  static async recordQuizAttempt(
    env: Env,
    progressId: string,
    score: number,
    answers: Record<string, number>,
    passed: boolean,
    pointsAwarded: number = 0
  ): Promise<UserProgress> {
    const entity = new UserProgressEntity(env, progressId);
    const now = Date.now();

    await entity.mutate(state => ({
      ...state,
      quizScore: score,
      quizAttempts: state.quizAttempts + 1,
      lastQuizAttemptAt: now,
      quizAnswers: answers,
      status: passed ? 'completed' as ContentStatus : state.status,
      completedAt: passed && !state.completedAt ? now : state.completedAt,
      pointsAwarded: state.pointsAwarded + pointsAwarded,
      updatedAt: now
    }));

    return entity.getState();
  }
}

// Index for tracking progress by enrollment
export class EnrollmentProgressIndex extends Index<string> {
  constructor(env: Env, enrollmentId: string) {
    super(env, `enrollment-progress:${enrollmentId}`);
  }
}

// Helper function to calculate current day based on project start date
// All users see the same day based on how many days since the project started,
// regardless of when they enrolled. Late joiners can catch up on past content.
//
// Test Mode: Users with isTestMode=true can preview content like admins before project starts.
// This allows thorough testing without granting full admin privileges.
export function calculateCurrentDay(
  enrolledAt: number,
  projectStartDate: string,
  isAdmin: boolean = false,
  isTestMode: boolean = false
): number {
  const projectStart = new Date(projectStartDate);
  const now = new Date();

  // ADMINS: Always have access to ALL 28 days for content management
  // This allows admins to preview, edit, and manage scheduled content
  if (isAdmin) {
    return 28;
  }

  // TEST MODE: Users testing before project starts see days since enrollment
  // This allows testers to preview content during setup
  if (isTestMode && now < projectStart) {
    const enrollmentDate = new Date(enrolledAt);
    const diffTime = now.getTime() - enrollmentDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.min(28, diffDays));
  }

  // REGULAR USERS: Project hasn't started yet - no content available (day 0)
  // This prevents non-admin users from seeing any content before project starts
  if (now < projectStart) {
    return 0;
  }

  // REGULAR USERS: Calculate days since project started (not since user enrolled)
  // This ensures all users see the same content based on project timeline
  const diffTime = now.getTime() - projectStart.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // Clamp between 1 and 28
  return Math.max(1, Math.min(28, diffDays));
}

// Helper function to check if content is unlocked for user
// Returns true if the content's day number is <= user's current day
// If currentUserDay is 0 (project not started), all content is locked
export function isContentUnlocked(
  contentDayNumber: number,
  currentUserDay: number
): boolean {
  // If currentUserDay is 0, project hasn't started - all content is locked
  if (currentUserDay === 0) {
    return false;
  }
  return contentDayNumber <= currentUserDay;
}

// Content Comment Entity - YouTube-style comments on course content
import type { ContentComment } from "@shared/types";

export class ContentCommentEntity extends IndexedEntity<ContentComment> {
  static readonly entityName = "content-comment";
  static readonly indexName = "content-comments";
  static readonly initialState: ContentComment = {
    id: "",
    contentId: "",
    userId: "",
    userName: "",
    userAvatarUrl: "",
    text: "",
    likes: 0,
    likedBy: [],
    createdAt: 0,
    updatedAt: undefined
  };

  // Get all comments for a content item
  static async findByContent(env: Env, contentId: string): Promise<ContentComment[]> {
    const index = new ContentCommentsIndex(env, contentId);
    const commentIds = await index.list();

    const comments = await Promise.all(commentIds.map(async (id) => {
      const entity = new ContentCommentEntity(env, id);
      return entity.getState();
    }));

    // Sort by createdAt descending (newest first)
    return comments
      .filter(c => c.id)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  // Add a new comment
  static async addComment(
    env: Env,
    contentId: string,
    userId: string,
    userName: string,
    userAvatarUrl: string | undefined,
    text: string
  ): Promise<ContentComment> {
    const commentId = crypto.randomUUID();
    const now = Date.now();

    const comment: ContentComment = {
      id: commentId,
      contentId,
      userId,
      userName,
      userAvatarUrl,
      text,
      likes: 0,
      likedBy: [],
      createdAt: now
    };

    await ContentCommentEntity.create(env, comment);

    // Index by content
    const contentIndex = new ContentCommentsIndex(env, contentId);
    await contentIndex.add(commentId);

    return comment;
  }

  // Toggle like on a comment
  static async toggleLike(env: Env, commentId: string, userId: string): Promise<ContentComment> {
    const entity = new ContentCommentEntity(env, commentId);

    await entity.mutate(state => {
      const likedBy = state.likedBy || [];
      const isLiked = likedBy.includes(userId);

      if (isLiked) {
        // Remove like
        return {
          ...state,
          likes: Math.max(0, state.likes - 1),
          likedBy: likedBy.filter(id => id !== userId),
          updatedAt: Date.now()
        };
      } else {
        // Add like
        return {
          ...state,
          likes: state.likes + 1,
          likedBy: [...likedBy, userId],
          updatedAt: Date.now()
        };
      }
    });

    return entity.getState();
  }
}

// Index for tracking comments by content
export class ContentCommentsIndex extends Index<string> {
  constructor(env: Env, contentId: string) {
    super(env, `content-comments:${contentId}`);
  }
}

// ============================================================================
// Coupon Code Tracking
// ============================================================================

import type { CouponUsage } from "@shared/types";

// Coupon Usage Entity - tracks who used which coupon codes
export class CouponUsageEntity extends IndexedEntity<CouponUsage> {
  static readonly entityName = "coupon-usage";
  static readonly indexName = "coupon-usages";
  static readonly initialState: CouponUsage = {
    id: "",
    couponCode: "",
    userId: "",
    userName: "",
    userPhone: "",
    userEmail: "",
    projectId: null,
    usedAt: 0
  };

  // Get all usages of a specific coupon code
  static async findByCode(env: Env, couponCode: string): Promise<CouponUsage[]> {
    const { items } = await CouponUsageEntity.list(env);
    return items
      .filter(u => u.couponCode === couponCode)
      .sort((a, b) => b.usedAt - a.usedAt);
  }

  // Check if a user has already used a specific coupon
  static async hasUserUsedCoupon(env: Env, userId: string, couponCode: string): Promise<boolean> {
    const { items } = await CouponUsageEntity.list(env);
    return items.some(u => u.userId === userId && u.couponCode === couponCode);
  }

  // Record coupon usage
  static async recordUsage(
    env: Env,
    couponCode: string,
    userId: string,
    userName: string,
    userPhone: string,
    userEmail: string,
    projectId: string | null
  ): Promise<CouponUsage> {
    const id = crypto.randomUUID();
    const usage: CouponUsage = {
      id,
      couponCode,
      userId,
      userName,
      userPhone,
      userEmail,
      projectId,
      usedAt: Date.now()
    };
    await CouponUsageEntity.create(env, usage);
    return usage;
  }
}

// Index for tracking coupon usage by code
export class CouponCodeUsageIndex extends Index<string> {
  constructor(env: Env, couponCode: string) {
    super(env, `coupon-usage:${couponCode}`);
  }
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================

// Notification Entity - in-app notifications for users
export class NotificationEntity extends IndexedEntity<Notification> {
  static readonly entityName = "notification";
  static readonly indexName = "notifications";
  static readonly initialState: Notification = {
    id: "",
    userId: "",
    type: "general",
    title: "",
    message: "",
    read: false,
    createdAt: 0
  };

  // Create a notification for a user
  static async createNotification(
    env: Env,
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, unknown>
  ): Promise<Notification> {
    const id = `${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const notification: Notification = {
      id,
      userId,
      type,
      title,
      message,
      data,
      read: false,
      createdAt: Date.now()
    };
    await NotificationEntity.create(env, notification);

    // Also add to user-specific index for quick lookup
    const userNotifIndex = new UserNotificationsIndex(env, userId);
    await userNotifIndex.add(id);

    return notification;
  }

  // Get all notifications for a user (most recent first)
  static async findByUser(env: Env, userId: string, limit = 50): Promise<Notification[]> {
    const userNotifIndex = new UserNotificationsIndex(env, userId);
    const ids = await userNotifIndex.list();

    const notifications = await Promise.all(
      ids.slice(0, limit).map(async (id) => {
        const entity = new NotificationEntity(env, id);
        return entity.getState();
      })
    );

    // Filter out empty and sort by createdAt descending
    return notifications
      .filter(n => n.id)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  // Get unread count for a user
  static async getUnreadCount(env: Env, userId: string): Promise<number> {
    const notifications = await NotificationEntity.findByUser(env, userId);
    return notifications.filter(n => !n.read).length;
  }

  // Mark notification as read
  static async markAsRead(env: Env, notificationId: string): Promise<void> {
    const entity = new NotificationEntity(env, notificationId);
    await entity.patch({ read: true, readAt: Date.now() });
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(env: Env, userId: string): Promise<number> {
    const notifications = await NotificationEntity.findByUser(env, userId);
    const unread = notifications.filter(n => !n.read);

    await Promise.all(
      unread.map(n => NotificationEntity.markAsRead(env, n.id))
    );

    return unread.length;
  }
}

// Index for user's notifications
export class UserNotificationsIndex extends Index<string> {
  constructor(env: Env, userId: string) {
    super(env, `user-notifications:${userId}`);
  }
}

// ============================================
// IMPERSONATION AUDIT LOGGING
// ============================================

// Impersonation Session Entity - tracks admin impersonation for audit
// Sessions auto-expire after 60 minutes for security
const IMPERSONATION_SESSION_DURATION_MS = 60 * 60 * 1000; // 60 minutes

export class ImpersonationSessionEntity extends IndexedEntity<ImpersonationSession> {
  static readonly entityName = "impersonation-session";
  static readonly indexName = "impersonation-sessions";
  static readonly initialState: ImpersonationSession = {
    id: "",
    adminUserId: "",
    adminUserName: "",
    targetUserId: "",
    targetUserName: "",
    startedAt: 0,
    expiresAt: 0
  };

  // Start an impersonation session (auto-expires after 60 minutes)
  static async startSession(
    env: Env,
    adminUserId: string,
    adminUserName: string,
    targetUserId: string,
    targetUserName: string,
    reason?: string
  ): Promise<ImpersonationSession> {
    const id = `imp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const now = Date.now();
    const session: ImpersonationSession = {
      id,
      adminUserId,
      adminUserName,
      targetUserId,
      targetUserName,
      startedAt: now,
      expiresAt: now + IMPERSONATION_SESSION_DURATION_MS,
      reason
    };
    await ImpersonationSessionEntity.create(env, session);
    return session;
  }

  // Check if a session is expired
  static isExpired(session: ImpersonationSession): boolean {
    return Date.now() > session.expiresAt;
  }

  // End an impersonation session
  static async endSession(env: Env, sessionId: string): Promise<void> {
    const entity = new ImpersonationSessionEntity(env, sessionId);
    await entity.patch({ endedAt: Date.now() });
  }

  // Get recent impersonation sessions (for admin audit view)
  static async getRecent(env: Env, limit = 100): Promise<ImpersonationSession[]> {
    const { items } = await ImpersonationSessionEntity.list(env);
    return items
      .filter(s => s.id)
      .sort((a, b) => b.startedAt - a.startedAt)
      .slice(0, limit);
  }

  // Get sessions for a specific target user
  static async findByTargetUser(env: Env, targetUserId: string): Promise<ImpersonationSession[]> {
    const { items } = await ImpersonationSessionEntity.list(env);
    return items
      .filter(s => s.id && s.targetUserId === targetUserId)
      .sort((a, b) => b.startedAt - a.startedAt);
  }
}

// ============================================
// AI BUG ANALYSIS (Cloudflare AI Gateway + Gemini)
// ============================================

export class BugAIAnalysisEntity extends IndexedEntity<BugAIAnalysis> {
  static readonly entityName = "bug-ai-analysis";
  static readonly indexName = "bug-ai-analyses";
  static readonly initialState: BugAIAnalysis = {
    id: "",
    bugId: "",
    status: "pending",
    analyzedAt: 0,
    summary: "",
    suggestedCause: "",
    suggestedSolutions: [],
    modelUsed: "",
    confidence: "low",
    processingTimeMs: 0
  };

  // Get analysis for a specific bug
  static async findByBugId(env: Env, bugId: string): Promise<BugAIAnalysis | null> {
    const { items } = await BugAIAnalysisEntity.list(env);
    const analysis = items.find(a => a.bugId === bugId && a.id);
    return analysis || null;
  }

  // Get the most recent analysis for a bug
  static async getLatestForBug(env: Env, bugId: string): Promise<BugAIAnalysis | null> {
    const { items } = await BugAIAnalysisEntity.list(env);
    const analyses = items
      .filter(a => a.bugId === bugId && a.id)
      .sort((a, b) => b.analyzedAt - a.analyzedAt);
    return analyses[0] || null;
  }

  // Create a pending analysis (before processing starts)
  static async createPending(env: Env, bugId: string): Promise<BugAIAnalysis> {
    const id = `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const analysis: BugAIAnalysis = {
      ...BugAIAnalysisEntity.initialState,
      id,
      bugId,
      status: "pending",
      analyzedAt: Date.now()
    };
    await BugAIAnalysisEntity.create(env, analysis);
    return analysis;
  }

  // Update analysis status to processing
  static async markProcessing(env: Env, analysisId: string): Promise<void> {
    const entity = new BugAIAnalysisEntity(env, analysisId);
    await entity.patch({ status: "processing" as AIAnalysisStatus });
  }

  // Complete an analysis with results
  static async complete(
    env: Env,
    analysisId: string,
    result: Omit<BugAIAnalysis, "id" | "bugId" | "status">
  ): Promise<void> {
    const entity = new BugAIAnalysisEntity(env, analysisId);
    await entity.patch({
      ...result,
      status: "completed" as AIAnalysisStatus,
      analyzedAt: Date.now()
    });
  }

  // Mark analysis as failed
  static async markFailed(env: Env, analysisId: string, error: string): Promise<void> {
    const entity = new BugAIAnalysisEntity(env, analysisId);
    await entity.patch({
      status: "failed" as AIAnalysisStatus,
      error,
      analyzedAt: Date.now()
    });
  }

  // Get recent analyses (for debugging/monitoring)
  static async getRecent(env: Env, limit = 50): Promise<BugAIAnalysis[]> {
    const { items } = await BugAIAnalysisEntity.list(env);
    return items
      .filter(a => a.id)
      .sort((a, b) => b.analyzedAt - a.analyzedAt)
      .slice(0, limit);
  }
}

// ============================================
// WEB PUSH SUBSCRIPTION SYSTEM
// ============================================

// Push Subscription Entity - stores push subscriptions per user/device
export class PushSubscriptionEntity extends IndexedEntity<PushSubscription> {
  static readonly entityName = "push-subscription";
  static readonly indexName = "push-subscriptions";
  static readonly initialState: PushSubscription = {
    id: "",
    userId: "",
    endpoint: "",
    keys: { p256dh: "", auth: "" },
    createdAt: 0,
    lastUsedAt: 0,
    failCount: 0
  };

  // Find all subscriptions for a user
  static async findByUser(env: Env, userId: string): Promise<PushSubscription[]> {
    const { items } = await PushSubscriptionEntity.list(env);
    return items.filter(s => s.userId === userId && s.id);
  }

  // Find subscription by endpoint (to prevent duplicates)
  static async findByEndpoint(env: Env, endpoint: string): Promise<PushSubscription | null> {
    const { items } = await PushSubscriptionEntity.list(env);
    return items.find(s => s.endpoint === endpoint && s.id) || null;
  }

  // Create or update a subscription
  static async upsert(
    env: Env,
    userId: string,
    endpoint: string,
    keys: { p256dh: string; auth: string },
    userAgent?: string
  ): Promise<PushSubscription> {
    // Check if subscription exists
    const existing = await PushSubscriptionEntity.findByEndpoint(env, endpoint);

    if (existing) {
      // Update existing subscription
      const entity = new PushSubscriptionEntity(env, existing.id);
      await entity.patch({
        userId, // Might have changed if user re-logged in
        keys,
        userAgent,
        lastUsedAt: Date.now(),
        failCount: 0 // Reset fail count on resubscribe
      });
      return { ...existing, userId, keys, userAgent, lastUsedAt: Date.now(), failCount: 0 };
    }

    // Create new subscription
    const id = `push-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const subscription: PushSubscription = {
      id,
      userId,
      endpoint,
      keys,
      userAgent,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
      failCount: 0
    };
    await PushSubscriptionEntity.create(env, subscription);
    return subscription;
  }

  // Delete a subscription by endpoint
  static async deleteByEndpoint(env: Env, endpoint: string): Promise<boolean> {
    const subscription = await PushSubscriptionEntity.findByEndpoint(env, endpoint);
    if (subscription) {
      const entity = new PushSubscriptionEntity(env, subscription.id);
      // Clear the subscription data (effectively delete)
      await entity.patch({
        id: "",
        userId: "",
        endpoint: "",
        keys: { p256dh: "", auth: "" }
      });
      return true;
    }
    return false;
  }

  // Increment fail count and remove if too many failures
  static async recordFailure(env: Env, endpoint: string): Promise<boolean> {
    const subscription = await PushSubscriptionEntity.findByEndpoint(env, endpoint);
    if (!subscription) return false;

    const newFailCount = subscription.failCount + 1;

    // Remove subscription after 5 consecutive failures
    if (newFailCount >= 5) {
      await PushSubscriptionEntity.deleteByEndpoint(env, endpoint);
      return false; // Subscription removed
    }

    const entity = new PushSubscriptionEntity(env, subscription.id);
    await entity.patch({ failCount: newFailCount });
    return true;
  }

  // Record successful push
  static async recordSuccess(env: Env, endpoint: string): Promise<void> {
    const subscription = await PushSubscriptionEntity.findByEndpoint(env, endpoint);
    if (subscription) {
      const entity = new PushSubscriptionEntity(env, subscription.id);
      await entity.patch({ lastUsedAt: Date.now(), failCount: 0 });
    }
  }
}

// Index for user's push subscriptions
export class UserPushSubscriptionsIndex extends Index<string> {
  constructor(env: Env, userId: string) {
    super(env, `user-push-subs:${userId}`);
  }
}

