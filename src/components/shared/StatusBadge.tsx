import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = "ongoing" | "clearing" | "resolved";

const statusClasses: Record<Status, string> = {
  ongoing: "badge-status-ongoing",
  clearing: "badge-status-clearing",
  resolved: "badge-status-resolved",
};

const statusLabels: Record<Status, string> = {
  ongoing: "Ongoing",
  clearing: "Clearing",
  resolved: "Resolved",
};

type StatusBadgeProps = {
  status: Status;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge className={cn(statusClasses[status], className)}>
      {statusLabels[status]}
    </Badge>
  );
}
