import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

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
  trendUp?: boolean;
  className?: string;
  delay?: number;
};

export function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  trend,
  trendUp,
  className,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
    >
      <Card
        size="sm"
        className={cn(
          "card-hover overflow-hidden border-transparent shadow-sm",
          "bg-gradient-to-br from-card to-muted/30",
          className
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </CardTitle>
          <span className="flex size-9 items-center justify-center rounded-xl bg-accent/10">
            <Icon className="size-4 text-accent" />
          </span>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-2xl font-semibold tabular-nums text-foreground md:text-3xl">
            {value}
          </div>
          {subtext ? (
            <CardDescription className="text-xs text-muted-foreground">
              {subtext}
            </CardDescription>
          ) : null}
          {trend ? (
            <div
              className={cn(
                "text-xs font-medium",
                trendUp === undefined
                  ? "text-accent"
                  : trendUp
                    ? "text-emerald-600"
                    : "text-red-500"
              )}
            >
              {trendUp !== undefined ? (trendUp ? "↑ " : "↓ ") : null}
              {trend}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}
