import { Badge } from "@/components/ui/badge";
import { SEVERITY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const severityClasses = {
  low: "badge-severity-low",
  moderate: "badge-severity-moderate",
  high: "badge-severity-high",
} as const;

type Severity = keyof typeof SEVERITY_LABELS;

type SeverityBadgeProps = {
  severity: Severity;
  className?: string;
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <Badge className={cn(severityClasses[severity], className)}>
      {SEVERITY_LABELS[severity]}
    </Badge>
  );
}
