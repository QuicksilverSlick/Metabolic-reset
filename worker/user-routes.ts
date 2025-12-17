import { Hono } from "hono";
import type { Env } from './core-utils';
import { ok, bad, notFound, Index } from './core-utils';
import {
  UserEntity,
  ReferralLedgerEntity,
  ReferralCodeMapping,
  CaptainIndex,
  AdminIndex,
  EmailMapping,
  PhoneMapping,
  DailyScoreEntity,
  WeeklyBiometricEntity,
  SystemStatsEntity,
  QuizLeadEntity,
  CaptainLeadsIndex,
  ResetProjectEntity,
  ProjectEnrollmentEntity,
  ProjectIndex,
  BugReportEntity,
  BugReportIndex,
  OtpEntity
} from './entities';
import type { User, QuizLead, ResetProject, ProjectEnrollment, CreateProjectRequest, UpdateProjectRequest, BugReportSubmitRequest, BugReportUpdateRequest, BugReport, SendOtpRequest, VerifyOtpRequest } from "@shared/types";
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
      // MOCK PAYMENT CHECK: Bypass Stripe for free/test transactions AND standard tiers
      // 0 = Free/Test
      // 2800 = Challenger ($28)
      // 4900 = Coach ($49)
      if (amount === 0 || amount === 2800 || amount === 4900) {
        console.log(`Mock amount detected (${amount}), bypassing Stripe`);
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
      const { name, email, phone, referralCodeUsed, role, hasScale, projectId, timezone } = body;
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

      // Handle Email Mapping for login lookup
      const normalizedEmail = email.toLowerCase().trim();
      const emailMapping = new EmailMapping(c.env, normalizedEmail);
      await emailMapping.save({ userId: userId });

      // Handle Phone Mapping for OTP login lookup
      const phoneDigits = phone.replace(/\D/g, '').slice(-10);
      if (phoneDigits.length === 10) {
        const normalizedPhone = `+1${phoneDigits}`;
        const phoneMapping = new PhoneMapping(c.env, normalizedPhone);
        await phoneMapping.save({ userId: userId });
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
        timezone: timezone || 'America/New_York', // Use provided timezone, default to Eastern
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

      // Create Project Enrollment if projectId is provided
      if (projectId) {
        const enrollmentId = `${projectId}:${userId}`;
        await ProjectEnrollmentEntity.create(c.env, {
          id: enrollmentId,
          projectId,
          userId,
          role: role || 'challenger',
          groupLeaderId: captainId || null, // Their group leader for this project
          points: 0,
          enrolledAt: now,
          isGroupLeaderEnrolled: true // Payment was already processed
        });

        // Index user's enrollment for looking up their projects
        const userEnrollmentsIndex = new Index(c.env, `user_enrollments:${userId}`);
        await userEnrollmentsIndex.add(projectId);

        // Index project's enrollment for looking up participants
        const projectEnrollmentsIndex = new Index(c.env, `project_enrollments:${projectId}`);
        await projectEnrollmentsIndex.add(userId);
      }

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
      const { date, habits, projectId } = body;
      if (!date || !habits) return bad(c, 'Missing date or habits');
      const scoreId = `${userId}:${date}`;
      const scoreEntity = new DailyScoreEntity(c.env, scoreId);
      // Check if this is a new score entry
      const isNewScore = !(await scoreEntity.exists());
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
        projectId: projectId || currentScore.projectId || '',
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
      // Add to index if new score
      if (isNewScore) {
        const scoresIndex = new Index(c.env, 'scores');
        await scoresIndex.add(scoreId);
      }
      // Update User Points if there is a change
      if (pointDelta !== 0) {
        await UserEntity.addPoints(c.env, userId, pointDelta);
        // Also update project enrollment points if projectId provided
        if (projectId) {
          await ProjectEnrollmentEntity.addPoints(c.env, projectId, userId, pointDelta);
        }
      }
      // Update System Stats
      await SystemStatsEntity.incrementHabits(c.env);
      return ok(c, await scoreEntity.getState());
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });
  // --- Biometrics ---
  // Get biometrics for a specific week (to check if already submitted)
  app.get('/api/biometrics/:weekNumber', async (c) => {
    try {
      const userId = c.req.header('X-User-ID');
      if (!userId) return bad(c, 'Unauthorized');
      const weekNumber = parseInt(c.req.param('weekNumber'));
      if (isNaN(weekNumber)) return bad(c, 'Invalid week number');
      const biometricId = `${userId}:week${weekNumber}`;
      const bioEntity = new WeeklyBiometricEntity(c.env, biometricId);
      const existing = await bioEntity.getState();
      if (!existing.id) {
        return ok(c, null);
      }
      return ok(c, existing);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  app.post('/api/biometrics', async (c) => {
    try {
      const userId = c.req.header('X-User-ID');
      if (!userId) return bad(c, 'Unauthorized');
      const body = await c.req.json() as any;
      const { weekNumber, weight, bodyFat, visceralFat, leanMass, metabolicAge, screenshotUrl, projectId } = body;
      if (!weekNumber || !screenshotUrl) return bad(c, 'Missing required fields');
      const biometricId = `${userId}:week${weekNumber}`;
      const bioEntity = new WeeklyBiometricEntity(c.env, biometricId);
      const isNewSubmission = !(await bioEntity.exists());
      const existing = await bioEntity.getState();
      // Save Biometric Data
      await bioEntity.save({
        id: biometricId,
        projectId: projectId || existing.projectId || '',
        userId,
        weekNumber,
        weight: Number(weight),
        bodyFat: Number(bodyFat),
        visceralFat: Number(visceralFat),
        leanMass: Number(leanMass),
        metabolicAge: Number(metabolicAge),
        screenshotUrl,
        pointsAwarded: isNewSubmission ? 25 : 0,
        submittedAt: Date.now()
      });
      // Add to index if new submission
      if (isNewSubmission) {
        const biometricsIndex = new Index(c.env, 'biometrics');
        await biometricsIndex.add(biometricId);
        await UserEntity.addPoints(c.env, userId, 25);
        // Also update project enrollment points if projectId provided
        if (projectId) {
          await ProjectEnrollmentEntity.addPoints(c.env, projectId, userId, 25);
        }
        // Update System Stats
        await SystemStatsEntity.incrementSubmissions(c.env);
      }
      // Return result with isNewSubmission flag so frontend knows if points were awarded
      const result = await bioEntity.getState();
      return ok(c, { ...result, isNewSubmission });
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

  // Get biometric data for a specific team member (captain only)
  app.get('/api/roster/:recruitId/biometrics', async (c) => {
    try {
      const userId = c.req.header('X-User-ID');
      if (!userId) return bad(c, 'Unauthorized');

      const recruitId = c.req.param('recruitId');
      if (!recruitId) return bad(c, 'Recruit ID required');

      // Verify the requesting user is a coach
      const userEntity = new UserEntity(c.env, userId);
      const user = await userEntity.getState();
      if (!user.id) return notFound(c, 'User not found');
      if (user.role !== 'coach') return bad(c, 'Only coaches can view team biometrics');

      // Verify the recruit exists and belongs to this captain
      const recruitEntity = new UserEntity(c.env, recruitId);
      const recruit = await recruitEntity.getState();
      if (!recruit.id) return notFound(c, 'Team member not found');

      // Check if recruit was recruited by this coach (or is under their team)
      const recruitIndex = new Index(c.env, `recruits:${userId}`);
      const recruitIds = await recruitIndex.list();
      if (!recruitIds.includes(recruitId)) {
        return bad(c, 'This user is not on your team');
      }

      // Fetch biometrics for the 28-day challenge (5 entries: initial + 4 weekly)
      const biometrics = [];
      for (let week = 0; week <= 4; week++) {
        const biometricId = `${recruitId}:week${week}`;
        const bioEntity = new WeeklyBiometricEntity(c.env, biometricId);
        // Must use exists() because getState() auto-populates id field even for non-existent entities
        if (await bioEntity.exists()) {
          const existing = await bioEntity.getState();
          biometrics.push(existing);
        }
      }

      return ok(c, {
        recruit: {
          id: recruit.id,
          name: recruit.name,
          email: recruit.email,
          points: recruit.points,
          createdAt: recruit.createdAt
        },
        biometrics: biometrics.sort((a, b) => a.weekNumber - b.weekNumber)
      });
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

  // --- Login (for returning users - legacy email+phone) ---
  app.post('/api/login', async (c) => {
    try {
      const { email, phone } = await c.req.json() as { email: string; phone: string };
      if (!email || !phone) {
        return bad(c, 'Email and phone are required');
      }

      // Find user by email
      const user = await UserEntity.findByEmail(c.env, email);
      if (!user) {
        return c.json({ error: 'User not found. Please register first.' }, 404);
      }

      // Verify phone matches (simple auth)
      const normalizedInputPhone = phone.replace(/\D/g, '');
      const normalizedStoredPhone = user.phone.replace(/\D/g, '');

      // Check last 10 digits match (handles country code differences)
      const inputLast10 = normalizedInputPhone.slice(-10);
      const storedLast10 = normalizedStoredPhone.slice(-10);

      if (inputLast10 !== storedLast10) {
        return c.json({ error: 'Phone number does not match our records' }, 401);
      }

      return ok(c, user);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // =========================================
  // OTP (SMS) Authentication Routes
  // =========================================

  // Helper: Convert phone to E.164 format
  const toE164 = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    return `+1${digits.slice(-10)}`;
  };

  // Helper: Generate 6-digit OTP
  const generateOtp = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Send OTP via Twilio SMS
  app.post('/api/auth/send-otp', async (c) => {
    try {
      const { phone } = await c.req.json() as SendOtpRequest;
      if (!phone) {
        return bad(c, 'Phone number is required');
      }

      const normalizedPhone = toE164(phone);
      const digits = normalizedPhone.replace(/\D/g, '');
      if (digits.length < 10) {
        return bad(c, 'Invalid phone number format');
      }

      // Get Twilio credentials from environment
      const twilioSid = (c.env as any).TWILIO_ACCOUNT_SID;
      const twilioToken = (c.env as any).TWILIO_AUTH_TOKEN;
      const twilioPhone = (c.env as any).TWILIO_PHONE_NUMBER;

      // Generate OTP
      const code = generateOtp();
      const now = Date.now();
      const expiresAt = now + 10 * 60 * 1000; // 10 minutes

      // Store OTP in database
      const otpEntity = new OtpEntity(c.env, normalizedPhone);
      await otpEntity.save({
        id: normalizedPhone,
        code,
        createdAt: now,
        expiresAt,
        attempts: 0,
        verified: false
      });

      // If no Twilio credentials, use mock mode (for development)
      if (!twilioSid || !twilioToken || !twilioPhone) {
        console.log(`[DEV MODE] OTP for ${normalizedPhone}: ${code}`);
        return ok(c, {
          success: true,
          message: 'Verification code sent (dev mode)',
          expiresIn: 600,
          // Only include code in dev mode for testing
          devCode: code
        });
      }

      // Send SMS via Twilio
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const params = new URLSearchParams();
      params.append('To', normalizedPhone);
      params.append('From', twilioPhone);
      params.append('Body', `Your Metabolic Reset verification code is: ${code}. Valid for 10 minutes.`);

      const authHeader = btoa(`${twilioSid}:${twilioToken}`);
      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      const result: any = await response.json();
      if (!response.ok) {
        console.error('Twilio API Error:', JSON.stringify(result));
        return c.json({ error: result.message || 'Failed to send SMS' }, 500);
      }

      console.log(`OTP sent to ${normalizedPhone}, SID: ${result.sid}`);
      return ok(c, {
        success: true,
        message: 'Verification code sent to your phone',
        expiresIn: 600
      });
    } catch (e: any) {
      console.error('Send OTP Error:', e);
      return c.json({ error: e.message }, 500);
    }
  });

  // Verify OTP and login
  app.post('/api/auth/verify-otp', async (c) => {
    try {
      const { phone, code } = await c.req.json() as VerifyOtpRequest;
      if (!phone || !code) {
        return bad(c, 'Phone and verification code are required');
      }

      const normalizedPhone = toE164(phone);

      // Get OTP record
      const otpEntity = new OtpEntity(c.env, normalizedPhone);
      const otp = await otpEntity.getState();

      if (!otp.id || !otp.code) {
        return c.json({ error: 'No verification code found. Please request a new one.' }, 400);
      }

      // Check if expired
      if (Date.now() > otp.expiresAt) {
        return c.json({ error: 'Verification code has expired. Please request a new one.' }, 400);
      }

      // Check attempt limit
      if (otp.attempts >= 5) {
        return c.json({ error: 'Too many failed attempts. Please request a new code.' }, 429);
      }

      // Verify code
      if (otp.code !== code.trim()) {
        await otpEntity.incrementAttempts();
        const remaining = 5 - (otp.attempts + 1);
        return c.json({ error: `Invalid code. ${remaining} attempts remaining.` }, 401);
      }

      // Mark as verified
      await otpEntity.markVerified();

      // Find user by phone
      const user = await UserEntity.findByPhone(c.env, normalizedPhone);

      if (user) {
        // Existing user - return user data for login
        return ok(c, {
          success: true,
          message: 'Phone verified successfully',
          user,
          isNewUser: false
        });
      } else {
        // New user - they need to complete registration
        return ok(c, {
          success: true,
          message: 'Phone verified. Please complete registration.',
          isNewUser: true,
          verifiedPhone: normalizedPhone
        });
      }
    } catch (e: any) {
      console.error('Verify OTP Error:', e);
      return c.json({ error: e.message }, 500);
    }
  });

  // Check if OTP is verified (for registration flow)
  app.get('/api/auth/check-verified/:phone', async (c) => {
    try {
      const phone = c.req.param('phone');
      if (!phone) return bad(c, 'Phone number required');

      const normalizedPhone = toE164(decodeURIComponent(phone));
      const otpEntity = new OtpEntity(c.env, normalizedPhone);
      const otp = await otpEntity.getState();

      if (!otp.id || !otp.verified) {
        return ok(c, { verified: false });
      }

      // Check if verification is recent (within 30 minutes)
      const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
      if (otp.createdAt < thirtyMinutesAgo) {
        return ok(c, { verified: false, expired: true });
      }

      return ok(c, { verified: true });
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // --- Referral Code Lookup (Public) ---
  // Used by quiz page to show referrer's name
  app.get('/api/referrer/:code', async (c) => {
    try {
      const code = c.req.param('code');
      if (!code) return bad(c, 'Referral code required');

      const referrer = await UserEntity.findByReferralCode(c.env, code);
      if (!referrer) {
        return ok(c, null);
      }

      // Only return public info (name)
      return ok(c, {
        name: referrer.name,
        role: referrer.role
      });
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // --- Quiz Leads ---

  // Submit a new quiz lead (public endpoint - no auth required)
  app.post('/api/leads', async (c) => {
    try {
      const body = await c.req.json() as {
        name: string;
        phone: string;
        age: number;
        referralCode?: string | null;
        quizScore: number;
        metabolicAge: number;
      };

      const { name, phone, age, referralCode, quizScore, metabolicAge } = body;

      if (!name || !phone || !age) {
        return bad(c, 'Missing required fields: name, phone, age');
      }

      // Resolve captain from referral code if provided
      let captainId: string | null = null;
      if (referralCode) {
        const referrer = await UserEntity.findByReferralCode(c.env, referralCode);
        if (referrer) {
          // If referrer is a coach, they are the captain
          // If referrer is a challenger, use their captain
          captainId = referrer.role === 'coach' ? referrer.id : referrer.captainId;
        }
      }

      const leadId = crypto.randomUUID();
      const now = Date.now();

      // Create the lead
      await QuizLeadEntity.create(c.env, {
        id: leadId,
        name,
        phone,
        age,
        referralCode: referralCode || null,
        captainId,
        quizScore,
        metabolicAge,
        convertedToUserId: null,
        capturedAt: now,
        source: 'quiz'
      });

      // Index the lead under the captain if we have one
      if (captainId) {
        const captainLeadsIndex = new CaptainLeadsIndex(c.env, captainId);
        await captainLeadsIndex.add(leadId);
      }

      // Also add to a global leads index for admins
      const globalLeadsIndex = new Index(c.env, 'all-quiz-leads');
      await globalLeadsIndex.add(leadId);

      // Trigger GHL Webhook for lead (Fire and Forget)
      const ghlWebhookUrl = (c.env as any).GHL_WEBHOOK_URL;
      if (ghlWebhookUrl) {
        c.executionCtx.waitUntil(
          fetch(ghlWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              phone,
              age,
              quizScore,
              metabolicAge,
              referralCode,
              captainId,
              source: 'quiz-lead'
            })
          }).catch(err => console.error('GHL Webhook Failed for lead', err))
        );
      }

      return ok(c, {
        id: leadId,
        name,
        phone,
        age,
        captainId,
        metabolicAge
      });
    } catch (e: any) {
      console.error('Lead submission error:', e);
      return c.json({ error: e.message }, 500);
    }
  });

  // Get leads for a captain (requires auth)
  app.get('/api/leads', async (c) => {
    try {
      const userId = c.req.header('X-User-ID');
      if (!userId) return bad(c, 'Unauthorized');

      // Verify user is a coach/captain
      const userEntity = new UserEntity(c.env, userId);
      const user = await userEntity.getState();
      if (!user.id) return notFound(c, 'User not found');

      // Only coaches can view their leads
      if (user.role !== 'coach') {
        return bad(c, 'Only coaches can view leads');
      }

      // Get all leads indexed under this captain
      const captainLeadsIndex = new CaptainLeadsIndex(c.env, userId);
      const leadIds = await captainLeadsIndex.list();

      if (leadIds.length === 0) {
        return ok(c, []);
      }

      // Fetch details for each lead
      const leads = await Promise.all(leadIds.map(async (id) => {
        const leadEntity = new QuizLeadEntity(c.env, id);
        return leadEntity.getState();
      }));

      // Filter valid leads and sort by capturedAt descending (newest first)
      const validLeads = leads
        .filter(l => l.id)
        .sort((a, b) => b.capturedAt - a.capturedAt);

      return ok(c, validLeads);
    } catch (e: any) {
      console.error('Get leads error:', e);
      return c.json({ error: e.message }, 500);
    }
  });

  // Mark a lead as converted (when they register)
  app.patch('/api/leads/:leadId/convert', async (c) => {
    try {
      const leadId = c.req.param('leadId');
      const { userId } = await c.req.json() as { userId: string };

      if (!leadId || !userId) {
        return bad(c, 'Lead ID and User ID required');
      }

      const leadEntity = new QuizLeadEntity(c.env, leadId);
      const lead = await leadEntity.getState();

      if (!lead.id) return notFound(c, 'Lead not found');

      // Mark as converted
      await leadEntity.patch({ convertedToUserId: userId });

      return ok(c, await leadEntity.getState());
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // --- Admin Routes ---

  // Helper to check if user is admin
  const requireAdmin = async (c: any): Promise<User | null> => {
    const userId = c.req.header('X-User-ID');
    if (!userId) return null;
    const userEntity = new UserEntity(c.env, userId);
    const user = await userEntity.getState();
    if (!user.id || !user.isAdmin) return null;
    return user;
  };

  // Get all users (admin only)
  app.get('/api/admin/users', async (c) => {
    try {
      const admin = await requireAdmin(c);
      if (!admin) return c.json({ error: 'Admin access required' }, 403);

      // Get all users from the index
      const userIndex = new Index(c.env, 'users');
      const userIds = await userIndex.list();

      const users = await Promise.all(userIds.map(async (id) => {
        const userEntity = new UserEntity(c.env, id);
        return userEntity.getState();
      }));

      // Filter out empty/invalid users and sort by createdAt desc
      const validUsers = users
        .filter(u => u.id)
        .sort((a, b) => b.createdAt - a.createdAt);

      return ok(c, validUsers);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // Get single user details (admin only)
  app.get('/api/admin/users/:userId', async (c) => {
    try {
      const admin = await requireAdmin(c);
      if (!admin) return c.json({ error: 'Admin access required' }, 403);

      const targetUserId = c.req.param('userId');
      const userEntity = new UserEntity(c.env, targetUserId);
      const user = await userEntity.getState();

      if (!user.id) return notFound(c, 'User not found');

      // Get user's daily scores - list all scores and filter by userId
      const { items: allScores } = await DailyScoreEntity.list(c.env);
      const scores = allScores.filter(s => s.userId === targetUserId);

      // Get user's biometrics - list all and filter by userId
      const { items: allBiometrics } = await WeeklyBiometricEntity.list(c.env);
      const biometrics = allBiometrics.filter(b => b.userId === targetUserId);

      return ok(c, { user, scores, biometrics });
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // Update user (admin only)
  app.patch('/api/admin/users/:userId', async (c) => {
    try {
      const admin = await requireAdmin(c);
      if (!admin) return c.json({ error: 'Admin access required' }, 403);

      const targetUserId = c.req.param('userId');
      const updates = await c.req.json() as {
        isAdmin?: boolean;
        isActive?: boolean;
        points?: number;
        role?: 'challenger' | 'coach';
      };

      const userEntity = new UserEntity(c.env, targetUserId);
      const user = await userEntity.getState();
      if (!user.id) return notFound(c, 'User not found');

      // Apply updates
      const patch: Partial<User> = {};
      if (typeof updates.isAdmin === 'boolean') patch.isAdmin = updates.isAdmin;
      if (typeof updates.isActive === 'boolean') patch.isActive = updates.isActive;
      if (typeof updates.points === 'number') patch.points = updates.points;
      if (updates.role) patch.role = updates.role;

      await userEntity.patch(patch);

      // Update admin index if isAdmin changed
      if (typeof updates.isAdmin === 'boolean') {
        const adminIndex = new AdminIndex(c.env);
        if (updates.isAdmin) {
          await adminIndex.add(targetUserId);
        } else {
          await adminIndex.remove(targetUserId);
        }
      }

      // Update captain index if role changed to/from coach
      if (updates.role) {
        const captainIndex = new CaptainIndex(c.env);
        if (updates.role === 'coach') {
          await captainIndex.add(targetUserId);
          // Set captainId to self if becoming coach
          await userEntity.patch({ captainId: targetUserId });
        } else if (user.role === 'coach' && updates.role !== 'coach') {
          await captainIndex.remove(targetUserId);
        }
      }

      return ok(c, await userEntity.getState());
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // Get all admins (admin only)
  app.get('/api/admin/admins', async (c) => {
    try {
      const admin = await requireAdmin(c);
      if (!admin) return c.json({ error: 'Admin access required' }, 403);

      const adminIndex = new AdminIndex(c.env);
      const adminIds = await adminIndex.list();

      const admins = await Promise.all(adminIds.map(async (id) => {
        const userEntity = new UserEntity(c.env, id);
        const user = await userEntity.getState();
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isAdmin: user.isAdmin
        };
      }));

      return ok(c, admins.filter(a => a.id));
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // Bootstrap first admin (special endpoint - only works if no admins exist)
  app.post('/api/admin/bootstrap', async (c) => {
    try {
      const { phone, secretKey } = await c.req.json() as { phone: string; secretKey: string };

      // Check for bootstrap secret key (should be set in environment)
      const bootstrapKey = (c.env as any).ADMIN_BOOTSTRAP_KEY || 'x.@-_Re$et>/-';
      if (secretKey !== bootstrapKey) {
        return c.json({ error: 'Invalid bootstrap key' }, 403);
      }

      // Check if any admins exist
      const adminIndex = new AdminIndex(c.env);
      const existingAdmins = await adminIndex.list();
      if (existingAdmins.length > 0) {
        return c.json({ error: 'Admin already exists. Use admin panel to add more.' }, 400);
      }

      // Find user by phone
      const user = await UserEntity.findByPhone(c.env, phone);
      if (!user) {
        return c.json({ error: 'User not found. Please register first.' }, 404);
      }

      // Make user an admin
      const userEntity = new UserEntity(c.env, user.id);
      await userEntity.patch({ isAdmin: true });
      await adminIndex.add(user.id);

      return ok(c, { message: 'Admin created successfully', userId: user.id, userName: user.name });
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // =========================================
  // Reset Project (Challenge) Routes
  // =========================================

  // Get all projects (public - used for project selection)
  app.get('/api/projects', async (c) => {
    try {
      const { items: projects } = await ResetProjectEntity.list(c.env);
      // Sort by start date descending (newest first)
      const sorted = projects
        .filter(p => p.id)
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      return ok(c, sorted);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // Get projects open for registration (public)
  app.get('/api/projects/open', async (c) => {
    try {
      const projects = await ResetProjectEntity.findOpenForRegistration(c.env);
      return ok(c, projects);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // Get active project (public)
  app.get('/api/projects/active', async (c) => {
    try {
      const project = await ResetProjectEntity.findActive(c.env);
      return ok(c, project);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // Get single project by ID (public)
  app.get('/api/projects/:projectId', async (c) => {
    try {
      const projectId = c.req.param('projectId');
      const projectEntity = new ResetProjectEntity(c.env, projectId);
      const project = await projectEntity.getState();
      if (!project.id) return notFound(c, 'Project not found');
      return ok(c, project);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // Create new project (admin only)
  app.post('/api/admin/projects', async (c) => {
    try {
      const admin = await requireAdmin(c);
      if (!admin) return c.json({ error: 'Admin access required' }, 403);

      const body = await c.req.json() as CreateProjectRequest;
      const { name, description, startDate, registrationOpen } = body;

      if (!name || !startDate) {
        return bad(c, 'Name and start date are required');
      }

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
        return bad(c, 'Start date must be in YYYY-MM-DD format');
      }

      const projectId = crypto.randomUUID();
      const now = Date.now();
      const endDate = ResetProjectEntity.calculateEndDate(startDate);

      // Determine initial status based on start date
      const startDateObj = new Date(startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let status: ResetProject['status'] = 'draft';
      if (startDateObj > today) {
        status = 'upcoming';
      }

      await ResetProjectEntity.create(c.env, {
        id: projectId,
        name,
        description: description || '',
        startDate,
        endDate,
        status,
        registrationOpen: registrationOpen ?? true,
        createdAt: now,
        updatedAt: now
      });

      // Add to project index
      const projectIndex = new ProjectIndex(c.env);
      await projectIndex.add(projectId);

      return ok(c, await new ResetProjectEntity(c.env, projectId).getState());
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // Update project (admin only)
  app.patch('/api/admin/projects/:projectId', async (c) => {
    try {
      const admin = await requireAdmin(c);
      if (!admin) return c.json({ error: 'Admin access required' }, 403);

      const projectId = c.req.param('projectId');
      const projectEntity = new ResetProjectEntity(c.env, projectId);
      const project = await projectEntity.getState();

      if (!project.id) return notFound(c, 'Project not found');

      const updates = await c.req.json() as UpdateProjectRequest;
      const patch: Partial<ResetProject> = { updatedAt: Date.now() };

      if (updates.name !== undefined) patch.name = updates.name;
      if (updates.description !== undefined) patch.description = updates.description;
      if (updates.registrationOpen !== undefined) patch.registrationOpen = updates.registrationOpen;
      if (updates.status !== undefined) patch.status = updates.status;

      // If start date changes, recalculate end date
      if (updates.startDate !== undefined) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(updates.startDate)) {
          return bad(c, 'Start date must be in YYYY-MM-DD format');
        }
        patch.startDate = updates.startDate;
        patch.endDate = ResetProjectEntity.calculateEndDate(updates.startDate);
      }

      await projectEntity.patch(patch);
      return ok(c, await projectEntity.getState());
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // Delete project (admin only) - soft delete by setting status to 'draft' or actual delete
  app.delete('/api/admin/projects/:projectId', async (c) => {
    try {
      const admin = await requireAdmin(c);
      if (!admin) return c.json({ error: 'Admin access required' }, 403);

      const projectId = c.req.param('projectId');
      const projectEntity = new ResetProjectEntity(c.env, projectId);
      const project = await projectEntity.getState();

      if (!project.id) return notFound(c, 'Project not found');

      // Check if project has enrollments
      const enrollments = await ProjectEnrollmentEntity.findByProject(c.env, projectId);
      if (enrollments.length > 0) {
        return bad(c, 'Cannot delete project with enrolled participants. Set status to completed instead.');
      }

      // Remove from index
      const projectIndex = new ProjectIndex(c.env);
      await projectIndex.remove(projectId);

      // Delete the entity
      await projectEntity.delete();

      return ok(c, { message: 'Project deleted successfully' });
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // Get project enrollments (admin only)
  app.get('/api/admin/projects/:projectId/enrollments', async (c) => {
    try {
      const admin = await requireAdmin(c);
      if (!admin) return c.json({ error: 'Admin access required' }, 403);

      const projectId = c.req.param('projectId');
      const enrollments = await ProjectEnrollmentEntity.findByProject(c.env, projectId);

      // Enrich with user info
      const enriched = await Promise.all(enrollments.map(async (e) => {
        const userEntity = new UserEntity(c.env, e.userId);
        const user = await userEntity.getState();
        return {
          ...e,
          userName: user.name || 'Unknown',
          userEmail: user.email || ''
        };
      }));

      return ok(c, enriched);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // Admin: Assign user to project
  app.post('/api/admin/users/:userId/enroll', async (c) => {
    try {
      const admin = await requireAdmin(c);
      if (!admin) return c.json({ error: 'Admin access required' }, 403);

      const targetUserId = c.req.param('userId');
      const body = await c.req.json() as any;
      const { projectId } = body;

      if (!projectId) {
        return bad(c, 'Project ID is required');
      }

      // Check if user exists
      const userEntity = new UserEntity(c.env, targetUserId);
      const user = await userEntity.getState();
      if (!user.id) return notFound(c, 'User not found');

      // Check if project exists
      const projectEntity = new ResetProjectEntity(c.env, projectId);
      const project = await projectEntity.getState();
      if (!project.id) return notFound(c, 'Project not found');

      // Check if already enrolled
      const existingEnrollment = await ProjectEnrollmentEntity.findByProjectAndUser(c.env, projectId, targetUserId);
      if (existingEnrollment) {
        return c.json({ error: 'User is already enrolled in this project' }, 400);
      }

      // Create enrollment
      const now = Date.now();
      const enrollmentId = `${projectId}:${targetUserId}`;
      await ProjectEnrollmentEntity.create(c.env, {
        id: enrollmentId,
        projectId,
        userId: targetUserId,
        role: user.role || 'challenger',
        groupLeaderId: user.captainId || null, // Their group leader for this project
        points: 0,
        enrolledAt: now,
        isGroupLeaderEnrolled: true // Admin-assigned = paid
      });

      // Index user's enrollment
      const userEnrollmentsIndex = new Index(c.env, `user_enrollments:${targetUserId}`);
      await userEnrollmentsIndex.add(projectId);

      // Index project's enrollment
      const projectEnrollmentsIndex = new Index(c.env, `project_enrollments:${projectId}`);
      await projectEnrollmentsIndex.add(targetUserId);

      return ok(c, { success: true, message: 'User enrolled in project' });
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // Admin: Get user's enrollments
  app.get('/api/admin/users/:userId/enrollments', async (c) => {
    try {
      const admin = await requireAdmin(c);
      if (!admin) return c.json({ error: 'Admin access required' }, 403);

      const targetUserId = c.req.param('userId');

      // Get all projects and check each one directly for enrollment
      // This handles cases where enrollment data may be corrupted
      const { items: allProjects } = await ResetProjectEntity.list(c.env);
      const enrollments: any[] = [];

      for (const project of allProjects) {
        const enrollmentId = `${project.id}:${targetUserId}`;
        const enrollmentEntity = new ProjectEnrollmentEntity(c.env, enrollmentId);

        // Check if enrollment actually exists in storage (not just in-memory default)
        const exists = await enrollmentEntity.exists();
        if (!exists) continue;

        const enrollment = await enrollmentEntity.getState();
        enrollments.push({
          ...enrollment,
          // Ensure required fields are present (handle corrupted data)
          projectId: enrollment.projectId || project.id,
          userId: enrollment.userId || targetUserId,
          projectName: project.name || 'Unknown',
          projectStatus: project.status,
          projectStartDate: project.startDate
        });
      }

      return ok(c, enrollments);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // Admin: Remove user from project
  app.delete('/api/admin/users/:userId/enrollments/:projectId', async (c) => {
    try {
      const admin = await requireAdmin(c);
      if (!admin) return c.json({ error: 'Admin access required' }, 403);

      const targetUserId = c.req.param('userId');
      const projectId = c.req.param('projectId');

      const enrollmentId = `${projectId}:${targetUserId}`;

      // Use the static delete method which properly removes from storage AND index
      const deleted = await ProjectEnrollmentEntity.delete(c.env, enrollmentId);

      if (!deleted) {
        // Entity didn't exist, but let's still clean up any stray indexes
      }

      // Also remove from our custom indexes (user_enrollments and project_enrollments)
      const userEnrollmentsIndex = new Index(c.env, `user_enrollments:${targetUserId}`);
      await userEnrollmentsIndex.remove(projectId);

      const projectEnrollmentsIndex = new Index(c.env, `project_enrollments:${projectId}`);
      await projectEnrollmentsIndex.remove(targetUserId);

      return ok(c, { success: true, message: 'User removed from project' });
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // =========================================
  // Project Enrollment Routes
  // =========================================

  // Get current user's enrollments
  app.get('/api/enrollments', async (c) => {
    try {
      const userId = c.req.header('X-User-ID');
      if (!userId) return bad(c, 'Unauthorized');

      const enrollments = await ProjectEnrollmentEntity.findByUser(c.env, userId);

      // Enrich with project info
      const enriched = await Promise.all(enrollments.map(async (e) => {
        const projectEntity = new ResetProjectEntity(c.env, e.projectId);
        const project = await projectEntity.getState();
        return {
          ...e,
          projectName: project.name || 'Unknown',
          projectStatus: project.status,
          projectStartDate: project.startDate,
          projectEndDate: project.endDate
        };
      }));

      return ok(c, enriched);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // Get enrollment for specific project
  app.get('/api/enrollments/:projectId', async (c) => {
    try {
      const userId = c.req.header('X-User-ID');
      if (!userId) return bad(c, 'Unauthorized');

      const projectId = c.req.param('projectId');
      const enrollment = await ProjectEnrollmentEntity.findByProjectAndUser(c.env, projectId, userId);

      if (!enrollment) return ok(c, null);

      // Enrich with project info
      const projectEntity = new ResetProjectEntity(c.env, projectId);
      const project = await projectEntity.getState();

      return ok(c, {
        ...enrollment,
        projectName: project.name || 'Unknown',
        projectStatus: project.status,
        projectStartDate: project.startDate,
        projectEndDate: project.endDate
      });
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // Enroll in a project (for existing users opting into new projects)
  app.post('/api/enrollments', async (c) => {
    try {
      const userId = c.req.header('X-User-ID');
      if (!userId) return bad(c, 'Unauthorized');

      const { projectId, groupLeaderId } = await c.req.json() as {
        projectId: string;
        groupLeaderId?: string;
      };

      if (!projectId) return bad(c, 'Project ID required');

      // Verify project exists and is open for registration
      const projectEntity = new ResetProjectEntity(c.env, projectId);
      const project = await projectEntity.getState();
      if (!project.id) return notFound(c, 'Project not found');
      if (!project.registrationOpen) {
        return bad(c, 'This project is not accepting registrations');
      }

      // Check if already enrolled
      const existing = await ProjectEnrollmentEntity.findByProjectAndUser(c.env, projectId, userId);
      if (existing) {
        return bad(c, 'Already enrolled in this project');
      }

      // Get user to determine role
      const userEntity = new UserEntity(c.env, userId);
      const user = await userEntity.getState();
      if (!user.id) return notFound(c, 'User not found');

      const enrollmentId = `${projectId}:${userId}`;
      const now = Date.now();

      // Resolve group leader
      let resolvedGroupLeaderId = groupLeaderId || null;
      if (user.role === 'coach') {
        // Coaches are their own group leader
        resolvedGroupLeaderId = userId;
      }

      await ProjectEnrollmentEntity.create(c.env, {
        id: enrollmentId,
        projectId,
        userId,
        role: user.role,
        groupLeaderId: resolvedGroupLeaderId,
        points: 0,
        enrolledAt: now,
        isGroupLeaderEnrolled: user.role === 'coach' ? false : true // Coaches need to pay
      });

      // Update user's current project
      await userEntity.patch({ currentProjectId: projectId });

      return ok(c, await new ProjectEnrollmentEntity(c.env, enrollmentId).getState());
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // Get group participants for a project (for group leaders)
  app.get('/api/projects/:projectId/group', async (c) => {
    try {
      const userId = c.req.header('X-User-ID');
      if (!userId) return bad(c, 'Unauthorized');

      const projectId = c.req.param('projectId');

      // Verify user is a coach
      const userEntity = new UserEntity(c.env, userId);
      const user = await userEntity.getState();
      if (!user.id) return notFound(c, 'User not found');
      if (user.role !== 'coach') return bad(c, 'Only group leaders can view their group');

      // Get participants where this user is the group leader
      const participants = await ProjectEnrollmentEntity.findGroupParticipants(c.env, projectId, userId);

      // Enrich with user info
      const enriched = await Promise.all(participants.map(async (e) => {
        const participantEntity = new UserEntity(c.env, e.userId);
        const participant = await participantEntity.getState();
        return {
          ...e,
          userName: participant.name || 'Unknown',
          userEmail: participant.email || ''
        };
      }));

      return ok(c, enriched);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // Get current week for a project
  app.get('/api/projects/:projectId/week', async (c) => {
    try {
      const projectId = c.req.param('projectId');
      const projectEntity = new ResetProjectEntity(c.env, projectId);
      const project = await projectEntity.getState();

      if (!project.id) return notFound(c, 'Project not found');

      const currentWeek = ResetProjectEntity.getCurrentWeek(project.startDate);
      const today = new Date();
      const startDate = new Date(project.startDate);
      const endDate = new Date(project.endDate);

      return ok(c, {
        currentWeek,
        projectId,
        projectName: project.name,
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status,
        isBeforeStart: today < startDate,
        isAfterEnd: today > endDate,
        daysUntilStart: today < startDate ? Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0,
        daysRemaining: today <= endDate ? Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0
      });
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // =========================================
  // Media Upload Routes (R2)
  // =========================================

  // Get a presigned URL for uploading media to R2
  app.post('/api/upload/presigned-url', async (c) => {
    try {
      const userId = c.req.header('X-User-ID');
      if (!userId) return bad(c, 'Unauthorized');

      const { filename, contentType, fileSize } = await c.req.json() as {
        filename: string;
        contentType: string;
        fileSize: number;
      };

      // Validate content type (only images and videos)
      const allowedTypes = [
        'image/png', 'image/jpeg', 'image/gif', 'image/webp',
        'video/webm', 'video/mp4', 'video/quicktime'
      ];
      if (!allowedTypes.includes(contentType)) {
        return bad(c, 'Invalid file type. Only images and videos are allowed.');
      }

      // Limit file size (50MB for images, 100MB for videos)
      const maxSize = contentType.startsWith('video/') ? 100 * 1024 * 1024 : 50 * 1024 * 1024;
      if (fileSize > maxSize) {
        return bad(c, `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
      }

      // Generate unique key for the file
      const ext = filename.split('.').pop() || 'bin';
      const key = `bugs/${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

      // For R2, we'll use direct upload through our worker
      // Return the upload endpoint and key
      return ok(c, {
        uploadUrl: `/api/upload/file`,
        key,
        publicUrl: `/api/media/${key}`
      });
    } catch (e: any) {
      console.error('Presigned URL error:', e);
      return c.json({ error: e.message }, 500);
    }
  });

  // Direct file upload to R2
  app.post('/api/upload/file', async (c) => {
    try {
      const userId = c.req.header('X-User-ID');
      if (!userId) return bad(c, 'Unauthorized');

      const formData = await c.req.formData();
      const file = formData.get('file') as File | null;
      const key = formData.get('key') as string | null;

      if (!file || !key) {
        return bad(c, 'File and key are required');
      }

      // Validate file type
      const allowedTypes = [
        'image/png', 'image/jpeg', 'image/gif', 'image/webp',
        'video/webm', 'video/mp4', 'video/quicktime'
      ];
      if (!allowedTypes.includes(file.type)) {
        return bad(c, 'Invalid file type');
      }

      // Validate key belongs to user
      if (!key.startsWith(`bugs/${userId}/`)) {
        return bad(c, 'Invalid upload key');
      }

      // Upload to R2
      const bucket = (c.env as any).BUG_REPORTS_BUCKET;
      if (!bucket) {
        return c.json({ error: 'Storage not configured' }, 500);
      }

      const arrayBuffer = await file.arrayBuffer();
      await bucket.put(key, arrayBuffer, {
        httpMetadata: {
          contentType: file.type
        }
      });

      return ok(c, {
        success: true,
        key,
        publicUrl: `/api/media/${key}`,
        size: file.size
      });
    } catch (e: any) {
      console.error('File upload error:', e);
      return c.json({ error: e.message }, 500);
    }
  });

  // Serve media files from R2
  app.get('/api/media/*', async (c) => {
    try {
      const key = c.req.path.replace('/api/media/', '');

      const bucket = (c.env as any).BUG_REPORTS_BUCKET;
      if (!bucket) {
        return c.json({ error: 'Storage not configured' }, 500);
      }

      const object = await bucket.get(key);
      if (!object) {
        return notFound(c, 'File not found');
      }

      const headers = new Headers();
      headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
      headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

      return new Response(object.body, { headers });
    } catch (e: any) {
      console.error('Media fetch error:', e);
      return c.json({ error: e.message }, 500);
    }
  });

  // =========================================
  // Bug Report Routes
  // =========================================

  // Submit a bug report (requires auth)
  app.post('/api/bugs', async (c) => {
    try {
      const userId = c.req.header('X-User-ID');
      if (!userId) return bad(c, 'Unauthorized');

      const userEntity = new UserEntity(c.env, userId);
      const user = await userEntity.getState();
      if (!user.id) return notFound(c, 'User not found');

      const body = await c.req.json() as BugReportSubmitRequest;
      const { title, description, severity, category, screenshotUrl, videoUrl, pageUrl, userAgent } = body;

      if (!title || !description) {
        return bad(c, 'Title and description are required');
      }

      const bugId = crypto.randomUUID();
      const now = Date.now();

      await BugReportEntity.create(c.env, {
        id: bugId,
        userId,
        userName: user.name,
        userEmail: user.email,
        title,
        description,
        severity: severity || 'medium',
        category: category || 'other',
        status: 'open',
        screenshotUrl: screenshotUrl || '',
        videoUrl: videoUrl || '',
        pageUrl: pageUrl || '',
        userAgent: userAgent || '',
        createdAt: now,
        updatedAt: now,
        adminNotes: ''
      });

      // Add to bug report index
      const bugIndex = new BugReportIndex(c.env);
      await bugIndex.add(bugId);

      return ok(c, await new BugReportEntity(c.env, bugId).getState());
    } catch (e: any) {
      console.error('Bug submission error:', e);
      return c.json({ error: e.message }, 500);
    }
  });

  // Get user's own bug reports (requires auth)
  app.get('/api/bugs/mine', async (c) => {
    try {
      const userId = c.req.header('X-User-ID');
      if (!userId) return bad(c, 'Unauthorized');

      const bugs = await BugReportEntity.findByUser(c.env, userId);
      return ok(c, bugs);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // Get all bug reports (admin only)
  app.get('/api/admin/bugs', async (c) => {
    try {
      const admin = await requireAdmin(c);
      if (!admin) return c.json({ error: 'Admin access required' }, 403);

      const bugs = await BugReportEntity.getAllSorted(c.env);
      return ok(c, bugs);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // Get bug reports by status (admin only)
  app.get('/api/admin/bugs/status/:status', async (c) => {
    try {
      const admin = await requireAdmin(c);
      if (!admin) return c.json({ error: 'Admin access required' }, 403);

      const status = c.req.param('status') as BugReport['status'];
      if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
        return bad(c, 'Invalid status');
      }

      const bugs = await BugReportEntity.findByStatus(c.env, status);
      return ok(c, bugs);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // Get single bug report (admin only)
  app.get('/api/admin/bugs/:bugId', async (c) => {
    try {
      const admin = await requireAdmin(c);
      if (!admin) return c.json({ error: 'Admin access required' }, 403);

      const bugId = c.req.param('bugId');
      const bugEntity = new BugReportEntity(c.env, bugId);
      const bug = await bugEntity.getState();

      if (!bug.id) return notFound(c, 'Bug report not found');
      return ok(c, bug);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // Update bug report status/notes (admin only)
  app.patch('/api/admin/bugs/:bugId', async (c) => {
    try {
      const admin = await requireAdmin(c);
      if (!admin) return c.json({ error: 'Admin access required' }, 403);

      const bugId = c.req.param('bugId');
      const bugEntity = new BugReportEntity(c.env, bugId);
      const bug = await bugEntity.getState();

      if (!bug.id) return notFound(c, 'Bug report not found');

      const updates = await c.req.json() as BugReportUpdateRequest;
      const patch: Partial<BugReport> = { updatedAt: Date.now() };

      if (updates.status) {
        if (!['open', 'in_progress', 'resolved', 'closed'].includes(updates.status)) {
          return bad(c, 'Invalid status');
        }
        patch.status = updates.status;
      }

      if (updates.adminNotes !== undefined) {
        patch.adminNotes = updates.adminNotes;
      }

      await bugEntity.patch(patch);
      return ok(c, await bugEntity.getState());
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });

  // Delete bug report (admin only)
  app.delete('/api/admin/bugs/:bugId', async (c) => {
    try {
      const admin = await requireAdmin(c);
      if (!admin) return c.json({ error: 'Admin access required' }, 403);

      const bugId = c.req.param('bugId');
      const bugEntity = new BugReportEntity(c.env, bugId);
      const bug = await bugEntity.getState();

      if (!bug.id) return notFound(c, 'Bug report not found');

      // Remove from index
      const bugIndex = new BugReportIndex(c.env);
      await bugIndex.remove(bugId);

      // Delete the entity
      await bugEntity.delete();

      return ok(c, { message: 'Bug report deleted successfully' });
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });
}