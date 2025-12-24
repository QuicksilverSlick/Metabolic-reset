/**
 * AI-Agent-First Documentation Types
 *
 * These types extend the base documentation system with AI-specific
 * metadata and structures for enhanced bug analysis and documentation search.
 */

import type { DocSectionId, DocArticle, DocSection } from './types';

// ============================================================================
// AI CONTEXT TYPES
// ============================================================================

/**
 * Codebase file reference for AI context
 */
export interface CodeReference {
  filePath: string;
  lineStart?: number;
  lineEnd?: number;
  description: string;
  type: 'component' | 'api' | 'entity' | 'hook' | 'util' | 'type' | 'config';
}

/**
 * API endpoint documentation for AI context
 */
export interface APIEndpointDoc {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  authentication: 'none' | 'user' | 'admin';
  requestBody?: {
    type: string;
    description: string;
    fields: Array<{
      name: string;
      type: string;
      required: boolean;
      description: string;
    }>;
  };
  responseBody?: {
    type: string;
    description: string;
  };
  errorCodes: Array<{
    code: number;
    message: string;
    description: string;
  }>;
  examples?: Array<{
    name: string;
    request?: unknown;
    response?: unknown;
  }>;
  sourceFile: string;
  sourceLine: number;
}

/**
 * Component documentation for AI context
 */
export interface ComponentDoc {
  name: string;
  filePath: string;
  description: string;
  props: Array<{
    name: string;
    type: string;
    required: boolean;
    defaultValue?: string;
    description: string;
  }>;
  hooks: string[];
  usedBy: string[];
  uses: string[];
  stateManagement?: string;
  examples?: string[];
}

/**
 * Error code documentation for AI context
 */
export interface ErrorCodeDoc {
  code: string;
  httpStatus?: number;
  message: string;
  description: string;
  possibleCauses: string[];
  solutions: string[];
  relatedFiles: string[];
  relatedDocs: string[];
}

/**
 * Database entity documentation for AI context
 */
export interface EntityDoc {
  name: string;
  filePath: string;
  description: string;
  fields: Array<{
    name: string;
    type: string;
    description: string;
    indexed?: boolean;
    unique?: boolean;
  }>;
  methods: Array<{
    name: string;
    description: string;
    params: string;
    returns: string;
  }>;
  relatedEntities: string[];
  usedBy: string[];
}

// ============================================================================
// ENHANCED DOCUMENTATION ARTICLE
// ============================================================================

/**
 * Extended article with AI-specific metadata
 */
export interface AIDocArticle extends DocArticle {
  // Code references for AI to understand context
  codeReferences?: CodeReference[];

  // Related API endpoints
  apiEndpoints?: string[];  // paths like '/api/bugs', '/api/users/:id'

  // Related components
  components?: string[];    // component names like 'BugReportDialog', 'AdminPage'

  // Related entities
  entities?: string[];      // entity names like 'BugReportEntity', 'UserEntity'

  // Error codes this article addresses
  errorCodes?: string[];

  // Common symptoms/keywords for bug matching
  symptoms?: string[];

  // AI-generated summary (optional, can be auto-generated)
  aiSummary?: string;

  // Importance score for AI ranking (1-10)
  importance?: number;

  // Last verified against codebase
  lastVerified?: string;
}

/**
 * Extended section with AI-specific metadata
 */
export interface AIDocSection extends Omit<DocSection, 'articles'> {
  articles: AIDocArticle[];

  // AI context for this section
  aiContext?: string;

  // Related sections for cross-referencing
  relatedSections?: DocSectionId[];
}

// ============================================================================
// CODEBASE KNOWLEDGE GRAPH
// ============================================================================

/**
 * Node in the codebase knowledge graph
 */
export interface CodebaseNode {
  id: string;
  type: 'file' | 'component' | 'function' | 'api' | 'entity' | 'type';
  name: string;
  path: string;
  description?: string;
  connections: Array<{
    targetId: string;
    relationship: 'imports' | 'uses' | 'defines' | 'implements' | 'extends' | 'calls';
  }>;
}

/**
 * Full codebase knowledge graph for AI context
 */
export interface CodebaseGraph {
  version: string;
  generatedAt: string;
  nodes: CodebaseNode[];
  summary: {
    totalFiles: number;
    totalComponents: number;
    totalAPIs: number;
    totalEntities: number;
  };
}

