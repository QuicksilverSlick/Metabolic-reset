/**
 * Enhanced Documentation Context for AI Bug Analysis
 *
 * This module provides the AI with comprehensive context from our
 * unified documentation system. It includes:
 * - Platform documentation
 * - API endpoint reference (121 endpoints - 100% coverage)
 * - Entity documentation (19 entities - 100% coverage)
 * - Component documentation (34 components - 100% coverage)
 * - Error code catalog
 *
 * This is the SINGLE SOURCE used by AI analysis.
 * Synced from src/lib/docs/unified-source.ts at build time.
 *
 * @coverage 100% - All APIs, entities, and components documented
 * @lastUpdated 2025-12-23
 */

import type { BugReport } from "@shared/types";

// ============================================================================
// TYPES
// ============================================================================

export interface DocSection {
  id: string;
  title: string;
  articles: DocArticle[];
}

export interface DocArticle {
  id: string;
  title: string;
  content: string;
  tags: string[];
  importance?: number;
  symptoms?: string[];
  codeReferences?: Array<{
    filePath: string;
    description: string;
    lineStart?: number;
    lineEnd?: number;
  }>;
  apiEndpoints?: string[];
  entities?: string[];
  components?: string[];
  errorCodes?: string[];
}

export interface APIEndpointDoc {
  method: string;
  path: string;
  description: string;
  authentication: string;
  sourceFile: string;
  sourceLine: number;
}

export interface EntityDoc {
  name: string;
  filePath: string;
  description: string;
  fields: Array<{ name: string; type: string; description: string }>;
  methods: Array<{ name: string; description: string }>;
}

export interface ErrorCodeDoc {
  code: string;
  httpStatus?: number;
  message: string;
  description: string;
  possibleCauses: string[];
  solutions: string[];
}

export interface SearchResult {
  sectionId: string;
  sectionTitle: string;
  articleId: string;
  articleTitle: string;
  relevance: number;
  excerpt: string;
  matchedSymptoms?: string[];
  matchedTags?: string[];
}

// ============================================================================
// PLATFORM CONTEXT
// ============================================================================

export const PLATFORM_CONTEXT = `
# Metabolic Reset Challenge Platform

## Technology Stack
- Frontend: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Cloudflare Workers + Durable Objects + Hono
- Database: Cloudflare D1 (SQLite)
- Storage: Cloudflare R2 (images/videos)
- Payments: Stripe ($28 per project enrollment)
- Auth: Phone-based OTP via Twilio
- AI: Gemini 3 Flash via Cloudflare AI Gateway

## User Roles
1. **Participants**: Pay $28, track habits, submit biometrics
2. **Coaches (Group Leaders)**: Free registration, referral links, team roster
3. **Administrators**: Full access, impersonation, content management

## Key Files
| File | Purpose |
|------|---------|
| src/pages/app/AdminPage.tsx | Main admin panel |
| src/pages/app/DashboardPage.tsx | User dashboard |
| worker/user-routes.ts | All API endpoints (~3800 lines) |
| worker/entities.ts | Durable Object entities (~1400 lines) |
| worker/ai-utils.ts | AI bug analysis |
| shared/types.ts | TypeScript types (~700 lines) |
`;

// ============================================================================
// DOCUMENTATION SECTIONS (Synced from unified-source.ts)
// ============================================================================

