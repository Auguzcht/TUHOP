import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: string;
  className?: string;
};

export function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("gap-3", className)} size="sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold text-muted-foreground">
          {label}
        </CardTitle>
        <span className="flex size-9 items-center justify-center rounded-full bg-muted">
          <Icon className="size-4 text-foreground" />
        </span>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-2xl font-semibold text-foreground">{value}</div>
        {subtext ? (
          <CardDescription className="text-xs text-muted-foreground">
            {subtext}
          </CardDescription>
        ) : null}
        {trend ? (
          <div className="text-xs font-medium text-accent">{trend}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}
