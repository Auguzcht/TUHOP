import { useMemo } from "react";

import { useAuthStore } from "@/stores/auth-store";

type UserRole = "barangay_official" | "hitl_validator" | "admin";

type RoleGuardResult = {
  isAllowed: boolean;
};

export function useRoleGuard(requiredRoles: UserRole[]): RoleGuardResult {
  const { profile } = useAuthStore();

  const isAllowed = useMemo(() => {
    if (!profile?.role) return false;
    return requiredRoles.includes(profile.role);
  }, [profile?.role, requiredRoles]);

  return { isAllowed };
}