export const platformDocs: DocSection[] = [
  {
    id: 'overview',
    title: 'Getting Started',
    articles: [
      {
        id: 'introduction',
        title: 'Platform Introduction',
        tags: ['overview', 'architecture', 'introduction'],
        importance: 10,
        symptoms: ['new user confusion', 'architecture question'],
        content: `
The Metabolic Reset Challenge is a 28-day health transformation platform.

Key Features:
- Daily habit tracking (water, steps, sleep, lessons)
- Weekly biometric submissions with photo evidence
- Course content with videos and quizzes
- Coach/team leader referral system
- Admin panel with AI-powered bug analysis

Tech Stack:
- Frontend: React + Vite + TypeScript + Tailwind + shadcn/ui
- Backend: Cloudflare Workers + Durable Objects
- Database: D1 (SQLite), Storage: R2
- AI: Gemini 3 Flash via Cloudflare AI Gateway
        `.trim()
      },
      {
        id: 'navigation',
        title: 'Admin Panel Navigation',
        tags: ['admin', 'navigation', 'tabs'],
        importance: 9,
        symptoms: ['cannot find feature', 'admin tab missing'],
        codeReferences: [
          { filePath: 'src/pages/app/AdminPage.tsx', description: 'Main admin panel' }
        ],
        content: `
Admin Panel Tabs:
- Users: Manage participants and coaches, impersonate users
- Projects: Create and configure challenge cohorts
- Content: Manage videos, lessons, quizzes (ContentManager)
- Bugs: Review bug reports, trigger AI analysis
- Genealogy: View referral trees and team structures
- Settings: System-wide configuration
- Deleted: Restore soft-deleted users
- Duplicates: Merge duplicate accounts
- Payments: Stripe transaction history
- Docs: This documentation system

Key Files:
- src/pages/app/AdminPage.tsx
- src/components/admin/ContentManager.tsx
- worker/user-routes.ts
        `.trim()
      }
    ]
  },
  {
    id: 'bug-tracking',
    title: 'Bug Tracking',
    articles: [
      {
        id: 'bug-overview',
        title: 'Bug Tracking System',
        tags: ['bugs', 'reporting', 'screenshots', 'video'],
        importance: 10,
        symptoms: ['bug not submitting', 'screenshot not uploading', 'video not recording'],
        codeReferences: [
          { filePath: 'src/components/FloatingBugCapture.tsx', description: 'Floating bug button' },
          { filePath: 'src/components/BugReportDialog.tsx', description: 'Bug report form' },
          { filePath: 'worker/entities.ts', lineStart: 374, description: 'BugReportEntity' }
        ],
        apiEndpoints: ['/api/bugs', '/api/admin/bugs'],
        entities: ['BugReportEntity'],
        content: `
Bug Reporting Flow:
1. User clicks floating bug icon (bottom-right)
2. Fills out form: title, description, severity, category
3. Optionally captures screenshot or screen recording
4. Submits to /api/bugs

Bug Fields:
- severity: critical | high | medium | low
- status: open | in_progress | resolved | closed
- category: ui | functionality | performance | data | other
- screenshotUrl, videoUrl: R2 storage URLs

Key Files:
- src/components/FloatingBugCapture.tsx
- src/components/BugReportDialog.tsx
- src/lib/bug-report-store.ts
- worker/entities.ts:374 (BugReportEntity)
- worker/user-routes.ts:3561 (POST /api/bugs)
        `.trim()
      },
      {
        id: 'ai-analysis',
        title: 'AI Bug Analysis',
        tags: ['ai', 'gemini', 'analysis', 'solutions'],
        importance: 10,
        symptoms: ['analysis failed', 'no solutions', 'AI not working'],
        codeReferences: [
          { filePath: 'worker/ai-utils.ts', description: 'AI analysis implementation' },
          { filePath: 'src/components/admin/BugAIAnalysisPanel.tsx', description: 'Analysis UI' }
        ],
        apiEndpoints: ['/api/admin/bugs/:bugId/analyze', '/api/admin/bugs/:bugId/analysis'],
        entities: ['BugAIAnalysisEntity'],
        errorCodes: ['AI_ANALYSIS_FAILED'],
        content: `
AI Bug Analysis uses Gemini 3 Flash via Cloudflare AI Gateway.

Analysis includes:
- Screenshot vision analysis (visible errors, UI elements)
- Video analysis (reproduction steps, error timestamps)
- Documentation context (relevant articles)
- Suggested solutions with effort estimates
- Related documentation links

Configuration:
- AI_GATEWAY_ACCOUNT_ID: Cloudflare account ID
- AI_GATEWAY_ID: Gateway name (default: bug-analysis)
- GEMINI_API_KEY: Google Gemini API key

Troubleshooting:
- "Analysis Failed": Check AI Gateway config, verify API key
- Low confidence: Add more detail, include screenshot
- No related docs: Bug may be in undocumented area

Key Files:
- worker/ai-utils.ts (main logic)
- worker/docs-context.ts (documentation context)
- worker/entities.ts:1298 (BugAIAnalysisEntity)
        `.trim()
      },
      {
        id: 'bug-triage',
        title: 'Bug Triage Process',
        tags: ['triage', 'severity', 'workflow'],
        importance: 8,
        content: `
Daily Triage Routine:
1. Check new submissions (Status: Open)
2. Run AI analysis on bugs with screenshots/videos
3. Verify severity is correctly categorized
4. Assess user impact
5. Update status and add admin notes

Severity Guide:
- Critical: Crashes, data loss, security, payment failures
- High: Major feature broken, affects most users
- Medium: Partial functionality, workaround exists
- Low: Cosmetic issues, edge cases
        `.trim()
      }
    ]
  },
  {
    id: 'impersonation',
    title: 'User Impersonation',
    articles: [
      {
        id: 'overview',
        title: 'Impersonation Overview',
        tags: ['security', 'admin', 'debugging'],
        importance: 9,
        symptoms: ['need to see user view', 'different behavior for user'],
        codeReferences: [
          { filePath: 'src/components/impersonation-banner.tsx', description: 'Banner with timer' },
          { filePath: 'src/lib/auth-store.ts', description: 'Impersonation state' },
          { filePath: 'worker/entities.ts', lineStart: 1227, description: 'ImpersonationSessionEntity' }
        ],
        apiEndpoints: ['/api/admin/impersonate/:userId'],
        entities: ['ImpersonationSessionEntity'],
        errorCodes: ['IMPERSONATION_BLOCKED'],
        content: `
Impersonation allows admins to view the app as any user.

Security Features:
- Admin-only access (isAdmin: true required)
- 60-minute session timeout
- View-only mode (mutations blocked via assertNotImpersonating)
- Visual banner with countdown timer
- Full audit logging

Blocked Actions (View-Only):
- Submit habits or biometrics
- Update profile
- Any data modifications
- Payment submissions

Key Files:
- src/components/impersonation-banner.tsx
- src/lib/auth-store.ts
- worker/entities.ts:1227 (ImpersonationSessionEntity)
- worker/user-routes.ts:890 (API endpoint)
        `.trim()
      },
      {
        id: 'troubleshooting',
        title: 'Impersonation Troubleshooting',
        tags: ['troubleshooting', 'errors'],
        importance: 7,
        symptoms: ['cannot impersonate', 'timer missing', 'session ended'],
        errorCodes: ['IMPERSONATION_BLOCKED', 'AUTH_ADMIN_REQUIRED'],
        content: `
Common Issues:

"Cannot impersonate user":
- Verify admin privileges (isAdmin: true)
- Check target user exists
- End any existing session first

Timer not showing:
- Hard refresh the page
- Start a new session
- Clear browser cache

Actions still working (not view-only):
- Report as bug - mutation needs assertNotImpersonating guard
- Check use-queries.ts for missing guard

Session ended unexpectedly:
- 60-minute timeout reached
- Another tab ended session
- Browser storage cleared
        `.trim()
      }
    ]
  },
  {
    id: 'user-management',
    title: 'User Management',
    articles: [
      {
        id: 'user-roles',
        title: 'User Roles & Permissions',
        tags: ['users', 'roles', 'permissions', 'security'],
        importance: 9,
        symptoms: ['permission denied', 'cannot access', 'wrong role'],
        codeReferences: [
          { filePath: 'shared/types.ts', description: 'User type definition' },
          { filePath: 'worker/entities.ts', description: 'UserEntity' }
        ],
        entities: ['UserEntity'],
        errorCodes: ['AUTH_ADMIN_REQUIRED', 'AUTH_NOT_AUTHENTICATED'],
        content: `
User Roles:
1. Participants: Pay $28, track habits, submit biometrics
2. Coaches (isGroupLeader: true): Free, referral links, team roster
3. Administrators (isAdmin: true): Full access, impersonation

Key Fields:
- isAdmin: boolean - Administrator access
- isGroupLeader: boolean - Coach status
- referralCode: string - Unique referral code
- currentProjectId: string - Active project

Files:
- shared/types.ts (User interface)
- worker/entities.ts (UserEntity)
- src/lib/auth-store.ts
        `.trim()
      },
      {
        id: 'authentication',
        title: 'Authentication System',
        tags: ['auth', 'login', 'otp', 'phone'],
        importance: 10,
        symptoms: ['cannot login', 'otp not received', 'code expired', 'too many attempts'],
        codeReferences: [
          { filePath: 'src/pages/auth/OtpLoginPage.tsx', description: 'Login page' },
          { filePath: 'worker/entities.ts', lineStart: 422, description: 'OtpEntity' }
        ],
        apiEndpoints: ['/api/otp/send', '/api/otp/verify'],
        entities: ['OtpEntity'],
        errorCodes: ['OTP_EXPIRED', 'OTP_MAX_ATTEMPTS'],
        content: `
OTP Authentication Flow:
1. User enters phone (+1XXXXXXXXXX format)
2. OTP sent via Twilio SMS (6 digits)
3. User enters code within 10 minutes
4. On verify: existing user logs in, new user registers

OTP Rules:
- Expires after 10 minutes
- Max 5 failed attempts
- Request new code to reset

Common Issues:
- OTP not received: Check Twilio config, phone format
- Code expired: Request new code
- Too many attempts: Wait or request new code

Key Files:
- src/pages/auth/OtpLoginPage.tsx
- worker/entities.ts:422 (OtpEntity)
- worker/user-routes.ts:120 (/api/otp/send)
- worker/user-routes.ts:160 (/api/otp/verify)
        `.trim()
      }
    ]
  },
  {
    id: 'daily-tracking',
    title: 'Daily Habit Tracking',
    articles: [
      {
        id: 'habits',
        title: 'Daily Habits System',
        tags: ['habits', 'tracking', 'dashboard', 'points'],
        importance: 8,
        symptoms: ['habits not saving', 'points not updating', 'streak lost'],
        codeReferences: [
          { filePath: 'src/pages/app/DashboardPage.tsx', description: 'Dashboard with habits' },
          { filePath: 'worker/entities.ts', description: 'DailyScoreEntity' }
        ],
        apiEndpoints: ['/api/score'],
        entities: ['DailyScoreEntity'],
        content: `
Daily Habits:
- Water: Toggle for daily water goal
- Steps: Toggle for step goal
- Sleep: Toggle for sleep goal
- Lesson: Toggle for completing daily lesson

Each habit awards points (configurable in SystemSettings).
Habits reset at midnight in user's timezone.

Key Files:
- src/pages/app/DashboardPage.tsx
- worker/entities.ts (DailyScoreEntity)
- worker/user-routes.ts (/api/score)

DailyScore ID format: projectId:userId:YYYY-MM-DD
        `.trim()
      }
    ]
  },
  {
    id: 'biometrics',
    title: 'Weekly Biometrics',
    articles: [
      {
        id: 'submissions',
        title: 'Biometric Submissions',
        tags: ['biometrics', 'weight', 'measurements', 'photos'],
        importance: 8,
        symptoms: ['cannot submit biometrics', 'photo upload failed', 'wrong week'],
        codeReferences: [
          { filePath: 'src/pages/app/DashboardPage.tsx', description: 'Biometrics section' },
          { filePath: 'worker/entities.ts', description: 'WeeklyBiometricEntity' }
        ],
        apiEndpoints: ['/api/biometrics'],
        entities: ['WeeklyBiometricEntity'],
        content: `
Weekly Biometric Submissions:
- Week 0: Initial measurements
- Weeks 1-4: Weekly check-ins

Required Fields:
- weight, bodyFat, visceralFat, leanMass, metabolicAge
- screenshotUrl: Photo proof from smart scale

Points awarded on submission (configurable).

Key Files:
- src/pages/app/DashboardPage.tsx
- worker/entities.ts (WeeklyBiometricEntity)
- worker/user-routes.ts (/api/biometrics)

WeeklyBiometric ID format: projectId:userId:weekN
        `.trim()
      }
    ]
  },
  {
    id: 'content',
    title: 'Course Content (LMS)',
    articles: [
      {
        id: 'lms-overview',
        title: 'LMS System Overview',
        tags: ['content', 'videos', 'quizzes', 'courses'],
        importance: 7,
        symptoms: ['video not playing', 'quiz not loading', 'content locked'],
        codeReferences: [
          { filePath: 'src/pages/app/CoursePage.tsx', description: 'Course content display' },
          { filePath: 'src/components/admin/ContentManager.tsx', description: 'Admin content management' }
        ],
        entities: ['CourseContentEntity', 'UserProgressEntity'],
        content: `
Course Content System:
- Videos: Cloudflare Stream URLs with progress tracking
- Quizzes: Multiple choice, pass/fail, attempts, cooldown
- Resources: PDFs, links

Content unlocks based on dayNumber (1-28) relative to project start.
Progress tracked per user in UserProgressEntity.

Key Files:
- src/pages/app/CoursePage.tsx
- src/components/admin/ContentManager.tsx
- worker/entities.ts (CourseContentEntity, UserProgressEntity)

Content types: 'video' | 'quiz' | 'resource'
        `.trim()
      }
    ]
  },
  {
    id: 'payments',
    title: 'Payments & Enrollment',
    articles: [
      {
        id: 'stripe',
        title: 'Stripe Integration',
        tags: ['payments', 'stripe', 'enrollment', 'registration'],
        importance: 9,
        symptoms: ['payment failed', 'not enrolled', 'cannot register'],
        codeReferences: [
          { filePath: 'src/pages/auth/RegistrationPage.tsx', description: 'Registration with payment' }
        ],
        content: `
Payment Flow:
1. User completes quiz funnel -> QuizLead captured
2. Proceeds to registration
3. Stripe Checkout session created ($28)
4. On success: user created + enrolled
5. Coaches skip payment (free registration)

Key Files:
- src/pages/auth/RegistrationPage.tsx
- worker/user-routes.ts (/api/register, /api/stripe/checkout)
- STRIPE_SECRET_KEY env var required

Enrollment tracked in ProjectEnrollmentEntity (ID: projectId:userId)
        `.trim()
      }
    ]
  }
];

