import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  MapPin,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

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
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/auth-context";
import { useAuthStore } from "@/stores/auth-store";

// ─── Types ─────────────────────────────────────────────────

type Role = "barangay_official" | "hitl_validator" | "admin";

import type { LucideIcon } from "lucide-react";

interface MainItem {
  label: string;
  to: string;
  icon: LucideIcon;
  roles?: readonly Role[];
}

interface GroupItem {
  label: string;
  to: string;
  icon: LucideIcon;
  roles?: readonly Role[];
}

interface SystemGroup {
  label: string;
  icon: LucideIcon;
  roles?: readonly Role[];
  to?: string;
  items?: GroupItem[];
}

// ─── Nav structure ─────────────────────────────────────────

const mainItems: MainItem[] = [
  { label: "Home", to: "/home", icon: Home },
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    roles: ["hitl_validator", "admin"] as const,
  },
  {
    label: "Validation",
    to: "/validate",
    icon: CheckCircle2,
    roles: ["hitl_validator", "admin"] as const,
  },
  { label: "Map", to: "/map", icon: MapPin },
];

const systemGroups: SystemGroup[] = [
  {
    label: "User Management",
    icon: Users,
    roles: ["admin"] as const,
    items: [
      { label: "Pending", to: "/settings/users", icon: Users },
      { label: "Approved", to: "/settings/approved", icon: UserCheck },
      { label: "Rejected", to: "/settings/rejected", icon: UserX },
      { label: "Directory", to: "/settings/directory", icon: Building2 },
    ],
  },
  {
    label: "Model Audit",
    icon: ShieldCheck,
    roles: ["hitl_validator", "admin"] as const,
    items: [
      { label: "Performance", to: "/audit", icon: ShieldCheck },
      {
        label: "Archive",
        to: "/audit/archive",
        icon: FileText,
        roles: ["admin"] as const,
      },
    ],
  },
  {
    label: "Reports",
    icon: FileText,
    roles: ["admin"] as const,
    to: "/reports",
  },
];

// ─── Helpers ────────────────────────────────────────────────

function useFiltered() {
  const { profile } = useAuthStore();
  const role = profile?.role;

  const filteredMain = mainItems.filter(
    (i) => !i.roles || (role && (i.roles as readonly string[]).includes(role))
  );

  const filteredGroups: (SystemGroup & { items?: GroupItem[] })[] = [];
  for (const g of systemGroups) {
    if (g.to) {
      // Single-item group
      if (!g.roles || (role && (g.roles as readonly string[]).includes(role))) {
        filteredGroups.push(g);
      }
    } else if (g.items) {
      // Multi-item group
      if (!g.roles || (role && (g.roles as readonly string[]).includes(role))) {
        const items = g.items.filter(
          (i) => !i.roles || (role && (i.roles as readonly string[]).includes(role))
        );
        if (items.length > 0) {
          filteredGroups.push({ ...g, items });
        }
      }
    }
  }

  return { filteredMain, filteredGroups };
}

export function AppSidebar() {
  const { signOut } = useAuthContext();
  const location = useLocation();
  const { filteredMain, filteredGroups } = useFiltered();

  // Track open groups based on active sub-route
  const initialGroups = filteredGroups.map((g) => {
    if (g.items) {
      return g.items.some((item) => location.pathname === item.to);
    }
    return false;
  });
  const [openGroups, setOpenGroups] = useState<boolean[]>(initialGroups);

  const toggleGroup = (idx: number) =>
    setOpenGroups((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });

  const isActive = (to: string) => location.pathname === to;

  return (
    <Sidebar collapsible="icon" variant="inset">
      {/* ─── Header ───────────────────────────────────────── */}
      <SidebarHeader className="gap-1 p-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent">
            <img
              src="/TUHOP-Logo.png"
              alt="TUHOP"
              draggable={false}
              className="size-7 object-contain"
            />
          </div>
          <div className="flex min-w-0 flex-col">
            <img
              src="/TUHOP-Banner.png"
              alt="TUHOP"
              draggable={false}
              className="h-5 w-auto select-none pointer-events-none transition-opacity duration-300 delay-200 ease-[cubic-bezier(0.7,-0.15,0.25,1.15)] group-data-[collapsible=icon]:opacity-0 group-data-[state=expanded]:delay-[50ms]"
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      {/* ─── Main Pages ───────────────────────────────────── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMain.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild isActive={isActive(item.to)}>
                    <NavLink
                      to={item.to}
                      className="flex w-full items-center gap-2.5"
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ─── System Sections ─────────────────────────────── */}
        {filteredGroups.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
              System
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredGroups.map((group, idx) => {
                  // Single-item group
                  if (group.to) {
                    return (
                      <SidebarMenuItem key={group.to}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(group.to)}
                        >
                          <NavLink
                            to={group.to}
                            className="flex w-full items-center gap-2.5"
                          >
                            <group.icon className="size-4 shrink-0" />
                            <span>{group.label}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }

                  // Multi-item group (collapsible)
                  const isOpen = openGroups[idx];

                  return (
                    <div key={group.label}>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={group.items.some(
                            (item) => location.pathname === item.to
                          )}
                          onClick={() => toggleGroup(idx)}
                          className="flex w-full items-center gap-2.5"
                        >
                          <group.icon className="size-4 shrink-0" />
                          <span className="flex-1 text-left">
                            {group.label}
                          </span>
                          <ChevronDown
                            className={cn(
                              "size-3 transition-transform duration-300 ease-[cubic-bezier(0.7,-0.15,0.25,1.15)]",
                              isOpen && "rotate-180"
                            )}
                          />
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      {/* Sub-items with timeline bar */}
                      <div
                        className={cn(
                          "grid transition-all duration-300 ease-[cubic-bezier(0.7,-0.15,0.25,1.15)]",
                          isOpen
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                        )}
                      >
                        <div className="overflow-hidden pt-1.5">
                          <div className="relative ml-2.5 pl-5">
                            {/* Static timeline track */}
                            <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-sidebar-border/30" />

                            {/* Animated highlight — px-based, aligns to actual button positions */}
                            {(() => {
                              const activeIdx = group.items.findIndex((i) => isActive(i.to));
                              if (activeIdx === -1) return null;
                              // h-7 = 28px, gap-1.5 = 6px. Each slot = 34px.
                              const slotH = 34;
                              const btnH = 28;
                              const pxHeight = activeIdx * slotH + btnH;
                              return (
                                <div
                                  className="pointer-events-none absolute left-0 w-px bg-sidebar-primary transition-all duration-400 ease-out"
                                  style={{ top: 0, height: pxHeight }}
                                />
                              );
                            })()}

                            <SidebarMenu>
                              {group.items.map((item) => (
                                <SidebarMenuItem key={item.to}>
                                  <SidebarMenuButton
                                    asChild
                                    isActive={isActive(item.to)}
                                    size="sm"
                                  >
                                    <NavLink
                                      to={item.to}
                                      className="flex w-full items-center gap-2.5"
                                    >
                                      <item.icon className="size-3.5 shrink-0" />
                                      <span>{item.label}</span>
                                    </NavLink>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              ))}
                            </SidebarMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <SidebarSeparator />
      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut()}
              className="flex w-full items-center gap-2.5 text-sidebar-foreground/60 hover:text-sidebar-foreground"
            >
              <LogOut className="size-4 shrink-0" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
