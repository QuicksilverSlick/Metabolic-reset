import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Scale,
  User,
  LogOut,
  Activity,
  Users
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
    <Sidebar className="border-r border-navy-800 bg-navy-900 text-white" variant="sidebar">
      <SidebarHeader className="bg-navy-950 p-4">
        <div className="flex items-center gap-2 px-2">
          <div className="bg-orange-500 p-1.5 rounded-lg">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-bold text-lg tracking-tight text-white">28 DAY</span>
            <span className="font-display font-extrabold text-orange-500 tracking-wide text-xs">RESET</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-navy-900">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/app')}
                className="text-slate-300 hover:text-white hover:bg-navy-800 data-[active=true]:bg-navy-800 data-[active=true]:text-orange-500"
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
                className="text-slate-300 hover:text-white hover:bg-navy-800 data-[active=true]:bg-navy-800 data-[active=true]:text-orange-500"
              >
                <Link to="/app/biometrics">
                  <Scale className="h-5 w-5" />
                  <span className="font-medium">Weekly Study</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {role === 'coach' && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/app/roster')}
                  className="text-slate-300 hover:text-white hover:bg-navy-800 data-[active=true]:bg-navy-800 data-[active=true]:text-orange-500"
                >
                  <Link to="/app/roster">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">Team Roster</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator className="bg-navy-800" />
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="text-slate-300 hover:text-white hover:bg-navy-800"
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
      <SidebarFooter className="bg-navy-950 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-400 hover:text-white hover:bg-navy-800"
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}