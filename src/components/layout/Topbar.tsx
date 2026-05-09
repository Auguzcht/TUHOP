import { Bell, Search } from "lucide-react";

import { RoleBadge } from "@/components/shared/RoleBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/auth-store";

export function Topbar() {
  const { profile } = useAuthStore();

  return (
    <header className="flex items-center justify-between border-b border-border/40 bg-background/80 px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <span className="text-sm font-semibold tracking-wide">TUHOP</span>
      </div>
      <div className="hidden items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground md:flex">
        <Search className="size-4" />
        Search (post-mvp)
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon">
          <Bell className="size-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2">
              <Avatar className="size-9">
                <AvatarFallback>
                  {profile?.full_name?.slice(0, 2)?.toUpperCase() ?? "TU"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <div className="text-xs font-semibold">
                  {profile?.full_name ?? "TUHOP"}
                </div>
                {profile?.role ? <RoleBadge role={profile.role} /> : null}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile (coming soon)</DropdownMenuItem>
            <DropdownMenuItem>Settings (coming soon)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
