# Comprehensive Codebase Refactoring Plan

**Created:** December 19, 2024
**Status:** Pending Implementation
**Total Estimated Effort:** 12-16 days

---

## Executive Summary

Your Metabolic Reset platform has grown to **~34,000 lines of code** across 116 TypeScript files. While functional, several files have become monolithic and require refactoring for maintainability, performance, and scalability.

---

## 📊 Critical Metrics

| Category | Current State | Target |
|----------|---------------|--------|
| Largest Page | AdminPage.tsx (3,040 lines) | < 500 lines |
| Largest Backend | user-routes.ts (3,989 lines) | < 800 lines/module |
| Largest Hook File | use-queries.ts (1,264 lines) | Split into 8 domains |
| Bundle Size (main) | 13.7 MB (uncompressed) | < 5 MB with splitting |

---

## 🔴 CRITICAL PRIORITY (Immediate Action Required)

### 1. `worker/user-routes.ts` - 3,989 lines
**Problem:** Monolithic API file handling ALL routes - users, projects, enrollments, content, admin, payments, biometrics, scores, referrals, OTP, genealogy.

**Issues Found:**
- N+1 query patterns in 4+ endpoints (lines 2020-2030, 2871-2886, 1863-1871)
- 100+ DRY violations (repeated phone normalization, entity fetch patterns)
- Magic strings for index names scattered throughout
- No route modularization

**Refactoring Plan:**
```
worker/
├── index.ts (entry point)
├── routes/
│   ├── auth.ts (login, OTP, registration)
│   ├── users.ts (profile, settings)
│   ├── admin/
│   │   ├── users.ts
│   │   ├── projects.ts
│   │   ├── content.ts
│   │   └── bugs.ts
│   ├── enrollments.ts
│   ├── scores.ts
│   ├── biometrics.ts
│   ├── referrals.ts
│   ├── course.ts
│   └── payments.ts
├── middleware/
│   ├── auth.ts (requireAuth, requireAdmin)
│   └── validation.ts
├── helpers/
│   ├── phone.ts (normalizePhone, toE164)
│   ├── indexNames.ts (INDEX_NAMES enum)
│   └── enrichment.ts (batch loading helpers)
└── entities.ts
```

**Estimated Effort:** 3-4 days

---

### 2. `src/pages/app/AdminPage.tsx` - 3,040 lines
**Problem:** Single component managing 7 admin features with 40+ state variables.

**Issues Found:**
- User management, projects, content, bugs, genealogy, deleted users, settings ALL in one file
- 200+ lines of helper functions for badge rendering
- Multiple nested dialogs and sheets
- No component extraction

**Refactoring Plan:**
```
src/components/admin/
├── AdminPage.tsx (coordinator ~200 lines)
├── tabs/
│   ├── AdminUsersTab.tsx
│   ├── AdminProjectsTab.tsx
│   ├── AdminBugsTab.tsx
│   ├── AdminGenealogyTab.tsx
│   ├── AdminDeletedUsersTab.tsx
│   └── AdminSettingsTab.tsx
├── dialogs/
│   ├── EditUserDialog.tsx
│   ├── EditProjectDialog.tsx
│   ├── BootstrapAdminDialog.tsx
│   └── UserDetailSheet.tsx
├── helpers/
│   └── badgeHelpers.ts
└── ContentManager.tsx (existing)
```

**Estimated Effort:** 2-3 days

---

### 3. `src/pages/QuizPage.tsx` - 2,281 lines
**Problem:** Handles entire quiz flow, scoring, payment, results in one component.

**Refactoring Plan:**
```
src/components/quiz/
├── QuizPage.tsx (coordinator)
├── phases/
│   ├── QuizLandingPhase.tsx
│   ├── LeadCapturePhase.tsx
│   ├── QuestionsPhase.tsx
│   ├── CalculatingPhase.tsx
│   ├── ResultsPhase.tsx
│   └── PaymentPhase.tsx
├── components/
│   ├── QuizQuestionCard.tsx
│   ├── QuizResultsDisplay.tsx
│   ├── SampleResultPreview.tsx
│   └── StripePaymentForm.tsx
└── utils/
    └── quizScoring.ts
```

**Estimated Effort:** 2 days

---

## 🟠 HIGH PRIORITY (Next Sprint)

### 4. `src/hooks/use-queries.ts` - 1,264 lines
**Problem:** 150+ hooks in a single file with no domain organization.

**Refactoring Plan:**
```
src/hooks/
├── index.ts (barrel exports)
├── auth/
│   ├── useUser.ts
│   ├── useLogin.ts
│   └── useUpdateProfile.ts
├── admin/
│   ├── useAdminUsers.ts
│   ├── useAdminProjects.ts
│   └── useAdminBugs.ts
├── scores/
│   ├── useDailyScore.ts
│   └── useScoreHistory.ts
├── biometrics/
│   └── useBiometrics.ts
├── course/
│   ├── useCourseOverview.ts
│   └── useContentComments.ts
├── projects/
│   └── useProjects.ts
└── factories/
    └── createQueryHook.ts (reduce duplication)
```

**Estimated Effort:** 1-2 days

---

### 5. `src/lib/api.ts` - 857 lines
**Problem:** All 30+ API client objects in one file.

**Refactoring Plan:**
```
src/lib/api/
├── index.ts (re-exports)
├── client.ts (base fetch wrapper)
├── auth.ts
├── users.ts
├── admin.ts
├── projects.ts
├── course.ts
├── scores.ts
└── biometrics.ts
```

**Estimated Effort:** 1 day

---

