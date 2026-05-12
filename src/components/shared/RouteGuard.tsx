import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/stores/auth-store";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

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
  const { profile, isInitialized } = useAuthStore();

  if (!isInitialized || !profile?.role) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner label="Loading access..." />
      </div>
    );
  }

  if (!allowedRoles.includes(profile.role)) {
    console.log("[guard] redirecting to", fallback, "- role:", profile.role);
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
