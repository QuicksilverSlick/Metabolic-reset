/**
 * Documentation Context for AI Bug Analysis
 *
 * This module provides the AI with context from our living documentation system.
 * It includes searchable documentation content that helps the AI understand
 * the platform architecture and provide relevant solutions.
 */

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
}

/**
 * Platform documentation - synchronized with src/lib/docs/sections/
 * This is a condensed version for AI context, focusing on key information.
 */
export const platformDocs: DocSection[] = [
  {
    id: 'overview',
    title: 'Getting Started',
    articles: [
      {
        id: 'introduction',
        title: 'Platform Introduction',
        tags: ['overview', 'introduction', 'architecture'],
        content: `
The Metabolic Reset Challenge is a 28-day health transformation platform built with:
- Frontend: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Cloudflare Workers + Durable Objects
- Database: Cloudflare D1 (SQLite)
- Storage: Cloudflare R2 (images/videos)
- Payments: Stripe (one-time $28 per project)
- Auth: Phone-based OTP via Twilio

Key features:
- Daily habit tracking (water, steps, sleep, lessons)
- Weekly biometric submissions
- Course content with videos and quizzes
- Coach/team leader referral system
- Admin panel for user management
        `.trim()
      },
      {
        id: 'navigation',
        title: 'Admin Panel Navigation',
        tags: ['admin', 'navigation', 'tabs'],
        content: `
Admin Panel Tabs:
- Users: Manage participant and coach accounts, impersonate users
- Projects: Create and configure challenge cohorts
- Content: Manage videos, lessons, and quizzes (ContentManager component)
- Bugs: Review and triage user-submitted bug reports
- Genealogy: View referral relationships and team structures
- Settings: Configure system-wide settings
- Deleted: View and restore soft-deleted users
- Duplicates: Identify and merge duplicate accounts
- Docs: Access living documentation system

Key files:
- src/pages/app/AdminPage.tsx - Main admin panel
- src/components/admin/ContentManager.tsx - LMS content management
- worker/user-routes.ts - All API endpoints
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
        content: `
User Roles:
1. Participants (challengers): Pay $28, track habits, submit biometrics
2. Coaches (group leaders): Free registration, get referral links, view team roster
3. Administrators: Full access, can impersonate users, manage content

Key fields:
- isAdmin: boolean - Admin access
- isGroupLeader: boolean (role === 'coach') - Coach status
- referralCode: string - Unique referral code
- currentProjectId: string - Active project

Files:
- shared/types.ts - User interface definition
- worker/entities.ts - UserEntity class
- src/hooks/use-queries.ts - React Query hooks
        `.trim()
      },
      {
        id: 'authentication',
        title: 'Authentication System',
        tags: ['auth', 'login', 'otp', 'phone'],
        content: `
Authentication Flow:
1. User enters phone number
2. OTP sent via Twilio SMS
3. User enters 6-digit code
4. If verified, check for existing user
5. New users go through registration
6. Existing users are logged in

Key components:
- src/pages/auth/OtpLoginPage.tsx - Login with OTP
- src/lib/auth-store.ts - Zustand auth state
- worker/entities.ts - OtpEntity for verification
- worker/user-routes.ts - /api/otp/send, /api/otp/verify

OTP expires after 10 minutes, max 5 attempts.
        `.trim()
      }
    ]
  },
  {
    id: 'impersonation',
    title: 'User Impersonation',
    tags: ['admin', 'security', 'impersonation'],
    articles: [
      {
        id: 'overview',
        title: 'Impersonation Overview',
        tags: ['security', 'admin', 'impersonation', 'debugging'],
        content: `
User Impersonation allows admins to view the app as any user for debugging.

Security Features:
- Admin-only access (requireAdminForImpersonation middleware)
- 60-minute session timeout (auto-expires)
- View-only mode (16+ mutations blocked with assertNotImpersonating)
- Visual indicator (ImpersonationBanner with countdown timer)
- Audit logging (ImpersonationSessionEntity)

Key files:
- src/components/impersonation-banner.tsx - UI banner with timer
- src/lib/auth-store.ts - Impersonation state management
- worker/user-routes.ts - /api/admin/impersonate/:userId
- worker/entities.ts - ImpersonationSessionEntity

Blocked actions during impersonation:
- Submit habits, biometrics
- Update profile
- Any data modifications
        `.trim()
      },
      {
        id: 'troubleshooting',
        title: 'Impersonation Troubleshooting',
        tags: ['troubleshooting', 'impersonation', 'issues'],
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

Actions still working:
- Report as bug - mutations should be guarded
- Check assertNotImpersonating in use-queries.ts

Session ended unexpectedly:
- 60-minute timeout reached
- Another tab ended session
- Browser storage cleared
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
        tags: ['bugs', 'reporting', 'admin'],
        content: `
Bug Reporting Flow:
1. User clicks floating bug icon
2. Fills out report form (title, description, severity, category)
3. Optionally captures screenshot or screen recording
4. Submits report

Bug fields:
- severity: 'critical' | 'high' | 'medium' | 'low'
- status: 'open' | 'in_progress' | 'resolved' | 'closed'
- category: 'ui' | 'functionality' | 'performance' | 'data' | 'other'
- screenshotUrl, videoUrl: R2 storage URLs

Key files:
- src/components/FloatingBugCapture.tsx - Bug report button
- src/components/BugReportDialog.tsx - Report form
- worker/entities.ts - BugReportEntity
- worker/user-routes.ts - /api/bugs endpoints
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
        content: `
Daily Habits:
- Water: Toggle for daily water goal
- Steps: Toggle for step goal
- Sleep: Toggle for sleep goal
- Lesson: Toggle for completing daily lesson

Each habit awards points (configurable in SystemSettings).
Habits reset at midnight in user's timezone.

Key files:
- src/pages/app/DashboardPage.tsx - Habit cards
- worker/entities.ts - DailyScoreEntity
- worker/user-routes.ts - /api/score (GET/POST)

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
        content: `
Weekly Biometric Submissions:
- Week 0: Initial measurements
- Weeks 1-4: Weekly check-ins

Required fields:
- weight, bodyFat, visceralFat, leanMass, metabolicAge
- screenshotUrl: Photo proof from smart scale

Points awarded on submission (configurable).

Key files:
- src/pages/app/DashboardPage.tsx - Biometrics section
- worker/entities.ts - WeeklyBiometricEntity
- worker/user-routes.ts - /api/biometrics

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
        content: `
Course Content System:
- Videos: Cloudflare Stream URLs with progress tracking
- Quizzes: Multiple choice with pass/fail, attempts, cooldown
- Resources: PDFs, links

Content unlocks based on dayNumber (1-28) relative to project start.
Progress tracked per user in UserProgressEntity.

Key files:
- src/pages/app/CoursePage.tsx - Course content display
- src/components/admin/ContentManager.tsx - Admin content management
- worker/entities.ts - CourseContentEntity, UserProgressEntity
- worker/user-routes.ts - /api/content/* endpoints

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
        content: `
Payment Flow:
1. User completes quiz funnel → QuizLead captured
2. User proceeds to registration
3. Stripe Checkout session created ($28)
4. On success, user created + enrolled in project
5. Coaches skip payment (free registration)

Key files:
- src/pages/auth/RegistrationPage.tsx - Registration with payment
- worker/user-routes.ts - /api/register, /api/stripe/checkout
- STRIPE_SECRET_KEY env var required

Enrollment tracked in ProjectEnrollmentEntity.
ID format: projectId:userId
        `.trim()
      }
    ]
  },
  {
    id: 'referrals',
    title: 'Referral System',
    articles: [
      {
        id: 'genealogy',
        title: 'Referral & Genealogy',
        tags: ['referrals', 'coaches', 'genealogy', 'teams'],
        content: `
Referral System:
- Each user has unique referralCode
- Coaches share referral links
- New users join under referring coach
- Points awarded for successful referrals

Genealogy tree shows hierarchical team structure.
Tracked in ReferralLedgerEntity and GenealogyNode type.

Key files:
- src/components/ui/genealogy-tree.tsx - Tree visualization
- worker/entities.ts - buildGenealogyTree function
- worker/user-routes.ts - /api/genealogy endpoints

Quiz links: /quiz?ref=CODE&project=ID
        `.trim()
      }
    ]
  }
];

/**
 * Search documentation for relevant articles based on keywords
 */
export function searchDocs(query: string): Array<{
  sectionId: string;
  sectionTitle: string;
  articleId: string;
  articleTitle: string;
  relevance: number;
  excerpt: string;
}> {
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/).filter(t => t.length > 2);
  const results: Array<{
    sectionId: string;
    sectionTitle: string;
    articleId: string;
    articleTitle: string;
    relevance: number;
    excerpt: string;
  }> = [];

  for (const section of platformDocs) {
    for (const article of section.articles) {
      const searchText = `${article.title} ${article.content} ${article.tags.join(' ')}`.toLowerCase();

      let relevance = 0;
      for (const term of queryTerms) {
        if (article.title.toLowerCase().includes(term)) relevance += 10;
        if (article.tags.some(t => t.includes(term))) relevance += 5;
        if (article.content.toLowerCase().includes(term)) relevance += 1;
      }

      if (relevance > 0) {
        // Extract a relevant excerpt
        const contentLower = article.content.toLowerCase();
        let excerpt = '';
        for (const term of queryTerms) {
          const idx = contentLower.indexOf(term);
          if (idx !== -1) {
            const start = Math.max(0, idx - 50);
            const end = Math.min(article.content.length, idx + 100);
            excerpt = '...' + article.content.slice(start, end).trim() + '...';
            break;
          }
        }
        if (!excerpt) {
          excerpt = article.content.slice(0, 150) + '...';
        }

        results.push({
          sectionId: section.id,
          sectionTitle: section.title,
          articleId: article.id,
          articleTitle: article.title,
          relevance,
          excerpt
        });
      }
    }
  }

  return results.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
}

/**
 * Get all documentation as a condensed context string for AI
 */
export function getFullDocsContext(): string {
  let context = '# Platform Documentation\n\n';

  for (const section of platformDocs) {
    context += `## ${section.title}\n\n`;
    for (const article of section.articles) {
      context += `### ${article.title}\n`;
      context += `Tags: ${article.tags.join(', ')}\n\n`;
      context += article.content + '\n\n';
    }
  }

  return context;
}

/**
 * Get relevant documentation context based on bug details
 */
export function getRelevantDocsContext(
  pageUrl: string,
  category: string,
  description: string
): string {
  // Extract keywords from the bug
  const keywords = new Set<string>();

  // From page URL
  if (pageUrl.includes('/admin')) keywords.add('admin');
  if (pageUrl.includes('/dashboard')) keywords.add('dashboard');
  if (pageUrl.includes('/course')) keywords.add('content');
  if (pageUrl.includes('/profile')) keywords.add('users');
  if (pageUrl.includes('/roster')) keywords.add('referrals');
  if (pageUrl.includes('/quiz')) keywords.add('quiz');
  if (pageUrl.includes('/login') || pageUrl.includes('/register')) keywords.add('auth');

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
  if (descLower.includes('bug')) keywords.add('bugs');

  // Search for relevant docs
  const query = Array.from(keywords).join(' ');
  const results = searchDocs(query);

  if (results.length === 0) {
    // Return overview if no specific matches
    return getFullDocsContext();
  }

  // Build context from relevant articles
  let context = '# Relevant Platform Documentation\n\n';
  for (const result of results) {
    const section = platformDocs.find(s => s.id === result.sectionId);
    const article = section?.articles.find(a => a.id === result.articleId);
    if (article) {
      context += `## ${result.sectionTitle} > ${result.articleTitle}\n`;
      context += article.content + '\n\n';
    }
  }

  return context;
}