### 6. Performance: No Code Splitting
**Problem:** All pages loaded upfront, 13.7 MB initial bundle.

**Fix:**
```typescript
// main.tsx - Replace static imports
const AdminPage = React.lazy(() => import('@/pages/app/AdminPage'));
const QuizPage = React.lazy(() => import('@/pages/QuizPage'));
const CoursePage = React.lazy(() => import('@/pages/app/CoursePage'));

// Wrap routes with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <AdminPage />
</Suspense>
```

**Estimated Effort:** 2-3 hours

---

### 7. Performance: Heavy Libraries Loaded Eagerly
**Problem:** Three.js (~500KB), canvas-confetti (~20KB), html2canvas (~100KB) loaded on every page.

**Fix:**
```typescript
// Dynamic import for confetti
const triggerConfetti = async () => {
  const confetti = (await import('canvas-confetti')).default;
  confetti({ particleCount: 100 });
};

// Lazy load Three.js background
const NeuralNetworkBackground = React.lazy(() =>
  import('@/components/ui/neural-network-background')
);
```

**Estimated Effort:** 2-3 hours

---

## 🟡 MEDIUM PRIORITY (Backlog)

### 8. `src/pages/app/CoursePage.tsx` - 948 lines
Extract: `DaySelector`, `VideoPlayerModal`, `CourseQuizModal`, `CommentsSection`

### 9. `src/pages/app/DashboardPage.tsx` - 850 lines
Extract: `DailyHabitsGrid`, `ActivityHistory`, `BiometricDetailModal`

### 10. `src/pages/app/RosterPage.tsx` - 1,165 lines
Extract: `RosterTable`, `LeadsList`, `RosterFilters`

### 11. `src/components/admin/ContentManager.tsx` - 1,079 lines
Extract: `ContentFormDialog`, `ContentList`, `QuizQuestionBuilder`

### 12. `worker/entities.ts` - 1,050 lines
- Add `SoftDeletableEntity` base class
- Add `getIfExists()` helper method
- Add cycle detection to `buildGenealogyTree`

---

## 🟢 QUICK WINS (< 2 hours each)

| Task | Impact | Effort |
|------|--------|--------|
| Remove console.log statements (21 files) | -5KB, cleaner logs | 30 min |
| Add Vite manualChunks config | Better caching | 1 hour |
| Create `INDEX_NAMES` constant enum | Code quality | 30 min |
| Extract phone normalization to utility | DRY | 30 min |
| Add `useCallback` to AdminPage handlers | Fewer re-renders | 1 hour |
| Reduce lucide-react imports (40+ → 15) | -50KB | 1 hour |

---

## 📈 Backend N+1 Query Fixes

| Location | Issue | Fix |
|----------|-------|-----|
| Line 2020-2030 | Enrollment + Project fetch | Batch load projects |
| Line 2871-2886 | User recruit counts | Denormalize to user-stats index |
| Line 1863-1871 | Enrollment + User info | Batch load users |
| Line 3309-3330 | Content analytics | Implement findByContentBatch() |

---

## 📁 Proposed Final Structure

```
src/
├── components/
│   ├── admin/           # Admin feature components
│   ├── course/          # Course/LMS components
│   ├── dashboard/       # Dashboard components
│   ├── quiz/            # Quiz flow components
│   ├── shared/          # Shared components (badges, dialogs)
│   ├── layout/          # Layout wrappers
│   └── ui/              # UI primitives (shadcn)
├── hooks/
│   ├── auth/
│   ├── admin/
│   ├── course/
│   ├── scores/
│   └── factories/
├── lib/
│   ├── api/             # Domain-split API clients
│   ├── stores/          # Zustand stores
│   └── utils/           # Utility functions
├── pages/               # Page coordinators (< 300 lines each)
└── constants/           # Shared constants

worker/
├── routes/              # Domain-split route handlers
├── middleware/          # Auth, validation
├── helpers/             # Shared utilities
├── entities.ts
└── index.ts

shared/
├── types/               # Domain-split type definitions
└── constants/
```

---

## 📋 Recommended Implementation Order

### Phase 1: Quick Wins (1 day)
1. [ ] Remove console.logs
2. [ ] Add Vite code splitting config
3. [ ] Lazy load heavy libraries
4. [ ] Create INDEX_NAMES constant

### Phase 2: Backend Modularization (3-4 days)
1. [ ] Split user-routes.ts into route modules
2. [ ] Extract middleware (auth, validation)
3. [ ] Fix N+1 query patterns
4. [ ] Add batch loading helpers

### Phase 3: Frontend Component Extraction (4-5 days)
1. [ ] Split AdminPage into tabs/dialogs
2. [ ] Split QuizPage into phases
3. [ ] Split CoursePage into components
4. [ ] Split DashboardPage into sections

### Phase 4: Hooks & API Reorganization (2 days)
1. [ ] Split use-queries.ts by domain
2. [ ] Split api.ts by domain
3. [ ] Create hook factories

### Phase 5: Polish (1-2 days)
1. [ ] Add React.memo to tables
2. [ ] Add useCallback to handlers
3. [ ] Reduce icon imports
4. [ ] Update types organization

---

## Expected Outcomes

| Metric | Before | After |
|--------|--------|-------|
| Initial Bundle | 13.7 MB | ~4-5 MB |
| Largest Component | 3,040 lines | < 500 lines |
| Time to Interactive | ~4s | < 2s |
| Code Maintainability | Poor | Good |
| Test Coverage Potential | Low | High |

---

## Notes

- This plan was generated from a comprehensive codebase analysis
- Priorities may shift based on feature development needs
- Each phase can be executed independently
- Consider creating feature branches for each phase
