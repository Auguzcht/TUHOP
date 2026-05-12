

import { useAuthStore } from "@/stores/auth-store";

type UserRole = "barangay_official" | "hitl_validator" | "admin";

type RoleGuardResult = {
  isAllowed: boolean;
};

export function useRoleGuard(requiredRoles: UserRole[]): RoleGuardResult {
  const { profile } = useAuthStore();

  const isAllowed = !!(profile?.role && requiredRoles.includes(profile.role));

  return { isAllowed };
}
