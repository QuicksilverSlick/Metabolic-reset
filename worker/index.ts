import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { userRoutes } from './user-routes';
import { docsRouter } from './docs-api';
import { Env, GlobalDurableObject } from './core-utils';
// Export the Durable Object class so Cloudflare can find it
export { GlobalDurableObject };
// Initialize the Hono app
const app = new Hono<{ Bindings: Env }>();
// Middleware
app.use('*', logger());
// CORS configuration with proper origin validation
// Using dynamic origin validation instead of wildcard for security
app.use('/api/*', cors({
  origin: (origin) => {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) return origin;

    // Production domains - add your deployed domains here
    const allowedOrigins = [
      'https://reset-project-v2-ruu_cpqeknx4_w3qa19lk.russelledeming.workers.dev',
      'https://metabolicreset.com',
      'https://www.metabolicreset.com',
      // Development
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
    ];

    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      return origin;
    }

    // Allow all *.workers.dev subdomains for staging/preview
    if (origin.endsWith('.workers.dev')) {
      return origin;
    }

    // Reject unknown origins
    return null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-User-ID'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
}));
// Cache control middleware for API responses
// Prevents browsers from caching API responses by default (they contain user-specific data)
app.use('/api/*', async (c, next) => {
  await next();
  if (!c.res.headers.has('Cache-Control')) {
    c.res.headers.set('Cache-Control', 'no-store, max-age=0');
  }
});

// Register User Routes
userRoutes(app);
// Register Documentation API Routes (admin-only)
app.route('/api/docs', docsRouter);
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