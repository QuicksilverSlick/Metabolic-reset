import { Hono } from "hono";
import type { Env } from './core-utils';
import { ok } from './core-utils';
import { UserEntity, ReferralLedgerEntity } from './entities';
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
      const { name, email, phone, referralCodeUsed } = body;
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
      await UserEntity.create(c.env, {
        id: userId,
        phone,
        name,
        email,
        role: 'challenger',
        captainId: captainId,
        referralCode: newReferralCode,
        timezone: 'America/New_York',
        hasScale: false,
        points: 0,
        createdAt: now,
        isActive: true
      });
      if (recruiterId && referrerRole) {
        const points = referrerRole === 'challenger' ? 10 : 1;
        await ReferralLedgerEntity.create(c.env, {
          id: crypto.randomUUID(), // Fix: Generate ID for ledger entry
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
}