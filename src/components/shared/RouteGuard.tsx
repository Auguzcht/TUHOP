import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/stores/auth-store";

type UserRole = "barangay_official" | "hitl_validator" | "admin";

type RouteGuardProps = {
  /** Only these roles can access the route */
  allowedRoles: UserRole[];
  /** Where to redirect if not allowed */
  fallback?: string;
};

/**
 * Route guard component.
 * Wraps <Outlet /> and checks user role against allowedRoles.
 * Auth is already initialized by AppProviders, so no loading state needed here.
 */
export function RouteGuard({
  allowedRoles,
  fallback = "/dashboard",
}: RouteGuardProps) {
  const { profile } = useAuthStore();

  if (!profile?.role || !allowedRoles.includes(profile.role)) {
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
