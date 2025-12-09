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
import { RegistrationPage } from '@/pages/auth/RegistrationPage';
import { DashboardPage } from '@/pages/app/DashboardPage';
import { BiometricsPage } from '@/pages/app/BiometricsPage';
import { RosterPage } from '@/pages/app/RosterPage';
import { ProfilePage } from '@/pages/app/ProfilePage';
import { AssignCaptainPage } from '@/pages/app/AssignCaptainPage';
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
    path: "/register",
    element: <RegistrationPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/app",
    element: (
      <AppLayout container>
        <Outlet />
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
      }
    ]
  },
  {
    path: "*",
    element: <NotFoundPage />,
    errorElement: <RouteErrorBoundary />
  }
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster richColors closeButton />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)