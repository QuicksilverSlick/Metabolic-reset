/**
 * Documentation API Endpoints
 *
 * Provides API access to the documentation system for:
 * - Frontend documentation viewer
 * - AI bug analysis context retrieval
 * - Documentation search
 * - API reference lookup
 *
 * All endpoints are admin-only for security.
 */

import { Hono } from 'hono';
import type { Env } from './core-utils';
import { UserEntity } from './entities';
import {
  platformDocs,
  apiEndpoints,
  errorCodes,
  searchDocs,
  getRelevantDocsContext,
  getFullDocsContext,
  PLATFORM_CONTEXT,
} from './docs-context-enhanced';

// Create docs router
export const docsRouter = new Hono<{ Bindings: Env }>();

// Admin-only middleware for docs API
docsRouter.use('*', async (c, next) => {
  const userId = c.req.header('X-User-ID');
  if (!userId) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  const userEntity = new UserEntity(c.env, userId);
  const user = await userEntity.getState();
  if (!user.id) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }
  if (!user.isAdmin) {
    return c.json({ success: false, error: 'Admin access required' }, 403);
  }

  await next();
});

/**
 * GET /api/docs
 * Get all documentation sections and articles
 */
docsRouter.get('/', async (c) => {
  return c.json({
    success: true,
    data: {
      sections: platformDocs.map(section => ({
        id: section.id,
        title: section.title,
        articleCount: section.articles.length,
        articles: section.articles.map(article => ({
          id: article.id,
          title: article.title,
          tags: article.tags,
          importance: article.importance || 5,
        })),
      })),
      totalArticles: platformDocs.reduce((sum, s) => sum + s.articles.length, 0),
      lastUpdated: new Date().toISOString(),
    },
  });
});

/**
 * GET /api/docs/sections/:sectionId
 * Get a specific documentation section with full articles
 */
docsRouter.get('/sections/:sectionId', async (c) => {
  const sectionId = c.req.param('sectionId');
  const section = platformDocs.find(s => s.id === sectionId);

  if (!section) {
    return c.json({ success: false, error: 'Section not found' }, 404);
  }

  return c.json({
    success: true,
    data: section,
  });
});

/**
 * GET /api/docs/sections/:sectionId/articles/:articleId
 * Get a specific article with full content
 */
docsRouter.get('/sections/:sectionId/articles/:articleId', async (c) => {
  const sectionId = c.req.param('sectionId');
  const articleId = c.req.param('articleId');

  const section = platformDocs.find(s => s.id === sectionId);
  if (!section) {
    return c.json({ success: false, error: 'Section not found' }, 404);
  }

  const article = section.articles.find(a => a.id === articleId);
  if (!article) {
    return c.json({ success: false, error: 'Article not found' }, 404);
  }

  return c.json({
    success: true,
    data: {
      section: {
        id: section.id,
        title: section.title,
      },
      article,
    },
  });
});

/**
 * GET /api/docs/search?q=query
 * Search documentation
 */
docsRouter.get('/search', async (c) => {
  const query = c.req.query('q') || '';

  if (query.length < 2) {
    return c.json({
      success: true,
      data: {
        query,
        results: [],
        totalResults: 0,
      },
    });
  }

  const results = searchDocs(query);

  return c.json({
    success: true,
    data: {
      query,
      results,
      totalResults: results.length,
    },
  });
});

/**
 * GET /api/docs/api-reference
 * Get API endpoint documentation
 */
docsRouter.get('/api-reference', async (c) => {
  const auth = c.req.query('auth'); // Filter by auth level
  const method = c.req.query('method'); // Filter by HTTP method

  let endpoints = [...apiEndpoints];

  if (auth) {
    endpoints = endpoints.filter(e => e.authentication === auth);
  }

  if (method) {
    endpoints = endpoints.filter(e => e.method === method.toUpperCase());
  }

  return c.json({
    success: true,
    data: {
      endpoints,
      totalEndpoints: endpoints.length,
      byMethod: {
        GET: endpoints.filter(e => e.method === 'GET').length,
        POST: endpoints.filter(e => e.method === 'POST').length,
        PUT: endpoints.filter(e => e.method === 'PUT').length,
        PATCH: endpoints.filter(e => e.method === 'PATCH').length,
        DELETE: endpoints.filter(e => e.method === 'DELETE').length,
      },
      byAuth: {
        none: endpoints.filter(e => e.authentication === 'none').length,
        user: endpoints.filter(e => e.authentication === 'user').length,
        admin: endpoints.filter(e => e.authentication === 'admin').length,
      },
    },
  });
});

/**
 * GET /api/docs/error-codes
 * Get error code documentation
 */
docsRouter.get('/error-codes', async (c) => {
  return c.json({
    success: true,
    data: {
      errorCodes,
      totalCodes: errorCodes.length,
    },
  });
});

/**
 * GET /api/docs/error-codes/:code
 * Get a specific error code
 */
docsRouter.get('/error-codes/:code', async (c) => {
  const code = c.req.param('code');
  const errorCode = errorCodes.find(e => e.code === code);

  if (!errorCode) {
    return c.json({ success: false, error: 'Error code not found' }, 404);
  }

  return c.json({
    success: true,
    data: errorCode,
  });
});

/**
 * POST /api/docs/ai-context
 * Get AI-optimized documentation context for a specific topic
 * Used by AI bug analysis to get relevant context
 */
docsRouter.post('/ai-context', async (c) => {
  try {
    const body = await c.req.json<{
      pageUrl?: string;
      category?: string;
      description?: string;
      fullContext?: boolean;
    }>();

    let context: string;

    if (body.fullContext) {
      context = getFullDocsContext();
    } else {
      context = getRelevantDocsContext(
        body.pageUrl || '',
        body.category || '',
        body.description || ''
      );
    }

    return c.json({
      success: true,
      data: {
        context,
        contextLength: context.length,
        estimatedTokens: Math.ceil(context.length / 4), // Rough token estimate
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get AI context',
    }, 500);
  }
});

/**
 * GET /api/docs/platform-context
 * Get the platform overview context
 */
docsRouter.get('/platform-context', async (c) => {
  return c.json({
    success: true,
    data: {
      context: PLATFORM_CONTEXT,
      sections: platformDocs.map(s => s.id),
    },
  });
});

/**
 * GET /api/docs/stats
 * Get documentation statistics
 */
docsRouter.get('/stats', async (c) => {
  const allArticles = platformDocs.flatMap(s => s.articles);
  const allTags = new Set<string>();
  allArticles.forEach(a => a.tags.forEach(t => allTags.add(t)));

  // Count articles by importance
  const byImportance: Record<string, number> = {};
  allArticles.forEach(a => {
    const imp = String(a.importance || 5);
    byImportance[imp] = (byImportance[imp] || 0) + 1;
  });

  // Count articles with code references
  const withCodeRefs = allArticles.filter(a => a.codeReferences && a.codeReferences.length > 0).length;
  const withAPIRefs = allArticles.filter(a => a.apiEndpoints && a.apiEndpoints.length > 0).length;
  const withErrorCodes = allArticles.filter(a => a.errorCodes && a.errorCodes.length > 0).length;

  return c.json({
    success: true,
    data: {
      sections: platformDocs.length,
      articles: allArticles.length,
      tags: allTags.size,
      apiEndpoints: apiEndpoints.length,
      errorCodes: errorCodes.length,
      articlesWithCodeRefs: withCodeRefs,
      articlesWithAPIRefs: withAPIRefs,
      articlesWithErrorCodes: withErrorCodes,
      byImportance,
      topTags: Array.from(allTags).slice(0, 20),
    },
  });
});

export default docsRouter;
