import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Scale,
  User,
  LogOut,
  Users,
  ShieldCheck,
  FolderKanban
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const logout = useAuthStore(s => s.logout);
  const user = useAuthStore(s => s.user);
  const role = user?.role;
  const isActive = (path: string) => location.pathname === path;
  return (
    <Sidebar className="border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 text-navy-900 dark:text-white transition-colors" variant="sidebar">
      <SidebarHeader className="bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-slate-800 p-4 transition-colors">
        <div className="flex items-center gap-2 px-2">
          <img
            src="https://storage.googleapis.com/msgsndr/ck6TDBskjrhSPWEO92xX/media/6940d027ca7298d33f239911.png"
            alt="The Metabolic Reset Project"
            className="h-10 w-auto"
          />
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-white dark:bg-navy-900 transition-colors">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/app')}
                className="text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 data-[active=true]:bg-gold-50 dark:data-[active=true]:bg-slate-800 data-[active=true]:text-gold-600 dark:data-[active=true]:text-gold-500"
              >
                <Link to="/app">
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="font-medium">Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/app/biometrics')}
                className="text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 data-[active=true]:bg-gold-50 dark:data-[active=true]:bg-slate-800 data-[active=true]:text-gold-600 dark:data-[active=true]:text-gold-500"
              >
                <Link to="/app/biometrics">
                  <Scale className="h-5 w-5" />
                  <span className="font-medium">Weekly Study</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/app/projects')}
                className="text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 data-[active=true]:bg-gold-50 dark:data-[active=true]:bg-slate-800 data-[active=true]:text-gold-600 dark:data-[active=true]:text-gold-500"
              >
                <Link to="/app/projects">
                  <FolderKanban className="h-5 w-5" />
                  <span className="font-medium">My Projects</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {role === 'coach' && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/app/roster')}
                  className="text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 data-[active=true]:bg-gold-50 dark:data-[active=true]:bg-slate-800 data-[active=true]:text-gold-600 dark:data-[active=true]:text-gold-500"
                >
                  <Link to="/app/roster">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">Team Roster</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            {user?.isAdmin && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/app/admin')}
                  className="text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 data-[active=true]:bg-gold-50 dark:data-[active=true]:bg-slate-800 data-[active=true]:text-gold-600 dark:data-[active=true]:text-gold-500"
                >
                  <Link to="/app/admin">
                    <ShieldCheck className="h-5 w-5" />
                    <span className="font-medium">Admin</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator className="bg-slate-200 dark:bg-slate-800" />
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Link to="/app/profile">
                  <User className="h-5 w-5" />
                  <span className="font-medium">My Profile</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-slate-800 p-4 transition-colors">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-white hover:bg-red-50 dark:hover:bg-slate-800"
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}