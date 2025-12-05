import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ReferralCodeEntity, DailyScoreEntity, WeeklyBiometricEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { RegisterRequest, ScoreSubmitRequest, BiometricSubmitRequest, User } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // REGISTER
  app.post('/api/register', async (c) => {
    const body = await c.req.json() as RegisterRequest;
    // Basic Validation
    if (!body.name || !body.email || !body.phone) return bad(c, 'Missing required fields');
    // Generate IDs
    const userId = crypto.randomUUID();
    // Simple referral code generation: First name + random 3 digits (e.g., JIM123)
    const cleanName = body.name.replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 4);
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newReferralCode = `${cleanName}${randomSuffix}`;
    // Genealogy Logic
    let captainId: string | null = null;
    if (body.isCaptain) {
      captainId = userId; // They are their own captain
    } else if (body.referralCodeUsed) {
      // Lookup referrer
      const refEntity = new ReferralCodeEntity(c.env, body.referralCodeUsed.toUpperCase());
      if (await refEntity.exists()) {
        const { userId: referrerId } = await refEntity.getState();
        const referrer = new UserEntity(c.env, referrerId);
        const referrerState = await referrer.getState();
        captainId = referrerState.captainId; // Inherit captain
      }
      // If invalid code, captainId remains null (Orphan)
    }
    const newUser: User = {
      id: userId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      role: body.role,
      captainId,
      referralCode: newReferralCode,
      timezone: body.timezone || 'UTC',
      points: 0,
      createdAt: Date.now(),
      isActive: true,
      hasScale: true // Defaulting to true for now as per flow
    };
    // Save User
    await UserEntity.create(c.env, newUser);
    // Save Referral Mapping
    const refMapping = new ReferralCodeEntity(c.env, newReferralCode);
    await refMapping.save({ userId });
    return ok(c, newUser);
  });
  // GET ME (Mock auth for now - passing userId in header or query for testing)
  // In real app, this would use JWT/Session from headers
  app.get('/api/me', async (c) => {
    const userId = c.req.header('X-User-ID') || c.req.query('userId');
    if (!userId) return bad(c, 'User ID required (X-User-ID header)');
    const user = new UserEntity(c.env, userId);
    if (!await user.exists()) return notFound(c, 'User not found');
    return ok(c, await user.getState());
  });
  // SUBMIT DAILY SCORE
  app.post('/api/scores', async (c) => {
    const userId = c.req.header('X-User-ID');
    if (!userId) return bad(c, 'User ID required');
    const body = await c.req.json() as ScoreSubmitRequest;
    if (!body.date) return bad(c, 'Date required');
    const scoreId = `${userId}:${body.date}`;
    const scoreEntity = new DailyScoreEntity(c.env, scoreId);
    // Fetch previous score to calculate point diff
    let oldPoints = 0;
    if (await scoreEntity.exists()) {
      const oldState = await scoreEntity.getState();
      oldPoints = oldState.totalPoints;
    }
    // Calculate new points (simple logic: 1 pt per habit)
    let newPoints = 0;
    if (body.habits.water) newPoints++;
    if (body.habits.steps) newPoints++;
    if (body.habits.sleep) newPoints++;
    if (body.habits.lesson) newPoints++;
    const scoreData = {
      id: scoreId,
      userId,
      date: body.date,
      habits: {
        water: !!body.habits.water,
        steps: !!body.habits.steps,
        sleep: !!body.habits.sleep,
        lesson: !!body.habits.lesson
      },
      totalPoints: newPoints,
      updatedAt: Date.now()
    };
    await DailyScoreEntity.create(c.env, scoreData);
    // Update User Total Points
    const pointDiff = newPoints - oldPoints;
    if (pointDiff !== 0) {
      const userEntity = new UserEntity(c.env, userId);
      await userEntity.mutate(u => ({ ...u, points: u.points + pointDiff }));
    }
    return ok(c, scoreData);
  });
  // SUBMIT BIOMETRICS
  app.post('/api/biometrics', async (c) => {
    const userId = c.req.header('X-User-ID');
    if (!userId) return bad(c, 'User ID required');
    const body = await c.req.json() as BiometricSubmitRequest;
    if (!body.weekNumber || !body.screenshotUrl) return bad(c, 'Missing required fields');
    const bioId = `${userId}:week${body.weekNumber}`;
    const bioEntity = new WeeklyBiometricEntity(c.env, bioId);
    if (await bioEntity.exists()) {
      return bad(c, 'Biometrics already submitted for this week');
    }
    const bioData = {
      id: bioId,
      userId,
      weekNumber: body.weekNumber,
      weight: body.weight,
      bodyFat: body.bodyFat,
      visceralFat: body.visceralFat,
      leanMass: body.leanMass,
      metabolicAge: body.metabolicAge,
      screenshotUrl: body.screenshotUrl,
      pointsAwarded: 25,
      submittedAt: Date.now()
    };
    await WeeklyBiometricEntity.create(c.env, bioData);
    // Award Points to User
    const userEntity = new UserEntity(c.env, userId);
    await userEntity.mutate(u => ({ ...u, points: u.points + 25 }));
    return ok(c, bioData);
  });
}