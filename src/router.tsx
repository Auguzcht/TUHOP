import { createBrowserRouter, Navigate } from "react-router-dom";

import { PrivateLayout } from "@/components/layout/PrivateLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { RouteGuard } from "@/components/shared/RouteGuard";
import { useAuthStore } from "@/stores/auth-store";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { PendingPage } from "@/features/auth/pages/PendingPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { IncidentArchivePage } from "@/features/dashboard/pages/IncidentArchivePage";
import { ValidateDetailPage } from "@/features/hitl/pages/ValidateDetailPage";
import { ValidatePage } from "@/features/hitl/pages/ValidatePage";
import { MapPage } from "@/features/map/pages/MapPage";
import { ModelAuditPage } from "@/features/audit/pages/ModelAuditPage";
import { AuditArchivePage } from "@/features/audit/pages/AuditArchivePage";
import { SettingsPage } from "@/features/admin/pages/SettingsPage";
import { HomePage } from "@/features/social/pages/HomePage";

// eslint-disable-next-line react-refresh/only-export-components
function IndexRedirect() {
  const { profile } = useAuthStore();

  if (profile?.role === "barangay_official") {
    return <Navigate to="/home" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

export const router = createBrowserRouter([
  // ─── Public Routes ───────────────────────────────────────
  {
    element: <PublicLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },

  // ─── Private Routes (shared auth layout) ─────────────────
  {
    element: <PrivateLayout />,
    children: [
      { index: true, element: <IndexRedirect /> },

      // All active users
      { path: "/home", element: <HomePage /> },
      { path: "/map", element: <MapPage /> },

      // Validators + Admins only
      {
        element: <RouteGuard allowedRoles={["hitl_validator", "admin"]} />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/validate", element: <ValidatePage /> },
          { path: "/validate/:reportId", element: <ValidateDetailPage /> },
          { path: "/audit", element: <ModelAuditPage /> },
        ],
      },

      // Admins only
      {
        element: <RouteGuard allowedRoles={["admin"]} />,
        children: [
          { path: "/audit/archive", element: <AuditArchivePage /> },
          { path: "/reports", element: <IncidentArchivePage /> },
          { path: "/settings", element: <SettingsPage /> },
        ],
      },
    ],
  },

  // ─── Pending Account Page ────────────────────────────────
  { path: "/account-pending", element: <PendingPage /> },

  // ─── Catch-all ───────────────────────────────────────────
  { path: "*", element: <Navigate to="/login" replace /> },
]);