// ============================================================================
// AI BUG ANALYSIS CONTEXT
// ============================================================================

/**
 * Context package for AI bug analysis
 */
export interface AIBugContext {
  // Bug details
  bugId: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  pageUrl: string;

  // Relevant documentation
  relevantDocs: Array<{
    sectionId: string;
    articleId: string;
    title: string;
    relevanceScore: number;
    excerpt: string;
  }>;

  // Relevant code
  relevantCode: Array<{
    filePath: string;
    description: string;
    content?: string;
  }>;

  // Relevant APIs
  relevantAPIs: APIEndpointDoc[];

  // Relevant components
  relevantComponents: ComponentDoc[];

  // Similar past bugs (if any)
  similarBugs?: Array<{
    bugId: string;
    title: string;
    resolution?: string;
    similarity: number;
  }>;

  // Platform context
  platformSummary: string;
}

// ============================================================================
// DOCUMENTATION INDEXING
// ============================================================================

/**
 * Search index entry for fast lookup
 */
export interface DocSearchIndex {
  id: string;                     // sectionId:articleId
  sectionId: string;
  articleId: string;
  title: string;
  description: string;
  tags: string[];
  keywords: string[];             // Extracted keywords for search
  codeRefs: string[];             // File paths mentioned
  apiRefs: string[];              // API paths mentioned
  lastUpdated: string;
  importance: number;
}

/**
 * Full documentation index for AI and search
 */
export interface DocumentationIndex {
  version: string;
  generatedAt: string;
  entries: DocSearchIndex[];
  tagCloud: Record<string, number>;
  fileIndex: Record<string, string[]>;  // filePath -> articleIds
  apiIndex: Record<string, string[]>;   // apiPath -> articleIds
}

// ============================================================================
// BEST PRACTICES GUIDANCE
// ============================================================================

/**
 * Best practices for Cloudflare D1/Durable Objects documentation storage
 */
export const STORAGE_BEST_PRACTICES = {
  D1_LIMITS: {
    maxDatabaseSize: '10GB',
    maxRowSize: '1MB',
    maxBindingsPerWorker: 50,
    recommendation: 'Store documentation metadata in D1, full content in KV or static files',
  },
  DURABLE_OBJECTS: {
    recommendation: 'Use for real-time collaboration on docs, not primary storage',
    maxMemory: '128MB per object',
    bestFor: 'Live editing sessions, real-time search suggestions',
  },
  KV: {
    maxValueSize: '25MB',
    maxKeySize: '512 bytes',
    recommendation: 'Good for caching compiled documentation',
    consistency: 'Eventually consistent (60s propagation)',
  },
  WORKERS_LIMITS: {
    maxWorkerSize: '10MB (free), 10MB (paid)',
    maxCPUTime: '50ms (free), 30s (paid)',
    recommendation: 'Lazy-load documentation sections to reduce worker size',
  },
};

/**
 * Best practices for AI API call budgeting
 */
export const AI_BUDGET_BEST_PRACTICES = {
  GEMINI_PRICING: {
    flash: {
      input: '$0.075 per 1M tokens',
      output: '$0.30 per 1M tokens',
    },
    pro: {
      input: '$1.25 per 1M tokens',
      output: '$5.00 per 1M tokens',
    },
  },
  RECOMMENDATIONS: {
    bugAnalysis: 'Use Gemini Flash for cost-effective analysis (~$0.001/bug)',
    caching: 'Cache AI analysis results, re-analyze only when bug is updated',
    batchProcessing: 'Batch multiple bugs for overnight analysis during off-peak',
    contextOptimization: 'Send only relevant doc sections, not full documentation',
    estimatedCostPerBug: {
      withScreenshot: '$0.002-0.005',
      withVideo: '$0.01-0.03',
      textOnly: '$0.0005-0.001',
    },
  },
  CLOUDFLARE_AI_GATEWAY: {
    benefits: [
      'Request caching (reduces duplicate API calls)',
      'Rate limiting (prevents budget overruns)',
      'Analytics (track usage and costs)',
      'Fallback providers (if primary fails)',
    ],
    setup: 'Configure in Cloudflare Dashboard > AI > Gateway',
  },
};