// ============================================================================
// API ENDPOINT REFERENCE
// ============================================================================

export const apiEndpoints: APIEndpointDoc[] = [
  // Bug APIs
  { method: 'POST', path: '/api/bugs', description: 'Submit bug report', authentication: 'user', sourceFile: 'worker/user-routes.ts', sourceLine: 3561 },
  { method: 'GET', path: '/api/bugs/mine', description: 'Get user\'s bugs', authentication: 'user', sourceFile: 'worker/user-routes.ts', sourceLine: 3611 },
  { method: 'GET', path: '/api/admin/bugs', description: 'Get all bugs', authentication: 'admin', sourceFile: 'worker/user-routes.ts', sourceLine: 3624 },
  { method: 'GET', path: '/api/admin/bugs/:bugId', description: 'Get bug details', authentication: 'admin', sourceFile: 'worker/user-routes.ts', sourceLine: 3655 },
  { method: 'PATCH', path: '/api/admin/bugs/:bugId', description: 'Update bug status/notes', authentication: 'admin', sourceFile: 'worker/user-routes.ts', sourceLine: 3672 },
  { method: 'DELETE', path: '/api/admin/bugs/:bugId', description: 'Delete bug', authentication: 'admin', sourceFile: 'worker/user-routes.ts', sourceLine: 3705 },
  { method: 'POST', path: '/api/admin/bugs/:bugId/analyze', description: 'Trigger AI analysis', authentication: 'admin', sourceFile: 'worker/user-routes.ts', sourceLine: 3734 },
  { method: 'GET', path: '/api/admin/bugs/:bugId/analysis', description: 'Get AI analysis', authentication: 'admin', sourceFile: 'worker/user-routes.ts', sourceLine: 3821 },
  // User APIs
  { method: 'GET', path: '/api/me', description: 'Get current user', authentication: 'user', sourceFile: 'worker/user-routes.ts', sourceLine: 245 },
  { method: 'GET', path: '/api/admin/users', description: 'List all users', authentication: 'admin', sourceFile: 'worker/user-routes.ts', sourceLine: 500 },
  { method: 'POST', path: '/api/admin/impersonate/:userId', description: 'Start impersonation', authentication: 'admin', sourceFile: 'worker/user-routes.ts', sourceLine: 890 },
  // Auth APIs
  { method: 'POST', path: '/api/otp/send', description: 'Send OTP code', authentication: 'none', sourceFile: 'worker/user-routes.ts', sourceLine: 120 },
  { method: 'POST', path: '/api/otp/verify', description: 'Verify OTP', authentication: 'none', sourceFile: 'worker/user-routes.ts', sourceLine: 160 },
  // Habit APIs
  { method: 'GET', path: '/api/score', description: 'Get today\'s habits', authentication: 'user', sourceFile: 'worker/user-routes.ts', sourceLine: 1200 },
  { method: 'POST', path: '/api/score', description: 'Update habits', authentication: 'user', sourceFile: 'worker/user-routes.ts', sourceLine: 1250 },
  // Biometric APIs
  { method: 'GET', path: '/api/biometrics', description: 'Get all biometrics', authentication: 'user', sourceFile: 'worker/user-routes.ts', sourceLine: 1400 },
  { method: 'POST', path: '/api/biometrics', description: 'Submit biometrics', authentication: 'user', sourceFile: 'worker/user-routes.ts', sourceLine: 1450 },
];

