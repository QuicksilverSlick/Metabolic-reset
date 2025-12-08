import { Hono } from "hono";
import type { Env } from './core-utils';
import { ok, bad, notFound } from './core-utils';
import { UserEntity, ReferralLedgerEntity, ReferralCodeMapping, CaptainIndex } from './entities';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/health', (c) => {
    return ok(c, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: 'v2.0.0-recovery'
    });
  });
  app.post('/api/create-payment-intent', async (c) => {
    // Cast env to any to access STRIPE_SECRET_KEY which is injected at runtime but not in the core Env type
    const stripeKey = (c.env as any).STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return c.json({ error: 'Stripe key not configured' }, 500);
    }
    try {
      const params = new URLSearchParams();
      params.append('amount', '2800'); // $28.00
      params.append('currency', 'usd');
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
        return c.json({ error: data.error?.message || 'Stripe error' }, 400);
      }
      return ok(c, { client_secret: data.client_secret });
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });
  app.post('/api/register', async (c) => {
    try {
      const body = await c.req.json() as any;
      const { name, email, phone, referralCodeUsed, role } = body;
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
      // Handle Referral Code Mapping (Moved from UserEntity.create)
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
        hasScale: false,
        points: 0,
        createdAt: now,
        isActive: true
      });
      // If user is a coach, add to CaptainIndex
      if (role === 'coach') {
        const captainIndex = new CaptainIndex(c.env);
        await captainIndex.add(userId);
      }
      if (recruiterId && referrerRole) {
        const points = referrerRole === 'challenger' ? 10 : 1;
        await ReferralLedgerEntity.create(c.env, {
          id: crypto.randomUUID(),
          recruiterId: recruiterId,
          newRecruitId: userId,
          pointsAmount: points,
          createdAt: now
        });
        await UserEntity.addPoints(c.env, recruiterId, points);
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
  // List all captains
  app.get('/api/captains', async (c) => {
    try {
      const captainIndex = new CaptainIndex(c.env);
      const captainIds = await captainIndex.list();
      // Fetch details for each captain
      // Limit to 20 for now to prevent massive fetches, though list() is paginated in Index
      // For a real app we'd want pagination here too
      const limitedIds = captainIds.slice(0, 50);
      const captains = await Promise.all(limitedIds.map(async (id) => {
        const user = await new UserEntity(c.env, id).getState();
        // Only return necessary public info
        return {
          id: user.id,
          name: user.name,
          role: user.role,
          referralCode: user.referralCode
        };
      }));
      // Filter out any nulls or non-coaches (just in case index is stale)
      const validCaptains = captains.filter(c => c.id && c.role === 'coach');
      return ok(c, validCaptains);
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });
  // Assign captain to orphan
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
      // If user already has a captain (and it's not themselves if they are a coach), maybe warn?
      // For now, we allow reassignment as per "Orphan Management" flow
      await userEntity.patch({ captainId });
      return ok(c, await userEntity.getState());
    } catch (e: any) {
      return c.json({ error: e.message }, 500);
    }
  });
}