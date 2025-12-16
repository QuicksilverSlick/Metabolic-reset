import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
  Outlet
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
    path: "/register",
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
    element: <LoginPage />,
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