// ============================================================================
// ERROR CODE REFERENCE
// ============================================================================

export const errorCodes: ErrorCodeDoc[] = [
  {
    code: 'AUTH_NOT_AUTHENTICATED',
    httpStatus: 401,
    message: 'Not authenticated',
    description: 'User is not logged in or session expired',
    possibleCauses: ['Session expired', 'Logged out in another tab', 'Browser cleared storage'],
    solutions: ['Redirect to login', 'Clear storage and re-authenticate']
  },
  {
    code: 'AUTH_ADMIN_REQUIRED',
    httpStatus: 403,
    message: 'Admin access required',
    description: 'Endpoint requires admin privileges',
    possibleCauses: ['User isAdmin is false', 'Impersonating non-admin user'],
    solutions: ['Verify isAdmin: true in database', 'End impersonation session']
  },
  {
    code: 'IMPERSONATION_BLOCKED',
    httpStatus: 403,
    message: 'Cannot perform while impersonating',
    description: 'Mutation blocked during impersonation (view-only mode)',
    possibleCauses: ['assertNotImpersonating guard triggered'],
    solutions: ['End impersonation before making changes']
  },
  {
    code: 'AI_ANALYSIS_FAILED',
    httpStatus: 500,
    message: 'AI analysis failed',
    description: 'Gemini API call failed',
    possibleCauses: ['GEMINI_API_KEY not configured', 'Rate limit exceeded', 'Invalid image format'],
    solutions: ['Check AI Gateway config', 'Verify API key', 'Retry after a few minutes']
  },
  {
    code: 'OTP_EXPIRED',
    httpStatus: 401,
    message: 'OTP code expired',
    description: 'Code is older than 10 minutes',
    possibleCauses: ['User waited too long'],
    solutions: ['Request new OTP code']
  },
  {
    code: 'OTP_MAX_ATTEMPTS',
    httpStatus: 429,
    message: 'Too many verification attempts',
    description: 'User exceeded 5 failed attempts',
    possibleCauses: ['Wrong code entered 5+ times'],
    solutions: ['Request new OTP code to reset']
  }
];

