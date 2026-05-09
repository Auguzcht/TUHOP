import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ValidationBadgeProps = {
  isValidated: boolean;
  isOverridden: boolean;
  className?: string;
};

export function ValidationBadge({
  isValidated,
  isOverridden,
  className,
}: ValidationBadgeProps) {
  if (!isValidated) {
    return <Badge className={cn("badge-unverified", className)}>Unverified</Badge>;
  }

  if (isOverridden) {
    return <Badge className={cn("badge-overridden", className)}>Overridden</Badge>;
  }

  return <Badge className={cn("badge-verified", className)}>Verified</Badge>;
}
