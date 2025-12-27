import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failed - silently ignore
    });
  });
}
import { StrictMode, Suspense, lazy, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
  useSearchParams
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import { ScrollToTop } from '@/components/ScrollToTop';
import '@/index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';

// Loading fallback component for Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-navy-950">
    <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
  </div>
);

// ============================================================================
// CRITICAL PATH PAGES - Eagerly loaded for fast initial render
// ============================================================================
import { HomePage } from '@/pages/HomePage';
import { QuizPage } from '@/pages/QuizPage';
import { OtpLoginPage } from '@/pages/auth/OtpLoginPage';
import { DashboardPage } from '@/pages/app/DashboardPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { AppLayout } from '@/components/layout/AppLayout';

// ============================================================================
// LAZY-LOADED PAGES - Code-split for smaller initial bundle
// ============================================================================

// Auth pages (less frequently accessed)
const RegistrationPage = lazy(() => import('@/pages/auth/RegistrationPage').then(m => ({ default: m.RegistrationPage })));
const CoachOnboardingPage = lazy(() => import('@/pages/auth/CoachOnboardingPage').then(m => ({ default: m.CoachOnboardingPage })));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));

// App pages (loaded after dashboard)
const BiometricsPage = lazy(() => import('@/pages/app/BiometricsPage').then(m => ({ default: m.BiometricsPage })));
const RosterPage = lazy(() => import('@/pages/app/RosterPage').then(m => ({ default: m.RosterPage })));
const ProfilePage = lazy(() => import('@/pages/app/ProfilePage').then(m => ({ default: m.ProfilePage })));
const AssignCaptainPage = lazy(() => import('@/pages/app/AssignCaptainPage').then(m => ({ default: m.AssignCaptainPage })));
const AdminPage = lazy(() => import('@/pages/app/AdminPage').then(m => ({ default: m.AdminPage })));
const MyProjectsPage = lazy(() => import('@/pages/app/MyProjectsPage').then(m => ({ default: m.MyProjectsPage })));
const EnrollProjectPage = lazy(() => import('@/pages/app/EnrollProjectPage').then(m => ({ default: m.EnrollProjectPage })));
const CoursePage = lazy(() => import('@/pages/app/CoursePage').then(m => ({ default: m.CoursePage })));
const CoachResourcesPage = lazy(() => import('@/pages/app/CoachResourcesPage').then(m => ({ default: m.CoachResourcesPage })));
const MyBugReportsPage = lazy(() => import('@/pages/app/MyBugReportsPage').then(m => ({ default: m.MyBugReportsPage })));

// Onboarding Pages (only needed during initial setup)
const CohortSelectionPage = lazy(() => import('@/pages/app/onboarding/CohortSelectionPage'));
const ProfilePhotoPage = lazy(() => import('@/pages/app/onboarding/ProfilePhotoPage'));
const PhoneVerificationPage = lazy(() => import('@/pages/app/onboarding/PhoneVerificationPage'));
const VideoOrientationPage = lazy(() => import('@/pages/app/onboarding/VideoOrientationPage'));
const KitConfirmationPage = lazy(() => import('@/pages/app/onboarding/KitConfirmationPage'));
const CoachCartLinkPage = lazy(() => import('@/pages/app/onboarding/CoachCartLinkPage'));
const AllAudienceVideoPage = lazy(() => import('@/pages/app/onboarding/AllAudienceVideoPage'));

// Legal Pages (rarely accessed)
const MedicalDisclaimerPage = lazy(() => import('@/pages/legal/MedicalDisclaimerPage'));
const PrivacyPolicyPage = lazy(() => import('@/pages/legal/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('@/pages/legal/TermsOfServicePage'));
const AssumptionOfRiskPage = lazy(() => import('@/pages/legal/AssumptionOfRiskPage'));
const RefundPolicyPage = lazy(() => import('@/pages/legal/RefundPolicyPage'));
const CookiePolicyPage = lazy(() => import('@/pages/legal/CookiePolicyPage'));
const AccessibilityStatementPage = lazy(() => import('@/pages/legal/AccessibilityStatementPage'));

// Redirect component for /register that preserves query params
function RegisterRedirect() {
  const [searchParams] = useSearchParams();
  const params = searchParams.toString();
  return <Navigate to={`/quiz${params ? `?${params}` : ''}`} replace />;
}

// Prefetch common routes during idle time for instant navigation
// Uses requestIdleCallback to avoid blocking the main thread
function prefetchCommonRoutes() {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      // Prefetch routes that users commonly navigate to after login
      import('@/pages/app/BiometricsPage');
      import('@/pages/app/RosterPage');
      import('@/pages/app/ProfilePage');
      import('@/pages/app/CoursePage');
    }, { timeout: 5000 });
  }
}

