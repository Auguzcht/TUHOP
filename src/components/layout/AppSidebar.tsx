import {
  CheckCircle2,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import { RoleBadge } from "@/components/shared/RoleBadge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

type NavItem = {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  roles?: Array<"barangay_official" | "hitl_validator" | "admin">;
};

const primaryItems: NavItem[] = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    roles: ["hitl_validator", "admin"],
  },
  {
    label: "Validation",
    to: "/validate",
    icon: CheckCircle2,
    roles: ["hitl_validator", "admin"],
  },
  {
    label: "Map",
    to: "/map",
    icon: MapPin,
  },
];

const managementItems: NavItem[] = [
  {
    label: "Approvals",
    to: "/settings/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    label: "Model Audit",
    to: "/audit",
    icon: ShieldCheck,
    roles: ["hitl_validator", "admin"],
  },
  {
    label: "Reports",
    to: "/reports",
    icon: FileText,
    roles: ["admin"],
  },
  {
    label: "Settings",
    to: "/settings",
    icon: Settings,
    roles: ["admin"],
  },
];

export function AppSidebar() {
  const { profile, clear } = useAuthStore();
  const location = useLocation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    clear();
  };

  const renderItem = (item: NavItem) => {
    if (item.roles && profile?.role && !item.roles.includes(profile.role)) {
      return null;
    }

    const isActive =
      location.pathname === item.to ||
      (item.to !== "/" && location.pathname.startsWith(item.to));

    return (
      <SidebarMenuItem key={item.to}>
        <SidebarMenuButton asChild isActive={isActive}>
          <NavLink to={item.to} className={cn("flex w-full items-center gap-2")}>
            <item.icon />
            <span>{item.label}</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarFallback>
              {profile?.full_name?.slice(0, 2)?.toUpperCase() ?? "TU"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">
              {profile?.full_name ?? "TUHOP"}
            </span>
            {profile?.role ? <RoleBadge role={profile.role} /> : null}
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Favorites</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{primaryItems.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>System Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{managementItems.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button variant="ghost" className="justify-start gap-2" onClick={handleSignOut}>
          <LogOut className="size-4" />
          <span>Log out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