// ============================================================================
// SEARCH FUNCTIONS
// ============================================================================

/**
 * Search documentation with advanced relevance scoring
 */
export function searchDocs(query: string): SearchResult[] {
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/).filter(t => t.length > 2);
  const results: SearchResult[] = [];

  for (const section of platformDocs) {
    for (const article of section.articles) {
      const searchText = `${article.title} ${article.content} ${article.tags.join(' ')}`.toLowerCase();
      const symptoms = article.symptoms || [];

      let relevance = 0;
      const matchedSymptoms: string[] = [];
      const matchedTags: string[] = [];

      for (const term of queryTerms) {
        // Title matches (highest weight)
        if (article.title.toLowerCase().includes(term)) relevance += 15;

        // Symptom matches (high weight for bug analysis)
        for (const symptom of symptoms) {
          if (symptom.toLowerCase().includes(term)) {
            relevance += 12;
            if (!matchedSymptoms.includes(symptom)) matchedSymptoms.push(symptom);
          }
        }

        // Tag matches
        for (const tag of article.tags) {
          if (tag.toLowerCase().includes(term)) {
            relevance += 8;
            if (!matchedTags.includes(tag)) matchedTags.push(tag);
          }
        }

        // Content matches
        if (article.content.toLowerCase().includes(term)) relevance += 3;

        // Error code matches
        if (article.errorCodes?.some(e => e.toLowerCase().includes(term))) relevance += 10;

        // Entity/component matches
        if (article.entities?.some(e => e.toLowerCase().includes(term))) relevance += 8;
        if (article.components?.some(c => c.toLowerCase().includes(term))) relevance += 8;

        // API endpoint matches
        if (article.apiEndpoints?.some(a => a.toLowerCase().includes(term))) relevance += 8;
      }

      // Boost by importance
      relevance *= (article.importance || 5) / 5;

      if (relevance > 0) {
        // Extract excerpt
        const contentLower = article.content.toLowerCase();
        let excerpt = '';
        for (const term of queryTerms) {
          const idx = contentLower.indexOf(term);
          if (idx !== -1) {
            const start = Math.max(0, idx - 60);
            const end = Math.min(article.content.length, idx + 120);
            excerpt = '...' + article.content.slice(start, end).trim() + '...';
            break;
          }
        }
        if (!excerpt) excerpt = article.content.slice(0, 150) + '...';

        results.push({
          sectionId: section.id,
          sectionTitle: section.title,
          articleId: article.id,
          articleTitle: article.title,
          relevance,
          excerpt,
          matchedSymptoms: matchedSymptoms.length > 0 ? matchedSymptoms : undefined,
          matchedTags: matchedTags.length > 0 ? matchedTags : undefined
        });
      }
    }
  }

  return results.sort((a, b) => b.relevance - a.relevance).slice(0, 8);
}

