import { Hono } from "hono";
import type { Env } from './core-utils';
import { ok } from './core-utils';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/health', (c) => {
    return ok(c, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: 'v2.0.0-recovery'
    });
  });
}