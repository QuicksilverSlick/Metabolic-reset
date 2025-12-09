import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuthStore } from "@/lib/auth-store";
import { Navigate } from "react-router-dom";
import { differenceInDays } from "date-fns";
import { ThemeToggle } from "@/components/ThemeToggle";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user = useAuthStore(s => s.user);
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
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
      <SidebarInset className={`bg-slate-50 dark:bg-navy-950 transition-colors duration-300 ${className || ''}`}>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 px-4 shadow-sm transition-colors duration-300">
          <SidebarTrigger className="-ml-1 text-navy-900 dark:text-white" />
          <div className="h-4 w-px bg-slate-200 dark:bg-navy-700 mx-2" />
          <div className="flex-1 flex justify-between items-center">
            <h1 className="font-display font-semibold text-navy-900 dark:text-white text-lg">
              Metabolic Reset
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
                {dayDisplay}
              </div>
              <ThemeToggle className="relative top-0 right-0" />
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
      </SidebarInset>
    </SidebarProvider>
  );
}