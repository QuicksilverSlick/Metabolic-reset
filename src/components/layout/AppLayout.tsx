import React, { useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuthStore } from "@/lib/auth-store";
import { Navigate, Link } from "react-router-dom";
import { differenceInDays } from "date-fns";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FloatingBugCapture } from "@/components/FloatingBugCapture";
import { BugReportDialog } from "@/components/BugReportDialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useMyActiveEnrollment } from "@/hooks/use-queries";
import { CohortIndicator } from "@/components/cohort-badge";
import { Loader2 } from "lucide-react";
import { ImpersonationBanner } from "@/components/impersonation-banner";
import { NotificationBell } from "@/components/notification-bell";
import { toast } from "sonner";

// Get user initials for avatar fallback
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user = useAuthStore(s => s.user);
  const impersonation = useAuthStore(s => s.impersonation);
  const endImpersonation = useAuthStore(s => s.endImpersonation);

  // Check for expired impersonation session on page load/navigation
  // This handles the case where the user closed their browser while impersonating
  useEffect(() => {
    if (impersonation.isImpersonating && impersonation.expiresAt) {
      const now = Date.now();
      if (now >= impersonation.expiresAt) {
        toast.warning('Impersonation session expired', {
          description: 'Your previous session has timed out. Returning to admin view.',
          duration: 5000,
        });
        endImpersonation();
      }
    }
  }, [impersonation.isImpersonating, impersonation.expiresAt, endImpersonation]);

  // When impersonating, use the impersonated user for display purposes
  const displayUser = impersonation.isImpersonating && impersonation.impersonatedUser
    ? impersonation.impersonatedUser
    : user;
  const { data: activeEnrollment, isLoading: enrollmentLoading } = useMyActiveEnrollment();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Show loading while we check enrollment status
  if (enrollmentLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  // Gatekeeper: If user has an enrollment but hasn't completed onboarding, redirect
  if (activeEnrollment && !activeEnrollment.onboardingComplete) {
    // Check if user is a coach (from user object or enrollment)
    const isCoach = user?.role === 'coach' || activeEnrollment.role === 'coach';

    // Coaches skip cohort selection entirely - they're always GROUP_A (Optavia coaches)
    // Send them directly to cart-link page to set up their referral link
    if (isCoach) {
      return <Navigate to="/app/onboarding/cart-link" replace />;
    }

    if (!activeEnrollment.cohortId) {
      // No cohort selected - send challengers to cohort selection
      return <Navigate to="/app/onboarding/cohort" replace />;
    }

    // Challengers in Group A who haven't completed kit confirmation
    if (activeEnrollment.cohortId === 'GROUP_A' && !activeEnrollment.hasKit) {
      return <Navigate to="/app/onboarding/kit" replace />;
    }

    // If they have cohort but onboarding not complete, they may still be in the flow
    // Let them through - the individual onboarding pages will handle their own logic
  }

  // Calculate current day of the challenge
  const getDayNumber = () => {
    if (!displayUser?.createdAt) return 1;
    const startDate = new Date(displayUser.createdAt);
    const today = new Date();
    const dayDiff = differenceInDays(today, startDate) + 1;
    // Clamp between 1 and 28 (or allow > 28 for post-challenge)
    return Math.max(1, dayDiff);
  };
  const currentDay = getDayNumber();
  const dayDisplay = currentDay > 28 ? `Day ${currentDay} (Post-Challenge)` : `Day ${currentDay} of 28`;

  // Calculate offset for impersonation banner
  const headerTopClass = impersonation.isImpersonating ? 'top-12' : 'top-0';

  return (
    <SidebarProvider defaultOpen={true}>
      {/* Impersonation banner - fixed at very top */}
      <ImpersonationBanner />
      <AppSidebar />
      <SidebarInset className={`bg-slate-100 dark:bg-navy-900 transition-colors duration-300 ${impersonation.isImpersonating ? 'pt-12' : ''} ${className || ''}`}>
        <header className={`sticky ${headerTopClass} z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 px-4 shadow-sm transition-colors duration-300`}>
          <SidebarTrigger className="-ml-1 text-navy-900 dark:text-white" />
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-2" />
          <div className="flex-1 flex justify-between items-center">
            <h1 className="font-display font-semibold text-navy-900 dark:text-white text-lg">
              Metabolic Reset
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
                {dayDisplay}
              </div>
              <NotificationBell />
              <ThemeToggle className="relative top-0 right-0" />
              <Link to="/app/profile" className="flex items-center">
                <div className="relative">
                  <Avatar className="h-8 w-8 border-2 border-gold-500/30 hover:border-gold-500/60 transition-colors cursor-pointer">
                    {displayUser?.avatarUrl ? (
                      <AvatarImage src={displayUser.avatarUrl} alt={displayUser.name} />
                    ) : null}
                    <AvatarFallback className="bg-gold-100 dark:bg-gold-900/50 text-gold-700 dark:text-gold-300 text-xs font-bold">
                      {displayUser?.name ? getInitials(displayUser.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <CohortIndicator cohortId={activeEnrollment?.cohortId} />
                </div>
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          {container ? (
            <div className={"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12" + (contentClassName ? ` ${contentClassName}` : "")}>
              {children}
            </div>
          ) : (
            children
          )}
        </main>
        {/* Global bug capture components */}
        <FloatingBugCapture />
        <BugReportDialog />
      </SidebarInset>
    </SidebarProvider>
  );
}