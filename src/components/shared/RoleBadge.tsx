import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Role = "barangay_official" | "hitl_validator" | "admin";

const roleClasses: Record<Role, string> = {
  barangay_official: "badge-role-barangay",
  hitl_validator: "badge-role-validator",
  admin: "badge-role-admin",
};

const roleLabels: Record<Role, string> = {
  barangay_official: "Barangay Official",
  hitl_validator: "Validator",
  admin: "Admin",
};

type RoleBadgeProps = {
  role: Role;
  className?: string;
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <Badge className={cn(roleClasses[role], className)}>
      {roleLabels[role]}
    </Badge>
  );
}
