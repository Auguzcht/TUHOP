import { Bell, Search } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthContext } from "@/contexts/auth-context";
import { useAuthStore } from "@/stores/auth-store";

export function Topbar() {
  const { profile } = useAuthStore();
  const { signOut } = useAuthContext();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/40 bg-background/80 px-4 py-3 backdrop-blur-sm md:px-6 md:py-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="size-8 md:size-9" />
        <span className="hidden text-sm font-semibold tracking-wide md:inline">
          TUHOP
        </span>
      </div>

      <div className="hidden items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground md:flex">
        <Search className="size-3.5" />
        <span>Search reports...</span>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="relative size-8 md:size-9"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-muted/60">
              <Avatar className="size-8 ring-1 ring-border md:size-9">
                <AvatarFallback className="text-xs font-semibold">
                  {profile?.full_name?.slice(0, 2)?.toUpperCase() ?? "TU"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <div className="text-xs font-semibold leading-tight">
                  {profile?.full_name ?? "TUHOP"}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {profile?.role === "admin"
                    ? "Admin"
                    : profile?.role === "hitl_validator"
                      ? "Validator"
                      : profile?.role === "barangay_official"
                        ? "Barangay Official"
                        : ""}
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              {profile?.email ?? ""}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Profile</DropdownMenuItem>
            <DropdownMenuItem disabled>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
