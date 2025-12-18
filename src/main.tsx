import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
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
import '@/index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
// Pages
import { HomePage } from '@/pages/HomePage';
import { QuizPage } from '@/pages/QuizPage';
import { RegistrationPage } from '@/pages/auth/RegistrationPage';
import { CoachOnboardingPage } from '@/pages/auth/CoachOnboardingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { OtpLoginPage } from '@/pages/auth/OtpLoginPage';
import { DashboardPage } from '@/pages/app/DashboardPage';
import { BiometricsPage } from '@/pages/app/BiometricsPage';
import { RosterPage } from '@/pages/app/RosterPage';
import { ProfilePage } from '@/pages/app/ProfilePage';
import { AssignCaptainPage } from '@/pages/app/AssignCaptainPage';
import { AdminPage } from '@/pages/app/AdminPage';
import { MyProjectsPage } from '@/pages/app/MyProjectsPage';
import { EnrollProjectPage } from '@/pages/app/EnrollProjectPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { AppLayout } from '@/components/layout/AppLayout';
// Onboarding Pages
import CohortSelectionPage from '@/pages/app/onboarding/CohortSelectionPage';
import ProfilePhotoPage from '@/pages/app/onboarding/ProfilePhotoPage';
import PhoneVerificationPage from '@/pages/app/onboarding/PhoneVerificationPage';
import VideoOrientationPage from '@/pages/app/onboarding/VideoOrientationPage';
import KitConfirmationPage from '@/pages/app/onboarding/KitConfirmationPage';

// Redirect component for /register that preserves query params
function RegisterRedirect() {
  const [searchParams] = useSearchParams();
  const params = searchParams.toString();
  return <Navigate to={`/quiz${params ? `?${params}` : ''}`} replace />;
}

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/quiz",
    element: <QuizPage />,
    errorElement: <RouteErrorBoundary />,
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
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/coach",
    element: <CoachOnboardingPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/login",
    element: <OtpLoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/login/legacy",
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  // Onboarding routes (full-screen, no AppLayout)
  {
    path: "/app/onboarding/cohort",
    element: <CohortSelectionPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/app/onboarding/profile",
    element: <ProfilePhotoPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/app/onboarding/verify",
    element: <PhoneVerificationPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/app/onboarding/video",
    element: <VideoOrientationPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/app/onboarding/kit",
    element: <KitConfirmationPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/app",
    element: (
      <AppLayout container>
        <Outlet />
        <Toaster richColors closeButton />
      </AppLayout>
    ),
    errorElement: <RouteErrorBoundary />,
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
      }
    ]
  },
  {
    path: "*",
    element: <NotFoundPage />,
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