import { Navigate, Outlet } from "react-router-dom";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { Topbar } from "@/components/layout/Topbar";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/auth-store";

export function PrivateLayout() {
  const { session, profile, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <LoadingSpinner label="Checking session" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.status === "pending_review") {
    return <Navigate to="/account-pending" replace />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Topbar />
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
