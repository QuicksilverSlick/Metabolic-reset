import { Hono } from "hono";
import type { Env } from './core-utils';
import { ok, bad, notFound, Index } from './core-utils';
import {
  UserEntity,
  ReferralLedgerEntity,
  ReferralCodeMapping,
  CaptainIndex,
  DailyScoreEntity,
  WeeklyBiometricEntity,
  SystemStatsEntity
} from './entities';
import type { User } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/health', (c) => {
    return ok(c, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: 'v2.1.0-core-api'
    });
  });
  // --- Payment Intent ---
  app.post('/api/create-payment-intent', async (c) => {
    // Cast env to any to access STRIPE_SECRET_KEY which is injected at runtime but not in the core Env type
    const rawStripeKey = (c.env as any).STRIPE_SECRET_KEY;
    try {
      const body = await c.req.json() as { amount: number };
      // Ensure amount is an integer (cents)
      const amount = Math.floor(Number(body.amount) || 0);
      // ZERO AMOUNT CHECK: Bypass Stripe for free/test transactions
      if (amount === 0) {
        console.log('Zero amount detected, bypassing Stripe');
        return ok(c, { clientSecret: "mock_secret_zero_amount", mock: true });
      }
      if (!rawStripeKey) {
        console.log('No Stripe key found, using mock mode');
        return ok(c, { mock: true });
      }
      // Robustly handle key: trim whitespace which is a common copy-paste error
      const stripeKey = rawStripeKey.trim();
      // Detect Test Mode: Check for '_test_' to support both sk_test_... and rk_test_... (Restricted Keys)
      const isTestMode = stripeKey.includes('_test_');
      console.log(`Stripe Mode: ${isTestMode ? 'TEST' : 'LIVE'} (Key prefix: ${stripeKey.substring(0, 8)}...)`);
      const params = new URLSearchParams();
      params.append('amount', amount.toString());
      params.append('currency', 'usd');
      if (isTestMode) {
        // In test mode, force card type to allow test cards (e.g., 4242 4242 4242 4242) to work reliably
        // without requiring complex dashboard configuration for automatic payment methods.
        params.append('payment_method_types[]', 'card');
      } else {
        // Enable automatic payment methods for better compatibility (cards, wallets, etc.) in production
        params.append('automatic_payment_methods[enabled]', 'true');
      }
      const response = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });
      const data: any = await response.json();
      if (!response.ok) {
        console.error('Stripe API Error:', JSON.stringify(data));
        return c.json({ error: data.error?.message || 'Stripe error' }, 400);
      }
      return ok(c, { clientSecret: data.client_secret });
    } catch (e: any) {
      console.error('Payment Intent Exception:', e);
      return c.json({ error: e.message }, 500);
    }
  });
  // --- Registration ---
  app.post('/api/register', async (c) => {
    try {
      const body = await c.req.json() as any;
      const { name, email, phone, referralCodeUsed, role, hasScale } = body;
      if (!name || !email || !phone) {
        return c.json({ error: 'Missing required fields' }, 400);
      }
      let recruiterId = null;
      let captainId = null;
      let referrerRole = null;
      if (referralCodeUsed) {
        const referrer = await UserEntity.findByReferralCode(c.env, referralCodeUsed);
        if (referrer) {
          recruiterId = referrer.id;
          captainId = referrer.captainId;
          referrerRole = referrer.role as string;
        }
      }
      const userId = crypto.randomUUID();
      const codeBase = name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'USR';
      const newReferralCode = `${codeBase}${Math.floor(1000 + Math.random() * 9000)}`;
      const now = Date.now();
      // Handle Referral Code Mapping
      if (newReferralCode) {
        const normalizedCode = newReferralCode.toUpperCase().trim();
        const mapping = new ReferralCodeMapping(c.env, normalizedCode);
        if (await mapping.exists()) {
             throw new Error("Referral code collision. Please try again.");
        }
        await mapping.save({ userId: userId });
      }
      // If user is a coach, they are their own captain
      if (role === 'coach') {
        captainId = userId;
      }
      await UserEntity.create(c.env, {
        id: userId,
        phone,
        name,
        email,
        role: role || 'challenger',
        captainId: captainId,
        referralCode: newReferralCode,
        timezone: 'America/New_York',
        hasScale: !!hasScale,
        points: 0,
        createdAt: now,
        isActive: true
      });
      // If user is a coach, add to CaptainIndex
      if (role === 'coach') {
        const captainIndex = new CaptainIndex(c.env);
        await captainIndex.add(userId);
      }
      // Handle Recruitment Logic
      if (recruiterId && referrerRole) {
        const points = referrerRole === 'challenger' ? 10 : 1;
        // Add to Ledger
        await ReferralLedgerEntity.create(c.env, {
          id: crypto.randomUUID(),
          recruiterId: recruiterId,
          newRecruitId: userId,
          pointsAmount: points,
          createdAt: now
        });
        // Award points to recruiter
        await UserEntity.addPoints(c.env, recruiterId, points);
        // Index the recruit for the recruiter (for Roster view)
        const recruitIndex = new Index(c.env, `recruits:${recruiterId}`);
        await recruitIndex.add(userId);
      }
      // Update System Stats
      await SystemStatsEntity.incrementUsers(c.env);
      // Trigger GHL Webhook (Fire and Forget)
      const ghlWebhookUrl = (c.env as any).GHL_WEBHOOK_URL;
      if (ghlWebhookUrl) {
        c.executionCtx.waitUntil(
          fetch(ghlWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              email,
              phone,
              role,
              referralCode: newReferralCode,
              recruiterId,
              hasScale: !!hasScale,
              source: 'app-registration'
            })
          }).catch(err => console.error('GHL Webhook Failed', err))
        );
      }
      return ok(c, {
        id: userId,
        name,
        email,
        phone,
        referralCode: newReferralCode,
        captainId,
        recruiterId
      });
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });
  // --- User Profile ---
  app.get('/api/me', async (c) => {
    try {
      const userId = c.req.header('X-User-ID');
      if (!userId) return bad(c, 'Unauthorized');
      const userEntity = new UserEntity(c.env, userId);
      const user = await userEntity.getState();
      if (!user.id) return notFound(c, 'User not found');
      return ok(c, user);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });
  // --- Daily Scores ---
  app.get('/api/scores', async (c) => {
    try {
      const userId = c.req.header('X-User-ID');
      const date = c.req.query('date');
      if (!userId) return bad(c, 'Unauthorized');
      if (!date) return bad(c, 'Date required');
      const scoreId = `${userId}:${date}`;
      const scoreEntity = new DailyScoreEntity(c.env, scoreId);
      const score = await scoreEntity.getState();
      // If score doesn't exist yet (id is empty string from initialState), return null or default
      if (!score.id) {
        return ok(c, null);
      }
      return ok(c, score);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });
  app.post('/api/scores', async (c) => {
    try {
      const userId = c.req.header('X-User-ID');
      if (!userId) return bad(c, 'Unauthorized');
      const body = await c.req.json() as any;
      const { date, habits } = body;
      if (!date || !habits) return bad(c, 'Missing date or habits');
      const scoreId = `${userId}:${date}`;
      const scoreEntity = new DailyScoreEntity(c.env, scoreId);
      // Get current state to calculate point difference
      const currentScore = await scoreEntity.getState();
      const oldPoints = currentScore.id ? currentScore.totalPoints : 0;
      // Calculate new points
      let newPoints = 0;
      if (habits.water) newPoints += 1;
      if (habits.steps) newPoints += 1;
      if (habits.sleep) newPoints += 1;
      if (habits.lesson) newPoints += 1;
      const pointDelta = newPoints - oldPoints;
      // Update Score Entity
      await scoreEntity.save({
        id: scoreId,
        userId,
        date,
        habits: {
          water: !!habits.water,
          steps: !!habits.steps,
          sleep: !!habits.sleep,
          lesson: !!habits.lesson
        },
        totalPoints: newPoints,
        updatedAt: Date.now()
      });
      // Update User Points if there is a change
      if (pointDelta !== 0) {
        await UserEntity.addPoints(c.env, userId, pointDelta);
      }
      // Update System Stats
      await SystemStatsEntity.incrementHabits(c.env);
      return ok(c, await scoreEntity.getState());
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });
  // --- Biometrics ---
  app.post('/api/biometrics', async (c) => {
    try {
      const userId = c.req.header('X-User-ID');
      if (!userId) return bad(c, 'Unauthorized');
      const body = await c.req.json() as any;
      const { weekNumber, weight, bodyFat, visceralFat, leanMass, metabolicAge, screenshotUrl } = body;
      if (!weekNumber || !screenshotUrl) return bad(c, 'Missing required fields');
      const biometricId = `${userId}:week${weekNumber}`;
      const bioEntity = new WeeklyBiometricEntity(c.env, biometricId);
      const existing = await bioEntity.getState();
      const isNewSubmission = !existing.id;
      // Save Biometric Data
      await bioEntity.save({
        id: biometricId,
        userId,
        weekNumber,
        weight: Number(weight),
        bodyFat: Number(bodyFat),
        visceralFat: Number(visceralFat),
        leanMass: Number(leanMass),
        metabolicAge: Number(metabolicAge),
        screenshotUrl,
        pointsAwarded: 25,
        submittedAt: Date.now()
      });
      // Only award points if this is the first submission for this week
      if (isNewSubmission) {
        await UserEntity.addPoints(c.env, userId, 25);
        // Update System Stats
        await SystemStatsEntity.incrementSubmissions(c.env);
      }
      return ok(c, await bioEntity.getState());
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });
  // --- Roster Management ---
  app.get('/api/roster', async (c) => {
    try {
      const userId = c.req.header('X-User-ID');
      if (!userId) return bad(c, 'Unauthorized');
      // Use the recruits index to find all users recruited by this user
      const recruitIndex = new Index(c.env, `recruits:${userId}`);
      const recruitIds = await recruitIndex.list();
      if (recruitIds.length === 0) {
        return ok(c, []);
      }
      // Fetch details for each recruit
      // In a production app with large rosters, we would want to batch this or paginate
      const recruits = await Promise.all(recruitIds.map(async (id) => {
        const userEntity = new UserEntity(c.env, id);
        const user = await userEntity.getState();
        // Return safe subset of user data
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          points: user.points,
          isActive: user.isActive,
          createdAt: user.createdAt
        };
      }));
      return ok(c, recruits);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });
  // --- Captains List (Public) ---
  app.get('/api/captains', async (c) => {
    try {
      const captainIndex = new CaptainIndex(c.env);
      const captainIds = await captainIndex.list();
      // Limit to 50 for performance
      const limitedIds = captainIds.slice(0, 50);
      const captains = await Promise.all(limitedIds.map(async (id) => {
        const user = await new UserEntity(c.env, id).getState();
        return {
          id: user.id,
          name: user.name,
          role: user.role,
          referralCode: user.referralCode
        };
      }));
      // Filter out any invalid entries
      const validCaptains = captains.filter(c => c.id && c.role === 'coach');
      return ok(c, validCaptains);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });
  // --- Orphan Assignment ---
  app.post('/api/orphan/assign', async (c) => {
    try {
      const userId = c.req.header('X-User-ID');
      if (!userId) return bad(c, 'Unauthorized');
      const { captainId } = await c.req.json() as { captainId: string };
      if (!captainId) return bad(c, 'Captain ID required');
      // Verify captain exists and is a coach
      const captainEntity = new UserEntity(c.env, captainId);
      const captain = await captainEntity.getState();
      if (!captain.id || captain.role !== 'coach') {
        return bad(c, 'Invalid captain selected');
      }
      // Update user
      const userEntity = new UserEntity(c.env, userId);
      const user = await userEntity.getState();
      if (!user.id) return notFound(c, 'User not found');
      await userEntity.patch({ captainId });
      return ok(c, await userEntity.getState());
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });
  // --- System Stats ---
  app.get('/api/stats', async (c) => {
    try {
      const statsEntity = new SystemStatsEntity(c.env, "global");
      const stats = await statsEntity.getState();
      return ok(c, stats);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });
}