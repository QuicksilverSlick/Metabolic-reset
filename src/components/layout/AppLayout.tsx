import React, { useEffect, useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuthStore } from "@/lib/auth-store";
import { Navigate, Link } from "react-router-dom";
import { differenceInDays } from "date-fns";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FloatingBugCapture } from "@/components/FloatingBugCapture";
import { BugReportDialog } from "@/components/BugReportDialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useMyActiveEnrollment, useSystemSettings } from "@/hooks/use-queries";
import { CohortIndicator } from "@/components/cohort-badge";
import { Loader2, Rocket, CalendarClock, Flame, Trophy, Target, Calendar } from "lucide-react";
import { ImpersonationBanner } from "@/components/impersonation-banner";
import { NotificationBell } from "@/components/notification-bell";
import { toast } from "sonner";
import { SystemAnnouncementBanner, SystemStatusBadge } from "@/components/system-announcement-banner";
import { IOSInstallPrompt } from "@/components/ios-install-prompt";

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
  const { data: settings } = useSystemSettings();

  // Track if announcement banner is dismissed (to show status badge instead)
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    const storageKey = `announcement_${settings?.announcementTitle || 'default'}_dismissed`;
    return localStorage.getItem(storageKey) === 'true';
  });

  // Update dismissed state when settings change
  useEffect(() => {
    if (settings?.announcementTitle) {
      const storageKey = `announcement_${settings.announcementTitle}_dismissed`;
      setBannerDismissed(localStorage.getItem(storageKey) === 'true');
    }
  }, [settings?.announcementTitle]);

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

  // Smart day display based on enrollment status
  const getDayDisplayInfo = (): {
    text: string;
    shortText: string;
    icon: React.ReactNode;
    variant: 'prompt' | 'countdown' | 'active' | 'complete' | 'default';
  } => {
    // No enrollment - prompt to join
    if (!activeEnrollment) {
      return {
        text: 'Join a Reset Project',
        shortText: 'Join Project',
        icon: <Target className="h-4 w-4" />,
        variant: 'prompt'
      };
    }

    const projectName = activeEnrollment.projectName || 'Reset Project';
    const projectStatus = activeEnrollment.projectStatus;
    const projectStartDate = activeEnrollment.projectStartDate;

    // Upcoming project - show countdown
    if (projectStatus === 'upcoming' && projectStartDate) {
      const startDate = new Date(projectStartDate + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysUntilStart = differenceInDays(startDate, today);

      if (daysUntilStart > 1) {
        return {
          text: `${projectName} starts in ${daysUntilStart} days!`,
          shortText: `${daysUntilStart}d to start`,
          icon: <Rocket className="h-4 w-4" />,
          variant: 'countdown'
        };
      } else if (daysUntilStart === 1) {
        return {
          text: `${projectName} starts tomorrow!`,
          shortText: 'Tomorrow!',
          icon: <CalendarClock className="h-4 w-4" />,
          variant: 'countdown'
        };
      } else if (daysUntilStart === 0) {
        return {
          text: `${projectName} starts today!`,
          shortText: 'Today!',
          icon: <Flame className="h-4 w-4" />,
          variant: 'countdown'
        };
      }
    }

    // Active project - show current day
    if (projectStatus === 'active' && projectStartDate) {
      const startDate = new Date(projectStartDate + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dayNumber = differenceInDays(today, startDate) + 1;

      if (dayNumber >= 1 && dayNumber <= 28) {
        return {
          text: `Day ${dayNumber} of 28`,
          shortText: `Day ${dayNumber}`,
          icon: <CalendarClock className="h-4 w-4" />,
          variant: 'active'
        };
      } else if (dayNumber > 28) {
        return {
          text: `${projectName} Complete!`,
          shortText: 'Complete',
          icon: <Trophy className="h-4 w-4" />,
          variant: 'complete'
        };
      }
    }

    // Completed project
    if (projectStatus === 'completed') {
      return {
        text: `${projectName} Complete!`,
        shortText: 'Complete',
        icon: <Trophy className="h-4 w-4" />,
        variant: 'complete'
      };
    }

    // Fallback for draft or unknown status
    return {
      text: projectName,
      shortText: projectName,
      icon: <Calendar className="h-4 w-4" />,
      variant: 'default'
    };
  };

  const dayInfo = getDayDisplayInfo();

  // Generate unique storage key based on announcement title
  const announcementStorageKey = `announcement_${settings?.announcementTitle || 'default'}_dismissed`;

  // Handler for when status badge is clicked to re-show banner
  const handleStatusBadgeClick = () => {
    localStorage.removeItem(announcementStorageKey);
    setBannerDismissed(false);
  };

  // Check if we have any active banners
  const hasImpersonationBanner = impersonation.isImpersonating;
  const hasAnnouncementBanner = settings?.announcementEnabled && !bannerDismissed;

  // Determine if any banner is showing (for safe area calculations)
  const anyBannerShowing = hasImpersonationBanner || hasAnnouncementBanner;

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col">
      {/*
        Top-level banners container - sticky at top with highest z-index
        Uses flex-shrink-0 to maintain size, content below will scroll
      */}
      <div className="sticky top-0 z-[70] flex-shrink-0 w-full">
        {/* Impersonation banner */}
        {hasImpersonationBanner && <ImpersonationBanner />}

        {/* System announcement banner - only top banner when no impersonation */}
        <SystemAnnouncementBanner
          enabled={settings?.announcementEnabled || false}
          title={settings?.announcementTitle || 'Test Mode'}
          message={settings?.announcementMessage || ''}
          videoUrl={settings?.announcementVideoUrl}
          type={settings?.announcementType || 'info'}
          storageKey={announcementStorageKey}
          onDismiss={() => setBannerDismissed(true)}
          isTopBanner={!hasImpersonationBanner}
        />

      </div>

      {/* Main app content with sidebar - takes remaining space */}
      <div className="flex-1 flex min-h-0">
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <SidebarInset className={`bg-slate-100 dark:bg-navy-900 transition-colors duration-300 flex flex-col ${className || ''}`}>
            {/*
              App header - uses position:sticky but NOT top:0 when banners are showing
              When no banners: top:0 with safe-area padding for notch devices
              When banners showing: the header flows naturally below the sticky banner container
            */}
            <header
              className="sticky z-50 flex shrink-0 items-center gap-2 border-b bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-300"
              style={{
                // When no banner: position header BELOW the safe area (notch)
                // When banner showing: banner handles safe area, header stays at top:0
                top: !anyBannerShowing ? 'env(safe-area-inset-top, 0px)' : '0',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                minHeight: '3.5rem',
                paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0px))',
                paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0px))',
              }}
            >
              <SidebarTrigger className="-ml-1 text-navy-900 dark:text-white" />
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1 sm:mx-2 hidden sm:block" />
              <div className="flex-1 flex justify-between items-center min-w-0">
                {/* Left side - Logo and optional status badge */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <h1 className="font-display font-semibold text-navy-900 dark:text-white text-base sm:text-lg truncate">
                    <span className="sm:hidden">Reset</span>
                    <span className="hidden sm:inline">Metabolic Reset</span>
                  </h1>
                  {/* Status badge - desktop only when banner is dismissed */}
                  {bannerDismissed && (
                    <div className="hidden md:block">
                      <SystemStatusBadge
                        enabled={settings?.announcementEnabled || false}
                        title={settings?.announcementTitle || 'Test Mode'}
                        type={settings?.announcementType || 'info'}
                        onClick={handleStatusBadgeClick}
                      />
                    </div>
                  )}
                </div>

                {/* Right side - Actions */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Day counter - Desktop only */}
                  <div className={`text-sm hidden md:flex items-center gap-1.5 font-medium ${
                    dayInfo.variant === 'countdown'
                      ? 'text-gold-600 dark:text-gold-400'
                      : dayInfo.variant === 'active'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : dayInfo.variant === 'complete'
                      ? 'text-gold-600 dark:text-gold-400'
                      : dayInfo.variant === 'prompt'
                      ? 'text-slate-600 dark:text-slate-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {dayInfo.icon}
                    <span>{dayInfo.text}</span>
                  </div>

                  {/* Notification bell */}
                  <NotificationBell />

                  {/* Theme toggle - Desktop only */}
                  <div className="hidden sm:block">
                    <ThemeToggle className="relative top-0 right-0" />
                  </div>

                  {/* Avatar with profile link */}
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
            {/* iOS Install Prompt for push notifications */}
            <IOSInstallPrompt />
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}
