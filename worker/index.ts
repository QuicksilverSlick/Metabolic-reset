import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { userRoutes } from './user-routes';
import { Env, GlobalDurableObject } from './core-utils';
// Export the Durable Object class so Cloudflare can find it
export { GlobalDurableObject };
// Initialize the Hono app
const app = new Hono<{ Bindings: Env }>();
// Middleware
app.use('*', logger());
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-User-ID'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
}));
// Register User Routes
userRoutes(app);
// Health Check Root
app.get('/', (c) => c.text('Worker is running'));
// Global Error Handling
app.onError((err, c) => {
  console.error(`[Uncaught Exception] ${err}`);
  return c.json({
    success: false,
    error: 'Internal Server Error',
    message: err instanceof Error ? err.message : String(err)
  }, 500);
});
app.notFound((c) => {
  return c.json({ success: false, error: 'Not Found' }, 404);
});
// Export the fetch handler
export default {
  fetch: app.fetch
} satisfies ExportedHandler<Env>;