// Root layout that wraps all routes with ScrollToTop and Suspense for lazy-loaded pages
function RootLayout() {
  // Trigger prefetch after first render
  useEffect(() => {
    prefetchCommonRoutes();
  }, []);

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </>
  );
}

// Configure QueryClient with optimized defaults for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't refetch on window focus by default (reduces unnecessary requests)
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect by default
      refetchOnReconnect: false,
      // Keep data in cache for 10 minutes after component unmounts
      gcTime: 1000 * 60 * 10,
      // Data is considered fresh for 30 seconds
      staleTime: 1000 * 30,
      // Retry failed requests up to 2 times
      retry: 2,
    },
  },
});

const router = createBrowserRouter([
  {
    // Root layout wraps all routes with ScrollToTop for consistent behavior
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/quiz",
        element: <QuizPage />,
      },
      {
        // Redirect /register to /quiz (preserving query params)
        path: "/register",
        element: <RegisterRedirect />,
      },
      {
        // Registration page (accessed after quiz + OTP verification for new users)
        path: "/registration",
        element: <RegistrationPage />,
      },
      {
        path: "/coach",
        element: <CoachOnboardingPage />,
      },
      {
        path: "/login",
        element: <OtpLoginPage />,
      },
      {
        path: "/login/legacy",
        element: <LoginPage />,
      },
      // Legal pages
      {
        path: "/legal/medical-disclaimer",
        element: <MedicalDisclaimerPage />,
      },
      {
        path: "/legal/privacy",
        element: <PrivacyPolicyPage />,
      },
      {
        path: "/legal/terms",
        element: <TermsOfServicePage />,
      },
      {
        path: "/legal/assumption-of-risk",
        element: <AssumptionOfRiskPage />,
      },
      {
        path: "/legal/refunds",
        element: <RefundPolicyPage />,
      },
      {
        path: "/legal/cookies",
        element: <CookiePolicyPage />,
      },
      {
        path: "/legal/accessibility",
        element: <AccessibilityStatementPage />,
      },
      // Onboarding routes (full-screen, no AppLayout)
      {
        path: "/app/onboarding/cohort",
        element: <CohortSelectionPage />,
      },
      {
        path: "/app/onboarding/profile",
        element: <ProfilePhotoPage />,
      },
      {
        path: "/app/onboarding/verify",
        element: <PhoneVerificationPage />,
      },
      {
        path: "/app/onboarding/video",
        element: <VideoOrientationPage />,
      },
      {
        path: "/app/onboarding/kit",
        element: <KitConfirmationPage />,
      },
      {
        path: "/app/onboarding/cart-link",
        element: <CoachCartLinkPage />,
      },
      {
        path: "/app/onboarding/final-video",
        element: <AllAudienceVideoPage />,
      },
      {
        path: "/app",
        element: (
          <AppLayout container>
            <Outlet />
            <Toaster richColors closeButton />
          </AppLayout>
        ),
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: "biometrics",
            element: <BiometricsPage />,
          },
          {
            path: "profile",
            element: <ProfilePage />
          },
          {
            path: "roster",
            element: <RosterPage />
          },
          {
            path: "assign",
            element: <AssignCaptainPage />
          },
          {
            path: "admin",
            element: <AdminPage />
          },
          {
            path: "projects",
            element: <MyProjectsPage />
          },
          {
            path: "enroll/:projectId",
            element: <EnrollProjectPage />
          },
          {
            path: "course",
            element: <CoursePage />
          },
          {
            path: "resources",
            element: <CoachResourcesPage />
          },
          {
            path: "bugs",
            element: <MyBugReportsPage />
          }
        ]
      },
      {
        path: "*",
        element: <NotFoundPage />,
      }
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
//