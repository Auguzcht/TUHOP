import { Navigate, Outlet } from "react-router-dom";

import { useAuthContext } from "@/contexts/auth-context";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Topbar } from "@/components/layout/Topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/auth-store";

export function PrivateLayout() {
  const { session } = useAuthContext();
  const profile = useAuthStore((s) => s.profile);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.status === "pending_review") {
    return <Navigate to="/account-pending" replace />;
  }

  return (
    <SidebarProvider
      defaultOpen
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-mobile": "18rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className="flex h-svh flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="content-padding mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
