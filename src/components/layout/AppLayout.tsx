import React from "react";
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
    // Determine which onboarding step they should be at
    if (!activeEnrollment.cohortId) {
      return <Navigate to="/app/onboarding/cohort" replace />;
    }
    // If they have cohort but somehow got here, send to video
    return <Navigate to="/app/onboarding/video" replace />;
  }

  // Calculate current day of the challenge
  const getDayNumber = () => {
    if (!user?.createdAt) return 1;
    const startDate = new Date(user.createdAt);
    const today = new Date();
    const dayDiff = differenceInDays(today, startDate) + 1;
    // Clamp between 1 and 28 (or allow > 28 for post-challenge)
    return Math.max(1, dayDiff);
  };
  const currentDay = getDayNumber();
  const dayDisplay = currentDay > 28 ? `Day ${currentDay} (Post-Challenge)` : `Day ${currentDay} of 28`;
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className={`bg-slate-100 dark:bg-navy-900 transition-colors duration-300 ${className || ''}`}>
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 px-4 shadow-sm transition-colors duration-300">
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
              <ThemeToggle className="relative top-0 right-0" />
              <Link to="/app/profile" className="flex items-center">
                <div className="relative">
                  <Avatar className="h-8 w-8 border-2 border-gold-500/30 hover:border-gold-500/60 transition-colors cursor-pointer">
                    {user?.avatarUrl ? (
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                    ) : null}
                    <AvatarFallback className="bg-gold-100 dark:bg-gold-900/50 text-gold-700 dark:text-gold-300 text-xs font-bold">
                      {user?.name ? getInitials(user.name) : 'U'}
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