import {
  CheckCircle2,
  FileText,
  Home,
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
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/auth-context";
import { useAuthStore } from "@/stores/auth-store";

type NavItem = {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  roles?: Array<"barangay_official" | "hitl_validator" | "admin">;
};

const primaryItems: NavItem[] = [
  {
    label: "Home",
    to: "/home",
    icon: Home,
  },
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

// Stagger animation delay helper (CSS-based, compatible with shadcn sidebar)
const staggerDelay = (i: number) => ({
  animationDelay: `${i * 50}ms`,
});

export function AppSidebar() {
  const { profile } = useAuthStore();
  const { signOut } = useAuthContext();
  const location = useLocation();

  const handleSignOut = () => {
    signOut();
  };

  const renderItem = (item: NavItem, index: number) => {
    if (item.roles && profile?.role && !item.roles.includes(profile.role)) {
      return null;
    }

    const isActive =
      location.pathname === item.to ||
      (item.to !== "/" && location.pathname.startsWith(item.to));

    return (
      <SidebarMenuItem
        key={item.to}
        className="animate-in-up"
        style={staggerDelay(index)}
      >
        <SidebarMenuButton asChild isActive={isActive}>
          <NavLink to={item.to} className="flex w-full items-center gap-2">
            <item.icon className="size-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="gap-3 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 ring-2 ring-sidebar-primary/20">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs font-semibold">
              {profile?.full_name?.slice(0, 2)?.toUpperCase() ?? "TU"}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-sm font-semibold text-sidebar-foreground">
              {profile?.full_name ?? "TUHOP"}
            </span>
            {profile?.role ? (
              <RoleBadge role={profile.role} className="w-fit" />
            ) : null}
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryItems.map((item, i) => renderItem(item, i))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item, i) =>
                renderItem(item, primaryItems.length + i)
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="size-4 shrink-0" />
          <span>Log out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
