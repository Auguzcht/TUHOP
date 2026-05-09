import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-muted p-8 text-center",
        className
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Icon className="size-5 text-muted-foreground" />
      </span>
      <div className="text-sm font-semibold text-foreground">{title}</div>
      <p className="max-w-xs text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