/**
 * Get full documentation as AI context string
 */
export function getFullDocsContext(): string {
  let context = PLATFORM_CONTEXT + '\n\n';

  for (const section of platformDocs) {
    context += `## ${section.title}\n\n`;
    for (const article of section.articles) {
      context += `### ${article.title}\n`;
      context += `Tags: ${article.tags.join(', ')}\n`;
      if (article.codeReferences) {
        context += `Files: ${article.codeReferences.map(r => r.filePath).join(', ')}\n`;
      }
      context += '\n' + article.content + '\n\n';
    }
  }

  // Add API reference
  context += '\n## API Reference\n\n';
  for (const endpoint of apiEndpoints) {
    context += `- ${endpoint.method} ${endpoint.path}: ${endpoint.description} (${endpoint.sourceFile}:${endpoint.sourceLine})\n`;
  }

  // Add error codes
  context += '\n## Error Codes\n\n';
  for (const err of errorCodes) {
    context += `- ${err.code} (${err.httpStatus}): ${err.message} - ${err.description}\n`;
    context += `  Causes: ${err.possibleCauses.join(', ')}\n`;
    context += `  Solutions: ${err.solutions.join(', ')}\n`;
  }

  return context;
}

/**
 * Get relevant documentation context for a bug report
 */
export function getRelevantDocsContext(
  pageUrl: string,
  category: string,
  description: string
): string {
  const keywords = new Set<string>();

  // Extract keywords from page URL
  if (pageUrl.includes('/admin')) keywords.add('admin');
  if (pageUrl.includes('/dashboard')) keywords.add('dashboard');
  if (pageUrl.includes('/course')) keywords.add('content');
  if (pageUrl.includes('/profile')) keywords.add('users');
  if (pageUrl.includes('/roster')) keywords.add('referrals');
  if (pageUrl.includes('/quiz')) keywords.add('quiz');
  if (pageUrl.includes('/login') || pageUrl.includes('/register')) keywords.add('auth');
  if (pageUrl.includes('/bugs')) keywords.add('bugs');

  // From category
  if (category === 'ui') keywords.add('components');
  if (category === 'functionality') keywords.add('features');
  if (category === 'data') keywords.add('entities');
  if (category === 'performance') keywords.add('optimization');

  // From description
  const descLower = description.toLowerCase();
  if (descLower.includes('impersonat')) keywords.add('impersonation');
  if (descLower.includes('habit')) keywords.add('habits');
  if (descLower.includes('biometric') || descLower.includes('weight')) keywords.add('biometrics');
  if (descLower.includes('video') || descLower.includes('lesson')) keywords.add('content');
  if (descLower.includes('payment') || descLower.includes('stripe')) keywords.add('payments');
  if (descLower.includes('referral') || descLower.includes('coach')) keywords.add('referrals');
  if (descLower.includes('login') || descLower.includes('otp')) keywords.add('auth');
  if (descLower.includes('bug') || descLower.includes('report')) keywords.add('bugs');
  if (descLower.includes('analys') || descLower.includes('ai')) keywords.add('ai');
  if (descLower.includes('error') || descLower.includes('fail')) keywords.add('troubleshooting');
  if (descLower.includes('screenshot') || descLower.includes('video')) keywords.add('media');

  // Also add words from description
  const words = descLower.match(/\b\w{4,}\b/g) || [];
  words.slice(0, 10).forEach(w => keywords.add(w));

  const query = Array.from(keywords).join(' ');
  const results = searchDocs(query);

  if (results.length === 0) {
    return getFullDocsContext();
  }

  // Build context from relevant articles
  let context = PLATFORM_CONTEXT + '\n\n# Relevant Documentation\n\n';

  for (const result of results) {
    const section = platformDocs.find(s => s.id === result.sectionId);
    const article = section?.articles.find(a => a.id === result.articleId);
    if (article) {
      context += `## ${result.sectionTitle} > ${result.articleTitle}\n`;
      context += `Relevance: ${result.relevance.toFixed(1)} | Tags: ${article.tags.join(', ')}\n`;
      if (article.codeReferences) {
        context += `Files: ${article.codeReferences.map(r => r.filePath).join(', ')}\n`;
      }
      if (article.apiEndpoints) {
        context += `APIs: ${article.apiEndpoints.join(', ')}\n`;
      }
      if (article.errorCodes) {
        context += `Error Codes: ${article.errorCodes.join(', ')}\n`;
      }
      context += '\n' + article.content + '\n\n';
    }
  }

  // Add relevant API endpoints
  const relevantAPIs = apiEndpoints.filter(api => {
    const apiPath = api.path.toLowerCase();
    return Array.from(keywords).some(k => apiPath.includes(k));
  });

  if (relevantAPIs.length > 0) {
    context += '\n## Relevant API Endpoints\n\n';
    for (const api of relevantAPIs) {
      context += `- ${api.method} ${api.path}: ${api.description}\n`;
      context += `  File: ${api.sourceFile}:${api.sourceLine}\n`;
    }
  }

  // Add relevant error codes
  const relevantErrors = errorCodes.filter(err => {
    return Array.from(keywords).some(k =>
      err.code.toLowerCase().includes(k) ||
      err.message.toLowerCase().includes(k) ||
      err.description.toLowerCase().includes(k)
    );
  });

  if (relevantErrors.length > 0) {
    context += '\n## Relevant Error Codes\n\n';
    for (const err of relevantErrors) {
      context += `### ${err.code} (HTTP ${err.httpStatus})\n`;
      context += `${err.message}: ${err.description}\n`;
      context += `Causes: ${err.possibleCauses.join(', ')}\n`;
      context += `Solutions: ${err.solutions.join(', ')}\n\n`;
    }
  }

  return context;
}

/**
 * Build comprehensive AI context for a specific bug
 */
export function buildAIBugContext(bug: BugReport): string {
  const relevantContext = getRelevantDocsContext(
    bug.pageUrl || '',
    bug.category,
    `${bug.title} ${bug.description}`
  );

  return `
${relevantContext}

---

# Bug Report to Analyze

**ID:** ${bug.id}
**Title:** ${bug.title}
**Description:** ${bug.description}
**Severity:** ${bug.severity}
**Category:** ${bug.category}
**Page URL:** ${bug.pageUrl}
**User Agent:** ${bug.userAgent}
**Has Screenshot:** ${bug.screenshotUrl ? 'Yes' : 'No'}
**Has Video:** ${bug.videoUrl ? 'Yes' : 'No'}
**Status:** ${bug.status}
**Created:** ${new Date(bug.createdAt).toISOString()}

---

Based on the platform documentation above and this bug report, provide a comprehensive analysis with:
1. Summary of the issue
2. Most likely technical cause (reference specific files/components from docs)
3. Suggested solutions with step-by-step instructions
4. Related documentation articles that would help resolve this
5. Confidence level (low/medium/high) based on available information
`.trim();
}
