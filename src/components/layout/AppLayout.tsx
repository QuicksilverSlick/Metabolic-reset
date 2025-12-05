import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuthStore } from "@/lib/auth-store";
import { Navigate } from "react-router-dom";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className={`bg-slate-50 ${className || ''}`}>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4 shadow-sm">
          <SidebarTrigger className="-ml-1" />
          <div className="h-4 w-px bg-slate-200 mx-2" />
          <div className="flex-1 flex justify-between items-center">
            <h1 className="font-display font-semibold text-navy-900 text-lg">
              Metabolic Reset
            </h1>
            <div className="text-sm text-slate-500 hidden sm:block">
              Day 4 of 28
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